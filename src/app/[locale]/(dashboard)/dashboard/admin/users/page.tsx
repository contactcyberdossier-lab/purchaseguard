'use client';

export const runtime = 'edge';

// ========================================================
// Admin User & Privileges Management View
// ========================================================

import { useEffect, useState } from 'react';
import { Search, Shield, ShieldCheck, UserCheck, UserX, Crown, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  subscription_status: string;
  country: string;
  created_at: string;
  purchase_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        role: roleFilter,
        subscription: subFilter,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, subFilter]);

  const handleRoleToggle = async (user: AdminUserItem) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change ${user.email}'s privilege to "${newRole.toUpperCase()}"?`)) {
      return;
    }

    setActionLoadingId(user.id);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user privilege');

      setNotification({
        type: 'success',
        message: `Successfully updated ${user.email} role to ${newRole.toUpperCase()}.`,
      });
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error updating role' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setActionLoadingId(userId);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription_status: newPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update subscription tier');

      setNotification({
        type: 'success',
        message: 'Subscription plan updated successfully.',
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, subscription_status: newPlan } : u))
      );
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error updating plan' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          User & Privilege Management
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Assign administrator privileges, grant or revoke access, and manage customer subscription tiers.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Normal Users Only</option>
          </select>

          {/* Subscription Filter */}
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading accounts & privileges...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No matching accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Account / Email</th>
                  <th className="px-6 py-3.5">Privilege (Role)</th>
                  <th className="px-6 py-3.5">Plan Tier</th>
                  <th className="px-6 py-3.5">Purchases Tracked</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Privilege Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isProcessing = actionLoadingId === u.id;
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div>
                          <span>{u.email}</span>
                          {u.full_name && (
                            <span className="block text-xs font-normal text-muted-foreground">
                              {u.full_name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isAdmin
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ADMIN</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-3.5 h-3.5" />
                              <span>USER</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Subscription Tier Selector */}
                      <td className="px-6 py-4">
                        <select
                          value={u.subscription_status}
                          disabled={isProcessing}
                          onChange={(e) => handlePlanChange(u.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold bg-background border border-border rounded-lg uppercase font-mono focus:ring-1 focus:ring-primary"
                        >
                          <option value="free">Free</option>
                          <option value="plus">Plus ($4.99/mo)</option>
                          <option value="annual">Annual ($39.99/yr)</option>
                        </select>
                      </td>

                      {/* Purchases count */}
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {u.purchase_count}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {/* Privilege Action */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant={isAdmin ? 'outline' : 'default'}
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleRoleToggle(u)}
                          className="h-8 text-xs font-semibold"
                        >
                          {isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
