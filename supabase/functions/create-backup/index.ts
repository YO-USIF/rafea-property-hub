import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // إنشاء عميل Supabase للتحقق من التوكن
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // التحقق من صحة التوكن والحصول على المستخدم
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن المستخدم مدير نظام
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'مدير النظام') {
      console.error('Role check failed:', roleError, userRole);
      return new Response(
        JSON.stringify({ error: 'Admin role required - غير مسموح - صلاحية مدير النظام مطلوبة' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authorized backup request from admin user: ${user.id}`);
    
    const supabase = supabaseAdmin;

    console.log('Starting backup process...');

    // Fetch all data from relevant tables
    const tables = [
      'projects',
      'sales',
      'purchases',
      'purchase_items',
      'extracts',
      'assignment_orders',
      'invoices',
      'contractors',
      'suppliers',
      'warehouse_inventory',
      'warehouse_transactions',
      'tasks',
      'task_reports',
      'maintenance_requests',
      'notifications',
      'profiles',
      'user_roles',
      'user_permissions',
      'company_settings',
      'customers',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
    ];

    const backupData: Record<string, any[]> = {};
    
    for (const table of tables) {
      console.log(`Fetching data from table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        backupData[table] = [];
      } else {
        backupData[table] = data || [];
        console.log(`Fetched ${data?.length || 0} rows from ${table}`);
      }
    }

    const backup = {
      created_at: new Date().toISOString(),
      version: '1.0',
      tables: backupData,
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const backupSize = new Blob([backupJson]).size;

    console.log(`Backup created successfully. Size: ${backupSize} bytes`);

    return new Response(backupJson, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
