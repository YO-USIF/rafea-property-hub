import React, { useState, useEffect } from 'react';
import { escapeHtml } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: any;
  contractors?: any[];
}

interface ClauseItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

const companyInfo: Record<string, { name: string; cr: string; vat: string; address: string }> = {
  suhail: {
    name: 'شركة سهيل طيبة للمقاولات',
    cr: '١١٠٢٠٤٤٣٠٣',
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

const defaultTerms = `1. يلتزم الطرف الثاني (المقاول) بتنفيذ الأعمال وفقاً للمواصفات والمخططات المعتمدة.
2. يلتزم المقاول بإنجاز الأعمال خلال المدة المتفق عليها، وفي حال التأخير يحق للطرف الأول فرض غرامة تأخير.
3. تصرف الدفعات بناءً على المستخلصات المعتمدة ونسبة الإنجاز الفعلية.
4. يتحمل المقاول مسؤولية سلامة العمال والموقع طوال فترة تنفيذ المشروع.
5. لا يحق للمقاول التنازل عن العقد أو التعاقد من الباطن إلا بموافقة خطية من الطرف الأول.
6. مدة الضمان للأعمال المنفذة سنة واحدة من تاريخ الاستلام الابتدائي.
7. يخضع هذا العقد لأنظمة المملكة العربية السعودية، وأي نزاع يحل ودياً أو عبر الجهات المختصة.`;

const ContractForm = ({ open, onOpenChange, contractor, contractors = [] }: ContractFormProps) => {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string>('');
  const [company, setCompany] = useState('suhail');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('دفعات حسب نسبة الإنجاز والمستخلصات المعتمدة');
  const [terms, setTerms] = useState(defaultTerms);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [items, setItems] = useState<ClauseItem[]>([
    { description: '', quantity: 1, unit: 'مقطوعية', unit_price: 0 },
  ]);

  const activeContractor = contractor || contractors.find((c) => c.id === selectedId);

  useEffect(() => {
    if (open) {
      setContractNumber(`CON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      if (!contractor) setSelectedId('');
    }
  }, [open, contractor]);

  // حساب مدة العقد تلقائياً من التواريخ
  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0) setDurationDays(String(diff));
    }
  }, [startDate, endDate]);

  const addItem = () =>
    setItems((prev) => [...prev, { description: '', quantity: 1, unit: 'مقطوعية', unit_price: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ClauseItem, value: any) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const subtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);
  const vatAmount = vatEnabled ? subtotal * 0.15 : 0;
  const total = subtotal + vatAmount;

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => {
    const ct = activeContractor; if (!ct) { toast({ title: "الرجاء اختيار المقاول", variant: "destructive" }); return; }
    const c = companyInfo[company];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = items
      .filter((it) => it.description.trim())
      .map(
        (it, idx) => `
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

    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>عقد مقاولة - ${escapeHtml(contractNumber)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Tajawal',Arial,sans-serif; color:#1a202c; direction:rtl; padding:30px; line-height:1.8; }
          .header { text-align:center; border-bottom:3px solid #2c5282; padding-bottom:16px; margin-bottom:24px; }
          .header h1 { font-size:1.6em; color:#2c5282; }
          .header p { color:#4a5568; font-size:0.9em; margin-top:4px; }
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
        </div>

        <div class="meta">
          <span><strong>رقم العقد:</strong> ${escapeHtml(contractNumber)}</span>
          <span><strong>تاريخ العقد:</strong> ${escapeHtml(contractDate)}</span>
          ${projectName ? `<span><strong>المشروع:</strong> ${escapeHtml(projectName)}</span>` : ''}
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
            ${ct.specialization ? `<div>التخصص: ${escapeHtml(ct.specialization)}</div>` : ''}
            ${ct.phone ? `<div>الهاتف: ${escapeHtml(ct.phone)}</div>` : ''}
            ${ct.email ? `<div>البريد: ${escapeHtml(ct.email)}</div>` : ''}
          </div>
        </div>

        <h2 class="section">مدة التنفيذ</h2>
        <div class="meta">
          <span><strong>تاريخ البدء:</strong> ${escapeHtml(startDate || 'غير محدد')}</span>
          <span><strong>تاريخ الانتهاء:</strong> ${escapeHtml(endDate || 'غير محدد')}</span>
          <span><strong>المدة:</strong> ${escapeHtml(durationDays || 'غير محدد')} يوم</span>
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
          ${vatEnabled ? `<tr><td>ضريبة القيمة المضافة (15%):</td><td>${fmt(vatAmount)} ر.س</td></tr>` : ''}
          <tr><td>الإجمالي النهائي:</td><td>${fmt(total)} ر.س</td></tr>
        </table>

        <h2 class="section">شروط الدفع</h2>
        <div class="terms">${escapeHtml(paymentTerms)}</div>

        <h2 class="section">الشروط والأحكام العامة</h2>
        <div class="terms">${escapeHtml(terms)}</div>

        <div class="signatures">
          <div class="sig">الطرف الأول (المالك)<br/><br/>الاسم والتوقيع</div>
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
    toast({ title: 'تم إنشاء العقد', description: 'جاري فتح نافذة الطباعة' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء عقد للمقاول</DialogTitle>
          <DialogDescription>
            إنشاء عقد مقاولة ذكي للمقاول: {contractor?.name} مع إمكانية الطباعة المباشرة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الجهة (الطرف الأول)</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="suhail">شركة سهيل طيبة للمقاولات</SelectItem>
                  <SelectItem value="tamlik">شركة تمليك الغامدي للتطوير العقاري</SelectItem>
                  <SelectItem value="rafea">شركة رافع العقارية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم العقد</Label>
              <Input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>تاريخ العقد</Label>
              <Input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>اسم المشروع</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="اسم المشروع" />
            </div>
            <div className="space-y-2">
              <Label>تاريخ البدء</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>المدة (أيام)</Label>
              <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </div>
          </div>

          {/* بنود الأعمال */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>بنود الأعمال</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 ml-1" /> إضافة بند
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-lg">
                  <Input
                    className="col-span-12 md:col-span-5"
                    placeholder="وصف العمل"
                    value={it.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                  />
                  <Input
                    className="col-span-3 md:col-span-2"
                    type="number"
                    placeholder="الكمية"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                  />
                  <Input
                    className="col-span-4 md:col-span-2"
                    placeholder="الوحدة"
                    value={it.unit}
                    onChange={(e) => updateItem(i, 'unit', e.target.value)}
                  />
                  <Input
                    className="col-span-3 md:col-span-2"
                    type="number"
                    placeholder="سعر الوحدة"
                    value={it.unit_price}
                    onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value))}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="col-span-2 md:col-span-1 text-red-600"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />
                إضافة ضريبة القيمة المضافة (15%)
              </label>
              <span className="font-bold">الإجمالي: {fmt(total)} ر.س</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>شروط الدفع</Label>
            <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>الشروط والأحكام</Label>
            <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={8} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 ml-2" /> إنشاء وطباعة العقد
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractForm;
