-- Add session management columns to admin_credentials
ALTER TABLE public.admin_credentials 
ADD COLUMN IF NOT EXISTS session_token text,
ADD COLUMN IF NOT EXISTS session_expires timestamp with time zone;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the existing admin password to be properly hashed
-- bcrypt hash for 'admin123' with cost factor 10
UPDATE public.admin_credentials 
SET password_hash = crypt('admin123', gen_salt('bf', 10))
WHERE username = 'admin' AND password_hash = 'admin123';

-- Insert admin if not exists with hashed password
INSERT INTO public.admin_credentials (username, password_hash) 
SELECT 'admin', crypt('admin123', gen_salt('bf', 10))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = 'admin');

-- Update RLS policy for admin_credentials to allow service role access
DROP POLICY IF EXISTS "No direct access to admin credentials" ON public.admin_credentials;

-- Create restrictive policy - no client access
CREATE POLICY "Service role only access"
ON public.admin_credentials
FOR ALL
USING (false)
WITH CHECK (false);

-- Update registrations RLS policies
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;

-- Only allow INSERT (registration remains open to public)
-- SELECT is now only via edge function with admin auth