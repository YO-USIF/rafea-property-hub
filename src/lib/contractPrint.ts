import { escapeHtml } from '@/lib/utils';
import { getUserSignature, getUserDisplayName } from '@/lib/userSignatures';

export const companyInfo: Record<string, { name: string; cr: string; vat: string; address: string }> = {
  suhail: {
    name: 'شركة سهيل طيبة للمقاولات',
    cr: '٧٠٤٠٦٢٩٧١٤',
    vat: '٣٠٠٢٨٩٨٨٥٢٠٠٠٠٣',
    address: 'المدينة المنورة، المملكة العربية السعودية',
  },
  tamlik: {
    name: 'شركة تمليك الغامدي للتطوير العقاري',
    cr: '١١٠٣٢٥٧٩٨١',
    vat: '٣١١٣٨١٧٥٤٠٠٠٠٣',
    address: 'المدينة المنورة، المملكة العربية السعودية',
  },
  rafea: {
    name: 'شركة رافع العقارية',
    cr: '١١٠٤٤٥٦٧٨٩',
    vat: '٣١٢٤٥٦٧٨٩٠٠٠٠٣',
    address: 'المدينة المنورة، المملكة العربية السعودية',
  },
};

export const defaultTerms = `1. يلتزم الطرف الثاني (المقاول) بتنفيذ الأعمال وفقاً للمواصفات والمخططات المعتمدة.
2. يلتزم المقاول بإنجاز الأعمال خلال المدة المتفق عليها، وفي حال التأخير يحق للطرف الأول فرض غرامة تأخير.
3. تصرف الدفعات بناءً على المستخلصات المعتمدة ونسبة الإنجاز الفعلية.
4. يتحمل المقاول مسؤولية سلامة العمال والموقع طوال فترة تنفيذ المشروع.
5. لا يحق للمقاول التنازل عن العقد أو التعاقد من الباطن إلا بموافقة خطية من الطرف الأول.
6. مدة الضمان للأعمال المنفذة سنة واحدة من تاريخ الاستلام الابتدائي.
7. يخضع هذا العقد لأنظمة المملكة العربية السعودية، وأي نزاع يحل ودياً أو عبر الجهات المختصة.`;

const fmt = (n: number) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface ContractData {
  company: string;
  contract_number: string;
  contract_date: string;
  project_name?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: string | number;
  items?: any[];
  vat_enabled?: boolean;
  subtotal?: number;
  vat_amount?: number;
  total?: number;
  payment_terms?: string;
  terms?: string;
  approved?: boolean;
  approved_at?: string | null;
}

export function printContract(
  contract: ContractData,
  contractor: any,
  approverName?: string | null
) {
  const c = companyInfo[contract.company] || companyInfo.suhail;
  const ct = contractor || {};
  const items = Array.isArray(contract.items) ? contract.items : [];

  const subtotal =
    contract.subtotal ??
    items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);
  const vatAmount = contract.vat_amount ?? (contract.vat_enabled ? subtotal * 0.15 : 0);
  const total = contract.total ?? subtotal + vatAmount;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsRows = items
    .filter((it: any) => (it.description || '').trim())
    .map(
      (it: any, idx: number) => `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align:right;">${escapeHtml(it.description)}</td>
          <td>${it.quantity}</td>
          <td>${escapeHtml(it.unit)}</td>
          <td>${fmt(Number(it.unit_price))}</td>
          <td>${fmt(Number(it.quantity) * Number(it.unit_price))}</td>
        </tr>`
    )
    .join('');

  // ختم التعميد لمدير النظام
  const sigPath = getUserSignature(approverName);
  const sigName = getUserDisplayName(approverName) || approverName || 'مدير النظام';
  const firstPartySig = contract.approved
    ? `<div class="sig">الطرف الأول (المالك)<br/>
        <div style="color:#16a34a;font-size:0.78em;margin-top:4px;">✅ معتمد من الإدارة ${
          contract.approved_at ? new Date(contract.approved_at).toLocaleDateString('en-GB') : ''
        }</div>
        ${sigPath ? `<img src="${sigPath}" style="height:55px;object-fit:contain;margin:4px auto;" />` : '<br/><br/>'}
        <div style="font-weight:600;">${escapeHtml(sigName)}</div>
      </div>`
    : `<div class="sig">الطرف الأول (المالك)<br/><br/>الاسم والتوقيع</div>`;

  const content = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>عقد مقاولة - ${escapeHtml(contract.contract_number)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Tajawal',Arial,sans-serif; color:#1a202c; direction:rtl; padding:30px; line-height:1.8; }
        .header { text-align:center; border-bottom:3px solid #2c5282; padding-bottom:16px; margin-bottom:24px; }
        .header h1 { font-size:1.6em; color:#2c5282; }
        .header p { color:#4a5568; font-size:0.9em; margin-top:4px; }
        .approved-badge { display:inline-block; background:#dcfce7; color:#166534; padding:4px 14px; border-radius:20px; font-size:0.8em; font-weight:700; margin-top:8px; }
        .meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; background:#f7fafc; padding:14px; border-radius:8px; margin-bottom:20px; font-size:0.9em; }
        .parties { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
        .party { border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
        .party h3 { color:#2c5282; font-size:1em; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; }
        .party div { font-size:0.88em; margin-bottom:4px; }
        h2.section { color:#2c5282; font-size:1.1em; margin:20px 0 10px; border-right:4px solid #2c5282; padding-right:10px; }
        table { width:100%; border-collapse:collapse; margin:12px 0; font-size:0.85em; }
        th,td { border:1px solid #cbd5e0; padding:8px; text-align:center; }
        th { background:#2c5282; color:#fff; }
        .totals { margin-top:8px; width:50%; margin-left:auto; }
        .totals td { text-align:left; }
        .totals tr:last-child td { font-weight:700; background:#ebf8ff; }
        .terms { white-space:pre-line; font-size:0.88em; background:#f7fafc; padding:14px; border-radius:8px; }
        .signatures { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:50px; text-align:center; }
        .sig { border-top:1px solid #1a202c; padding-top:8px; font-size:0.9em; }
        @media print { body { padding:15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>عقد مقاولة</h1>
        <p>${escapeHtml(c.name)}</p>
        ${contract.approved ? '<div class="approved-badge">معتمد من الإدارة</div>' : ''}
      </div>

      <div class="meta">
        <span><strong>رقم العقد:</strong> ${escapeHtml(contract.contract_number)}</span>
        <span><strong>تاريخ العقد:</strong> ${escapeHtml(contract.contract_date)}</span>
        ${contract.project_name ? `<span><strong>المشروع:</strong> ${escapeHtml(contract.project_name)}</span>` : ''}
      </div>

      <div class="parties">
        <div class="party">
          <h3>الطرف الأول (المالك)</h3>
          <div><strong>${escapeHtml(c.name)}</strong></div>
          <div>السجل التجاري: ${escapeHtml(c.cr)}</div>
          <div>الرقم الضريبي: ${escapeHtml(c.vat)}</div>
          <div>${escapeHtml(c.address)}</div>
        </div>
        <div class="party">
          <h3>الطرف الثاني (المقاول)</h3>
          <div><strong>${escapeHtml(ct.name || '')}</strong></div>
          ${ct.company ? `<div>الشركة: ${escapeHtml(ct.company)}</div>` : ''}
          ${ct.commercial_registration ? `<div>السجل التجاري: ${escapeHtml(ct.commercial_registration)}</div>` : ''}
          ${ct.specialization ? `<div>التخصص: ${escapeHtml(ct.specialization)}</div>` : ''}
          ${ct.phone ? `<div>الهاتف: ${escapeHtml(ct.phone)}</div>` : ''}
          ${ct.email ? `<div>البريد: ${escapeHtml(ct.email)}</div>` : ''}
        </div>
      </div>

      <h2 class="section">مدة التنفيذ</h2>
      <div class="meta">
        <span><strong>تاريخ البدء:</strong> ${escapeHtml(contract.start_date || 'غير محدد')}</span>
        <span><strong>تاريخ الانتهاء:</strong> ${escapeHtml(contract.end_date || 'غير محدد')}</span>
        <span><strong>المدة:</strong> ${escapeHtml(String(contract.duration_days || 'غير محدد'))} يوم</span>
      </div>

      <h2 class="section">بنود الأعمال والقيمة المالية</h2>
      <table>
        <thead>
          <tr>
            <th>م</th><th>وصف العمل</th><th>الكمية</th><th>الوحدة</th><th>سعر الوحدة</th><th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>${itemsRows || '<tr><td colspan="6">لا توجد بنود</td></tr>'}</tbody>
      </table>

      <table class="totals">
        <tr><td>الإجمالي قبل الضريبة:</td><td>${fmt(subtotal)} ر.س</td></tr>
        ${contract.vat_enabled ? `<tr><td>ضريبة القيمة المضافة (15%):</td><td>${fmt(vatAmount)} ر.س</td></tr>` : ''}
        <tr><td>الإجمالي النهائي:</td><td>${fmt(total)} ر.س</td></tr>
      </table>

      <h2 class="section">شروط الدفع</h2>
      <div class="terms">${escapeHtml(contract.payment_terms || '')}</div>

      <h2 class="section">الشروط والأحكام العامة</h2>
      <div class="terms">${escapeHtml(contract.terms || '')}</div>

      <div class="signatures">
        ${firstPartySig}
        <div class="sig">الطرف الثاني (المقاول)<br/><br/>${escapeHtml(ct.name || '')}<br/>الاسم والتوقيع</div>
      </div>

      <script>
        window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}
