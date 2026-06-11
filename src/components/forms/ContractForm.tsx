import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Printer, Save, Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';
import { useFileHandler } from '@/hooks/useFileHandler';
import { companyInfo, defaultTerms, printContract } from '@/lib/contractPrint';

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: any;
  contractors?: any[];
  contract?: any;
  onSaved?: () => void;
}

interface ClauseItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

const ContractForm = ({ open, onOpenChange, contractor, contractors = [], contract, onSaved }: ContractFormProps) => {
  const { toast } = useToast();
  const { createContract, updateContract } = useContracts();
  const { uploadFile, viewFile, uploading } = useFileHandler();
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
  const [saving, setSaving] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [items, setItems] = useState<ClauseItem[]>([
    { description: '', quantity: 1, unit: 'مقطوعية', unit_price: 0 },
  ]);

  const activeContractor =
    contractor ||
    contractors.find((c) => c.id === selectedId) ||
    (contract?.contractor_id ? contractors.find((c) => c.id === contract.contractor_id) : null) ||
    (contract ? { name: contract.contractor_name } : null);

  useEffect(() => {
    if (!open) return;
    if (contract) {
      // وضع التعديل
      setSelectedId(contract.contractor_id || '');
      setCompany(contract.company || 'suhail');
      setContractNumber(contract.contract_number || '');
      setContractDate(contract.contract_date || new Date().toISOString().split('T')[0]);
      setProjectName(contract.project_name || '');
      setStartDate(contract.start_date || '');
      setEndDate(contract.end_date || '');
      setDurationDays(contract.duration_days ? String(contract.duration_days) : '');
      setPaymentTerms(contract.payment_terms || '');
      setTerms(contract.terms || defaultTerms);
      setVatEnabled(contract.vat_enabled ?? true);
      setAttachmentUrl(contract.attachment_url || null);
      setAttachmentName(contract.attachment_name || null);
      setItems(
        Array.isArray(contract.items) && contract.items.length > 0
          ? contract.items
          : [{ description: '', quantity: 1, unit: 'مقطوعية', unit_price: 0 }]
      );
    } else {
      setContractNumber(`CON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSelectedId('');
      setCompany('suhail');
      setContractDate(new Date().toISOString().split('T')[0]);
      setProjectName('');
      setStartDate('');
      setEndDate('');
      setDurationDays('');
      setPaymentTerms('دفعات حسب نسبة الإنجاز والمستخلصات المعتمدة');
      setTerms(defaultTerms);
      setVatEnabled(true);
      setAttachmentUrl(null);
      setAttachmentName(null);
      setItems([{ description: '', quantity: 1, unit: 'مقطوعية', unit_price: 0 }]);
    }
  }, [open, contract]);

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

  const buildPayload = () => {
    const ct = activeContractor;
    return {
      contractor_id: ct?.id || null,
      contractor_name: ct?.name || '',
      company,
      contract_number: contractNumber,
      contract_date: contractDate,
      project_name: projectName || null,
      start_date: startDate || null,
      end_date: endDate || null,
      duration_days: durationDays ? Number(durationDays) : null,
      payment_terms: paymentTerms,
      terms,
      vat_enabled: vatEnabled,
      items,
      subtotal,
      vat_amount: vatAmount,
      total,
    };
  };

  const handleSave = async (thenPrint = false) => {
    const ct = activeContractor;
    if (!ct) {
      toast({ title: 'الرجاء اختيار المقاول', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (contract?.id) {
        await updateContract.mutateAsync({ id: contract.id, ...payload });
      } else {
        await createContract.mutateAsync(payload);
      }
      if (thenPrint) {
        printContract({ ...payload, approved: contract?.approved, approved_at: contract?.approved_at }, ct);
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      // الأخطاء تُعرض من الهوك
    } finally {
      setSaving(false);
    }
  };

  const handlePrintOnly = () => {
    const ct = activeContractor;
    if (!ct) {
      toast({ title: 'الرجاء اختيار المقاول', variant: 'destructive' });
      return;
    }
    printContract({ ...buildPayload(), approved: contract?.approved, approved_at: contract?.approved_at }, ct);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'تعديل العقد' : 'إنشاء عقد للمقاول'}</DialogTitle>
          <DialogDescription>
            إنشاء عقد مقاولة ذكي مع الحفظ في النظام وإمكانية الطباعة المباشرة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!contractor && (
            <div className="space-y-2">
              <Label>المقاول</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="اختر المقاول" /></SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الجهة (الطرف الأول)</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(companyInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>{info.name}</SelectItem>
                  ))}
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

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => handleSave(false)} disabled={saving} className="flex-1 min-w-[120px]">
              <Save className="w-4 h-4 ml-2" /> {saving ? 'جارٍ الحفظ...' : 'حفظ العقد'}
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" className="flex-1 min-w-[120px]">
              <Printer className="w-4 h-4 ml-2" /> حفظ وطباعة
            </Button>
            <Button variant="outline" onClick={handlePrintOnly}>
              <Printer className="w-4 h-4 ml-2" /> طباعة فقط
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractForm;
