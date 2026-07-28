import { supabase } from '@/integrations/supabase/client';

// كاش بسيط في الذاكرة لتقليل الاستعلامات
const cache = new Map<string, string>();

/**
 * إرجاع اسم المستخدم المُنشئ للسجل بناءً على user_id
 * يقرأ من جدول profiles: full_name أو email، ويعود بـ "غير معروف" في حال عدم وجوده.
 * يستخدم RPC آمنة كـ fallback عندما لا يمتلك المستخدم صلاحية قراءة ملفات الآخرين.
 */
export async function resolvePreparerName(userId?: string | null): Promise<string> {
  if (!userId) return 'غير معروف';
  if (cache.has(userId)) return cache.get(userId)!;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .maybeSingle();

    let name =
      (data?.full_name && data.full_name.trim()) ||
      (data?.email ? data.email.split('@')[0] : '') ||
      '';

    // Fallback: RLS may hide other users' profiles. استخدم دالة آمنة على مستوى قاعدة البيانات.
    if (!name) {
      const { data: rpcName } = await supabase.rpc('get_user_display_name', { _user_id: userId });
      if (typeof rpcName === 'string' && rpcName.trim()) {
        name = rpcName.trim();
      }
    }

    if (!name) name = 'غير معروف';

    cache.set(userId, name);
    return name;
  } catch {
    return 'غير معروف';
  }
}
