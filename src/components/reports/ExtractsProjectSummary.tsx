import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Extract {
  id: string;
  extract_number: string;
  project_name: string;
  contractor_name: string;
  amount: number;
  current_amount: number;
  previous_amount: number;
  percentage_completed: number;
  status: string;
  extract_date: string;
  description?: string;
}

interface ExtractsProjectSummaryProps {
  extracts: Extract[];
}

interface ProjectSummary {
  projectName: string;
  extractsCount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  completionPercentage: number;
  extracts: Extract[];
}

export const ExtractsProjectSummary = ({ extracts }: ExtractsProjectSummaryProps) => {
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // تجميع المستخلصات حسب المشروع
  const projectSummaries: ProjectSummary[] = Object.values(
    extracts.reduce((acc, extract) => {
      const projectName = extract.project_name;
      
      if (!acc[projectName]) {
        acc[projectName] = {
          projectName,
          extractsCount: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          completionPercentage: 0,
          extracts: []
        };
      }
      
      acc[projectName].extractsCount++;
      acc[projectName].totalAmount += extract.amount || 0;
      acc[projectName].paidAmount += extract.current_amount || 0;
      acc[projectName].extracts.push(extract);
      
      return acc;
    }, {} as Record<string, ProjectSummary>)
  ).map(summary => {
    summary.pendingAmount = summary.totalAmount - summary.paidAmount;
    summary.completionPercentage = summary.totalAmount > 0 
      ? Math.round((summary.paidAmount / summary.totalAmount) * 100) 
      : 0;
    return summary;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  const handleViewDetails = (project: ProjectSummary) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>ملخص المستخلصات حسب المشروع</CardTitle>
          <CardDescription>
            عرض إحصائيات ومبالغ المستخلصات لكل مشروع على حدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المشروع</TableHead>
                  <TableHead className="text-center">عدد المستخلصات</TableHead>
                  <TableHead className="text-center">إجمالي المبالغ</TableHead>
                  <TableHead className="text-center">المبالغ المدفوعة</TableHead>
                  <TableHead className="text-center">المتبقي</TableHead>
                  <TableHead className="text-center">نسبة الإنجاز</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد مستخلصات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  projectSummaries.map((project, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{project.extractsCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold text-purple-600">
                            {formatCurrency(project.totalAmount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(project.paidAmount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(project.pendingAmount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{project.completionPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog للتقرير التفصيلي */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>التقرير التفصيلي - {selectedProject?.projectName}</DialogTitle>
            <DialogDescription>
              جميع المستخلصات الخاصة بهذا المشروع
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6">
              {/* إحصائيات المشروع */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">عدد المستخلصات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedProject.extractsCount}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(selectedProject.totalAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">المبالغ المدفوعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedProject.paidAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">نسبة الإنجاز</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedProject.completionPercentage}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* جدول المستخلصات التفصيلي */}
              <Card>
                <CardHeader>
                  <CardTitle>قائمة المستخلصات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">رقم المستخلص</TableHead>
                          <TableHead className="text-right">المقاول</TableHead>
                          <TableHead className="text-center">التاريخ</TableHead>
                          <TableHead className="text-center">المبلغ</TableHead>
                          <TableHead className="text-center">المدفوع</TableHead>
                          <TableHead className="text-center">نسبة الإنجاز</TableHead>
                          <TableHead className="text-center">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProject.extracts.map((extract) => (
                          <TableRow key={extract.id}>
                            <TableCell className="font-medium">{extract.extract_number}</TableCell>
                            <TableCell>{extract.contractor_name}</TableCell>
                            <TableCell className="text-center">
                              {new Date(extract.extract_date).toLocaleDateString('en-GB')}
                            </TableCell>
                            <TableCell className="text-center font-semibold text-purple-600">
                              {formatCurrency(extract.amount)}
                            </TableCell>
                            <TableCell className="text-center font-semibold text-green-600">
                              {formatCurrency(extract.current_amount || 0)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {extract.percentage_completed || 0}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(extract.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
