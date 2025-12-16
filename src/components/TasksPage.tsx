
import React, { useState } from 'react';
import TaskForm from '@/components/forms/TaskForm';
import TaskReportForm from '@/components/forms/TaskReportForm';
import AttachFileForm from '@/components/forms/AttachFileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ClipboardList, User, Calendar, CheckCircle2, Trash2, Edit, Printer, FileText, Eye, File, ExternalLink, Paperclip, MessageCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useUserRole } from '@/hooks/useUserRole';
import { useTaskReports } from '@/hooks/useTaskReports';
import { useProfiles } from '@/hooks/useProfiles';
import { useWhatsApp } from '@/hooks/useWhatsApp';

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [showReports, setShowReports] = useState(false);
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [attachingTask, setAttachingTask] = useState<any>(null);
  const { tasks, isLoading, deleteTask } = useTasks();
  const { isAdmin, isManager } = useUserRole();
  const { reports, deleteReport } = useTaskReports();
  const { profiles } = useProfiles();
  const { sendWhatsAppMessage, isSending } = useWhatsApp();
  
  const isManagerOrAdmin = isAdmin || isManager;

  // دالة إرسال رسالة WhatsApp للمدير المُكلف بالمهمة
  const handleSendWhatsApp = async (task: any) => {
    // البحث عن رقم جوال المدير المُكلف بالمهمة
    const assignedProfile = profiles.find(
      p => p.full_name === task.assigned_to || p.email?.split('@')[0] === task.assigned_to
    );
    
    if (!assignedProfile?.phone) {
      alert('لا يوجد رقم جوال مسجل لهذا المستخدم');
      return;
    }

    const message = `📋 تحديث حول المهمة

العنوان: ${task.title}
الحالة: ${task.status}
نسبة الإنجاز: ${task.progress}%
تاريخ الاستحقاق: ${task.due_date}
${task.description ? `\nالوصف: ${task.description}` : ''}

يرجى مراجعة التفاصيل في النظام.`;

    await sendWhatsAppMessage({ to: assignedProfile.phone, message });
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
      case 'مكتملة':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مكتملة</Badge>;
      case 'قيد التنفيذ':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد التنفيذ</Badge>;
      case 'جديدة':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">جديدة</Badge>;
      case 'متأخرة':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">متأخرة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالية':
        return 'text-red-600';
      case 'متوسطة':
        return 'text-yellow-600';
      case 'منخفضة':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // تصفية المهام حسب البحث
  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'مكتملة').length;
  const inProgressTasks = tasks.filter(task => task.status === 'قيد التنفيذ').length;
  const newTasks = tasks.filter(task => task.status === 'جديدة').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المهام اليومية</h1>
          <p className="text-gray-600 mt-2">إدارة وتتبع المهام والأنشطة اليومية</p>
        </div>
        <div className="flex gap-2">
          {isManagerOrAdmin && (
            <Button 
              variant="outline"
              onClick={() => setShowReports(!showReports)}
            >
              <FileText className="w-4 h-4 ml-2" />
              {showReports ? 'إخفاء التقارير' : 'عرض التقارير'}
            </Button>
          )}
          {isManagerOrAdmin && (
            <Button 
              variant="outline"
              onClick={() => setShowReportForm(true)}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة تقرير
            </Button>
          )}
          {isManagerOrAdmin && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مهمة جديدة
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">مهمة إجمالية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">مهمة مكتملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">مهمة جارية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام جديدة</CardTitle>
            <User className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{newTasks}</div>
            <p className="text-xs text-muted-foreground">مهمة جديدة</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المهام</CardTitle>
          <CardDescription>جميع المهام المسندة للموظفين مع حالة التقدم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المهام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => {
                  const headers = "رقم المهمة,عنوان المهمة,المسؤول,القسم,الأولوية,الحالة,نسبة الإنجاز,تاريخ الاستحقاق\n";
                  const csvContent = headers + 
                    filteredTasks.map(task => 
                      `${task.id},${task.title},${task.assigned_to},${task.department},${task.priority},${task.status},${task.progress}%,${task.due_date}`
                    ).join("\n");
                  
                  // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
                  const BOM = '\uFEFF';
                  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'tasks.csv';
                  link.click();
                }}>تصدير</Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المهمة</TableHead>
                  <TableHead className="text-right">عنوان المهمة</TableHead>
                  <TableHead className="text-right">المسؤول</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">نسبة الإنجاز</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الملف المرفق</TableHead>
                  {isManagerOrAdmin && <TableHead className="text-right">الإجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">#{task.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{task.assigned_to}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>
                      <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{task.due_date}</TableCell>
                    <TableCell>
                      {task.file_url && task.file_name ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(task.file_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <File className="w-4 h-4" />
                          <span className="max-w-20 truncate">{task.file_name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">لا يوجد ملف</span>
                      )}
                    </TableCell>
                    {isManagerOrAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSendWhatsApp(task)}
                            disabled={isSending}
                            title="إرسال رسالة WhatsApp"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setAttachingTask(task);
                              setShowAttachForm(true);
                            }}
                            title="إرفاق ملف"
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteTask.mutate(task.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Task Reports Section */}
      {showReports && (
        <Card>
          <CardHeader>
            <CardTitle>تقارير المهام</CardTitle>
            <CardDescription>تقارير المسؤولين حول سير العمل والمهام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(report.report_date).toLocaleDateString('en-GB')}
                      </span>
                      {isAdmin && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingReport(report);
                              setShowReportForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteReport.mutate(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {report.content}
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  لا توجد تقارير بعد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <TaskForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingTask(null);
          }}
          task={editingTask}
          onSuccess={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {isManagerOrAdmin && (
        <TaskReportForm
          open={showReportForm}
          onOpenChange={(open) => {
            setShowReportForm(open);
            if (!open) setEditingReport(null);
          }}
          report={editingReport}
          onSuccess={() => {
            setShowReportForm(false);
            setEditingReport(null);
          }}
        />
      )}

      {isManagerOrAdmin && attachingTask && (
        <AttachFileForm
          open={showAttachForm}
          onOpenChange={(open) => {
            setShowAttachForm(open);
            if (!open) setAttachingTask(null);
          }}
          taskId={attachingTask.id}
          taskTitle={attachingTask.title}
          currentFileUrl={attachingTask.file_url}
          currentFileName={attachingTask.file_name}
          onSuccess={() => {
            setShowAttachForm(false);
            setAttachingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
