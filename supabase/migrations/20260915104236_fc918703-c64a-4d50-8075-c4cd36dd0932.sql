INSERT INTO public.user_permissions (user_id, page_name, can_view, can_create, can_edit, can_delete)
VALUES ('773cdbb4-5da8-459e-9d74-cd1c061a95d1', 'extracts', true, true, true, false)
ON CONFLICT (user_id, page_name) DO UPDATE SET can_edit = true, can_view = true, can_create = true, updated_at = now();