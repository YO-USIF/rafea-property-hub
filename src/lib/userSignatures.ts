// خريطة تواقيع المستخدمين: تربط اسم المُعد بصورة توقيعه
// لإضافة توقيع جديد: ضع الصورة في public/signatures وأضف سطراً هنا
const SIGNATURE_MAP: { match: string; path: string; displayName?: string }[] = [
  { match: 'ريان', path: '/signatures/rayan-signature.png', displayName: 'ريان راوه' },
  { match: 'رياض', path: '/signatures/riyad-signature.jpeg', displayName: 'محمد رياض حمامي' },
  // مطابقة أسماء المستخدمين الإنجليزية المخزّنة في الملف الشخصي
  { match: 'reyad', path: '/signatures/reyad-signature.jpeg', displayName: 'محمد رياض حمامي' },
  { match: 'rawah', path: '/signatures/rawah-signature.png', displayName: 'ريان راوه' },
  // عمار نور الدين
  { match: 'عمار', path: '/signatures/ammar-signature.jpeg', displayName: 'عمار نور الدين' },
  { match: 'amarnory', path: '/signatures/ammar-signature.jpeg', displayName: 'عمار نور الدين' },
  // م/ يوسف صلاح يوسف
  { match: 'يوسف', path: '/signatures/yousef-signature.jpeg', displayName: 'م/ يوسف صلاح يوسف' },
  { match: 'wwork', path: '/signatures/yousef-signature.jpeg', displayName: 'م/ يوسف صلاح يوسف' },
];

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function findUserSignature(name: string | null | undefined) {
  if (!name) return null;
  const normalized = normalizeText(String(name));
  return SIGNATURE_MAP.find((s) => normalized.includes(normalizeText(s.match))) || null;
}

/**
 * إرجاع مسار صورة توقيع المستخدم بناءً على اسمه، أو null إن لم يوجد توقيع.
 */
export function getUserSignature(name: string | null | undefined): string | null {
  const found = findUserSignature(name);
  return found ? found.path : null;
}

/**
 * إرجاع الاسم الكامل للمستخدم بناءً على الاسم المختصر/المعروف، أو null.
 */
export function getUserDisplayName(name: string | null | undefined): string | null {
  const found = findUserSignature(name);
  return found?.displayName || null;
}
