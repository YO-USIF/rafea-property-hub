import { escapeHtml } from '@/lib/utils';
import { Phase, CostDoc, phaseCost, phaseDelay, computedStatus, daysBetween } from './projectPhases';

const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const d = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-GB') : '—');
const e = escapeHtml;

const shell = (title: string, body: string) => `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${e(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}
@page{size:A4 portrait;margin:1cm}
body{font-family:'Tahoma','Segoe UI',saudi_riyal,sans-serif;color:#1f2937;font-size:12px;margin:0;padding:12px}
h1{font-size:20px;margin:0 0 4px;color:#0f3d5e} h2{font-size:15px;color:#0f3d5e;border-bottom:2px solid #0f3d5e;padding-bottom:4px;margin-top:18px}
.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px double #0f3d5e;padding-bottom:8px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;margin-top:6px} th,td{border:1px solid #cbd5e1;padding:5px 6px;text-align:right}
th{background:#e2e8f0} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.box{border:1px solid #cbd5e1;border-radius:6px;padding:8px} .box b{display:block;font-size:14px;margin-top:2px}
.late{color:#b91c1c;font-weight:bold} .ok{color:#15803d;font-weight:bold}
.bar{height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden}.bar i{display:block;height:100%;background:#0f3d5e}
.tl{position:relative;height:16px;background:#f1f5f9;border-radius:3px}.tl i{position:absolute;top:2px;height:12px;border-radius:3px;background:#0f3d5e}
.tl i.a{background:#f59e0b;top:6px;height:4px}
.footer{margin-top:28px;display:flex;justify-content:space-between;font-size:11px;color:#64748b}
</style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`;

const header = (title: string, project: string) => `<div class="head"><div><h1>${e(title)}</h1><div>المشروع: <b>${e(project)}</b></div></div>
<div style="text-align:left">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</div></div>`;

function openWin(html: string) {
  const w = window.open('', '_blank');
  if (!w) { alert('يرجى السماح بالنوافذ المنبثقة للطباعة'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

export function printPhase(phase: Phase, docs: CostDoc[]) {
  const { linked, total } = phaseCost(phase, docs);
  const delay = phaseDelay(phase);
  const rows = linked.map((x) => `<tr><td>${e(x.kind)}</td><td>${e(x.number)}</td><td>${d(x.date)}</td><td>${e(x.contractor_name)}</td><td>${e(x.description || '')}</td><td>${fmt(x.amount)} \u20C1</td></tr>`).join('');
  const body = `${header('تقرير مرحلة: ' + phase.phase_name, phase.project_name)}
<div class="grid">
<div class="box">الحالة<b>${e(computedStatus(phase))}</b></div>
<div class="box">نسبة الإنجاز<b>${phase.progress}%</b><div class="bar"><i style="width:${phase.progress}%"></i></div></div>
<div class="box">التأخير<b class="${delay ? 'late' : 'ok'}">${delay ? delay + ' يوم' : 'لا يوجد'}</b></div>
<div class="box">البدء المخطط<b>${d(phase.planned_start)}</b></div>
<div class="box">الانتهاء المخطط<b>${d(phase.planned_end)}</b></div>
<div class="box">المدة المخططة<b>${daysBetween(phase.planned_start, phase.planned_end)} يوم</b></div>
<div class="box">البدء الفعلي<b>${d(phase.actual_start)}</b></div>
<div class="box">الانتهاء الفعلي<b>${d(phase.actual_end)}</b></div>
<div class="box">المقاول<b>${e(phase.contractor_name || '—')}</b></div>
<div class="box">الميزانية<b>${fmt(phase.budget)}</b></div>
<div class="box">التكلفة الفعلية<b class="${total > phase.budget && phase.budget > 0 ? 'late' : ''}">${fmt(total)}</b></div>
<div class="box">المتبقي من الميزانية<b>${fmt(phase.budget - total)}</b></div>
</div>
${phase.description ? `<h2>وصف المرحلة</h2><p>${e(phase.description)}</p>` : ''}
<h2>المستندات المرتبطة (${linked.length})</h2>
${linked.length ? `<table><tr><th>النوع</th><th>الرقم</th><th>التاريخ</th><th>المقاول</th><th>البيان</th><th>المبلغ</th></tr>${rows}<tr><th colspan="5">الإجمالي</th><th>${fmt(total)}</th></tr></table>` : '<p>لا توجد مستندات مرتبطة.</p>'}
${phase.notes ? `<h2>ملاحظات</h2><p>${e(phase.notes)}</p>` : ''}
<div class="footer"><span>إعداد: ............</span><span>اعتماد مدير المشروع: ............</span></div>`;
  openWin(shell('مرحلة ' + phase.phase_name, body));
}

export function printTimelineReport(project: string, phases: Phase[], docs: CostDoc[], ai?: any) {
  if (!phases.length) return;
  const start = phases.reduce((m, p) => (p.planned_start < m ? p.planned_start : m), phases[0].planned_start);
  const end = phases.reduce((m, p) => { const x = p.actual_end && p.actual_end > p.planned_end ? p.actual_end : p.planned_end; return x > m ? x : m; }, phases[0].planned_end);
  const span = Math.max(1, daysBetween(start, end));
  const pos = (a: string, b: string) => `right:${(daysBetween(start, a) / span) * 100}%;width:${Math.max(1, (daysBetween(a, b) / span) * 100)}%`;
  let tBudget = 0, tCost = 0;
  const rows = phases.map((p, i) => {
    const { total } = phaseCost(p, docs); tBudget += Number(p.budget); tCost += total;
    const delay = phaseDelay(p);
    return `<tr><td>${i + 1}</td><td>${e(p.phase_name)}</td><td>${d(p.planned_start)}</td><td>${d(p.planned_end)}</td><td>${daysBetween(p.planned_start, p.planned_end)}</td><td>${d(p.actual_start)}</td><td>${d(p.actual_end)}</td><td>${p.progress}%</td><td class="${delay ? 'late' : ''}">${delay}</td><td>${e(computedStatus(p))}</td><td>${fmt(p.budget)}</td><td>${fmt(total)}</td></tr>`;
  }).join('');
  const gantt = phases.map((p) => `<tr><td style="width:25%">${e(p.phase_name)}</td><td><div class="tl"><i style="${pos(p.planned_start, p.planned_end)}"></i>${p.actual_start ? `<i class="a" style="${pos(p.actual_start, p.actual_end || new Date().toISOString().slice(0, 10))}"></i>` : ''}</div></td></tr>`).join('');
  const avg = Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length);
  const late = phases.filter((p) => phaseDelay(p) > 0).length;
  const aiHtml = ai ? `<h2>تحليل الذكاء الصناعي</h2><p><b>الحالة العامة:</b> ${e(ai.health)} — <b>التأخير المتوقع:</b> ${e(String(ai.overall_delay_days ?? 0))} يوم — <b>الإنجاز المتوقع:</b> ${d(ai.predicted_completion)}</p><p>${e(ai.summary)}</p>
${(ai.recommendations || []).length ? `<ul>${ai.recommendations.map((r: string) => `<li>${e(r)}</li>`).join('')}</ul>` : ''}` : '';
  const body = `${header('التقرير الشامل للزمن والمراحل', project)}
<div class="grid">
<div class="box">فترة المشروع<b>${d(start)} ← ${d(end)}</b></div>
<div class="box">المدة الإجمالية<b>${span} يوم</b></div>
<div class="box">متوسط الإنجاز<b>${avg}%</b><div class="bar"><i style="width:${avg}%"></i></div></div>
<div class="box">عدد المراحل<b>${phases.length}</b></div>
<div class="box">المراحل المتأخرة<b class="${late ? 'late' : 'ok'}">${late}</b></div>
<div class="box">التكلفة / الميزانية<b>${fmt(tCost)} / ${fmt(tBudget)}</b></div>
</div>
<h2>المخطط الزمني</h2><div style="font-size:10px">▬ المخطط &nbsp; <span style="color:#f59e0b">▬</span> الفعلي</div><table>${gantt}</table>
<h2>تفاصيل المراحل</h2>
<table style="font-size:10px"><tr><th>#</th><th>المرحلة</th><th>بدء مخطط</th><th>انتهاء مخطط</th><th>المدة</th><th>بدء فعلي</th><th>انتهاء فعلي</th><th>الإنجاز</th><th>تأخير (يوم)</th><th>الحالة</th><th>الميزانية</th><th>التكلفة</th></tr>${rows}
<tr><th colspan="10">الإجمالي</th><th>${fmt(tBudget)}</th><th>${fmt(tCost)}</th></tr></table>
${aiHtml}
<div class="footer"><span>إعداد: ............</span><span>اعتماد: ............</span></div>`;
  openWin(shell('تقرير مراحل ' + project, body));
}
