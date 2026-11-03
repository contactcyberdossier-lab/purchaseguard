'use client';

// ========================================================
// Email Connection & Receipt Sync Management Card
// ========================================================

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Mail,
  ShieldCheck,
  Check,
  Unlink,
  Trash2,
  Copy,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface EmailConnection {
  id: string;
  provider: 'gmail' | 'outlook';
  email_address: string;
  connected_at: string;
}

export function EmailConnectionsCard({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const statusParam = searchParams.get('status');
  const syncedParam = searchParams.get('synced');
  const syncErrorParam = searchParams.get('sync_error');

  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const [copiedForwarding, setCopiedForwarding] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/email-connections');
      const data = await res.json();
      if (res.ok) {
        setConnections(data.connections || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleSync = async (connectionId?: string) => {
    setIsSyncing(true);
    setSyncingId(connectionId || 'all');
    setSyncMessage(null);

    try {
      const res = await fetch('/api/email-connections/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.syncedCount > 0) {
          setSyncMessage({
            type: 'success',
            text: `Success! Synced ${data.syncedCount} new purchase receipt${data.syncedCount === 1 ? '' : 's'} from your inbox!`,
          });
        } else {
          setSyncMessage({
            type: 'info',
            text: data.message || `Scanned ${data.scannedCount || 0} emails. No new purchase receipts or order confirmations found.`,
          });
        }
        // Refresh server components on the dashboard to display new purchases
        router.refresh();
      } else {
        setSyncMessage({
          type: 'error',
          text: data.error || data.message || 'Sync failed. Please verify your connection.',
        });
      }
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err.message || 'Failed to trigger inbox sync.',
      });
    } finally {
      setIsSyncing(false);
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id: string, purgeData: boolean) => {
    const confirmMsg = purgeData
      ? 'Disconnect email and permanently delete all purchases created from this inbox?'
      : 'Disconnect this email account from automated sync?';

    if (!confirm(confirmMsg)) return;

    await fetch(`/api/email-connections?id=${id}&purge_data=${purgeData}`, {
      method: 'DELETE',
    });
    fetchConnections();
  };

  const copyForwardingEmail = () => {
    navigator.clipboard.writeText('receipts@purchaseguard.app');
    setCopiedForwarding(true);
    setTimeout(() => setCopiedForwarding(false), 2000);
  };

  return (
    <Card id="email-sync" className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span>Automated Email Purchase Sync</span>
          </CardTitle>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Read-Only OAuth 2.0
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Connection Status Alerts */}
        {statusParam === 'gmail_connected' && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-semibold">Gmail connected successfully!</p>
              {syncedParam && Number(syncedParam) > 0 ? (
                <p className="text-[11px] mt-0.5">Found and synced {syncedParam} purchase receipt{Number(syncedParam) === 1 ? '' : 's'} to your dashboard.</p>
              ) : (
                <p className="text-[11px] mt-0.5">PurchaseGuard is now monitoring your inbox for purchase receipts and invoices.</p>
              )}
            </div>
          </div>
        )}

        {statusParam === 'outlook_connected' && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-semibold">Outlook connected successfully!</p>
              <p className="text-[11px] mt-0.5">PurchaseGuard is now monitoring your Outlook inbox for receipts and invoices.</p>
            </div>
          </div>
        )}

        {/* Sync Result Toast Banner */}
        {syncMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              syncMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : syncMessage.type === 'error'
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {syncMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : syncMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <Inbox className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className="font-medium">{syncMessage.text}</span>
            </div>
          </div>
        )}

        {syncErrorParam && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold">Sync Notice</p>
              <p className="text-[11px] mt-0.5">{decodeURIComponent(syncErrorParam)}</p>
            </div>
          </div>
        )}

        {errorParam === 'gmail_oauth_missing_credentials' && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">Google Cloud OAuth Credentials Required</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  To connect your Gmail inbox directly via Google OAuth, you need to add <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GOOGLE_CLIENT_SECRET</code> to your Vercel Project Environment Variables.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[11px] font-semibold underline flex items-center gap-1 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <span>{showSetupGuide ? 'Hide Setup Steps' : 'View Quick 2-Minute Setup Steps'}</span>
              {showSetupGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Collapsible Google OAuth Setup Steps */}
        {showSetupGuide && (
          <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs space-y-3">
            <h5 className="font-bold text-foreground">How to configure Google Cloud OAuth:</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
              <li>
                Open the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-0.5"
                >
                  Google Cloud Credentials Console <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                under your existing project.
              </li>
              <li>
                Click <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong> &gt; select <strong>Web application</strong>.
              </li>
              <li>
                In <strong>Authorized redirect URIs</strong>, enter:{' '}
                <code className="bg-card px-1.5 py-0.5 rounded font-mono text-[10px] select-all border border-border">
                  https://purchaseguardapp.com/api/auth/oauth/google/callback
                </code>
              </li>
              <li>
                Copy the generated <strong>Client ID</strong> and <strong>Client Secret</strong>.
              </li>
              <li>
                Add them into Vercel Settings &gt; Environment Variables as <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code>.
              </li>
            </ol>
          </div>
        )}

        {/* Explanation & Security Guarantee */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-background text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-0.5">Privacy First Guarantee:</p>
            We strictly request minimal read-only access (<code>gmail.readonly</code> / <code>Mail.Read</code>) to identify purchase receipts. We never see or store your email password, never scrape websites, and never log into your Amazon or store accounts.
          </div>
        </div>

        {/* Connect Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/api/auth/oauth/google">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-11 text-xs">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
              </svg>
              <span>Connect Gmail (Read-Only)</span>
            </Button>
          </a>

          <a href="/api/auth/oauth/microsoft">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-11 text-xs">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                <rect fill="#7FBA00" x="13" y="1" width="10" height="10" />
                <rect fill="#00A4EF" x="1" y="13" width="10" height="10" />
                <rect fill="#FFB900" x="13" y="13" width="10" height="10" />
              </svg>
              <span>Connect Outlook (Read-Only)</span>
            </Button>
          </a>
        </div>

        {/* Connected Accounts List & Sync Trigger */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Connected Inboxes ({connections.length})
            </h4>
            {connections.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync()}
                disabled={isSyncing}
                className="text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
              >
                {isSyncing && syncingId === 'all' ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>{isSyncing && syncingId === 'all' ? 'Scanning...' : 'Sync All Inboxes'}</span>
              </Button>
            )}
          </div>

          {connections.length > 0 ? (
            <div className="space-y-2">
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border bg-background gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-2.5 text-xs truncate">
                    <span className="font-semibold uppercase text-foreground px-1.5 py-0.5 rounded bg-muted">
                      {c.provider}
                    </span>
                    <span className="text-muted-foreground font-medium truncate">{c.email_address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSync(c.id)}
                      disabled={isSyncing}
                      className="text-xs text-primary hover:bg-primary/10 h-8"
                      title="Sync this inbox for receipts"
                    >
                      {isSyncing && syncingId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      )}
                      Sync Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(c.id, false)}
                      className="text-xs text-muted-foreground hover:text-foreground h-8"
                      title="Disconnect sync"
                    >
                      <Unlink className="w-3.5 h-3.5 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(c.id, true)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-8"
                      title="Disconnect and delete all synced purchases"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Purge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              No email inboxes connected. Connect Gmail or Outlook above, or use direct receipt scanning.
            </p>
          )}
        </div>

        {/* Forwarding Option */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
            Instant Alternative: Forward Order Receipts
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Forward your order confirmation emails directly from your registered email address to:
          </p>
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 font-mono text-xs">
            <span className="text-foreground">receipts@purchaseguard.app</span>
            <button
              onClick={copyForwardingEmail}
              className="p-1 text-primary hover:text-primary/80"
              title="Copy email address"
            >
              {copiedForwarding ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
