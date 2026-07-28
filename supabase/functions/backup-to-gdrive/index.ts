import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { zipSync, strToU8 } from 'https://esm.sh/[email protected]';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_drive';
const BACKUP_FOLDER_NAME = 'Rafea Property Hub Backups';

// Same attachment sources as backup-attachments
const ATTACHMENT_SOURCES = [
  { folder: 'contracts', table: 'contractor_contracts', urlCol: 'attachment_url', nameCol: 'attachment_name' },
  { folder: 'extracts', table: 'extracts', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'invoices', table: 'invoices', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'assignment_orders', table: 'assignment_orders', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'maintenance', table: 'maintenance_requests', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'purchases', table: 'purchases', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'sales', table: 'sales', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
  { folder: 'tasks', table: 'tasks', urlCol: 'file_url', nameCol: 'file_name' },
  { folder: 'unit_handovers', table: 'unit_handovers', urlCol: 'attached_file_url', nameCol: 'attached_file_name' },
];

const DB_TABLES = [
  'projects', 'sales', 'purchases', 'purchase_items', 'extracts', 'assignment_orders',
  'invoices', 'contractors', 'contractor_contracts', 'suppliers', 'warehouse_inventory',
  'warehouse_transactions', 'tasks', 'task_reports', 'maintenance_requests', 'unit_handovers',
  'hoa_members', 'hoa_fees', 'notifications', 'profiles', 'user_roles', 'user_permissions',
  'company_settings', 'customers', 'chart_of_accounts', 'journal_entries', 'journal_entry_lines',
];

const sanitize = (s: string) => (s || 'file').replace(/[\/\\:*?"<>|]/g, '_').slice(0, 180);

async function driveFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const driveKey = Deno.env.get('GOOGLE_DRIVE_API_KEY');
  if (!lovableKey || !driveKey) throw new Error('Google Drive connector not configured');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${lovableKey}`);
  headers.set('X-Connection-Api-Key', driveKey);

  const res = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
  return res;
}

async function ensureBackupFolder(): Promise<string> {
  const query = encodeURIComponent(
    `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const listRes = await driveFetch(`/drive/v3/files?q=${query}&fields=files(id,name)`);
  if (!listRes.ok) {
    const body = await listRes.text();
    throw new Error(`[${listRes.status}] list folders: ${body}`);
  }
  const listData = await listRes.json();
  if (listData.files?.length) return listData.files[0].id;

  const createRes = await driveFetch('/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: BACKUP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`[${createRes.status}] create folder: ${body}`);
  }
  const created = await createRes.json();
  return created.id;
}

async function uploadToDrive(name: string, mimeType: string, content: Uint8Array, folderId: string): Promise<string> {
  const boundary = `boundary_${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name, parents: [folderId], mimeType });

  const enc = new TextEncoder();
  const preamble = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
  );
  const closing = enc.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(preamble.length + content.length + closing.length);
  body.set(preamble, 0);
  body.set(content, preamble.length);
  body.set(closing, preamble.length + content.length);

  const uploadRes = await fetch(
    `${GATEWAY_URL}/upload/drive/v3/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'X-Connection-Api-Key': Deno.env.get('GOOGLE_DRIVE_API_KEY')!,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body,
    },
  );

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    throw new Error(`[${uploadRes.status}] upload ${name}: ${errBody}`);
  }
  const j = await uploadRes.json();
  return j.id;
}

async function buildDatabaseBackup(admin: ReturnType<typeof createClient>): Promise<Uint8Array> {
  const backupData: Record<string, any[]> = {};
  for (const table of DB_TABLES) {
    const { data, error } = await admin.from(table).select('*');
    backupData[table] = error ? [] : (data || []);
    if (error) console.error(`Table ${table} failed:`, error.message);
  }
  const json = JSON.stringify({
    created_at: new Date().toISOString(),
    version: '1.0',
    tables: backupData,
  }, null, 2);
  return new TextEncoder().encode(json);
}

async function buildAttachmentsZip(admin: ReturnType<typeof createClient>): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {};
  const manifest: Record<string, any[]> = {};
  let count = 0;

  for (const src of ATTACHMENT_SOURCES) {
    manifest[src.folder] = [];
    const { data, error } = await admin.from(src.table).select(`id, ${src.urlCol}, ${src.nameCol}`);
    if (error) continue;
    const used = new Set<string>();
    for (const row of (data as any[]) || []) {
      const rawUrl: string | null = row[src.urlCol];
      const dispName: string = row[src.nameCol] || `${src.table}-${row.id}`;
      if (!rawUrl) continue;
      const storagePath = rawUrl.replace(/^storage\/documents\//, '');
      try {
        const { data: blob, error: dl } = await admin.storage.from('documents').download(storagePath);
        if (dl || !blob) continue;
        const buf = new Uint8Array(await blob.arrayBuffer());
        let entry = sanitize(dispName);
        let unique = entry;
        let i = 1;
        while (used.has(unique)) {
          const dot = entry.lastIndexOf('.');
          unique = dot > 0 ? `${entry.slice(0, dot)}-${i}${entry.slice(dot)}` : `${entry}-${i}`;
          i++;
        }
        used.add(unique);
        files[`${src.folder}/${unique}`] = buf;
        manifest[src.folder].push({ id: row.id, file: unique, size: buf.length });
        count++;
      } catch (e) {
        console.error('attachment error:', e);
      }
    }
  }
  files['manifest.json'] = strToU8(JSON.stringify({
    created_at: new Date().toISOString(), total_files: count, groups: manifest,
  }, null, 2));
  return zipSync(files, { level: 6 });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Auth: admin JWT OR cron secret header
  let triggeredBy: string | null = null;
  const cronSecretHeader = req.headers.get('x-cron-secret');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (cronSecretHeader && cronSecret && cronSecretHeader === cronSecret) {
    triggeredBy = 'cron';
  } else {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: { user } } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', user.id).single();
    if (!role || role.role !== 'مدير النظام') {
      return new Response(JSON.stringify({ error: 'صلاحية مدير النظام مطلوبة' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    triggeredBy = user.id;
  }

  const logRow = await admin.from('backup_logs').insert({
    backup_type: 'Google Drive',
    status: 'في التقدم',
    created_by: triggeredBy === 'cron' ? null : triggeredBy,
  }).select('id').single();
  const logId = logRow.data?.id;

  try {
    console.log('Ensuring Drive folder...');
    const folderId = await ensureBackupFolder();

    console.log('Building DB backup...');
    const dbBackup = await buildDatabaseBackup(admin);
    console.log('Building attachments ZIP...');
    const attachmentsZip = await buildAttachmentsZip(admin);

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    console.log('Uploading DB backup to Drive...');
    const dbId = await uploadToDrive(`database-${stamp}.json`, 'application/json', dbBackup, folderId);
    console.log('Uploading attachments ZIP to Drive...');
    const zipId = await uploadToDrive(`attachments-${stamp}.zip`, 'application/zip', attachmentsZip, folderId);

    const totalSize = dbBackup.length + attachmentsZip.length;
    if (logId) {
      await admin.from('backup_logs').update({
        status: 'مكتمل',
        file_size: totalSize,
        file_path: `Google Drive / ${BACKUP_FOLDER_NAME}`,
        completed_at: new Date().toISOString(),
      }).eq('id', logId);
    }

    return new Response(JSON.stringify({
      success: true,
      triggered_by: triggeredBy,
      folder: BACKUP_FOLDER_NAME,
      files: { database: dbId, attachments: zipId },
      total_size: totalSize,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('backup-to-gdrive error:', e);
    if (logId) {
      await admin.from('backup_logs').update({
        status: 'فشل',
        completed_at: new Date().toISOString(),
      }).eq('id', logId);
    }
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
