
-- Alter tables to make name nullable to support "no basic details" entry
ALTER TABLE hospital_entries ALTER COLUMN name DROP NOT NULL;
ALTER TABLE dairy_entries ALTER COLUMN name DROP NOT NULL;

-- Also for staff accounts, maybe name is not basic? 
-- But username/password should stay NOT NULL for auth.
ALTER TABLE staff_accounts ALTER COLUMN name DROP NOT NULL;
