
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Users, Building2 } from 'lucide-react';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const reportCategories = [
    {
      id: 'financial',
      title: 'التقارير المالية',
      description: 'تقارير الإيرادات والمصروفات والأرباح',
      icon: DollarSign,
      reports: [
        { name: 'تقرير الإيرادات الشهرية', lastGenerated: '2024-01-20' },
        { name: 'تقرير المصروفات التشغيلية', lastGenerated: '2024-01-19' },
        { name: 'تقرير الأرباح والخسائر', lastGenerated: '2024-01-18' }
      ]
    },
    {
      id: 'projects',
      title: 'تقارير المشاريع',
      description: 'تقارير حالة المشاريع والتقدم',
      icon: Building2,
      reports: [
        { name: 'تقرير تقدم المشاريع', lastGenerated: '2024-01-20' },
        { name: 'تقرير التكاليف حسب المشروع', lastGenerated: '2024-01-19' },
        { name: 'تقرير المشاريع المتأخرة', lastGenerated: '2024-01-17' }
      ]
    },
    {
      id: 'sales',
      title: 'تقارير المبيعات',
      description: 'تقارير مبيعات الشقق والعقود',
      icon: TrendingUp,
      reports: [
        { name: 'تقرير المبيعات الشهرية', lastGenerated: '2024-01-20' },
        { name: 'تقرير العملاء الجدد', lastGenerated: '2024-01-19' },
        { name: 'تقرير معدل التحويل', lastGenerated: '2024-01-18' }
      ]
    },
    {
      id: 'operations',
      title: 'تقارير العمليات',
      description: 'تقارير الصيانة والمهام والموظفين',
      icon: Users,
      reports: [
        { name: 'تقرير الصيانة والأعطال', lastGenerated: '2024-01-20' },
        { name: 'تقرير إنتاجية الموظفين', lastGenerated: '2024-01-19' },
        { name: 'تقرير المهام المكتملة', lastGenerated: '2024-01-18' }
      ]
    }
  ];

  const quickStats = [
    {
      title: 'إجمالي التقارير',
      value: '48',
      description: 'تقرير متاح',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'التقارير الشهرية',
      value: '12',
      description: 'تقرير شهري',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'التقارير المجدولة',
      value: '8',
      description: 'تقرير آلي',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'معدل الاستخدام',
      value: '85%',
      description: 'من التقارير',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والتحليلات</h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة التقارير التفصيلية والتحليلات</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4 ml-2" />
            إنشاء تقرير مخصص
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقارير</CardTitle>
          <CardDescription>اختر الفترة الزمنية وخصائص التقرير</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Button 
                variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('daily')}
                size="sm"
              >
                يومي
              </Button>
              <Button 
                variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('weekly')}
                size="sm"
              >
                أسبوعي
              </Button>
              <Button 
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('monthly')}
                size="sm"
              >
                شهري
              </Button>
              <Button 
                variant={selectedPeriod === 'quarterly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('quarterly')}
                size="sm"
              >
                ربع سنوي
              </Button>
            </div>
            <div className="flex gap-2 mr-auto">
              <Input type="date" className="w-40" />
              <span className="flex items-center text-gray-500">إلى</span>
              <Input type="date" className="w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        آخر إنشاء: {report.lastGenerated}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm">عرض</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>التقارير الأخيرة</CardTitle>
              <CardDescription>التقارير المُنشأة مؤخراً</CardDescription>
            </div>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'تقرير المبيعات الشهرية - يناير 2024', type: 'مالي', date: '2024-01-20', status: 'مكتمل' },
              { name: 'تقرير تقدم مشروع النخيل', type: 'مشاريع', date: '2024-01-19', status: 'قيد المعالجة' },
              { name: 'تقرير الصيانة والأعطال', type: 'عمليات', date: '2024-01-18', status: 'مكتمل' },
              { name: 'تقرير العملاء الجدد', type: 'مبيعات', date: '2024-01-17', status: 'مكتمل' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {report.type} • {report.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={report.status === 'مكتمل' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
