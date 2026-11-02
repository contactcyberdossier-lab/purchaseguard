-- ========================================================
-- PurchaseGuard Migration: WhatsApp, Device Push & OCR
-- Migration: 20261102000001_notifications_and_ocr.sql
-- ========================================================

-- 1. Add phone and notification preference columns to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30),
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_reminders_enabled BOOLEAN DEFAULT TRUE;

-- 2. Create Push Subscriptions table for device-level notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their push subscriptions"
    ON public.push_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can view push subscriptions"
    ON public.push_subscriptions FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);

-- 3. Add OCR extraction metadata column to attachments if not present
ALTER TABLE public.attachments
ADD COLUMN IF NOT EXISTS ocr_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(20) DEFAULT 'none' CHECK (ocr_status IN ('none', 'pending', 'completed', 'failed'));
