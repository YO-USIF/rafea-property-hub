// خريطة أسماء المستخدمين: تربط بريد/اسم المستخدم بالاسم المعروض بالعربية
// لإضافة مستخدم جديد: أضف سطراً في القائمة أدناه
const DISPLAY_NAME_MAP: { match: string; displayName: string }[] = [
  { match: 'wwork9575', displayName: 'م/ يوسف صلاح يوسف' },
  { match: 'amarnory92', displayName: 'عمار نور الدين' },
  { match: 'rawah901219', displayName: 'ريان راوه' },
  { match: 'reyad908', displayName: 'رياض حمامي' },
];

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * إرجاع الاسم المعروض للمستخدم بناءً على بريده الإلكتروني أو اسمه.
 * في حال عدم وجود تطابق، يُرجع الجزء قبل @ من البريد أو القيمة الافتراضية.
 */
export function getDisplayName(
  emailOrName: string | null | undefined,
  fallback: string = 'مستخدم'
): string {
  if (!emailOrName) return fallback;
  const normalized = normalizeText(String(emailOrName));
  const found = DISPLAY_NAME_MAP.find((u) => normalized.includes(normalizeText(u.match)));
  if (found) return found.displayName;
  // إن كان بريداً إلكترونياً، أعد الجزء قبل @
  return String(emailOrName).split('@')[0] || fallback;
}
