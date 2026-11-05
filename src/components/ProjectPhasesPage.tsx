import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionButton } from '@/components/PermissionButton';
import { Sparkles, Plus, Printer, Pencil, Trash2, BrainCircuit, CalendarRange, Loader2, AlertTriangle } from 'lucide-react';
import { Phase, CostDoc, phaseCost, phaseDelay, computedStatus, daysBetween } from '@/lib/projectPhases';
import { printPhase, printTimelineReport } from '@/lib/phasePrint';

const db = supabase as any;
const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fd = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-GB') : '—');
const today = () => new Date().toISOString().slice(0, 10);

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'مكتملة': 'default', 'قيد التنفيذ': 'secondary', 'متأخرة': 'destructive', 'لم تبدأ': 'outline',
};

const emptyForm = {
  phase_name: '', description: '', planned_start: '', planned_end: '', actual_start: '', actual_end: '',
  progress: 0, budget: 0, contractor_name: '', keywords: '', notes: '', sort_order: 0,
};

async function callAI(mode: 'suggest' | 'analyze', payload: any) {
  const { data, error } = await supabase.functions.invoke('project-phases-ai', { body: { mode, payload } });
  if (error) {
    let msg = error.message;
    try { const b = await (error as any).context?.json?.(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data.result;
}

const ProjectPhasesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selection, setSelection] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Phase | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['phase-projects'],
    queryFn: async () => {
      const { data, error } = await db.from('projects').select('id,name,type,location,start_date,expected_completion,total_cost,land_value,total_units,zone').order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  const zones = useMemo(() => Array.from(new Set(projects.map((p: any) => (p.zone || '').trim()).filter(Boolean))).sort() as string[], [projects]);
  const isZone = selection.startsWith('zone:');
  const zoneName = isZone ? selection.slice(5) : '';
  const scopeProjects = isZone ? projects.filter((p: any) => (p.zone || '').trim() === zoneName) : projects.filter((p: any) => p.id === selection);
  const scopeIds: string[] = scopeProjects.map((p: any) => p.id);
  const projectId = isZone ? (scopeIds.includes(targetId) ? targetId : scopeIds[0] || '') : selection;
  const project = projects.find((p: any) => p.id === projectId);
  const scopeLabel = isZone ? `نطاق ${zoneName} (${scopeProjects.map((p: any) => p.name).join('، ')})` : project?.name || '';
  const nameOf = (id: string | null) => projects.find((p: any) => p.id === id)?.name || '';

  const { data: phases = [] } = useQuery({
    queryKey: ['project_phases', scopeIds.join(',')],
    queryFn: async () => {
      const { data, error } = await db.from('project_phases').select('*').in('project_id', scopeIds).order('sort_order').order('planned_start');
      if (error) throw error;
      return (data || []) as Phase[];
    },
    enabled: scopeIds.length > 0,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['phase-docs', scopeIds.join(',')],
    queryFn: async () => {
      const [ex, ao] = await Promise.all([
        db.from('extracts').select('extract_number,extract_date,amount,current_amount,previous_amount,contractor_name,description,project_id,project_name').in('project_id', scopeIds),
        db.from('assignment_orders').select('order_number,order_date,amount,contractor_name,description,project_id,project_name').in('project_id', scopeIds),
      ]);
      const list: CostDoc[] = [];
      (ex.data || []).forEach((x: any) => list.push({ kind: 'مستخلص', number: x.extract_number, date: x.extract_date, amount: Number(x.amount || 0), contractor_name: x.contractor_name, description: x.description, project_id: x.project_id, project_name: x.project_name }));
      (ao.data || []).forEach((x: any) => list.push({ kind: 'أمر تكليف', number: x.order_number, date: x.order_date, amount: Number(x.amount || 0), contractor_name: x.contractor_name, description: x.description, project_id: x.project_id, project_name: x.project_name }));
      return list;
    },
    enabled: scopeIds.length > 0,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['project_phases'] });

  const save = useMutation({
    mutationFn: async (values: any) => {
      const row = {
        ...values,
        actual_start: values.actual_start || null,
        actual_end: values.actual_end || null,
        progress: Math.min(100, Math.max(0, Number(values.progress) || 0)),
        budget: Number(values.budget) || 0,
        project_id: values.project_id || projectId,
        project_name: nameOf(values.project_id || projectId),
      };
      row.status = computedStatus(row as Phase);
      const q = editing ? db.from('project_phases').update(row).eq('id', editing.id) : db.from('project_phases').insert(row);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: 'تم حفظ المرحلة' }); },
    onError: (e: any) => toast({ title: 'خطأ', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db.from('project_phases').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { invalidate(); toast({ title: 'تم حذف المرحلة' }); },
    onError: (e: any) => toast({ title: 'خطأ', description: e.message, variant: 'destructive' }),
  });

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, project_id: projectId, sort_order: phases.length + 1, planned_start: today(), planned_end: today() }); setFormOpen(true); };
  const openEdit = (p: Phase) => {
    setEditing(p);
    setForm({ ...emptyForm, ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ''])) });
    setFormOpen(true);
  };

  const suggest = async () => {
    if (!project) return;
    setSuggesting(true);
    try {
      const r = await callAI('suggest', { name: project.name, type: project.type, location: project.location, units: project.total_units, start_date: project.start_date, expected_completion: project.expected_completion, total_cost: project.total_cost });
      setSuggestions((r.phases || []).map((p: any) => ({ ...p, selected: true })));
    } catch (e: any) {
      toast({ title: 'تعذر اقتراح المراحل', description: e.message, variant: 'destructive' });
    } finally { setSuggesting(false); }
  };

  const addSuggestions = async () => {
    if (!suggestions || !project) return;
    const chosen = suggestions.filter((s) => s.selected);
    const base = Number(project.total_cost) || 0;
    const rows = chosen.map((s, i) => {
      const r: any = {
        project_id: projectId, project_name: project.name, phase_name: s.phase_name, description: s.description || null,
        planned_start: s.planned_start, planned_end: s.planned_end, keywords: s.keywords || null,
        sort_order: phases.length + i + 1, progress: 0, budget: Math.round((base * Number(s.budget_percent || 0)) / 100),
      };
      r.status = computedStatus(r);
      return r;
    });
    const { error } = await db.from('project_phases').insert(rows);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    setSuggestions(null); invalidate(); toast({ title: `تمت إضافة ${rows.length} مرحلة` });
  };

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const payload = {
        scope: scopeLabel, projects: scopeProjects.map((p: any) => ({ name: p.name, expected_completion: p.expected_completion })),
        phases: phases.map((p) => ({ project: p.project_name, name: p.phase_name, planned_start: p.planned_start, planned_end: p.planned_end, actual_start: p.actual_start, actual_end: p.actual_end, progress: p.progress, budget: p.budget, actual_cost: phaseCost(p, docs).total, delay_days: phaseDelay(p) })),
      };
      setAnalysis(await callAI('analyze', payload));
    } catch (e: any) {
      toast({ title: 'تعذر التحليل', description: e.message, variant: 'destructive' });
    } finally { setAnalyzing(false); }
  };

  const stats = useMemo(() => {
    if (!phases.length) return null;
    const start = phases.reduce((m, p) => (p.planned_start < m ? p.planned_start : m), phases[0].planned_start);
    const end = phases.reduce((m, p) => (p.planned_end > m ? p.planned_end : m), phases[0].planned_end);
    const avg = Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length);
    const late = phases.filter((p) => phaseDelay(p) > 0).length;
    const budget = phases.reduce((s, p) => s + Number(p.budget || 0), 0);
    const cost = phases.reduce((s, p) => s + phaseCost(p, docs).total, 0);
    return { start, end, span: Math.max(1, daysBetween(start, end)), avg, late, budget, cost };
  }, [phases, docs]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarRange className="h-6 w-6 text-primary" /> مراحل المشاريع</h1>
          <p className="text-sm text-muted-foreground">تخطيط المراحل وجدولها الزمني ومتابعة التأخير والتكلفة بمساعدة الذكاء الصناعي</p>
        </div>
        <div className="w-72">
          <Select value={selection} onValueChange={(v) => { setSelection(v); setTargetId(''); setAnalysis(null); }}>
            <SelectTrigger><SelectValue placeholder="اختر المشروع أو النطاق" /></SelectTrigger>
            <SelectContent>
              {zones.map((z) => <SelectItem key={'z' + z} value={'zone:' + z}>🔗 نطاق {z} — كل مشاريعه معاً</SelectItem>)}
              {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}{p.zone ? ` (${p.zone})` : ''}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selection ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">اختر مشروعاً لعرض مراحله والجدول الزمني</CardContent></Card>
      ) : (
        <>
          {isZone && (
            <Card className="border-primary/40"><CardContent className="p-4 flex flex-wrap items-center gap-3 text-sm">
              <span>عرض موحّد لمشاريع النطاق <b>{zoneName}</b>: {scopeProjects.map((p: any) => <Badge key={p.id} variant="secondary" className="mx-0.5">{p.name}</Badge>)}</span>
              <span className="mr-auto flex items-center gap-2">المشروع عند الإضافة/الاقتراح:
                <Select value={projectId} onValueChange={setTargetId}><SelectTrigger className="w-48 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{scopeProjects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></span>
            </CardContent></Card>
          )}
          <div className="flex flex-wrap gap-2">
            <PermissionButton pageName="project_phases" requirePermission="create" onClick={openNew}><Plus className="h-4 w-4 ml-1" /> إضافة مرحلة</PermissionButton>
            <PermissionButton pageName="project_phases" requirePermission="create" variant="secondary" onClick={suggest} disabled={suggesting}>
              {suggesting ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <Sparkles className="h-4 w-4 ml-1" />} اقتراح المراحل بالذكاء الصناعي
            </PermissionButton>
            <Button variant="outline" onClick={analyze} disabled={analyzing || !phases.length}>
              {analyzing ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <BrainCircuit className="h-4 w-4 ml-1" />} تحليل وتوقع التأخير
            </Button>
            <Button variant="outline" onClick={() => printTimelineReport(scopeLabel, phases, docs, analysis)} disabled={!phases.length}>
              <Printer className="h-4 w-4 ml-1" /> التقرير الشامل للزمن
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                ['فترة المشروع', `${fd(stats.start)} ← ${fd(stats.end)}`],
                ['المدة', `${stats.span} يوم`],
                ['متوسط الإنجاز', `${stats.avg}%`],
                ['المراحل المتأخرة', String(stats.late)],
                ['الميزانية', fmt(stats.budget)],
                ['التكلفة الفعلية', fmt(stats.cost)],
              ].map(([l, v]) => (
                <Card key={l}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-bold mt-1">{v}</div></CardContent></Card>
              ))}
            </div>
          )}

          {analysis && (
            <Card className="border-primary/40">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> تحليل الذكاء الصناعي
                <Badge variant={analysis.health === 'حرج' ? 'destructive' : analysis.health === 'متوسط' ? 'secondary' : 'default'}>{analysis.health}</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{analysis.summary}</p>
                <p>التأخير المتوقع: <b>{analysis.overall_delay_days ?? 0} يوم</b> — الإنجاز المتوقع: <b>{fd(analysis.predicted_completion)}</b></p>
                {(analysis.phases || []).filter((p: any) => p.risk !== 'منخفض').map((p: any, i: number) => (
                  <div key={i} className="flex gap-2 items-start"><AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /><span><b>{p.phase_name}</b> ({p.risk}، ~{p.expected_delay_days} يوم): {p.reason}</span></div>
                ))}
                {(analysis.recommendations || []).length > 0 && (
                  <ul className="list-disc pr-5 space-y-1">{analysis.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
                )}
              </CardContent>
            </Card>
          )}

          {stats && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">المخطط الزمني (Timeline)</CardTitle></CardHeader>
              <CardContent className="space-y-2 overflow-x-auto">
                <div className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><i className="inline-block w-4 h-2 rounded bg-primary" /> المخطط</span><span className="flex items-center gap-1"><i className="inline-block w-4 h-1 rounded bg-accent-foreground/60" /> الفعلي</span><span className="flex items-center gap-1"><i className="inline-block w-0.5 h-3 bg-destructive" /> اليوم</span></div>
                {phases.map((p) => {
                  const pos = (a: string, b: string) => ({ right: `${(daysBetween(stats.start, a) / stats.span) * 100}%`, width: `${Math.max(1, (daysBetween(a, b) / stats.span) * 100)}%` });
                  const t = (daysBetween(stats.start, today()) / stats.span) * 100;
                  const late = phaseDelay(p) > 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 min-w-[640px]">
                      <div className="w-44 text-sm truncate" title={p.phase_name}>{p.phase_name}{isZone && <div className="text-xs text-muted-foreground truncate">{p.project_name}</div>}</div>
                      <div className="relative flex-1 h-7 bg-muted rounded">
                        <div className={`absolute top-1 h-5 rounded ${late ? 'bg-destructive/70' : 'bg-primary/80'}`} style={pos(p.planned_start, p.planned_end)}>
                          <div className="h-full rounded bg-primary" style={{ width: `${p.progress}%` }} />
                        </div>
                        {p.actual_start && <div className="absolute bottom-0.5 h-1 rounded bg-accent-foreground/60" style={pos(p.actual_start, p.actual_end || today())} />}
                        {t >= 0 && t <= 100 && <div className="absolute top-0 bottom-0 w-0.5 bg-destructive" style={{ right: `${t}%` }} />}
                      </div>
                      <div className="w-12 text-xs text-left">{p.progress}%</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">المراحل ({phases.length})</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {!phases.length ? <p className="text-center text-muted-foreground py-8">لا توجد مراحل — أضف مرحلة أو استخدم الاقتراح الذكي</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-muted-foreground">
                    {['#', 'المرحلة', 'المخطط', 'الفعلي', 'الإنجاز', 'التأخير', 'الحالة', 'الميزانية', 'التكلفة المرتبطة', ''].map((h) => <th key={h} className="p-2 text-right whitespace-nowrap">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {phases.map((p, i) => {
                      const { total, linked } = phaseCost(p, docs);
                      const delay = phaseDelay(p);
                      const st = computedStatus(p);
                      return (
                        <tr key={p.id} className="border-b hover:bg-muted/40">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2"><div className="font-medium">{p.phase_name}</div>{isZone && <div className="text-xs text-primary">{p.project_name}</div>}{p.contractor_name && <div className="text-xs text-muted-foreground">{p.contractor_name}</div>}</td>
                          <td className="p-2 whitespace-nowrap text-xs">{fd(p.planned_start)} ← {fd(p.planned_end)}</td>
                          <td className="p-2 whitespace-nowrap text-xs">{fd(p.actual_start)} ← {fd(p.actual_end)}</td>
                          <td className="p-2 w-32"><Progress value={p.progress} className="h-2" /><span className="text-xs">{p.progress}%</span></td>
                          <td className={`p-2 ${delay ? 'text-destructive font-bold' : ''}`}>{delay ? `${delay} يوم` : '—'}</td>
                          <td className="p-2"><Badge variant={statusVariant[st]}>{st}</Badge></td>
                          <td className="p-2">{fmt(p.budget)}</td>
                          <td className={`p-2 ${p.budget > 0 && total > p.budget ? 'text-destructive font-bold' : ''}`}>{fmt(total)}<div className="text-xs text-muted-foreground">{linked.length} مستند</div></td>
                          <td className="p-2 whitespace-nowrap">
                            <Button size="icon" variant="ghost" title="طباعة المرحلة" onClick={() => printPhase(p, docs)}><Printer className="h-4 w-4" /></Button>
                            <PermissionButton pageName="project_phases" requirePermission="edit" size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></PermissionButton>
                            <PermissionButton pageName="project_phases" requirePermission="delete" size="icon" variant="ghost" onClick={() => confirm('حذف هذه المرحلة؟') && remove.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></PermissionButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? 'تعديل مرحلة' : 'إضافة مرحلة'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {isZone && <div className="col-span-2"><Label>المشروع</Label>
              <Select value={form.project_id || projectId} onValueChange={(v) => setForm({ ...form, project_id: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{scopeProjects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="col-span-2"><Label>اسم المرحلة *</Label><Input value={form.phase_name} onChange={(e) => setForm({ ...form, phase_name: e.target.value })} /></div>
            <div className="col-span-2"><Label>الوصف</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>البدء المخطط *</Label><Input type="date" value={form.planned_start} onChange={(e) => setForm({ ...form, planned_start: e.target.value })} /></div>
            <div><Label>الانتهاء المخطط *</Label><Input type="date" value={form.planned_end} onChange={(e) => setForm({ ...form, planned_end: e.target.value })} /></div>
            <div><Label>البدء الفعلي</Label><Input type="date" value={form.actual_start} onChange={(e) => setForm({ ...form, actual_start: e.target.value })} /></div>
            <div><Label>الانتهاء الفعلي</Label><Input type="date" value={form.actual_end} onChange={(e) => setForm({ ...form, actual_end: e.target.value })} /></div>
            <div><Label>نسبة الإنجاز %</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
            <div><Label>الميزانية</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
            <div><Label>المقاول (لربط المستخلصات)</Label><Input value={form.contractor_name} onChange={(e) => setForm({ ...form, contractor_name: e.target.value })} /></div>
            <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <div className="col-span-2"><Label>كلمات الربط (مفصولة بفواصل)</Label><Input placeholder="مثال: حفر, خرسانة, حديد" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">أي مستخلص أو أمر تكليف في نفس المشروع يحتوي بيانه على إحدى الكلمات، أو باسم نفس المقاول، يُحسب ضمن تكلفة المرحلة.</p></div>
            <div className="col-span-2"><Label>ملاحظات</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button disabled={save.isPending || !form.phase_name || !form.planned_start || !form.planned_end || form.planned_end < form.planned_start}
              onClick={() => { const { id, user_id, created_at, updated_at, project_name, status, ...v } = form; save.mutate(v); }}>
              {save.isPending && <Loader2 className="h-4 w-4 ml-1 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!suggestions} onOpenChange={(o) => !o && setSuggestions(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> المراحل المقترحة</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">اختر المراحل التي تريد إضافتها، ويمكنك تعديلها لاحقاً. الميزانية تُحسب كنسبة من تكلفة المشروع.</p>
          <div className="space-y-2">
            {(suggestions || []).map((s, i) => (
              <label key={i} className="flex gap-3 items-start border rounded p-3 cursor-pointer hover:bg-muted/40">
                <input type="checkbox" className="mt-1" checked={s.selected} onChange={(e) => setSuggestions(suggestions!.map((x, j) => (j === i ? { ...x, selected: e.target.checked } : x)))} />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{s.phase_name} <span className="text-xs text-muted-foreground">({s.budget_percent}%)</span></div>
                  <div className="text-xs text-muted-foreground">{fd(s.planned_start)} ← {fd(s.planned_end)}</div>
                  {s.description && <div className="text-xs mt-1">{s.description}</div>}
                </div>
              </label>
            ))}
          </div>
          <DialogFooter><Button onClick={addSuggestions}>إضافة المراحل المحددة</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPhasesPage;
