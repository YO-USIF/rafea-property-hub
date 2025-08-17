import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // إنشاء عميل Supabase مع service role key
    const supabaseUrl = "https://dwinqajspowvbkvzbbbn.supabase.co";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'إعداد الخادم غير صحيح' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // التحقق من المصادقة والحصول على المستخدم
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'لم يتم العثور على رمز المصادقة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // استخدام JWT للتحقق من المستخدم - استخدام service role client
    const userClient = createClient(supabaseUrl, authHeader.replace('Bearer ', ''));
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'مستخدم غير صحيح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن المستخدم مدير نظام
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'مدير النظام') {
      console.error('Role check failed:', roleError, userRole);
      return new Response(
        JSON.stringify({ error: 'غير مسموح - صلاحية مدير النظام مطلوبة' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // استخراج بيانات الطلب
    const { title, message, type, sendToAll, selectedUsers } = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'العنوان والرسالة مطلوبان' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let targetUsers: string[] = [];

    if (sendToAll) {
      // جلب جميع المستخدمين النشطين
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('status', 'نشط');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب بيانات المستخدمين' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetUsers = profiles?.map(profile => profile.user_id) || [];
    } else if (selectedUsers && selectedUsers.length > 0) {
      targetUsers = selectedUsers;
    } else {
      // إذا لم يتم تحديد مستخدمين، أرسل للمدراء فقط
      const { data: managers, error: managersError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['مدير النظام', 'مدير']);

      if (managersError) {
        console.error('Error fetching managers:', managersError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب بيانات المدراء' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetUsers = managers?.map(manager => manager.user_id) || [];
    }

    if (targetUsers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'لا يوجد مستخدمين لإرسال الإشعار إليهم' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء الإشعارات
    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      title,
      message,
      type: type || 'info',
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // إدراج الإشعارات في قاعدة البيانات
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
      return new Response(
        JSON.stringify({ error: 'خطأ في إرسال الإشعارات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully sent notifications to ${targetUsers.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `تم إرسال الإشعار بنجاح لـ ${targetUsers.length} مستخدم`,
        recipientCount: targetUsers.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: 'خطأ داخلي في الخادم' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});