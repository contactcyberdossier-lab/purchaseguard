-- ========================================================
-- PurchaseGuard Migration: Admin Privileges & Role-Based Access Control (RBAC)
-- Migration: 20261102000000_admin_roles.sql
-- Description: Adds 'role' column to public.users and grants admin read/write policies
-- ========================================================

-- 1. Add role column to public.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL 
        CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. Create is_admin() Security Definer Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Update RLS on public.users
-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (public.is_admin() OR auth.uid() = id);

-- Admins can update any user profile (e.g. modify role or subscription_status)
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    USING (public.is_admin() OR auth.uid() = id)
    WITH CHECK (public.is_admin() OR auth.uid() = id);

-- 4. Update RLS on public.purchases
-- Admins can view all purchases across the entire platform
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases"
    ON public.purchases FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);

-- Admins can manage all purchases
DROP POLICY IF EXISTS "Admins can update all purchases" ON public.purchases;
CREATE POLICY "Admins can update all purchases"
    ON public.purchases FOR UPDATE
    USING (public.is_admin() OR auth.uid() = user_id)
    WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete all purchases" ON public.purchases;
CREATE POLICY "Admins can delete all purchases"
    ON public.purchases FOR DELETE
    USING (public.is_admin() OR auth.uid() = user_id);

-- 5. Update RLS on public.audit_logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);

-- 6. Update RLS on public.subscription_events
DROP POLICY IF EXISTS "Admins can view all subscription events" ON public.subscription_events;
CREATE POLICY "Admins can view all subscription events"
    ON public.subscription_events FOR SELECT
    USING (public.is_admin() OR auth.uid() = user_id);

-- 7. Update RLS on public.reminders
DROP POLICY IF EXISTS "Admins can view all reminders" ON public.reminders;
CREATE POLICY "Admins can view all reminders"
    ON public.reminders FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = reminders.purchase_id
            AND purchases.user_id = auth.uid()
        )
    );

-- 8. Grant first user (or specific email) admin role if none exists
-- You can also run: UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
UPDATE public.users 
SET role = 'admin' 
WHERE id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin');
