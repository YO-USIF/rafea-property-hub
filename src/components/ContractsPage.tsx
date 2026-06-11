import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, FileSignature, Printer, Edit, Trash2, CheckCircle2, XCircle, FileText, ShieldCheck } from 'lucide-react';
import ContractForm from '@/components/forms/ContractForm';
import { useContracts } from '@/hooks/useContracts';
import { useContractors } from '@/hooks/useContractors';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { companyInfo, printContract } from '@/lib/contractPrint';

const ContractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  const { contracts, isLoading, deleteContract, approveContract, revokeApproval } = useContracts();
  const { contractors } = useContractors();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    const loadNames = async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((p: any) => { map[p.user_id] = p.full_name; });
        setProfileNames(map);
      }
    };
    loadNames();
  }, []);

  const getContractor = (contract: any) =>
    contractors.find((c) => c.id === contract.contractor_id) || { name: contract.contractor_name };

  const handlePrint = (contract: any) => {
    const approverName = contract.approved_by ? profileNames[contract.approved_by] : null;
    printContract(contract, getContractor(contract), approverName);
  };

  const filtered = contracts.filter((c: any) =>
    (c.contractor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contract_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.project_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContracts = contracts.length;
  const approvedCount = contracts.filter((c: any) => c.approved).length;
  const pendingCount = totalContracts - approvedCount;
  const totalValue = contracts.reduce((s: number, c: any) => s + Number(c.total || 0), 0);

  const fmt = (n: number) => Number(n || 0).toLocaleString('en-US');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل العقود...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">عقود المقاولين</h1>
          <p className="text-gray-600 mt-2">إنشاء وحفظ وطباعة واعتماد عقود المقاولين</p>
        </div>
        <Button
          onClick={() => { setEditingContract(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-2" /> إضافة عقد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-muted-foreground">عقد مسجل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عقود معتمدة</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">تم تعميدها</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">بانتظار التعميد</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">مسودة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(totalValue)}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
          <CardDescription>جميع عقود المقاولين المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex-1 mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث برقم العقد أو المقاول أو المشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم العقد</TableHead>
                  <TableHead className="text-right">المقاول</TableHead>
                  <TableHead className="text-right">الجهة</TableHead>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">تاريخ العقد</TableHead>
                  <TableHead className="text-right">القيمة</TableHead>
                  <TableHead className="text-right">التعميد</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      لا توجد عقود مسجلة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((contract: any) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contract_number}</TableCell>
                      <TableCell>{contract.contractor_name}</TableCell>
                      <TableCell>{companyInfo[contract.company]?.name || contract.company}</TableCell>
                      <TableCell>{contract.project_name || '-'}</TableCell>
                      <TableCell>{contract.contract_date}</TableCell>
                      <TableCell>{fmt(contract.total)} ر.س</TableCell>
                      <TableCell>
                        {contract.approved ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">معتمد</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">بانتظار التعميد</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" title="طباعة" onClick={() => handlePrint(contract)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            contract.approved ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                title="إلغاء التعميد"
                                onClick={() => revokeApproval.mutate(contract.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                title="تعميد مدير النظام"
                                onClick={() => approveContract.mutate(contract.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 ml-1" /> تعميد
                              </Button>
                            )
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            title="تعديل"
                            onClick={() => { setEditingContract(contract); setShowForm(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            title="حذف"
                            onClick={() => setDeleteId(contract.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ContractForm
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditingContract(null); }}
        contractors={contractors}
        contract={editingContract}
        onSaved={() => { setShowForm(false); setEditingContract(null); }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف العقد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العقد؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (deleteId) deleteContract.mutate(deleteId); setDeleteId(null); }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
};

export default ContractsPage;
