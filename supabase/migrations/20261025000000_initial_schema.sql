-- ========================================================
-- PurchaseGuard Database Schema
-- Migration: 20261025000000_initial_schema.sql
-- Description: Core tables, constraints, indices, and triggers
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    country VARCHAR(2) DEFAULT 'US',
    preferred_language VARCHAR(5) DEFAULT 'en',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'plus', 'annual', 'canceled', 'past_due')),
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-sync auth.users to public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, preferred_language, preferred_currency)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'USD')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    retailer_name VARCHAR(150) NOT NULL,
    retailer_domain VARCHAR(255),
    order_id VARCHAR(100),
    purchase_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    subtotal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    shipping NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    product_name TEXT NOT NULL,
    product_url TEXT,
    tracking_number VARCHAR(120),
    carrier VARCHAR(50),
    delivery_date DATE,
    return_deadline DATE,
    warranty_deadline DATE,
    refund_status VARCHAR(30) DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'processing', 'completed', 'denied')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'refunded', 'closed', 'review_needed')),
    confidence NUMERIC(3, 2) DEFAULT 1.00 CHECK (confidence >= 0.00 AND confidence <= 1.00),
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'email', 'upload')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent duplicate order entries per retailer per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_user_retailer_order
    ON public.purchases (user_id, retailer_name, order_id)
    WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_return_deadline ON public.purchases(return_deadline);
CREATE INDEX IF NOT EXISTS idx_purchases_warranty_deadline ON public.purchases(warranty_deadline);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at DESC);

-- 3. PURCHASE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);

-- 4. EMAIL CONNECTIONS TABLE (Encrypted OAuth Tokens)
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

-- 5. PROCESSED EMAILS TABLE (Audit and Dedup Pipeline)
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

-- 6. ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_purchase_id ON public.attachments(purchase_id);

-- 7. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    reminder_type VARCHAR(30) NOT NULL CHECK (reminder_type IN (
        'return_deadline', 'warranty_deadline', 'delivery', 'refund_followup'
    )),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_purchase_id ON public.reminders(purchase_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status_scheduled ON public.reminders(status, scheduled_for);

-- 8. SUBSCRIPTION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);

-- 9. AUDIT LOGS TABLE
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 10. PRIVACY REQUESTS TABLE (GDPR / CCPA Data Rights)
CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('export', 'delete', 'consent_update')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    metadata JSONB DEFAULT '{}'::jsonb,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_user_id ON public.privacy_requests(user_id);
