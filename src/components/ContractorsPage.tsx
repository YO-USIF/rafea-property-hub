import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, HardHat, FileText, DollarSign, Clock } from 'lucide-react';

const ContractorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const contractors = [
    {
      id: 1,
      name: 'شركة البناء المتقدم',
      specialty: 'أعمال خرسانية',
      contactPerson: 'المهندس محمد أحمد',
      phone: '0501234567',
      email: 'info@advanced-construction.com',
      projectsAssigned: 2,
      totalContracts: 2500000,
      completedExtracts: 5,
      pendingPayments: 350000,
      rating: 4.8,
      status: 'نشط'
    },
    {
      id: 2,
      name: 'مؤسسة الأعمال الكهربائية',
      specialty: 'أعمال كهربائية',
      contactPerson: 'أحمد سالم العتيبي',
      phone: '0507654321',
      email: 'electrical@works.com',
      projectsAssigned: 3,
      totalContracts: 1200000,
      completedExtracts: 3,
      pendingPayments: 180000,
      rating: 4.5,
      status: 'نشط'
    },
    {
      id: 3,
      name: 'شركة السباكة الحديثة',
      specialty: 'أعمال سباكة',
      contactPerson: 'عبدالله فهد المطيري',
      phone: '0509876543',
      email: 'modern@plumbing.com',
      projectsAssigned: 1,
      totalContracts: 800000,
      completedExtracts: 2,
      pendingPayments: 120000,
      rating: 4.2,
      status: 'مكتمل'
    }
  ];

  const extracts = [
    {
      id: 1,
      extractNumber: 'EXT-2024-001',
      contractorName: 'شركة البناء المتقدم',
      projectName: 'مجمع النخيل السكني',
      extractAmount: 450000,
      workDescription: 'أعمال الخرسانة - الدور الثالث',
      submissionDate: '2024-01-15',
      approvalDate: '2024-01-18',
      paymentDate: null,
      status: 'معتمد - في انتظار الدفع'
    },
    {
      id: 2,
      extractNumber: 'EXT-2024-002',
      contractorName: 'مؤسسة الأعمال الكهربائية',
      projectName: 'برج الياسمين التجاري',
      extractAmount: 180000,
      workDescription: 'تركيب الكابلات الكهربائية',
      submissionDate: '2024-01-10',
      approvalDate: '2024-01-12',
      paymentDate: '2024-01-20',
      status: 'مدفوع'
    }
  ];

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

  const totalContractors = contractors.length;
  const activeContractors = contractors.filter(c => c.status === 'نشط').length;
  const totalContracts = contractors.reduce((sum, c) => sum + c.totalContracts, 0);
  const totalPendingPayments = contractors.reduce((sum, c) => sum + c.pendingPayments, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المقاولون والمستخلصات</h1>
          <p className="text-gray-600 mt-2">إدارة المقاولين ومتابعة المستخلصات والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مقاول
          </Button>
          <Button variant="outline">
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
            <div className="text-2xl font-bold">{(totalContracts / 1000000).toFixed(1)}م</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalPendingPayments.toLocaleString()}</div>
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
            <Button variant="outline">تصفية</Button>
            <Button variant="outline">تصدير</Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell className="font-medium">{contractor.name}</TableCell>
                    <TableCell>{contractor.specialty}</TableCell>
                    <TableCell>{contractor.contactPerson}</TableCell>
                    <TableCell>{contractor.phone}</TableCell>
                    <TableCell>{contractor.projectsAssigned}</TableCell>
                    <TableCell>{contractor.totalContracts.toLocaleString()} ر.س</TableCell>
                    <TableCell>{contractor.pendingPayments.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{contractor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contractor.status)}</TableCell>
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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المستخلص</TableHead>
                  <TableHead className="text-right">المقاول</TableHead>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">وصف العمل</TableHead>
                  <TableHead className="text-right">تاريخ التقديم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extracts.map((extract) => (
                  <TableRow key={extract.id}>
                    <TableCell className="font-medium">{extract.extractNumber}</TableCell>
                    <TableCell>{extract.contractorName}</TableCell>
                    <TableCell>{extract.projectName}</TableCell>
                    <TableCell>{extract.extractAmount.toLocaleString()} ر.س</TableCell>
                    <TableCell>{extract.workDescription}</TableCell>
                    <TableCell>{extract.submissionDate}</TableCell>
                    <TableCell>{getExtractStatusBadge(extract.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorsPage;