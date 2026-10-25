-- ========================================================
-- PurchaseGuard Storage Configuration & Security Policies
-- Migration: 20261025000002_storage_and_indexes.sql
-- Description: Private 'receipts' storage bucket with zero-trust user isolation
-- ========================================================

-- Create the private 'receipts' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    false,
    10485760, -- 10 MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY: Users can only download their own receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
CREATE POLICY "Users can view their own receipts"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 2. INSERT POLICY: Users can only upload into their own folder
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
CREATE POLICY "Users can upload their own receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 3. DELETE POLICY: Users can only delete their own receipts
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
CREATE POLICY "Users can delete their own receipts"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
