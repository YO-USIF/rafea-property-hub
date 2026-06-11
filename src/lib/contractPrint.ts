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

  const todayStr = new Date().toLocaleDateString('en-GB');

  const content = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>عقد مقاولة - ${escapeHtml(contract.contract_number)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        html,body { background:#fff; }
        body { font-family:'Tajawal',Arial,sans-serif; color:#1a202c; direction:rtl; line-height:1.85; font-size:13px; }

        .page {
          width:210mm; min-height:297mm; padding:18mm 16mm 24mm;
          margin:0 auto; position:relative; background:#fff; display:flex; flex-direction:column;
        }
        .page + .page { page-break-before:always; }

        /* الترويسة */
        .brand { display:flex; align-items:center; justify-content:space-between; gap:16px; border-bottom:3px solid #2c5282; padding-bottom:14px; margin-bottom:6px; }
        .brand .company-block h2 { color:#2c5282; font-size:1.15em; font-weight:800; }
        .brand .company-block span { display:block; color:#718096; font-size:0.78em; margin-top:2px; }
        .brand .doc-block { text-align:left; }
        .brand .doc-title { background:#2c5282; color:#fff; padding:6px 18px; border-radius:6px; font-weight:800; font-size:1.05em; }
        .brand .doc-block small { display:block; color:#4a5568; font-size:0.78em; margin-top:6px; }
        .approved-badge { display:inline-block; background:#dcfce7; color:#166534; border:1px solid #86efac; padding:3px 12px; border-radius:20px; font-size:0.72em; font-weight:700; margin-top:6px; }

        .intro { background:#f7fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin:16px 0; font-size:0.88em; }
        .meta { display:flex; flex-wrap:wrap; gap:10px 24px; }
        .meta span { font-size:0.88em; }

        .parties { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
        .party { border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; }
        .party h3 { color:#fff; background:#2c5282; font-size:0.9em; margin:-12px -14px 10px; padding:7px 14px; border-radius:8px 8px 0 0; }
        .party div { font-size:0.84em; margin-bottom:4px; }

        h2.section { color:#2c5282; font-size:1.02em; font-weight:800; margin:18px 0 8px; border-right:4px solid #2c5282; padding-right:10px; }

        table { width:100%; border-collapse:collapse; margin:8px 0; font-size:0.82em; }
        th,td { border:1px solid #cbd5e0; padding:7px 6px; text-align:center; }
        th { background:#2c5282; color:#fff; font-weight:700; }
        tbody tr:nth-child(even) { background:#f7fafc; }

        .totals { margin-top:8px; width:55%; margin-left:auto; }
        .totals td { text-align:left; padding:7px 10px; }
        .totals td:first-child { text-align:right; font-weight:600; background:#f7fafc; }
        .totals tr:last-child td { font-weight:800; background:#ebf8ff; color:#2c5282; font-size:1.05em; }

        .terms { white-space:pre-line; font-size:0.84em; background:#f7fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:8px; }

        .signatures { display:grid; grid-template-columns:1fr 1fr; gap:50px; margin-top:auto; padding-top:40px; text-align:center; }
        .sig { border-top:2px solid #1a202c; padding-top:10px; font-size:0.88em; font-weight:600; }
        .sig .role { color:#2c5282; font-weight:800; margin-bottom:8px; }

        .footer { position:absolute; bottom:10mm; right:16mm; left:16mm; display:flex; justify-content:space-between; border-top:1px solid #cbd5e0; padding-top:6px; color:#a0aec0; font-size:0.72em; }

        @page { size:A4; margin:0; }
        @media print { .page { margin:0; box-shadow:none; } }
      </style>
    </head>
    <body>

      <!-- ====== الصفحة الأولى ====== -->
      <div class="page">
        <div class="brand">
          <div class="company-block">
            <h2>${escapeHtml(c.name)}</h2>
            <span>السجل التجاري: ${escapeHtml(c.cr)} • الرقم الضريبي: ${escapeHtml(c.vat)}</span>
            <span>${escapeHtml(c.address)}</span>
          </div>
          <div class="doc-block">
            <div class="doc-title">عقد مقاولة</div>
            <small>رقم: ${escapeHtml(contract.contract_number)}</small>
            <small>التاريخ: ${escapeHtml(contract.contract_date)}</small>
            ${contract.approved ? '<div class="approved-badge">معتمد من الإدارة</div>' : ''}
          </div>
        </div>

        <div class="intro">
          إنه في يوم ${escapeHtml(contract.contract_date)} تم الاتفاق والتراضي بين الطرفين الموضحة بياناتهما أدناه على تنفيذ الأعمال المبيّنة في هذا العقد وفقاً للشروط والبنود التالية.
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

        <h2 class="section">بيانات المشروع ومدة التنفيذ</h2>
        <div class="intro meta">
          ${contract.project_name ? `<span><strong>المشروع:</strong> ${escapeHtml(contract.project_name)}</span>` : ''}
          <span><strong>تاريخ البدء:</strong> ${escapeHtml(contract.start_date || 'غير محدد')}</span>
          <span><strong>تاريخ الانتهاء:</strong> ${escapeHtml(contract.end_date || 'غير محدد')}</span>
          <span><strong>المدة:</strong> ${escapeHtml(String(contract.duration_days || 'غير محدد'))} يوم</span>
        </div>

        <h2 class="section">بنود الأعمال والقيمة المالية</h2>
        <table>
          <thead>
            <tr>
              <th style="width:5%">م</th><th>وصف العمل</th><th style="width:9%">الكمية</th><th style="width:11%">الوحدة</th><th style="width:15%">سعر الوحدة</th><th style="width:16%">الإجمالي</th>
            </tr>
          </thead>
          <tbody>${itemsRows || '<tr><td colspan="6">لا توجد بنود</td></tr>'}</tbody>
        </table>

        <table class="totals">
          <tr><td>الإجمالي قبل الضريبة:</td><td>${fmt(subtotal)} ر.س</td></tr>
          ${contract.vat_enabled ? `<tr><td>ضريبة القيمة المضافة (15%):</td><td>${fmt(vatAmount)} ر.س</td></tr>` : ''}
          <tr><td>الإجمالي النهائي:</td><td>${fmt(total)} ر.س</td></tr>
        </table>

        <div class="footer">
          <span>${escapeHtml(c.name)}</span>
          <span>عقد رقم ${escapeHtml(contract.contract_number)} — صفحة 1 من 2</span>
        </div>
      </div>

      <!-- ====== الصفحة الثانية ====== -->
      <div class="page">
        <div class="brand">
          <div class="company-block">
            <h2>${escapeHtml(c.name)}</h2>
            <span>تابع عقد المقاولة رقم: ${escapeHtml(contract.contract_number)}</span>
          </div>
          <div class="doc-block">
            <div class="doc-title">الشروط والتوقيعات</div>
          </div>
        </div>

        <h2 class="section">شروط الدفع</h2>
        <div class="terms">${escapeHtml(contract.payment_terms || 'تصرف الدفعات وفقاً للمستخلصات المعتمدة ونسبة الإنجاز الفعلية.')}</div>

        <h2 class="section">الشروط والأحكام العامة</h2>
        <div class="terms">${escapeHtml(contract.terms || defaultTerms)}</div>

        <div class="signatures">
          ${firstPartySig}
          <div class="sig">
            <div class="role">الطرف الثاني (المقاول)</div>
            <br/><br/>
            ${escapeHtml(ct.name || '')}<br/>الاسم والتوقيع
          </div>
        </div>

        <div class="footer">
          <span>حُرّر بتاريخ ${todayStr}</span>
          <span>عقد رقم ${escapeHtml(contract.contract_number)} — صفحة 2 من 2</span>
        </div>
      </div>

      <script>
        window.onload = function() { setTimeout(function(){ window.print(); }, 300); window.onafterprint = function(){ window.close(); }; };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}
