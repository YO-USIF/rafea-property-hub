-- حذف أسطر القيود المرتبطة بالمسودات أولاً
DELETE FROM journal_entry_lines 
WHERE journal_entry_id IN (
  SELECT id FROM journal_entries WHERE status = 'draft'
);

-- ثم حذف المسودات نفسها
DELETE FROM journal_entries WHERE status = 'draft';