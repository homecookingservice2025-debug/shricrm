
-- Disable RLS on all tables to ensure public access as intended for this simplistic setup
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Read" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Insert" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Update" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Delete" ON public.%I', t);
    END LOOP;
END $$;
