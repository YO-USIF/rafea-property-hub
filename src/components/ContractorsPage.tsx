import React, { useState, useEffect } from 'react';
import ContractorForm from '@/components/forms/ContractorForm';
import ExtractForm from '@/components/forms/ExtractForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, HardHat, FileText, DollarSign, Clock, Trash2, Edit, Printer, Receipt } from 'lucide-react';
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
  const [showAccountStatement, setShowAccountStatement] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
          return extractNameNormalized === contractorNameNormalized ||
                 extract.contractor_name?.includes(contractor.name) ||
                 contractor.name?.includes(extract.contractor_name);
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
      console.log('Total contracts calculation:', Object.values(stats).reduce((sum: number, st: any) => sum + Number(st.totalContracts || 0), 0));
      console.log('Total pending payments calculation:', Object.values(stats).reduce((sum: number, st: any) => sum + Number(st.pendingPayments || 0), 0));
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

  const generateAccountStatement = async (contractor: any) => {
    try {
      // جلب المستخلصات للمقاول في الفترة المحددة
      let query = supabase
        .from('extracts')
        .select('*')
        .eq('contractor_name', contractor.name)
        .order('extract_date', { ascending: true });

      if (startDate) {
        query = query.gte('extract_date', startDate);
      }
      if (endDate) {
        query = query.lte('extract_date', endDate);
      }

      const { data: contractorExtracts, error } = await query;
      
      if (error) throw error;

      return contractorExtracts || [];
    } catch (error) {
      console.error('Error generating account statement:', error);
      return [];
    }
  };

  const printAccountStatement = async (contractor: any) => {
    const contractorExtracts = await generateAccountStatement(contractor);
    
    const printWindow = window.open('', '_blank');
    const totalAmount = contractorExtracts.reduce((sum, extract) => sum + (Number(extract.amount) || 0), 0);
    const paidAmount = contractorExtracts.filter(ext => ext.status === 'مدفوع' || ext.status === 'مكتمل').reduce((sum, extract) => sum + (Number(extract.amount) || 0), 0);
    const remainingAmount = totalAmount - paidAmount;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>كشف حساب المقاول - ${contractor.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Tajawal', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            direction: rtl;
            background: #f8f9fa;
            padding: 20px;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 { 
            font-size: 2.2em; 
            font-weight: 700; 
            margin-bottom: 10px;
          }
          
          .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .print-date {
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 0.9em;
            opacity: 0.8;
          }
          
          .content {
            padding: 30px;
          }
          
          .contractor-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-right: 4px solid #28a745;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .label {
            font-weight: 600;
            color: #495057;
          }
          
          .value {
            color: #212529;
          }
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .summary-card.total {
            border-color: #007bff;
          }
          
          .summary-card.paid {
            border-color: #28a745;
          }
          
          .summary-card.remaining {
            border-color: #dc3545;
          }
          
          .summary-card h3 {
            font-size: 0.9em;
            margin-bottom: 10px;
            color: #6c757d;
          }
          
          .summary-card .amount {
            font-size: 1.5em;
            font-weight: 700;
          }
          
          .total .amount { color: #007bff; }
          .paid .amount { color: #28a745; }
          .remaining .amount { color: #dc3545; }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .transactions-table th {
            background: #f8f9fa;
            padding: 15px 10px;
            text-align: center;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }
          
          .transactions-table td {
            padding: 12px 10px;
            text-align: center;
            border-bottom: 1px solid #dee2e6;
          }
          
          .transactions-table tr:last-child td {
            border-bottom: none;
          }
          
          .transactions-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
          }
          
          .status-paid {
            background: #d4edda;
            color: #155724;
          }
          
          .status-unpaid {
            background: #f8d7da;
            color: #721c24;
          }
          
          .status-review {
            background: #fff3cd;
            color: #856404;
          }
          
          .period-info {
            background: #e8f5e8;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
            color: #155724;
          }
          
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="شعار الشركة" style="height: 60px; object-fit: contain;" />
              <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
            </div>
            <h1>كشف حساب المقاول</h1>
            <div class="subtitle">تقرير مفصل للمستخلصات والمدفوعات</div>
          </div>
          
          <div class="content">
            <div class="contractor-info">
              <h2 style="margin-bottom: 20px; color: #2c3e50;">بيانات المقاول</h2>
              <div class="info-row">
                <span class="label">اسم المقاول:</span>
                <span class="value">${contractor.name || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">الشركة:</span>
                <span class="value">${contractor.company || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">التخصص:</span>
                <span class="value">${contractor.specialization || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">الهاتف:</span>
                <span class="value">${contractor.phone || 'غير محدد'}</span>
              </div>
              <div class="info-row">
                <span class="label">البريد الإلكتروني:</span>
                <span class="value">${contractor.email || 'غير محدد'}</span>
              </div>
            </div>

            ${startDate || endDate ? `
              <div class="period-info">
                فترة الكشف: ${startDate ? `من ${startDate}` : 'من البداية'} ${endDate ? `إلى ${endDate}` : 'حتى اليوم'}
              </div>
            ` : ''}
            
            <div class="summary-cards">
              <div class="summary-card total">
                <h3>إجمالي المستخلصات</h3>
                <div class="amount">${totalAmount.toLocaleString()} ر.س</div>
              </div>
              <div class="summary-card paid">
                <h3>المبلغ المدفوع</h3>
                <div class="amount">${paidAmount.toLocaleString()} ر.س</div>
              </div>
              <div class="summary-card remaining">
                <h3>الرصيد المتبقي</h3>
                <div class="amount">${remainingAmount.toLocaleString()} ر.س</div>
              </div>
            </div>
            
            <h3 style="margin-bottom: 15px; color: #2c3e50;">تفاصيل المستخلصات</h3>
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>رقم المستخلص</th>
                  <th>التاريخ</th>
                  <th>المشروع</th>
                  <th>المبلغ</th>
                  <th>نسبة الإنجاز</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${contractorExtracts.length > 0 ? contractorExtracts.map(extract => `
                  <tr>
                    <td>${extract.extract_number || 'غير محدد'}</td>
                    <td>${new Date(extract.extract_date).toLocaleDateString('ar-SA')}</td>
                    <td>${extract.project_name || 'غير محدد'}</td>
                    <td>${Number(extract.amount).toLocaleString()} ر.س</td>
                    <td>${extract.percentage_completed || 0}%</td>
                    <td>
                      <span class="status-badge ${extract.status === 'مدفوع' || extract.status === 'مكتمل' ? 'status-paid' : extract.status === 'قيد المراجعة' ? 'status-review' : 'status-unpaid'}">
                        ${extract.status || 'غير محدد'}
                      </span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">
                      لا توجد مستخلصات في الفترة المحددة
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
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
            <div className="text-2xl font-bold">{Number(totalContracts) > 0 ? Number(totalContracts).toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(totalPendingPayments) > 0 ? Number(totalPendingPayments).toLocaleString() : '0'}</div>
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
                            setSelectedContractor(contractor);
                            setShowAccountStatement(true);
                          }}
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
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

      {/* Account Statement Dialog */}
      <Dialog open={showAccountStatement} onOpenChange={setShowAccountStatement}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>كشف حساب المقاول</DialogTitle>
            <DialogDescription>
              كشف حساب تفصيلي للمقاول: {selectedContractor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">من تاريخ</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">إلى تاريخ</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => selectedContractor && printAccountStatement(selectedContractor)}
                className="flex-1"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة الكشف
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAccountStatement(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorsPage;