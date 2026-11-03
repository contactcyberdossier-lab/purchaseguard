'use client';

export const runtime = 'edge';

// ========================================================
// Security & System Audit Trail (Admin Only)
// ========================================================

import { useEffect, useState } from 'react';
import { Activity, Search, ShieldAlert, Key } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  user_id: string | null;
  ip_hash: string | null;
  metadata: any;
  created_at: string;
  users?: {
    email: string;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ action: actionFilter });
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      } else {
        setError(data.error || 'Failed to load audit records');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Network error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          System & Security Audit Logs
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Immutable event trail for authentication, administrative privilege changes, and customer requests.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        >
          <option value="all">All Audit Actions</option>
          <option value="admin_user_update">Admin User Updates</option>
          <option value="login">Authentication Events</option>
          <option value="purchase_create">Purchase Creations</option>
          <option value="subscription_change">Subscription Events</option>
          <option value="data_export">GDPR/CCPA Exports</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading audit records...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-destructive">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No audit records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Initiator / User</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/30 font-mono text-xs">
                    <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-primary/10 text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-foreground whitespace-nowrap">
                      {log.users?.email || log.user_id || 'System'}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground max-w-md truncate font-sans">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
