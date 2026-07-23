import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ZoneCosts {
  ZONE1: number;
  ZONE2: number;
  UNASSIGNED: number;
}

export const useZoneCosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['zone-costs'],
    enabled: !!user?.id,
    queryFn: async (): Promise<ZoneCosts> => {
      const [extractsRes, invoicesRes, aoRes, projectsRes] = await Promise.all([
        supabase.from('extracts').select('amount, zone, project_id'),
        supabase.from('invoices').select('amount, zone, project_id'),
        supabase.from('assignment_orders').select('amount, project_id'),
        supabase.from('projects').select('id, zone'),
      ]);

      if (extractsRes.error) throw extractsRes.error;
      if (invoicesRes.error) throw invoicesRes.error;
      if (aoRes.error) throw aoRes.error;
      if (projectsRes.error) throw projectsRes.error;

      const projZone: Record<string, string | null> = {};
      (projectsRes.data || []).forEach((p: any) => { projZone[p.id] = p.zone; });

      const totals: ZoneCosts = { ZONE1: 0, ZONE2: 0, UNASSIGNED: 0 };

      const add = (zone: string | null | undefined, amount: number) => {
        const n = Number(amount) || 0;
        if (zone === 'ZONE1') totals.ZONE1 += n;
        else if (zone === 'ZONE2') totals.ZONE2 += n;
        else totals.UNASSIGNED += n;
      };

      (extractsRes.data || []).forEach((r: any) =>
        add(r.zone || (r.project_id ? projZone[r.project_id] : null), r.amount)
      );
      (invoicesRes.data || []).forEach((r: any) =>
        add(r.zone || (r.project_id ? projZone[r.project_id] : null), r.amount)
      );
      (aoRes.data || []).forEach((r: any) =>
        add(r.project_id ? projZone[r.project_id] : null, r.amount)
      );

      return totals;
    },
  });
};
