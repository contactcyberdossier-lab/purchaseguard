// ========================================================
// Purchase Zod Validation Schemas
// ========================================================

import { z } from 'zod';

export const SUPPORTED_CURRENCIES = [
  'USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD', 'INR',
  'JPY', 'BRL', 'MXN', 'SGD', 'AED', 'CHF', 'SEK',
  'NOK', 'DKK', 'PLN', 'ZAR'
] as const;

export const purchaseItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(200),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  unit_price: z.coerce.number().min(0, 'Unit price cannot be negative').default(0),
  total_price: z.coerce.number().min(0, 'Total price cannot be negative').default(0),
});

export const purchaseSchema = z.object({
  retailer_name: z.string().trim().min(1, 'Retailer name is required').max(150),
  retailer_domain: z.string().trim().max(255).optional().nullable(),
  product_name: z.string().trim().min(1, 'Product name is required').max(300),
  product_url: z.string().url('Invalid URL format').optional().or(z.literal('')).nullable(),
  order_id: z.string().trim().max(100).optional().nullable(),
  tracking_number: z.string().trim().max(120).optional().nullable(),
  carrier: z.string().trim().max(50).optional().nullable(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Unsupported currency code' }),
  }).default('USD'),
  subtotal: z.coerce.number().min(0, 'Subtotal must be non-negative').default(0),
  tax: z.coerce.number().min(0, 'Tax must be non-negative').default(0),
  shipping: z.coerce.number().min(0, 'Shipping must be non-negative').default(0),
  total: z.coerce.number().min(0, 'Total must be non-negative'),
  custom_return_days: z.coerce.number().int().min(0).max(3650).optional().nullable(),
  custom_warranty_months: z.coerce.number().int().min(0).max(240).optional().nullable(),
  return_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).nullable(),
  warranty_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).nullable(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(purchaseItemSchema).optional().default([]),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;
