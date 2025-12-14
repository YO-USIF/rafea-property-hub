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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
