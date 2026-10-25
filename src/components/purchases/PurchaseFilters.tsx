'use client';

// ========================================================
// Purchases Search, Filter, and Sort Controls
// ========================================================

import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface PurchaseFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function PurchaseFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: PurchaseFiltersProps) {
  const statuses = [
    { id: 'all', label: 'All Purchases' },
    { id: 'active', label: 'Active Returns' },
    { id: 'review_needed', label: 'Review Needed' },
    { id: 'returned', label: 'Returned' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Sort bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by retailer, product name, or order number..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rtl:pl-4 rtl:pr-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="purchase_date">Sort: Purchase Date</option>
            <option value="return_deadline">Sort: Return Deadline</option>
            <option value="total">Sort: Total Amount</option>
            <option value="retailer_name">Sort: Retailer</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {statuses.map((tab) => {
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
