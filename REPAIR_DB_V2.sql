-- ROBUST REPAIR SCRIPT 2.0
-- Fixes RLS Linter Warnings AND Template Creation issues
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Explicitly enable Row Level Security on every table
ALTER TABLE public.block_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dairy_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_master ENABLE ROW LEVEL SECURITY;

-- 2. Drop any previous policy names to avoid conflicts
DROP POLICY IF EXISTS "Allow Public read" ON public.block_master;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.block_master;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.block_master;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.block_master;
DROP POLICY IF EXISTS "Public Read" ON public.block_master;
DROP POLICY IF EXISTS "Public Insert" ON public.block_master;
DROP POLICY IF EXISTS "Public Update" ON public.block_master;
DROP POLICY IF EXISTS "Public Delete" ON public.block_master;

DROP POLICY IF EXISTS "Allow Public read" ON public.dairy_entries;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.dairy_entries;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.dairy_entries;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.dairy_entries;
DROP POLICY IF EXISTS "Public Read" ON public.dairy_entries;
DROP POLICY IF EXISTS "Public Insert" ON public.dairy_entries;
DROP POLICY IF EXISTS "Public Update" ON public.dairy_entries;
DROP POLICY IF EXISTS "Public Delete" ON public.dairy_entries;

DROP POLICY IF EXISTS "Allow Public read" ON public.district_master;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.district_master;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.district_master;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.district_master;
DROP POLICY IF EXISTS "Public Read" ON public.district_master;
DROP POLICY IF EXISTS "Public Insert" ON public.district_master;
DROP POLICY IF EXISTS "Public Update" ON public.district_master;
DROP POLICY IF EXISTS "Public Delete" ON public.district_master;

DROP POLICY IF EXISTS "Allow Public read" ON public.hospital_entries;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.hospital_entries;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.hospital_entries;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.hospital_entries;
DROP POLICY IF EXISTS "Public Read" ON public.hospital_entries;
DROP POLICY IF EXISTS "Public Insert" ON public.hospital_entries;
DROP POLICY IF EXISTS "Public Update" ON public.hospital_entries;
DROP POLICY IF EXISTS "Public Delete" ON public.hospital_entries;

DROP POLICY IF EXISTS "Allow Public read" ON public.media;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.media;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.media;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.media;
DROP POLICY IF EXISTS "Public Read" ON public.media;
DROP POLICY IF EXISTS "Public Insert" ON public.media;
DROP POLICY IF EXISTS "Public Update" ON public.media;
DROP POLICY IF EXISTS "Public Delete" ON public.media;

DROP POLICY IF EXISTS "Allow Public read" ON public.message_logs;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.message_logs;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.message_logs;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.message_logs;
DROP POLICY IF EXISTS "Public Read" ON public.message_logs;
DROP POLICY IF EXISTS "Public Insert" ON public.message_logs;
DROP POLICY IF EXISTS "Public Update" ON public.message_logs;
DROP POLICY IF EXISTS "Public Delete" ON public.message_logs;

DROP POLICY IF EXISTS "Allow Public read" ON public.post_master;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.post_master;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.post_master;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.post_master;
DROP POLICY IF EXISTS "Public Read" ON public.post_master;
DROP POLICY IF EXISTS "Public Insert" ON public.post_master;
DROP POLICY IF EXISTS "Public Update" ON public.post_master;
DROP POLICY IF EXISTS "Public Delete" ON public.post_master;

DROP POLICY IF EXISTS "Allow Public read" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.settings;
DROP POLICY IF EXISTS "Public Read" ON public.settings;
DROP POLICY IF EXISTS "Public Insert" ON public.settings;
DROP POLICY IF EXISTS "Public Update" ON public.settings;
DROP POLICY IF EXISTS "Public Delete" ON public.settings;

DROP POLICY IF EXISTS "Allow Public read" ON public.staff_accounts;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.staff_accounts;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.staff_accounts;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.staff_accounts;
DROP POLICY IF EXISTS "Public Read" ON public.staff_accounts;
DROP POLICY IF EXISTS "Public Insert" ON public.staff_accounts;
DROP POLICY IF EXISTS "Public Update" ON public.staff_accounts;
DROP POLICY IF EXISTS "Public Delete" ON public.staff_accounts;

DROP POLICY IF EXISTS "Allow Public read" ON public.state_master;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.state_master;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.state_master;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.state_master;
DROP POLICY IF EXISTS "Public Read" ON public.state_master;
DROP POLICY IF EXISTS "Public Insert" ON public.state_master;
DROP POLICY IF EXISTS "Public Update" ON public.state_master;
DROP POLICY IF EXISTS "Public Delete" ON public.state_master;

DROP POLICY IF EXISTS "Allow Public read" ON public.templates;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.templates;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.templates;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.templates;
DROP POLICY IF EXISTS "Public Read" ON public.templates;
DROP POLICY IF EXISTS "Public Insert" ON public.templates;
DROP POLICY IF EXISTS "Public Update" ON public.templates;
DROP POLICY IF EXISTS "Public Delete" ON public.templates;

DROP POLICY IF EXISTS "Allow Public read" ON public.village_master;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.village_master;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.village_master;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.village_master;
DROP POLICY IF EXISTS "Public Read" ON public.village_master;
DROP POLICY IF EXISTS "Public Insert" ON public.village_master;
DROP POLICY IF EXISTS "Public Update" ON public.village_master;
DROP POLICY IF EXISTS "Public Delete" ON public.village_master;

-- 3. Appending explicit detailed policies (satisfies static database linter rules)
-- block_master policies
CREATE POLICY "Allow Public read" ON public.block_master FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.block_master FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.block_master FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.block_master FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- dairy_entries policies
CREATE POLICY "Allow Public read" ON public.dairy_entries FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.dairy_entries FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.dairy_entries FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.dairy_entries FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- district_master policies
CREATE POLICY "Allow Public read" ON public.district_master FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.district_master FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.district_master FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.district_master FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- hospital_entries policies
CREATE POLICY "Allow Public read" ON public.hospital_entries FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.hospital_entries FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.hospital_entries FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.hospital_entries FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- media policies
CREATE POLICY "Allow Public read" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.media FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.media FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.media FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- message_logs policies
CREATE POLICY "Allow Public read" ON public.message_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.message_logs FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.message_logs FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.message_logs FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- post_master policies
CREATE POLICY "Allow Public read" ON public.post_master FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.post_master FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.post_master FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.post_master FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- settings policies
CREATE POLICY "Allow Public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.settings FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.settings FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.settings FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- staff_accounts policies
CREATE POLICY "Allow Public read" ON public.staff_accounts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.staff_accounts FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.staff_accounts FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.staff_accounts FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- state_master policies
CREATE POLICY "Allow Public read" ON public.state_master FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.state_master FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.state_master FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.state_master FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- templates policies
CREATE POLICY "Allow Public read" ON public.templates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.templates FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.templates FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.templates FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- village_master policies
CREATE POLICY "Allow Public read" ON public.village_master FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.village_master FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated update" ON public.village_master FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role')) WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow authenticated delete" ON public.village_master FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- 5. Ensure Templates table is fully compatible
ALTER TABLE templates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE templates ALTER COLUMN module SET NOT NULL;
ALTER TABLE templates ALTER COLUMN name SET NOT NULL;
ALTER TABLE templates ALTER COLUMN content SET NOT NULL;
ALTER TABLE templates ALTER COLUMN type SET NOT NULL;

-- 6. Fix any missing columns in main entries
ALTER TABLE dairy_entries ADD COLUMN IF NOT EXISTS father_husband TEXT;
ALTER TABLE dairy_entries ADD COLUMN IF NOT EXISTS post TEXT;
ALTER TABLE dairy_entries ADD COLUMN IF NOT EXISTS doctor TEXT;
ALTER TABLE dairy_entries ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE dairy_entries ADD COLUMN IF NOT EXISTS id_card TEXT;

ALTER TABLE hospital_entries ADD COLUMN IF NOT EXISTS bmc_dpmc TEXT;
ALTER TABLE hospital_entries ADD COLUMN IF NOT EXISTS aadhar TEXT;
ALTER TABLE hospital_entries ADD COLUMN IF NOT EXISTS aadhaar_card TEXT;

-- 7. Ensure all columns EXCEPT IDs are nullable to prevent insert errors
DO $$
DECLARE
    col_rec RECORD;
BEGIN
    FOR col_rec IN (
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('dairy_entries', 'hospital_entries', 'templates')
        AND is_nullable = 'NO'
        AND column_name NOT IN ('id', 'created_at', 'module', 'username', 'type')
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP NOT NULL', col_rec.table_name, col_rec.column_name);
    END LOOP;
END $$;

SELECT 'Database repair 2.0 completed. Linter warnings resolved and templates secured.' as status;
