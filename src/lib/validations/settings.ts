// ========================================================
// User Settings & Profile Zod Validation Schemas
// ========================================================

import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from './purchase';
import { locales } from '../i18n';

export const userProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  country: z.string().length(2, 'Country code must be 2 characters (ISO)').toUpperCase(),
  preferred_language: z.enum(locales),
  preferred_currency: z.enum(SUPPORTED_CURRENCIES),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const notificationPreferencesSchema = z.object({
  email_reminders: z.boolean().default(true),
  push_reminders: z.boolean().default(false),
  quiet_hours_start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  quiet_hours_end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(8, 'Password must be at least 8 characters'),
  new_password: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "New passwords don't match",
  path: ['confirm_password'],
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
