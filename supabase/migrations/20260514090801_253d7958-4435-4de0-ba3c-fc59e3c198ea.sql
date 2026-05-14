-- Drop Digistore IPN handler and related table
DROP FUNCTION IF EXISTS public.process_digistore_ipn(text, text, text, text, text, numeric, text, jsonb);
DROP TABLE IF EXISTS public.ipn_logs CASCADE;