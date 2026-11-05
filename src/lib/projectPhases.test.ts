import { describe, it, expect } from 'vitest';
import { docMatchesPhase, phaseDelay, computedStatus, type Phase, type CostDoc } from './projectPhases';

const phase: Phase = {
  id: '1', project_id: 'p1', project_name: 'سهيل', phase_name: 'الهيكل', sort_order: 1,
  planned_start: '2026-01-01', planned_end: '2026-03-01', progress: 50, status: '', budget: 0,
  keywords: 'خرسانة، حديد', contractor_name: 'مؤسسة أ',
};
const doc = (o: Partial<CostDoc>): CostDoc => ({
  kind: 'مستخلص', number: 'x', date: '2026-02-01', amount: 100, contractor_name: 'غيره',
  description: '', project_id: 'p1', project_name: 'سهيل', ...o,
});

describe('phase cost linking', () => {
  it('links by keyword in same project', () => expect(docMatchesPhase(doc({ description: 'صب خرسانة' }), phase)).toBe(true));
  it('links by phase contractor', () => expect(docMatchesPhase(doc({ contractor_name: 'مؤسسة أ' }), phase)).toBe(true));
  it('ignores other projects', () => expect(docMatchesPhase(doc({ project_id: 'p2', description: 'خرسانة' }), phase)).toBe(false));
});

describe('phase delay', () => {
  it('counts days past planned end', () => expect(phaseDelay(phase, '2026-03-11')).toBe(10));
  it('marks late phase', () => expect(computedStatus(phase, '2026-03-11')).toBe('متأخرة'));
  it('completed phase is not late', () => expect(phaseDelay({ ...phase, progress: 100 }, '2026-05-01')).toBe(0));
});
