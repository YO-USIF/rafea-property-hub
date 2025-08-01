import React, { useState, useEffect } from 'react';
import ContractorForm from '@/components/forms/ContractorForm';
import ExtractForm from '@/components/forms/ExtractForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, HardHat, FileText, DollarSign, Clock, Trash2, Edit, Printer } from 'lucide-react';
import { useContractors } from '@/hooks/useContractors';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ContractorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContractor, setEditingContractor] = useState<any>(null);
  const [showExtractForm, setShowExtractForm] = useState(false);
  const [extracts, setExtracts] = useState<any[]>([]);
  const [contractorStats, setContractorStats] = useState<any>({});
  const { contractors, isLoading, deleteContractor } = useContractors();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExtractsData();
    }
  }, [user, contractors]);

  const fetchExtractsData = async () => {
    try {
      // جلب بيانات المستخلصات
      const { data: extractsData, error: extractsError } = await supabase
        .from('extracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (extractsError) throw extractsError;
      setExtracts(extractsData || []);

      // حساب إحصائيات كل مقاول
      const stats: any = {};
      
      for (const contractor of contractors) {
        // تحسين مطابقة الأسماء - إزالة المسافات الزائدة وتوحيد الحالة
        const contractorNameNormalized = contractor.name?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        
        const contractorExtracts = extractsData?.filter(extract => {
          const extractNameNormalized = extract.contractor_name?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
          return extractNameNormalized === contractorNameNormalized;
        }) || [];

        console.log(`Contractor: ${contractor.name}, Normalized: ${contractorNameNormalized}, Extracts found: ${contractorExtracts.length}`);

        const totalContracts = contractorExtracts.reduce((sum, extract) => sum + (Number(extract.amount) || 0), 0);
        const pendingPayments = contractorExtracts
          .filter(extract => extract.status !== 'مدفوع' && extract.status !== 'مكتمل')
          .reduce((sum, extract) => sum + (Number(extract.amount) || 0), 0);
        
        const projects = [...new Set(contractorExtracts.map(extract => extract.project_name).filter(Boolean))];

        stats[contractor.id] = {
          projects: projects.length,
          totalContracts,
          pendingPayments,
          projectNames: projects,
          extractsCount: contractorExtracts.length
        };
      }

      console.log('Contractor Stats:', stats);
      setContractorStats(stats);
    } catch (error) {
      console.error('Error fetching extracts data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل البيانات...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'نشط':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نشط</Badge>;
      case 'مكتمل':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">مكتمل</Badge>;
      case 'متوقف':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">متوقف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExtractStatusBadge = (status: string) => {
    if (status.includes('مدفوع')) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مدفوع</Badge>;
    } else if (status.includes('معتمد')) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">معتمد</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد المراجعة</Badge>;
    }
  };

  // تصفية المقاولين حسب البحث
  const filteredContractors = contractors.filter(contractor =>
    contractor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContractors = contractors.length;
  const activeContractors = contractors.filter(c => c.status === 'نشط').length;
  const totalContracts = Object.values(contractorStats).reduce((sum: number, stats: any) => sum + Number(stats.totalContracts || 0), 0);
  const totalPendingPayments = Object.values(contractorStats).reduce((sum: number, stats: any) => sum + Number(stats.pendingPayments || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المقاولون والمستخلصات</h1>
          <p className="text-gray-600 mt-2">إدارة المقاولين ومتابعة المستخلصات والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مقاول
          </Button>
          <Button variant="outline" onClick={() => setShowExtractForm(true)}>
            <FileText className="w-4 h-4 ml-2" />
            إضافة مستخلص
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقاولين</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContractors}</div>
            <p className="text-xs text-muted-foreground">مقاول مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقاولين النشطين</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeContractors}</div>
            <p className="text-xs text-muted-foreground">مقاول نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalContracts) > 0 ? (Number(totalContracts) / 1000000).toFixed(1) + 'م' : '0'}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(totalPendingPayments) > 0 ? (Number(totalPendingPayments) / 1000000).toFixed(1) + 'م' : '0'}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Contractors Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المقاولين</CardTitle>
          <CardDescription>جميع المقاولين المسجلين وبياناتهم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المقاولين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={() => {
              const headers = "اسم المقاول,التخصص,الشخة المسؤول,الهاتف,الحالة\n";
              const csvContent = headers + 
                filteredContractors.map(contractor => 
                  `${contractor.name},${contractor.specialization || ''},${contractor.email || ''},${contractor.phone || ''},${contractor.status}`
                ).join("\n");
              
              // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
              const BOM = '\uFEFF';
              const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'contractors.csv';
              link.click();
            }}>تصدير</Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المقاول</TableHead>
                  <TableHead className="text-right">التخصص</TableHead>
                  <TableHead className="text-right">الشخص المسؤول</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">المشاريع المكلف بها</TableHead>
                  <TableHead className="text-right">إجمالي العقود</TableHead>
                  <TableHead className="text-right">المدفوعات المعلقة</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell className="font-medium">{contractor.name}</TableCell>
                    <TableCell>{contractor.specialization}</TableCell>
                    <TableCell>{contractor.email}</TableCell>
                    <TableCell>{contractor.phone}</TableCell>
                    <TableCell>{contractorStats[contractor.id]?.projects || 0} مشروع</TableCell>
                    <TableCell>{(contractorStats[contractor.id]?.totalContracts || 0).toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-red-600">{(contractorStats[contractor.id]?.pendingPayments || 0).toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge variant="outline">ممتاز</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(contractor.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingContractor(contractor);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteContractor.mutate(contractor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Extracts */}
      <Card>
        <CardHeader>
          <CardTitle>المستخلصات الحديثة</CardTitle>
          <CardDescription>آخر المستخلصات المقدمة من المقاولين</CardDescription>
        </CardHeader>
        <CardContent>
          {extracts && extracts.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم المستخلص</TableHead>
                    <TableHead className="text-right">اسم المقاول</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">تاريخ التقديم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extracts.slice(0, 5).map((extract) => (
                    <TableRow key={extract.id}>
                      <TableCell className="font-medium">{extract.extract_number}</TableCell>
                      <TableCell>{extract.contractor_name}</TableCell>
                      <TableCell>{extract.project_name}</TableCell>
                      <TableCell>{Number(extract.amount).toLocaleString()} ر.س</TableCell>
                      <TableCell>{extract.extract_date}</TableCell>
                      <TableCell>{getExtractStatusBadge(extract.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد مستخلصات حديثة</p>
              <p className="text-xs mt-1">سيتم عرض المستخلصات عند إضافتها</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContractorForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingContractor(null);
        }}
        contractor={editingContractor}
        onSuccess={() => {
          setShowForm(false);
          setEditingContractor(null);
        }}
      />

      <ExtractForm
        open={showExtractForm}
        onOpenChange={setShowExtractForm}
        onSuccess={() => {
          setShowExtractForm(false);
          // Refresh data if needed
        }}
      />
    </div>
  );
};

export default ContractorsPage;