-- Add HR Manager role type (must be in separate transaction)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'مدير الموارد البشرية' 
    AND enumtypid = 'public.user_role'::regtype
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'مدير الموارد البشرية';
  END IF;
END $$;