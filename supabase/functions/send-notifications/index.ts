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
    // إنشاء عميل Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'لم يتم العثور على رمز المصادقة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من صلاحية المستخدم (مدير نظام فقط)
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'مستخدم غير صحيح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن المستخدم مدير نظام
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'مدير النظام') {
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
    } else {
      targetUsers = selectedUsers || [];
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