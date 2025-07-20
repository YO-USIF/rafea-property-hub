import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCostData {
  id: string;
  name: string;
  invoiceDetails: any[];
  extractDetails: any[];
  invoiceCosts: number;
  extractCosts: number;
  totalProjectCosts: number;
  invoiceCount: number;
  extractCount: number;
}

interface ProjectCostCenterReportProps {
  data: ProjectCostData[];
  period: string;
}

export const ProjectCostCenterReport: React.FC<ProjectCostCenterReportProps> = ({ data, period }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalAllProjects = data.reduce((sum, project) => sum + project.totalProjectCosts, 0);
  const totalInvoices = data.reduce((sum, project) => sum + project.invoiceCosts, 0);
  const totalExtracts = data.reduce((sum, project) => sum + project.extractCosts, 0);

  return (
    <div className="space-y-6">
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">عدد المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إجمالي التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAllProjects)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">تكاليف الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalInvoices)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">تكاليف المستخلصات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalExtracts)}</div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل كل مشروع */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">تفاصيل تكاليف المشاريع</h3>
        
        {data.map((project) => (
          <Card key={project.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{project.name}</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(project.totalProjectCosts)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ملخص التكاليف */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">
                    {formatCurrency(project.invoiceCosts)}
                  </div>
                  <div className="text-sm text-gray-600">
                    تكاليف الفواتير ({project.invoiceCount} فاتورة)
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(project.extractCosts)}
                  </div>
                  <div className="text-sm text-gray-600">
                    تكاليف المستخلصات ({project.extractCount} مستخلص)
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(project.totalProjectCosts)}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي التكاليف</div>
                </div>
              </div>

              {/* تفاصيل الفواتير */}
              {project.invoiceDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">تفاصيل الفواتير:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-right p-2">رقم الفاتورة</th>
                          <th className="text-right p-2">المورد</th>
                          <th className="text-right p-2">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.invoiceDetails.map((invoice, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{invoice.invoice_number}</td>
                            <td className="p-2">{invoice.supplier_name}</td>
                            <td className="p-2 font-medium">{formatCurrency(invoice.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* تفاصيل المستخلصات */}
              {project.extractDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">تفاصيل المستخلصات:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-right p-2">رقم المستخلص</th>
                          <th className="text-right p-2">المقاول</th>
                          <th className="text-right p-2">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.extractDetails.map((extract, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{extract.extract_number}</td>
                            <td className="p-2">{extract.contractor_name}</td>
                            <td className="p-2 font-medium">{formatCurrency(extract.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* إذا لم توجد تكاليف */}
              {project.invoiceDetails.length === 0 && project.extractDetails.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  لا توجد تكاليف مرتبطة بهذا المشروع
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* رسالة إذا لم توجد مشاريع */}
      {data.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">لا توجد مشاريع أو تكاليف في الفترة المحددة</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};