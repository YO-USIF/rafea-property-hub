// خريطة تواقيع المستخدمين: تربط اسم المُعد بصورة توقيعه
// لإضافة توقيع جديد: ضع الصورة في public/signatures وأضف سطراً هنا
const SIGNATURE_MAP: { match: string; path: string }[] = [
  { match: 'ريان', path: '/signatures/rayan-signature.png' },
  { match: 'رياض', path: '/signatures/riyad-signature.jpeg' },
  // مطابقة أسماء المستخدمين الإنجليزية المخزّنة في الملف الشخصي
  { match: 'reyad', path: '/signatures/reyad-signature.jpeg' },
  { match: 'rawah', path: '/signatures/rawah-signature.png' },
];

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * إرجاع مسار صورة توقيع المستخدم بناءً على اسمه، أو null إن لم يوجد توقيع.
 */
export function getUserSignature(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = normalizeText(String(name));
  const found = SIGNATURE_MAP.find((s) => normalized.includes(normalizeText(s.match)));
  return found ? found.path : null;
}
