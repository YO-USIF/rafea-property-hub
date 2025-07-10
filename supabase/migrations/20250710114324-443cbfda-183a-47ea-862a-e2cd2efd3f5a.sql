-- إعادة إنشاء قيود المبيعات
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
    
    -- إنشاء قيود للمبيعات المباعة فقط
    FOR sale_record IN SELECT * FROM sales WHERE status = 'مباع' LIMIT 5 LOOP
        -- إنشاء رقم القيد
        entry_number := 'SALE-' || TO_CHAR(COALESCE(sale_record.sale_date, sale_record.created_at), 'YYYYMMDD') || '-' || RIGHT(sale_record.id::text, 8);
        
        -- إنشاء القيد الرئيسي
        INSERT INTO journal_entries (
            entry_number, 
            description, 
            reference_type, 
            reference_id, 
            created_by,
            transaction_date,
            status
        ) VALUES (
            entry_number,
            'قيد مبيعة وحدة رقم ' || sale_record.unit_number || ' - ' || sale_record.customer_name,
            'sale',
            sale_record.id,
            sale_record.user_id,
            COALESCE(sale_record.sale_date, sale_record.created_at::date),
            'posted'
        ) RETURNING id INTO entry_id;
        
        -- إضافة السطر المدين (المدينون)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
        VALUES (entry_id, accounts_receivable_id, 'مدين مبيعة وحدة ' || sale_record.unit_number, sale_record.price);
        
        -- إضافة السطر الدائن (إيرادات المبيعات)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
        VALUES (entry_id, sales_revenue_id, 'إيراد مبيعة وحدة ' || sale_record.unit_number, sale_record.price);
    END LOOP;
END $$;

-- إعادة إنشاء قيود الفواتير
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
    
    -- إنشاء قيود لجميع الفواتير
    FOR invoice_record IN SELECT * FROM invoices LOOP
        -- إنشاء رقم القيد
        entry_number := 'INV-' || TO_CHAR(invoice_record.invoice_date, 'YYYYMMDD') || '-' || invoice_record.invoice_number;
        
        -- إنشاء القيد الرئيسي
        INSERT INTO journal_entries (
            entry_number, 
            description, 
            reference_type, 
            reference_id, 
            created_by,
            transaction_date,
            status
        ) VALUES (
            entry_number,
            'قيد فاتورة رقم ' || invoice_record.invoice_number || ' - ' || invoice_record.supplier_name,
            'invoice',
            invoice_record.id,
            invoice_record.user_id,
            invoice_record.invoice_date,
            'posted'
        ) RETURNING id INTO entry_id;
        
        -- إضافة السطر المدين (مصروفات)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
        VALUES (entry_id, expenses_id, 'مصروف فاتورة ' || invoice_record.invoice_number, invoice_record.amount);
        
        -- إضافة السطر الدائن (الدائنون)
        INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
        VALUES (entry_id, accounts_payable_id, 'دائن فاتورة ' || invoice_record.invoice_number, invoice_record.amount);
    END LOOP;
END $$;