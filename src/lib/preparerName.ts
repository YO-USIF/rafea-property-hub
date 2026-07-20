import { supabase } from '@/integrations/supabase/client';

// كاش بسيط في الذاكرة لتقليل الاستعلامات
const cache = new Map<string, string>();

/**
 * إرجاع اسم المستخدم المُنشئ للسجل بناءً على user_id
 * يقرأ من جدول profiles: full_name أو email، ويعود بـ "غير معروف" في حال عدم وجوده.
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

    const name =
      (data?.full_name && data.full_name.trim()) ||
      (data?.email ? data.email.split('@')[0] : '') ||
      'غير معروف';

    cache.set(userId, name);
    return name;
  } catch {
    return 'غير معروف';
  }
}
