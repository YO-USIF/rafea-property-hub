import { escapeHtml } from '@/lib/utils';
import { getUserSignature } from '@/lib/userSignatures';
import { resolvePreparerName } from '@/lib/preparerName';

const COMPANY_LOGO = '/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png';
const COMPANY_NAME = 'شركة سهيل طيبة للتطوير العقاري';

const formatCurrency = (amount: number | null | undefined) =>
  `${(Number(amount) || 0).toLocaleString('en-US')} ريال سعودي`;

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? escapeHtml(value) : d.toLocaleDateString('en-GB');
};

// مربع توقيع: يعرض صورة التوقيع إن وُجدت تحت اسم الشخص
const signatureBox = (label: string, name?: string | null) => {
  if (!name) return '';
  const sig = getUserSignature(name);
  return `
    <div class="sign-box">
      <div class="sign-role">${escapeHtml(label)}</div>
      <div class="sign-img">${sig ? `<img src="${sig}" alt="توقيع" />` : ''}</div>
      <div class="sign-name">${escapeHtml(name)}</div>
    </div>`;
};

const baseStyles = (accent: string, accent2: string) => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
  body { font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif, 'saudi_riyal'; direction: rtl; text-align: right; color: #1e293b; background: #f1f5f9; padding: 24px; }
  .sheet { max-width: 850px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,.12); }
  .header { background: linear-gradient(135deg, ${accent}, ${accent2}); color: #fff; padding: 28px 32px; }
  .header .top { display: flex; align-items: center; justify-content: space-between; }
  .header .logo { height: 58px; object-fit: contain; background: #fff; padding: 6px 10px; border-radius: 8px; }
  .header h1 { font-size: 26px; font-weight: 700; }
  .header .sub { font-size: 13px; opacity: .9; margin-top: 4px; }
  .header .doc-no { text-align: left; font-size: 13px; }
  .header .doc-no b { display: block; font-size: 20px; }
  .body { padding: 30px 32px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
  .cell { background: #f8fafc; border: 1px solid #e2e8f0; border-right: 4px solid ${accent}; border-radius: 8px; padding: 12px 14px; }
  .cell .l { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
  .cell .v { font-size: 15px; font-weight: 700; color: #0f172a; }
  .amount { background: linear-gradient(135deg, #059669, #10b981); color: #fff; border-radius: 12px; padding: 18px; text-align: center; margin: 8px 0 22px; }
  .amount .l { font-size: 13px; opacity: .9; }
  .amount .v { font-size: 26px; font-weight: 800; margin-top: 4px; }
  .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 18px; margin-bottom: 22px; }
  .notes .l { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
  .notes .v { font-size: 14px; white-space: pre-wrap; line-height: 1.8; color: #334155; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
  .signs { display: flex; justify-content: space-around; gap: 16px; flex-wrap: wrap; margin-top: 28px; padding-top: 22px; border-top: 2px dashed #cbd5e1; }
  .sign-box { text-align: center; min-width: 150px; }
  .sign-role { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 6px; }
  .sign-img { height: 60px; display: flex; align-items: center; justify-content: center; }
  .sign-img img { max-height: 60px; object-fit: contain; }
  .sign-name { font-size: 14px; font-weight: 700; border-top: 1px solid #94a3b8; margin-top: 4px; padding-top: 6px; }
  .footer { text-align: center; padding: 18px; color: #64748b; font-size: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; } }
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

export const printPurchaseOrder = async (order: any) => {
  const preparerName = await resolvePreparerName(order.user_id || order.created_by);
  const statusColor =
    order.status === 'معتمد'
      ? 'background:#dcfce7;color:#166534;'
      : order.status === 'في انتظار الموافقة'
      ? 'background:#fef3c7;color:#92400e;'
      : 'background:#fee2e2;color:#991b1b;';
  const deliveryColor =
    order.delivery_status === 'تم التسليم'
      ? 'background:#dcfce7;color:#166534;'
      : order.delivery_status === 'قيد التجهيز'
      ? 'background:#dbeafe;color:#1e40af;'
      : 'background:#f1f5f9;color:#475569;';

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" />
    <title>طلب شراء ${escapeHtml(order.order_number)}</title>
    <style>@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}${baseStyles('#f59e0b', '#d97706')}</style></head>
    <body><div class="sheet">
      <div class="header">
        <div class="top">
          <img src="${COMPANY_LOGO}" class="logo" alt="الشعار" />
          <div style="text-align:center"><h1>طلب شراء</h1><div class="sub">نظام إدارة المشتريات</div></div>
          <div class="doc-no">رقم الطلب<b>${escapeHtml(order.order_number)}</b></div>
        </div>
      </div>
      <div class="body">
        <div class="grid">
          <div class="cell"><div class="l">اسم المورد</div><div class="v">${escapeHtml(order.supplier_name || '—')}</div></div>
          <div class="cell"><div class="l">المشروع</div><div class="v">${escapeHtml(order.project_name || '—')}</div></div>
          <div class="cell"><div class="l">طالب الشراء</div><div class="v">${escapeHtml(order.requested_by || '—')}</div></div>
          <div class="cell"><div class="l">مسؤول المشتريات</div><div class="v">${escapeHtml(order.purchase_officer || '—')}</div></div>
          <div class="cell"><div class="l">تاريخ الطلب</div><div class="v">${formatDate(order.order_date)}</div></div>
          <div class="cell"><div class="l">تاريخ التسليم المتوقع</div><div class="v">${formatDate(order.expected_delivery)}</div></div>
          <div class="cell"><div class="l">حالة الموافقة</div><div class="v"><span class="badge" style="${statusColor}">${escapeHtml(order.status || '—')}</span></div></div>
          <div class="cell"><div class="l">حالة التسليم</div><div class="v"><span class="badge" style="${deliveryColor}">${escapeHtml(order.delivery_status || '—')}</span></div></div>
        </div>
        <div class="amount"><div class="l">المبلغ الإجمالي</div><div class="v">${formatCurrency(order.total_amount)}</div></div>
        ${order.notes ? `<div class="notes"><div class="l">الأصناف / تفاصيل الطلب</div><div class="v">${escapeHtml(order.notes)}</div></div>` : ''}
        <div class="signs">
          ${signatureBox('مُعد المستند', preparerName)}
          ${signatureBox('طالب الشراء', order.requested_by)}
          ${signatureBox('مسؤول المشتريات', order.purchase_officer)}
          ${signatureBox('المعتمد', order.approved_by)}
        </div>
      </div>
      <div class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} &nbsp;•&nbsp; ${COMPANY_NAME}</div>
    </div></body></html>`;

  openAndPrint(html);
};

export const printInvoice = async (invoice: any, linkedPurchase?: any) => {
  const preparerName = await resolvePreparerName(invoice.user_id || invoice.created_by);
  const statusColor =
    invoice.status === 'مدفوع'
      ? 'background:#dcfce7;color:#166534;'
      : invoice.status === 'متأخر'
      ? 'background:#fef3c7;color:#92400e;'
      : 'background:#fee2e2;color:#991b1b;';

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8" />
    <title>فاتورة ${escapeHtml(invoice.invoice_number)}</title>
    <style>@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}${baseStyles('#4f46e5', '#7c3aed')}</style></head>
    <body><div class="sheet">
      <div class="header">
        <div class="top">
          <img src="${COMPANY_LOGO}" class="logo" alt="الشعار" />
          <div style="text-align:center"><h1>فاتورة</h1><div class="sub">نظام إدارة الفواتير</div></div>
          <div class="doc-no">رقم الفاتورة<b>${escapeHtml(invoice.invoice_number)}</b></div>
        </div>
      </div>
      <div class="body">
        <div class="grid">
          <div class="cell"><div class="l">رقم طلب الشراء</div><div class="v">${escapeHtml(linkedPurchase?.order_number || '—')}</div></div>
          <div class="cell"><div class="l">اسم المورد</div><div class="v">${escapeHtml(invoice.supplier_name || '—')}</div></div>
          <div class="cell"><div class="l">المشروع</div><div class="v">${escapeHtml(linkedPurchase?.project_name || '—')}</div></div>
          <div class="cell"><div class="l">حالة الدفع</div><div class="v"><span class="badge" style="${statusColor}">${escapeHtml(invoice.status || '—')}</span></div></div>
          <div class="cell"><div class="l">تاريخ الفاتورة</div><div class="v">${formatDate(invoice.invoice_date)}</div></div>
          <div class="cell"><div class="l">تاريخ الاستحقاق</div><div class="v">${formatDate(invoice.due_date)}</div></div>
        </div>
        <div class="amount"><div class="l">المبلغ الإجمالي</div><div class="v">${formatCurrency(invoice.amount)}</div></div>
        ${invoice.description ? `<div class="notes"><div class="l">تفاصيل الفاتورة</div><div class="v">${escapeHtml(invoice.description)}</div></div>` : ''}
        <div class="signs">
          ${signatureBox('مُعد الفاتورة', preparerName)}
          ${signatureBox('طالب الشراء', linkedPurchase?.requested_by)}
          ${signatureBox('مسؤول المشتريات', linkedPurchase?.purchase_officer)}
          ${signatureBox('المعتمد', linkedPurchase?.approved_by)}
        </div>
      </div>
      <div class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')} &nbsp;•&nbsp; ${COMPANY_NAME}</div>
    </div></body></html>`;

  openAndPrint(html);
};
