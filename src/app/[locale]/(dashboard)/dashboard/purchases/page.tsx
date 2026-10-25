'use client';

// ========================================================
// Purchases List & Management View
// ========================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ShoppingBag, Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PurchaseFilters } from '@/components/purchases/PurchaseFilters';
import { PurchaseModal } from '@/components/purchases/PurchaseModal';
import { DeleteConfirmModal } from '@/components/purchases/DeleteConfirmModal';
import { DeadlineCountdownBadge } from '@/components/purchases/DeadlineCountdownBadge';
import { formatCurrency, formatDate } from '@/lib/i18n';

interface PurchasesPageProps {
  params: {
    locale: string;
  };
}

export default function PurchasesPage({ params: { locale } }: PurchasesPageProps) {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('purchase_date');
  const [isLoading, setIsLoading] = useState(true);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<any | null>(null);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        q: searchQuery,
        sort_by: sortBy,
      });

      const res = await fetch(`/api/purchases?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPurchases(data.purchases || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [statusFilter, searchQuery, sortBy]);

  const handleDelete = async () => {
    if (!deletingPurchase) return;
    try {
      await fetch(`/api/purchases/${deletingPurchase.id}`, { method: 'DELETE' });
      fetchPurchases();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Purchases
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track return deadlines, warranties, and organize receipts in one place.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPurchase(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Purchase</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <PurchaseFilters
        status={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Table & List */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading purchases...
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No purchases found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No purchases match your current filters. Try resetting search criteria.'
                : 'Start tracking online purchases and never miss a return deadline.'}
            </p>
            <Button
              onClick={() => {
                setEditingPurchase(null);
                setIsModalOpen(true);
              }}
              size="sm"
            >
              Add Your First Purchase
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Retailer</th>
                  <th scope="col" className="px-6 py-3.5">Product</th>
                  <th scope="col" className="px-6 py-3.5">Date</th>
                  <th scope="col" className="px-6 py-3.5">Return Window</th>
                  <th scope="col" className="px-6 py-3.5">Warranty</th>
                  <th scope="col" className="px-6 py-3.5">Total</th>
                  <th scope="col" className="px-6 py-3.5 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      {p.retailer_name}
                    </td>
                    <td className="px-6 py-4 text-foreground max-w-xs truncate">
                      <Link
                        href={`/${locale}/dashboard/purchases/${p.id}`}
                        className="hover:text-primary hover:underline font-medium"
                      >
                        {p.product_name}
                      </Link>
                      {p.order_id && (
                        <span className="block text-xs text-muted-foreground">
                          Order #{p.order_id}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(p.purchase_date, locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DeadlineCountdownBadge targetDate={p.return_deadline} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {p.warranty_deadline ? formatDate(p.warranty_deadline, locale) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(p.total, p.currency, locale)}
                    </td>
                    <td className="px-6 py-4 text-right rtl:text-left whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link href={`/${locale}/dashboard/purchases/${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit"
                          onClick={() => {
                            setEditingPurchase(p);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete"
                          onClick={() => setDeletingPurchase(p)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPurchases}
        initialData={editingPurchase}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingPurchase)}
        onClose={() => setDeletingPurchase(null)}
        onConfirm={handleDelete}
        itemName={deletingPurchase?.product_name || 'this purchase'}
      />
    </div>
  );
}
