drop policy if exists "Users can view customers in their own sales" on public.customers;
drop policy if exists "Users can update customers in their sales" on public.customers;

create policy "Users can view customers they created or in their sales"
on public.customers
for select
to authenticated
using (
  is_admin()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.sales
    where sales.customer_id = customers.id
      and sales.user_id = auth.uid()
  )
);

create policy "Users can update customers they created or in their sales"
on public.customers
for update
to authenticated
using (
  is_admin()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.sales
    where sales.customer_id = customers.id
      and sales.user_id = auth.uid()
  )
)
with check (
  is_admin()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.sales
    where sales.customer_id = customers.id
      and sales.user_id = auth.uid()
  )
);