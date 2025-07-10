import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Calculator,
  TrendingUp,
  DollarSign,
  Download,
  Filter
} from 'lucide-react';
import { useExtracts } from '@/hooks/useExtracts';
import { useAuth } from '@/hooks/useAuth';
import ExtractForm from '@/components/forms/ExtractForm';

const ExtractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExtract, setEditingExtract] = useState<any>(null);
  
  const { user } = useAuth();
  const { extracts, isLoading, deleteExtract } = useExtracts();

  // تصفية المستخصات بناءً على البحث
  const filteredExtracts = extracts.filter(extract =>
    extract.extract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extract.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extract.contractor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الإحصائيات
  const totalExtracts = extracts.length;
  const totalAmount = extracts.reduce((sum, extract) => sum + (extract.current_amount || 0), 0);
  const approvedExtracts = extracts.filter(extract => extract.status === 'معتمد').length;
  const pendingExtracts = extracts.filter(extract => extract.status === 'قيد المراجعة').length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'قيد المراجعة': { variant: 'secondary', label: 'قيد المراجعة' },
      'معتمد': { variant: 'default', label: 'معتمد' },
      'مرفوض': { variant: 'destructive', label: 'مرفوض' },
      'مدفوع': { variant: 'success', label: 'مدفوع' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEdit = (extract: any) => {
    setEditingExtract(extract);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخص؟')) {
      deleteExtract.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExtract(null);
  };

  const quickStats = [
    {
      title: 'إجمالي المستخصات',
      value: totalExtracts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'المعتمدة',
      value: approvedExtracts,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'قيد المراجعة',
      value: pendingExtracts,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'إجمالي المبالغ',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // إضافة تحقق من حالة المستخدم
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>يجب تسجيل الدخول لعرض المستخلصات</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // إضافة تسجيل للتشخيص
  console.log('Extracts data:', extracts);
  console.log('Loading state:', isLoading);
  console.log('Current user:', user);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المستخصات</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة مستخصات المقاولين</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مستخص
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المستخصات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 ml-2" />
                تصفية
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Extracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخصات</CardTitle>
          <CardDescription>
            عرض جميع المستخصات ({filteredExtracts.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم المستخص</TableHead>
                  <TableHead>المشروع</TableHead>
                  <TableHead>المقاول</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>نسبة الإنجاز</TableHead>
                  <TableHead>المبلغ الحالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الملف المرفق</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExtracts.map((extract) => (
                  <TableRow key={extract.id}>
                    <TableCell className="font-medium">{extract.extract_number}</TableCell>
                    <TableCell>{extract.project_name}</TableCell>
                    <TableCell>{extract.contractor_name}</TableCell>
                    <TableCell>{new Date(extract.extract_date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>{extract.percentage_completed}%</TableCell>
                    <TableCell>{formatCurrency(extract.current_amount)}</TableCell>
                    <TableCell>{getStatusBadge(extract.status)}</TableCell>
                    <TableCell>
                      {extract.attached_file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={extract.attached_file_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(extract)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(extract.id)}
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
          
          {filteredExtracts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مستخصات مسجلة'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ExtractForm
        open={showForm}
        onOpenChange={setShowForm}
        extract={editingExtract}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default ExtractsPage;