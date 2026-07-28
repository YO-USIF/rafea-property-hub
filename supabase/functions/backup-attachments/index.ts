import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { zipSync, strToU8 } from 'https://esm.sh/[email protected]';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables and their attachment URL columns, grouped into folder categories
const ATTACHMENT_SOURCES: Array<{ folder: string; table: string; urlCol: string; nameCol: string }> = [
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

function sanitizeName(name: string): string {
  return (name || 'file').replace(/[\/\\:*?"<>|]/g, '_').slice(0, 180);
}

export async function buildAttachmentsZip(supabase: ReturnType<typeof createClient>): Promise<{
  zip: Uint8Array;
  fileCount: number;
  manifest: Record<string, unknown>;
}> {
  const files: Record<string, Uint8Array> = {};
  const manifest: Record<string, any[]> = {};
  let fileCount = 0;

  for (const src of ATTACHMENT_SOURCES) {
    manifest[src.folder] = [];
    const { data, error } = await supabase.from(src.table).select(`id, ${src.urlCol}, ${src.nameCol}`);
    if (error) {
      console.error(`Fetch failed for ${src.table}:`, error.message);
      continue;
    }
    const usedNames = new Set<string>();
    for (const row of (data as any[]) || []) {
      const rawUrl: string | null = row[src.urlCol];
      const displayName: string = row[src.nameCol] || `${src.table}-${row.id}`;
      if (!rawUrl) continue;

      const storagePath = rawUrl.replace(/^storage\/documents\//, '');
      try {
        const { data: fileBlob, error: dlError } = await supabase.storage.from('documents').download(storagePath);
        if (dlError || !fileBlob) {
          console.error(`Download failed ${storagePath}:`, dlError?.message);
          continue;
        }
        const buf = new Uint8Array(await fileBlob.arrayBuffer());
        let entryName = sanitizeName(displayName);
        let uniqueName = entryName;
        let i = 1;
        while (usedNames.has(uniqueName)) {
          const dot = entryName.lastIndexOf('.');
          uniqueName = dot > 0
            ? `${entryName.slice(0, dot)}-${i}${entryName.slice(dot)}`
            : `${entryName}-${i}`;
          i++;
        }
        usedNames.add(uniqueName);
        files[`${src.folder}/${uniqueName}`] = buf;
        manifest[src.folder].push({ id: row.id, file: uniqueName, size: buf.length });
        fileCount++;
      } catch (e) {
        console.error(`Error processing ${storagePath}:`, e);
      }
    }
  }

  files['manifest.json'] = strToU8(JSON.stringify(
    { created_at: new Date().toISOString(), total_files: fileCount, groups: manifest },
    null,
    2,
  ));

  const zip = zipSync(files, { level: 6 });
  return { zip, fileCount, manifest: { total_files: fileCount, groups: manifest } };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: userError } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
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

    console.log('Building attachments backup...');
    const { zip, fileCount } = await buildAttachmentsZip(admin);
    console.log(`Attachments backup ready: ${fileCount} files, ${zip.length} bytes`);

    await admin.from('backup_logs').insert({
      backup_type: 'المرفقات',
      status: 'مكتمل',
      file_size: zip.length,
      created_by: user.id,
      completed_at: new Date().toISOString(),
    });

    return new Response(zip, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="attachments-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (e: any) {
    console.error('backup-attachments error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
