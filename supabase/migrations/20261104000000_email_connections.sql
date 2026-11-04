-- ========================================================
-- PurchaseGuard Email Connections & Receipt Sync Schema
-- Migration: 20261104000000_email_connections.sql
-- Description: Creates audit_logs, email_connections & processed_emails tables with zero-trust RLS policies
-- ========================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_hash VARCHAR(64),
    user_agent_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert their own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 2. EMAIL CONNECTIONS TABLE (Encrypted OAuth Tokens)
CREATE TABLE IF NOT EXISTS public.email_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    email_address VARCHAR(255) NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    disconnected_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_provider_email UNIQUE (user_id, provider, email_address)
);

CREATE INDEX IF NOT EXISTS idx_email_connections_user_id ON public.email_connections(user_id);
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own email connections" ON public.email_connections;
DROP POLICY IF EXISTS "Users can insert their own email connections" ON public.email_connections;
DROP POLICY IF EXISTS "Users can update their own email connections" ON public.email_connections;
DROP POLICY IF EXISTS "Users can delete their own email connections" ON public.email_connections;

CREATE POLICY "Users can view their own email connections"
    ON public.email_connections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email connections"
    ON public.email_connections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email connections"
    ON public.email_connections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email connections"
    ON public.email_connections FOR DELETE USING (auth.uid() = user_id);

-- 3. PROCESSED EMAILS TABLE (Audit and Dedup Pipeline)
CREATE TABLE IF NOT EXISTS public.processed_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_connection_id UUID REFERENCES public.email_connections(id) ON DELETE SET NULL,
    message_id VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN (
        'order_confirmation', 'shipping_update', 'delivery_update',
        'refund_confirmation', 'return_confirmation', 'warranty', 'unrelated'
    )),
    retailer_detected VARCHAR(150),
    extraction_confidence NUMERIC(3, 2) DEFAULT 0.00,
    raw_reference TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_message_id UNIQUE (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_processed_emails_user_id ON public.processed_emails(user_id);
ALTER TABLE public.processed_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own processed emails" ON public.processed_emails;
DROP POLICY IF EXISTS "Users can insert their own processed emails" ON public.processed_emails;
DROP POLICY IF EXISTS "Users can delete their own processed email records" ON public.processed_emails;

CREATE POLICY "Users can view their own processed emails"
    ON public.processed_emails FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processed emails"
    ON public.processed_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processed email records"
    ON public.processed_emails FOR DELETE USING (auth.uid() = user_id);

-- 4. USERS POLICIES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
