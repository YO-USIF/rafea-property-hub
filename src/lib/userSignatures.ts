// خريطة تواقيع المستخدمين: تربط اسم المُعد بصورة توقيعه
// لإضافة توقيع جديد: ضع الصورة في public/signatures وأضف سطراً هنا
const SIGNATURE_MAP: { match: string; path: string }[] = [
  { match: 'ريان', path: '/signatures/rayan-signature.png' },
  { match: 'رياض', path: '/signatures/riyad-signature.jpeg' },
];

/**
 * إرجاع مسار صورة توقيع المستخدم بناءً على اسمه، أو null إن لم يوجد توقيع.
 */
export function getUserSignature(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = String(name).trim();
  const found = SIGNATURE_MAP.find((s) => normalized.includes(s.match));
  return found ? found.path : null;
}
