'use client';

export const runtime = 'edge';

// ========================================================
// Global Purchases Explorer (Admin Only)
// ========================================================

import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminPurchaseItem {
  id: string;
  retailer_name: string;
  product_name: string;
  order_id: string | null;
  purchase_date: string;
  total: number;
  currency: string;
  status: string;
  return_deadline: string | null;
  warranty_deadline: string | null;
  created_at: string;
  users?: {
    email: string;
    full_name?: string;
  };
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<AdminPurchaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/purchases?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPurchases(data.purchases || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Platform-Wide Purchases Explorer
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Inspect, audit, and analyze purchase records across all customer accounts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product, retailer, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="review_needed">Review Needed</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading platform purchases...
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No purchases found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Retailer</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">User / Account</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Return Deadline</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      {p.retailer_name}
                      {p.order_id && (
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          #{p.order_id}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground max-w-xs truncate font-medium">
                      {p.product_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {p.users?.email || 'Customer'}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {p.purchase_date}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono whitespace-nowrap">
                      {p.return_deadline || 'None'}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">
                      ${Number(p.total).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : p.status === 'review_needed'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {p.status}
                      </span>
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
