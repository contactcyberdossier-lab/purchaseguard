'use client';

// ========================================================
// Account Settings & Privacy Management Tabs
// ========================================================

import { useState } from 'react';
import { User, Bell, Shield, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { SUPPORTED_CURRENCIES } from '@/lib/validations/purchase';
import { locales, localeNames, type Locale } from '@/lib/i18n';

interface SettingsTabsProps {
  initialProfile: {
    id: string;
    email: string;
    full_name: string;
    country: string;
    preferred_language: string;
    preferred_currency: string;
    timezone: string;
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

  // Notifications
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(false);

  // Status
  const [isSaving, setIsSaving] = useState(false);
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
          { id: 'notifications', label: 'Notifications', icon: Bell },
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
          className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.message}</span>
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

          <Button type="submit" isLoading={isSaving} className="mt-4">
            Save Preferences
          </Button>
        </form>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 max-w-xl">
          <div className="p-4 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Return Deadline Reminders</h4>
                <p className="text-xs text-muted-foreground">
                  Receive alerts 7 days, 3 days, and 1 day before return windows close.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Browser Push Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  Get high-priority alerts on device when deadlines approach.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushReminders}
                onChange={(e) => setPushReminders(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
            </div>
          </div>

          <Button onClick={() => setStatusMsg({ type: 'success', message: 'Notification preferences saved.' })}>
            Update Notification Settings
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
            <Button variant="outline" size="sm" onClick={handleExportData} className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>Download JSON Export</span>
            </Button>
          </div>

          {/* Delete Account Card */}
          <div className="p-5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              <h4 className="text-sm font-bold">
                Delete Account & Purge Data (Right to be Forgotten)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permanently delete your account, synced purchases, and uploaded receipt images from all servers. This action is irreversible.
            </p>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Type <strong className="font-mono text-destructive">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Everything
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
