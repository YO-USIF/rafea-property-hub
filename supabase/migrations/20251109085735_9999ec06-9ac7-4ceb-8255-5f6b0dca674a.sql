-- إنشاء جدول المخزون
CREATE TABLE public.warehouse_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_quantity NUMERIC NOT NULL DEFAULT 0,
  minimum_quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول حركات المستودع
CREATE TABLE public.warehouse_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL REFERENCES public.warehouse_inventory(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'دخول' أو 'خروج'
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT NOT NULL,
  notes TEXT,
  created_by_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transactions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمخزون
CREATE POLICY "Users can view warehouse inventory"
ON public.warehouse_inventory FOR SELECT
USING (auth.uid() = user_id OR is_manager_or_admin());

CREATE POLICY "Users can create inventory items"
ON public.warehouse_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update inventory items"
ON public.warehouse_inventory FOR UPDATE
USING (auth.uid() = user_id OR is_manager_or_admin());

CREATE POLICY "Users can delete inventory items"
ON public.warehouse_inventory FOR DELETE
USING (auth.uid() = user_id OR is_manager_or_admin());

-- سياسات الأمان للحركات
CREATE POLICY "Users can view warehouse transactions"
ON public.warehouse_transactions FOR SELECT
USING (auth.uid() = user_id OR is_manager_or_admin());

CREATE POLICY "Users can create warehouse transactions"
ON public.warehouse_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update warehouse transactions"
ON public.warehouse_transactions FOR UPDATE
USING (auth.uid() = user_id OR is_manager_or_admin());

CREATE POLICY "Users can delete warehouse transactions"
ON public.warehouse_transactions FOR DELETE
USING (auth.uid() = user_id OR is_manager_or_admin());

-- دالة لتحديث الكميات تلقائياً
CREATE OR REPLACE FUNCTION public.update_inventory_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.transaction_type = 'دخول' THEN
    UPDATE public.warehouse_inventory
    SET current_quantity = current_quantity + NEW.quantity,
        updated_at = now()
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.transaction_type = 'خروج' THEN
    UPDATE public.warehouse_inventory
    SET current_quantity = current_quantity - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- إنشاء trigger لتحديث الكميات
CREATE TRIGGER update_inventory_on_transaction
AFTER INSERT ON public.warehouse_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_quantity();

-- trigger لتحديث updated_at
CREATE TRIGGER update_warehouse_inventory_updated_at
BEFORE UPDATE ON public.warehouse_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_transactions_updated_at
BEFORE UPDATE ON public.warehouse_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();