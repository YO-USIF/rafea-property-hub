-- إنشاء قيود يومية للمبيعات الموجودة
DO $$
DECLARE
    sale_record RECORD;
    entry_id UUID;
    entry_number TEXT;
    accounts_receivable_id UUID;
    sales_revenue_id UUID;
BEGIN
    -- الحصول على معرف حساب المدينون
    SELECT id INTO accounts_receivable_id 
    FROM chart_of_accounts 
    WHERE account_code = '1120';
    
    -- الحصول على معرف حساب إيرادات المبيعات
    SELECT id INTO sales_revenue_id 
    FROM chart_of_accounts 
    WHERE account_code = '4100';
    
    -- إنشاء قيود للمبيعات الموجودة
    FOR sale_record IN SELECT * FROM sales WHERE status = 'مباع' LOOP
        -- إنشاء رقم القيد
        entry_number := 'JE-' || TO_CHAR(COALESCE(sale_record.sale_date, sale_record.created_at), 'YYYYMMDD') || '-' || sale_record.id;
        
        -- إنشاء القيد الرئيسي
        INSERT INTO journal_entries (
            entry_number, 
            description, 
            reference_type, 
            reference_id, 
            created_by,
            transaction_date
        ) VALUES (
            entry_number,
            'قيد مبيعة - ' || sale_record.customer_name,
            'sale',
            sale_record.id,
            sale_record.user_id,
            COALESCE(sale_record.sale_date, sale_record.created_at::date)
        ) RETURNING id INTO entry_id;
        
        -- إضافة السطر المدين (المدينون)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
        VALUES (entry_id, accounts_receivable_id, 'مدين مبيعة - ' || sale_record.customer_name, sale_record.price);
        
        -- إضافة السطر الدائن (إيرادات المبيعات)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
        VALUES (entry_id, sales_revenue_id, 'إيراد مبيعة - ' || sale_record.customer_name, sale_record.price);
    END LOOP;
END $$;

-- إنشاء قيود يومية للفواتير الموجودة
DO $$
DECLARE
    invoice_record RECORD;
    entry_id UUID;
    entry_number TEXT;
    accounts_payable_id UUID;
    expenses_id UUID;
BEGIN
    -- الحصول على معرف حساب الدائنون
    SELECT id INTO accounts_payable_id 
    FROM chart_of_accounts 
    WHERE account_code = '2110';
    
    -- الحصول على معرف حساب المصروفات
    SELECT id INTO expenses_id 
    FROM chart_of_accounts 
    WHERE account_code = '5200';
    
    -- إنشاء قيود للفواتير الموجودة
    FOR invoice_record IN SELECT * FROM invoices LOOP
        -- إنشاء رقم القيد
        entry_number := 'JE-' || TO_CHAR(invoice_record.invoice_date, 'YYYYMMDD') || '-' || invoice_record.id;
        
        -- إنشاء القيد الرئيسي
        INSERT INTO journal_entries (
            entry_number, 
            description, 
            reference_type, 
            reference_id, 
            created_by,
            transaction_date
        ) VALUES (
            entry_number,
            'قيد فاتورة - ' || invoice_record.supplier_name,
            'invoice',
            invoice_record.id,
            invoice_record.user_id,
            invoice_record.invoice_date
        ) RETURNING id INTO entry_id;
        
        -- إضافة السطر المدين (مصروفات)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
        VALUES (entry_id, expenses_id, 'مصروف فاتورة - ' || invoice_record.supplier_name, invoice_record.amount);
        
        -- إضافة السطر الدائن (الدائنون)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
        VALUES (entry_id, accounts_payable_id, 'دائن فاتورة - ' || invoice_record.supplier_name, invoice_record.amount);
    END LOOP;
END $$;