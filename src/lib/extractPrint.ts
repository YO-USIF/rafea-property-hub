import { escapeHtml } from '@/lib/utils';
import { getUserSignature, getUserDisplayName } from '@/lib/userSignatures';

const SUHAIL_LOGO = '/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png';

const formatCurrency = (amount: number | null | undefined) =>
  `${(Number(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`;

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? escapeHtml(value) : d.toLocaleDateString('en-GB');
};

// مربع توقيع موحّد يعرض صورة التوقيع إن وُجدت + الاسم الكامل
const signatureBox = (role: string, name?: string | null, sigPath?: string | null, statusHtml = '') => {
  const sig = sigPath !== undefined ? sigPath : getUserSignature(name);
  const display = getUserDisplayName(name) || name || '';
  return `
    <div class="sign-box">
      <div class="sign-top">${escapeHtml(display || role)}</div>
      <div class="sign-img">${sig ? `<img src="${sig}" alt="توقيع" />` : ''}</div>
      ${statusHtml}
      <div class="sign-role">${escapeHtml(role)}</div>
    </div>`;
};

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
  body { font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif, 'saudi_riyal'; direction: rtl; text-align: right; color: #1e293b; background: #f1f5f9; padding: 20px; }
  .sheet { max-width: 850px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,.12); }
  .header { background: linear-gradient(135deg, #0e7490, #0891b2); color: #fff; padding: 24px 32px; text-align: center; }
  .header .logo { height: 70px; object-fit: contain; background: #fff; padding: 6px 10px; border-radius: 8px; margin: 0 auto 10px; display: block; }
  .header h1 { font-size: 24px; font-weight: 700; }
  .header .sub { font-size: 13px; opacity: .9; margin-top: 4px; }
  .title { text-align: center; padding: 16px; }
  .title .name { font-size: 20px; font-weight: 800; color: #0e7490; }
  .title .no { display: inline-block; margin-top: 6px; background: #ecfeff; border: 1px solid #a5f3fc; color: #155e75; padding: 6px 18px; border-radius: 20px; font-weight: 700; }
  .body { padding: 8px 32px 30px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .cell { background: #f8fafc; border: 1px solid #e2e8f0; border-right: 4px solid #0891b2; border-radius: 8px; padding: 10px 14px; }
  .cell .l { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
  .cell .v { font-size: 15px; font-weight: 700; color: #0f172a; }
  .fin { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 18px; }
  .fin .row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .fin .row b { font-weight: 700; }
  .fin .total { background: linear-gradient(135deg, #0e7490, #0891b2); color: #fff; font-size: 17px; font-weight: 800; }
  .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; }
  .notes .l { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
  .notes .v { font-size: 14px; white-space: pre-wrap; line-height: 1.8; color: #334155; }
  table.inst { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; }
  table.inst th, table.inst td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
  table.inst th { background: #ecfeff; color: #155e75; }
  .signs { display: flex; justify-content: space-around; gap: 16px; flex-wrap: wrap; margin-top: 26px; padding-top: 20px; border-top: 2px dashed #cbd5e1; }
  .sign-box { text-align: center; min-width: 150px; flex: 1; }
  .sign-top { font-size: 14px; font-weight: 700; color: #0e7490; margin-bottom: 6px; }
  .sign-img { height: 80px; display: flex; align-items: flex-end; justify-content: center; }
  .sign-img img { max-height: 78px; max-width: 100%; object-fit: contain; }
  .sign-role { font-size: 13px; font-weight: 700; border-top: 1px solid #94a3b8; margin-top: 6px; padding-top: 6px; }
  .sign-status { font-size: 11px; margin: 4px 0; }
  .ok { color: #16a34a; font-weight: 700; }
  .pending { color: #dc2626; font-weight: 700; }
  .footer { text-align: center; padding: 16px; color: #64748b; font-size: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; border-radius: 0; } @page { size: A4; margin: 0.8cm; } }
`;

const openAndPrint = (html: string) => {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.onload = () => {
    w.focus();
    w.print();
  };
};

export const printExtract = (extract: any, company: 'suhail' | 'tamlik' = 'suhail') => {
  const companyName =
    company === 'suhail'
      ? 'شركة سهيل طيبة للتطوير العقاري'
      : 'شركة تمليك الغامدي للتطوير العقاري';
  const logo = company === 'suhail'
    ? `<img src="${SUHAIL_LOGO}" class="logo" alt="الشعار" />`
    : '';

  // التفاصيل المالية
  const amountBeforeTax = Math.max(0, (Number(extract.current_amount) || 0) - (Number(extract.previous_amount) || 0));
  let finRows = '';
  if (extract.previous_amount) {
    finRows += `<div class="row"><span>المبلغ المدفوع سابقاً</span><b>${formatCurrency(extract.previous_amount)}</b></div>`;
  }
  if (extract.current_amount !== null && extract.current_amount !== undefined) {
    finRows += `<div class="row"><span>قيمة المستخلص الحالي</span><b>${formatCurrency(extract.current_amount)}</b></div>`;
  }
  if (extract.tax_included) {
    const tax = amountBeforeTax * 0.15;
    finRows += `<div class="row"><span>صافي المبلغ قبل الضريبة (بعد خصم المدفوع سابقاً)</span><b>${formatCurrency(amountBeforeTax)}</b></div>`;
    finRows += `<div class="row"><span>ضريبة القيمة المضافة (15%)</span><b>${formatCurrency(tax)}</b></div>`;
    finRows += `<div class="row total"><span>إجمالي المبلغ شامل الضريبة</span><b>${formatCurrency(amountBeforeTax + tax)}</b></div>`;
  } else {
    finRows += `<div class="row total"><span>إجمالي المبلغ</span><b>${formatCurrency(extract.amount)}</b></div>`;
  }

  // جدول الدفعات
  let installmentsHtml = '';
  if (extract.payment_type === 'دفعات' && Array.isArray(extract.installments_approvals) && extract.installments_approvals.length > 0) {
    const rows = extract.installments_approvals
      .map(
        (inst: any) => `<tr>
          <td>دفعة ${escapeHtml(String(inst.index))}</td>
          <td>${formatCurrency(Number(inst.amount) || 0)}</td>
          <td>${inst.approved ? '<span class="ok">✅ معتمد</span>' : '<span class="pending">⏳ بانتظار التعميد</span>'}</td>
          <td>${inst.approved && inst.approved_at ? new Date(inst.approved_at).toLocaleDateString('en-GB') : '—'}</td>
        </tr>`
      )
      .join('');
    installmentsHtml = `<table class="inst"><thead><tr><th>#</th><th>قيمة الدفعة</th><th>حالة التعميد</th><th>تاريخ التعميد</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // التواقيع
  const approverStatus = extract.approved
    ? `<div class="sign-status ok">✅ تم التعميد ${extract.approved_at ? new Date(extract.approved_at).toLocaleDateString('en-GB') : ''}</div>`
    : `<div class="sign-status pending">لم يتم التعميد بعد</div>`;
  const approverName = extract.approver_name || 'م/ يوسف صلاح يوسف';
  const approverSig = extract.approved ? (getUserSignature(approverName) || '/signatures/yousef-signature.jpeg') : null;

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>مستخلص ${escapeHtml(extract.extract_number || '')}</title>
    <style>@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}${baseStyles}</style></head>
    <body><div class="sheet">
      <div class="header">
        ${logo}
        <h1>${escapeHtml(companyName)}</h1>
        <div class="sub">المدينة المنورة - المملكة العربية السعودية</div>
      </div>
      <div class="title">
        <div class="name">مستخلص أعمال</div>
        <div class="no">رقم المستخلص: ${escapeHtml(extract.extract_number || '—')}</div>
      </div>
      <div class="body">
        <div class="grid">
          <div class="cell"><div class="l">المشروع</div><div class="v">${escapeHtml(extract.project_name || '—')}</div></div>
          <div class="cell"><div class="l">المقاول</div><div class="v">${escapeHtml(extract.contractor_name || '—')}</div></div>
          <div class="cell"><div class="l">التاريخ</div><div class="v">${formatDate(extract.extract_date)}</div></div>
          <div class="cell"><div class="l">الحالة</div><div class="v">${escapeHtml(extract.status || '—')}</div></div>
          ${extract.percentage_completed !== null && extract.percentage_completed !== undefined ? `<div class="cell"><div class="l">نسبة الإنجاز</div><div class="v">${escapeHtml(String(extract.percentage_completed))}%</div></div>` : ''}
        </div>
        <div class="fin">${finRows}</div>
        ${extract.description ? `<div class="notes"><div class="l">الوصف</div><div class="v">${escapeHtml(extract.description)}</div></div>` : ''}
        ${installmentsHtml}
        <div class="signs">
          ${signatureBox('المُعد', extract.created_by_name)}
          ${signatureBox('المقاول', extract.contractor_name, null)}
          ${signatureBox('المُعتمد', approverName, approverSig, approverStatus)}
        </div>
      </div>
      <div class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} &nbsp;•&nbsp; ${escapeHtml(companyName)} - جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
    </div></body></html>`;

  openAndPrint(html);
};

// ========== تقرير أعمال المقاول ==========
export const printContractorReport = (
  contractorName: string,
  extracts: any[],
  period?: { from?: string; to?: string; project?: string }
) => {
  const net = (e: any) => Math.max(0, (Number(e.current_amount) || 0) - (Number(e.previous_amount) || 0));

  const totals = extracts.reduce(
    (acc, e) => {
      acc.total += Number(e.amount) || 0;
      acc.net += net(e);
      acc.previous += Number(e.previous_amount) || 0;
      acc.current += Number(e.current_amount) || 0;
      if (e.approved) acc.approved += 1;
      return acc;
    },
    { total: 0, net: 0, previous: 0, current: 0, approved: 0 }
  );

  const projects = Array.from(new Set(extracts.map((e) => e.project_name).filter(Boolean)));

  const rows = extracts
    .slice()
    .sort((a, b) => String(a.extract_date).localeCompare(String(b.extract_date)))
    .map(
      (e, i) => `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(e.extract_number || '—')}</td>
        <td>${escapeHtml(e.project_name || '—')}</td>
        <td class="desc">${escapeHtml(e.description || '—')}</td>
        <td>${formatDate(e.extract_date)}</td>
        <td>${escapeHtml(String(e.percentage_completed ?? 0))}%</td>
        <td>${formatCurrency(e.previous_amount)}</td>
        <td>${formatCurrency(e.current_amount)}</td>
        <td>${formatCurrency(net(e))}</td>
        <td><b>${formatCurrency(e.amount)}</b></td>
        <td>${e.approved ? '<span class="ok">معتمد</span>' : '<span class="pending">بانتظار</span>'}</td>
      </tr>`
    )
    .join('');

  // ملخص حسب المشروع
  const byProject = new Map<string, { count: number; net: number; total: number }>();
  extracts.forEach((e) => {
    const p = e.project_name || 'غير محدد';
    const r = byProject.get(p) || { count: 0, net: 0, total: 0 };
    r.count += 1;
    r.net += net(e);
    r.total += Number(e.amount) || 0;
    byProject.set(p, r);
  });
  const projectRows = Array.from(byProject.entries())
    .map(
      ([p, r]) => `<tr>
        <td>${escapeHtml(p)}</td>
        <td>${r.count}</td>
        <td>${formatCurrency(r.net)}</td>
        <td><b>${formatCurrency(r.total)}</b></td>
      </tr>`
    )
    .join('');

  const periodText =
    period && (period.from || period.to || period.project)
      ? `الفترة: ${period.from ? formatDate(period.from) : 'البداية'} — ${period.to ? formatDate(period.to) : 'اليوم'}${period.project ? ` • المشروع: ${period.project}` : ''}`
      : 'كل الفترات';

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>تقرير أعمال المقاول - ${escapeHtml(contractorName)}</title>
    <style>@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}${baseStyles}
      .sheet { max-width: 760px; }
      table.rep { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 18px; }
      table.rep th, table.rep td { border: 1px solid #cbd5e1; padding: 5px 4px; text-align: center; }
      table.rep th { background: #ecfeff; color: #155e75; font-weight: 700; }
      table.rep tbody tr:nth-child(even) { background: #f8fafc; }
      table.rep td.desc { text-align: right; max-width: 160px; }
      table.rep tfoot td { background: #0e7490; color: #fff; font-weight: 800; }
      .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
      .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-top: 4px solid #0891b2; border-radius: 8px; padding: 10px; text-align: center; }
      .kpi .l { font-size: 11px; color: #64748b; font-weight: 600; }
      .kpi .v { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px; }
      h3.sec { font-size: 15px; color: #0e7490; margin: 6px 0 10px; border-right: 4px solid #0891b2; padding-right: 8px; }
      @media print { @page { size: A4 portrait; margin: 0.7cm; } }
    </style></head>
    <body><div class="sheet">
      <div class="header">
        <img src="${SUHAIL_LOGO}" class="logo" alt="الشعار" />
        <h1>تقرير أعمال المقاول</h1>
        <div class="sub">المدينة المنورة - المملكة العربية السعودية</div>
      </div>
      <div class="title">
        <div class="name">${escapeHtml(contractorName)}</div>
        <div class="no">${escapeHtml(periodText)}</div>
      </div>
      <div class="body">
        <div class="kpis">
          <div class="kpi"><div class="l">عدد المستخلصات</div><div class="v">${extracts.length}</div></div>
          <div class="kpi"><div class="l">المعتمدة</div><div class="v">${totals.approved} / ${extracts.length}</div></div>
          <div class="kpi"><div class="l">صافي الأعمال</div><div class="v">${formatCurrency(totals.net)}</div></div>
          <div class="kpi"><div class="l">إجمالي المبالغ</div><div class="v">${formatCurrency(totals.total)}</div></div>
        </div>

        <h3 class="sec">ملخص حسب المشروع (${projects.length})</h3>
        <table class="rep">
          <thead><tr><th>المشروع</th><th>عدد المستخلصات</th><th>صافي الأعمال</th><th>الإجمالي</th></tr></thead>
          <tbody>${projectRows}</tbody>
        </table>

        <h3 class="sec">تفاصيل المستخلصات</h3>
        <table class="rep">
          <thead><tr>
            <th>#</th><th>رقم المستخلص</th><th>المشروع</th><th>وصف الأعمال</th><th>التاريخ</th>
            <th>الإنجاز</th><th>مدفوع سابقاً</th><th>قيمة المستخلص</th><th>الصافي</th><th>الإجمالي</th><th>التعميد</th>
          </tr></thead>
          <tbody>${rows || '<tr><td colspan="11">لا توجد مستخلصات</td></tr>'}</tbody>
          <tfoot><tr>
            <td colspan="6">الإجمالي العام</td>
            <td>${formatCurrency(totals.previous)}</td>
            <td>${formatCurrency(totals.current)}</td>
            <td>${formatCurrency(totals.net)}</td>
            <td>${formatCurrency(totals.total)}</td>
            <td>—</td>
          </tr></tfoot>
        </table>

        <div class="signs">
          ${signatureBox('المُعد', extracts[0]?.created_by_name)}
          ${signatureBox('المقاول', contractorName, null)}
          ${signatureBox('المُعتمد', 'م/ يوسف صلاح يوسف', '/signatures/yousef-signature.jpeg')}
        </div>
      </div>
      <div class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} &nbsp;•&nbsp; جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
    </div></body></html>`;

  openAndPrint(html);
};
