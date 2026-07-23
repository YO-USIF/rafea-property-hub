
-- Add zone column to extracts and invoices with auto-populate from project
ALTER TABLE public.extracts ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zone TEXT;

-- Backfill from linked projects
UPDATE public.extracts e SET zone = p.zone
FROM public.projects p WHERE e.project_id = p.id AND e.zone IS NULL AND p.zone IS NOT NULL;

UPDATE public.invoices i SET zone = p.zone
FROM public.projects p WHERE i.project_id = p.id AND i.zone IS NULL AND p.zone IS NOT NULL;

-- Trigger function to sync zone from project
CREATE OR REPLACE FUNCTION public.sync_zone_from_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj_zone TEXT;
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    SELECT zone INTO proj_zone FROM public.projects WHERE id = NEW.project_id;
    -- Only override if user didn't explicitly set one different, or on insert
    IF proj_zone IS NOT NULL AND (NEW.zone IS NULL OR NEW.zone = '') THEN
      NEW.zone := proj_zone;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_extracts_sync_zone ON public.extracts;
CREATE TRIGGER trg_extracts_sync_zone
  BEFORE INSERT OR UPDATE ON public.extracts
  FOR EACH ROW EXECUTE FUNCTION public.sync_zone_from_project();

DROP TRIGGER IF EXISTS trg_invoices_sync_zone ON public.invoices;
CREATE TRIGGER trg_invoices_sync_zone
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.sync_zone_from_project();
