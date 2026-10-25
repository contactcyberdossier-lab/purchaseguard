'use client';

// ========================================================
// Email Connection & Receipt Sync Management Card
// ========================================================

import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Check, Unlink, Trash2, Copy, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface EmailConnection {
  id: string;
  provider: 'gmail' | 'outlook';
  email_address: string;
  connected_at: string;
}

export function EmailConnectionsCard({ userEmail }: { userEmail?: string }) {
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedForwarding, setCopiedForwarding] = useState(false);

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
      <CardContent className="space-y-6">
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

        {/* Connected Accounts List */}
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Connected Inboxes
          </h4>
          {connections.length > 0 ? (
            <div className="space-y-2">
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-background"
                >
                  <div className="flex items-center gap-2.5 text-xs truncate">
                    <span className="font-semibold uppercase text-foreground">{c.provider}</span>
                    <span className="text-muted-foreground truncate">{c.email_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      Purge Synced Data
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              No email inboxes connected. Connect Gmail or Outlook above for automatic tracking.
            </p>
          )}
        </div>

        {/* Forwarding Option */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
            Alternative: Forward Order Receipts
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
