'use client';

// ========================================================
// Account Settings & Privacy Management Tabs
// Enhanced with WhatsApp & Device Push Notification Engines
// ========================================================

import { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  MessageSquare, 
  Mail, 
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SUPPORTED_CURRENCIES } from '@/lib/validations/purchase';
import { locales, localeNames, type Locale } from '@/lib/i18n';
import { subscribeToDeviceNotifications, triggerLocalTestNotification, isPushNotificationSupported } from '@/lib/pushClient';

interface SettingsTabsProps {
  initialProfile: {
    id: string;
    email: string;
    full_name: string;
    country: string;
    preferred_language: string;
    preferred_currency: string;
    timezone: string;
    phone_number?: string | null;
    whatsapp_enabled?: boolean | null;
    push_enabled?: boolean | null;
    email_reminders_enabled?: boolean | null;
  };
  locale: string;
}

export function SettingsTabs({ initialProfile, locale }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [country, setCountry] = useState(initialProfile.country || 'US');
  const [currency, setCurrency] = useState(initialProfile.preferred_currency || 'USD');
  const [language, setLanguage] = useState(initialProfile.preferred_language || locale);
  const [timezone, setTimezone] = useState(initialProfile.timezone || 'UTC');

  // Notifications State
  const [emailReminders, setEmailReminders] = useState(initialProfile.email_reminders_enabled ?? true);
  const [pushReminders, setPushReminders] = useState(Boolean(initialProfile.push_enabled));
  const [whatsappEnabled, setWhatsappEnabled] = useState(Boolean(initialProfile.whatsapp_enabled));
  const [phone, setPhone] = useState(initialProfile.phone_number || '');

  // Loading & Testing States
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete modal state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          country,
          preferred_currency: currency,
          preferred_language: language,
          timezone,
          phone_number: phone || null,
          whatsapp_enabled: whatsappEnabled,
          push_enabled: pushReminders,
          email_reminders_enabled: emailReminders,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setStatusMsg({ type: 'success', message: 'Settings updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'Error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePushNotifications = async (enabled: boolean) => {
    setPushReminders(enabled);
    if (enabled) {
      setIsTestingPush(true);
      const res = await subscribeToDeviceNotifications();
      setIsTestingPush(false);
      if (res.success) {
        setStatusMsg({ type: 'success', message: 'Device push notifications enabled and subscribed!' });
      } else {
        setPushReminders(false);
        setStatusMsg({ type: 'error', message: res.error || 'Failed to enable push notifications' });
      }
    } else {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ push_enabled: false }),
      });
      setStatusMsg({ type: 'success', message: 'Device push notifications turned off.' });
    }
  };

  const handleTestDevicePush = async () => {
    setIsTestingPush(true);
    setStatusMsg(null);
    try {
      const success = await triggerLocalTestNotification();
      if (success) {
        setStatusMsg({ type: 'success', message: 'Notification triggered! Look at your device screen / notification shade.' });
      } else {
        // Fallback: subscribe first
        const subRes = await subscribeToDeviceNotifications();
        if (subRes.success) {
          await triggerLocalTestNotification();
          setPushReminders(true);
          setStatusMsg({ type: 'success', message: 'Notification permission granted! Sent test alert to this device.' });
        } else {
          throw new Error(subRes.error || 'Could not trigger device notification');
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'Error sending test push' });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!phone || phone.trim().length < 7) {
      setStatusMsg({ type: 'error', message: 'Please enter a valid phone number with country code first (e.g. +1... or +91...).' });
      return;
    }

    setIsTestingWhatsApp(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/notifications/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp test');

      setWhatsappEnabled(true);
      setStatusMsg({ type: 'success', message: data.message || 'WhatsApp alert dispatched successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'Error sending WhatsApp alert' });
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/notifications/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: initialProfile.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test email');

      setStatusMsg({ type: 'success', message: data.message || 'Test email dispatched successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'Error sending test email' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleExportData = () => {
    window.open('/api/user/export', '_blank');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      if (!res.ok) throw new Error('Failed to delete account');
      window.location.href = `/${locale}`;
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'Deletion failed' });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'profile', label: 'Profile & Regional', icon: User },
          { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
          { id: 'privacy', label: 'Privacy & Data Rights', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setStatusMsg(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{statusMsg.message}</span>
        </div>
      )}

      {/* Tab: Profile & Regional */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={initialProfile.email}
              className="w-full rounded-lg border border-input bg-muted px-3.5 py-2 text-sm text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {localeNames[loc].flag} {localeNames[loc].nativeName} ({loc.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Country (2-letter ISO)
              </label>
              <input
                type="text"
                maxLength={2}
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                placeholder="US, CA, GB, DE, etc."
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC, America/New_York, Europe/London"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="mt-4">
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      )}

      {/* Tab: Notifications (Device Push + WhatsApp + Email) */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 max-w-2xl">
          {/* 1. Device Push Notifications Card */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Device & Mobile Push Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Receive high-priority system alerts on your phone or computer screen when return deadlines approach.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={pushReminders}
                onChange={(e) => handleTogglePushNotifications(e.target.checked)}
                className="h-5 w-5 mt-1 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Status: {pushReminders ? <strong className="text-emerald-500">Active on this device</strong> : 'Inactive'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTestingPush}
                onClick={handleTestDevicePush}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                {isTestingPush ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test Alert to Device</span>
              </Button>
            </div>
          </div>

          {/* 2. WhatsApp Notifications Card */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>WhatsApp Deadline Alerts</span>
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      INSTANT
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get automated WhatsApp notifications 7 days, 3 days, and 1 day before your return window closes.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="h-5 w-5 mt-1 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
            </div>

            <div className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Your WhatsApp Phone Number (with Country Code)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199 or +91 9876543210"
                    className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isTestingWhatsApp}
                    onClick={handleTestWhatsApp}
                    className="shrink-0 h-10 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isTestingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Test WhatsApp</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format: International E.164 (e.g. +1... for US/Canada, +44... for UK, +91... for India).
                </p>
              </div>
            </div>
          </div>

          {/* 3. Transactional Email Card */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Email Countdown Reminders</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Receive formatted countdown emails to <span className="font-semibold">{initialProfile.email}</span>.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
                className="h-5 w-5 mt-1 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-border/50 gap-3">
              <span className="text-xs text-muted-foreground">
                Destination: <span className="text-foreground font-mono font-medium">{initialProfile.email}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="gap-2 shrink-0"
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Test Email Alert
                  </>
                )}
              </Button>
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}
          </Button>
        </div>
      )}

      {/* Tab: Privacy & Data Ownership */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 max-w-xl">
          {/* Export Card */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Export Your Data (GDPR / CCPA Portability)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download a complete JSON export of all your purchases, receipts metadata, reminders, and profile records.
            </p>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              Request Complete Data Export
            </Button>
          </div>

          {/* Delete Account Card */}
          <div className="p-5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              <h4 className="text-sm font-semibold">Delete Account & Purge Data</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permanently delete your profile, all uploaded receipts, purchase records, and active reminders. This action cannot be reversed.
            </p>
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-foreground">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? 'Purging...' : 'Permanently Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
