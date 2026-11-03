'use client';

// ========================================================
// Client Component: Interactive Audit Logs Filter & Table
// ========================================================

import { useState } from 'react';
import { Activity, Filter, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  action: string;
  user_id: string | null;
  created_at: string;
  metadata?: any;
  users?: {
    email: string;
  };
}

interface AuditLogsTableProps {
  initialLogs: AuditLogItem[];
  adminEmail: string;
}

export function AuditLogsTable({ initialLogs, adminEmail }: AuditLogsTableProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [actionFilter, setActionFilter] = useState('all');

  // Filter logs instantly in memory
  const displayedLogs = actionFilter === 'all'
    ? logs
    : logs.filter((log) => log.action === actionFilter);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'domain_ssl_verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'admin_privilege_granted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'oauth_flow_configured':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'android_release_compiled':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'login':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            System & Security Audit Logs
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Immutable event trail for authentication, administrative privilege changes, and infrastructure security.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
          >
            <option value="all">All Audit Actions ({logs.length})</option>
            <option value="login">Authentication & Logins</option>
            <option value="domain_ssl_verified">Domain & SSL Verified</option>
            <option value="admin_privilege_granted">Admin Privilege Escalations</option>
            <option value="oauth_flow_configured">OAuth Configurations</option>
            <option value="android_release_compiled">Android Releases</option>
            <option value="api_rate_limiter_active">API & Service Checks</option>
            <option value="terms_disclaimer_updated">Compliance & Policy Updates</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Showing {displayedLogs.length} verified events</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {displayedLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No audit records match the selected action filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action Name</th>
                  <th className="px-6 py-3.5">Initiator / User</th>
                  <th className="px-6 py-3.5">Security Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/30 font-mono text-xs">
                    <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap flex items-center gap-1.5 pt-4">
                      <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-semibold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-foreground whitespace-nowrap font-medium">
                      {log.users?.email || log.user_id || adminEmail || 'System'}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground max-w-md truncate font-sans">
                      {log.metadata ? (
                        typeof log.metadata === 'object' ? (
                          <span className="font-mono text-[11px] bg-muted/60 px-2 py-0.5 rounded text-foreground/80">
                            {JSON.stringify(log.metadata)}
                          </span>
                        ) : (
                          String(log.metadata)
                        )
                      ) : (
                        '-'
                      )}
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
