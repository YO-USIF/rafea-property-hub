// PDF and Excel export utilities for reports

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Export data as Excel (CSV with BOM for Arabic support)
export const exportToExcel = (data: any[], columns: { key: string; header: string }[], filename: string) => {
  const BOM = '\uFEFF';
  const headers = columns.map(c => c.header).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  const csv = BOM + headers + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

// Export report content as PDF (print-based)
export const exportToPDF = (elementId: string, title: string) => {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; color: #333; }
        h1, h2, h3 { margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: right; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: 700; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
        .stat-card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-value { font-size: 20px; font-weight: 700; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        .report-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .report-date { color: #666; font-size: 12px; }
        .project-section { margin: 20px 0; page-break-inside: avoid; }
        .project-title { background: #f0f9ff; padding: 10px; border-radius: 6px; font-weight: 700; margin-bottom: 10px; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>${title}</h1>
        <p class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
      </div>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// Helper to download blob
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Sales report columns
export const salesColumns = [
  { key: 'customer_name', header: 'اسم العميل' },
  { key: 'project_name', header: 'المشروع' },
  { key: 'unit_type', header: 'نوع الوحدة' },
  { key: 'unit_number', header: 'رقم الوحدة' },
  { key: 'price', header: 'السعر' },
  { key: 'remaining_amount', header: 'المبلغ المتبقي' },
  { key: 'status', header: 'الحالة' },
  { key: 'sale_date', header: 'تاريخ البيع' },
];

export const invoiceColumns = [
  { key: 'invoice_number', header: 'رقم الفاتورة' },
  { key: 'supplier_name', header: 'المورد' },
  { key: 'amount', header: 'المبلغ' },
  { key: 'status', header: 'الحالة' },
  { key: 'invoice_date', header: 'تاريخ الفاتورة' },
  { key: 'due_date', header: 'تاريخ الاستحقاق' },
];

export const purchaseColumns = [
  { key: 'order_number', header: 'رقم الطلب' },
  { key: 'supplier_name', header: 'المورد' },
  { key: 'project_name', header: 'المشروع' },
  { key: 'total_amount', header: 'المبلغ' },
  { key: 'status', header: 'الحالة' },
  { key: 'order_date', header: 'تاريخ الطلب' },
];

export const extractColumns = [
  { key: 'extract_number', header: 'رقم المستخلص' },
  { key: 'contractor_name', header: 'المقاول' },
  { key: 'project_name', header: 'المشروع' },
  { key: 'amount', header: 'المبلغ' },
  { key: 'status', header: 'الحالة' },
  { key: 'extract_date', header: 'التاريخ' },
];

export const taskColumns = [
  { key: 'title', header: 'عنوان المهمة' },
  { key: 'assigned_to', header: 'مسند إلى' },
  { key: 'department', header: 'القسم' },
  { key: 'priority', header: 'الأولوية' },
  { key: 'status', header: 'الحالة' },
  { key: 'progress', header: 'نسبة الإنجاز' },
  { key: 'due_date', header: 'تاريخ الاستحقاق' },
];

export const maintenanceColumns = [
  { key: 'building_name', header: 'المبنى' },
  { key: 'unit', header: 'الوحدة' },
  { key: 'issue_type', header: 'نوع المشكلة' },
  { key: 'priority', header: 'الأولوية' },
  { key: 'status', header: 'الحالة' },
  { key: 'estimated_cost', header: 'التكلفة المقدرة' },
  { key: 'reported_date', header: 'تاريخ البلاغ' },
];
