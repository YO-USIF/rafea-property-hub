export interface Phase {
  id: string;
  project_id: string | null;
  project_name: string;
  phase_name: string;
  description?: string | null;
  sort_order: number;
  planned_start: string;
  planned_end: string;
  actual_start?: string | null;
  actual_end?: string | null;
  progress: number;
  status: string;
  budget: number;
  contractor_name?: string | null;
  keywords?: string | null;
  notes?: string | null;
}

export interface CostDoc {
  kind: 'مستخلص' | 'أمر تكليف';
  number: string;
  date: string;
  amount: number;
  contractor_name: string;
  description: string | null;
  project_id: string | null;
  project_name: string;
}

const DAY = 86400000;
export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY);

/** A cost document belongs to a phase when it is in the same project and
 * matches one of the phase keywords (in description) or the phase contractor. */
export function docMatchesPhase(doc: CostDoc, phase: Phase): boolean {
  const sameProject = phase.project_id
    ? doc.project_id === phase.project_id
    : doc.project_name?.trim() === phase.project_name.trim();
  if (!sameProject) return false;
  const kws = (phase.keywords || '')
    .split(/[,،]/)
    .map((k) => k.trim())
    .filter(Boolean);
  const desc = doc.description || '';
  if (kws.some((k) => desc.includes(k))) return true;
  const c = phase.contractor_name?.trim();
  return !!c && doc.contractor_name?.trim() === c;
}

export function phaseCost(phase: Phase, docs: CostDoc[]) {
  const linked = docs.filter((d) => docMatchesPhase(d, phase));
  return { linked, total: linked.reduce((s, d) => s + Number(d.amount || 0), 0) };
}

/** Delay in days vs plan (positive = late). */
export function phaseDelay(phase: Phase, today = new Date().toISOString().slice(0, 10)): number {
  if (phase.actual_end) return Math.max(0, daysBetween(phase.planned_end, phase.actual_end));
  if (phase.progress >= 100) return 0;
  return Math.max(0, daysBetween(phase.planned_end, today));
}

export function computedStatus(phase: Phase, today = new Date().toISOString().slice(0, 10)): string {
  if (phase.progress >= 100 || phase.actual_end) return 'مكتملة';
  if (phaseDelay(phase, today) > 0) return 'متأخرة';
  if (phase.progress > 0 || phase.actual_start || today >= phase.planned_start) return 'قيد التنفيذ';
  return 'لم تبدأ';
}
