-- ========================================================
-- PurchaseGuard Row-Level Security (RLS) Policies
-- Migration: 20261025000001_row_level_security.sql
-- Description: Zero-trust RLS policies enforcing tenant isolation and preventing IDOR
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 1. USERS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------
-- 2. PURCHASES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own purchases"
    ON public.purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
    ON public.purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
    ON public.purchases FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
    ON public.purchases FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 3. PURCHASE ITEMS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view items of their own purchases"
    ON public.purchase_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = purchase_items.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items into their own purchases"
    ON public.purchase_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = purchase_items.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items of their own purchases"
    ON public.purchase_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = purchase_items.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items of their own purchases"
    ON public.purchase_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = purchase_items.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------
-- 4. EMAIL CONNECTIONS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own email connections"
    ON public.email_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email connections"
    ON public.email_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email connections"
    ON public.email_connections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email connections"
    ON public.email_connections FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 5. PROCESSED EMAILS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own processed emails"
    ON public.processed_emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processed email records"
    ON public.processed_emails FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 6. ATTACHMENTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view attachments of their purchases"
    ON public.attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = attachments.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attachments for their purchases"
    ON public.attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = attachments.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete attachments of their purchases"
    ON public.attachments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = attachments.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------
-- 7. REMINDERS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view reminders of their purchases"
    ON public.reminders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = reminders.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage reminders of their purchases"
    ON public.reminders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = reminders.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------
-- 8. SUBSCRIPTION EVENTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own subscription billing events"
    ON public.subscription_events FOR SELECT
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 9. AUDIT LOGS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 10. PRIVACY REQUESTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own privacy requests"
    ON public.privacy_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own privacy requests"
    ON public.privacy_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);
