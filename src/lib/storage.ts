// ========================================================
// Supabase Storage & Secure Receipt Management
// ========================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

export const ALLOWED_RECEIPT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateReceiptFile(file: { type: string; size: number }): { valid: boolean; error?: string } {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF, JPG, PNG, and WEBP files are permitted.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds maximum allowed limit of 10 MB.',
    };
  }

  return { valid: true };
}

/**
 * Uploads receipt file to user's private Supabase storage path
 */
export async function uploadReceiptFile({
  supabase,
  userId,
  purchaseId,
  fileBuffer,
  fileName,
  mimeType,
}: {
  supabase: SupabaseClient;
  userId: string;
  purchaseId: string;
  fileBuffer: Buffer | Blob | Uint8Array;
  fileName: string;
  mimeType: string;
}): Promise<{ path: string; error?: string }> {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const randomSuffix = randomBytes(12).toString('hex');
  const storagePath = `${userId}/${purchaseId}/${randomSuffix}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    return { path: '', error: uploadError.message };
  }

  return { path: storagePath };
}

/**
 * Generates temporary time-limited signed URL for viewing/downloading receipt
 */
export async function getReceiptSignedUrl(
  supabase: SupabaseClient,
  filePath: string,
  expiresInSeconds: number = 3600 // 1 hour
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}
