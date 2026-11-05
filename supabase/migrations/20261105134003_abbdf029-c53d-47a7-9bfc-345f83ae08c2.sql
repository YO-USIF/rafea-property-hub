CREATE TABLE public.project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  phase_name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  planned_start date NOT NULL,
  planned_end date NOT NULL,
  actual_start date,
  actual_end date,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'لم تبدأ',
  budget numeric NOT NULL DEFAULT 0,
  contractor_name text,
  keywords text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_phases TO authenticated;
GRANT ALL ON public.project_phases TO service_role;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phases_select" ON public.project_phases FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_manager_or_admin() OR public.check_user_permission(auth.uid(), 'project_phases', 'view'));
CREATE POLICY "phases_insert" ON public.project_phases FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_manager_or_admin() OR public.check_user_permission(auth.uid(), 'project_phases', 'create')));
CREATE POLICY "phases_update" ON public.project_phases FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_manager_or_admin() OR public.check_user_permission(auth.uid(), 'project_phases', 'edit'));
CREATE POLICY "phases_delete" ON public.project_phases FOR DELETE TO authenticated
  USING (public.is_manager_or_admin() OR public.check_user_permission(auth.uid(), 'project_phases', 'delete'));
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON public.project_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();