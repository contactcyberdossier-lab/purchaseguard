'use client';

// ========================================================
// Manual Purchase Entry & Edit Modal
// ========================================================

import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { SUPPORTED_CURRENCIES, type PurchaseInput } from '@/lib/validations/purchase';
import { calculateDeadlines, matchRetailerPolicy } from '@/lib/deadlines';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function PurchaseModal({ isOpen, onClose, onSuccess, initialData }: PurchaseModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [retailerName, setRetailerName] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('USD');
  const [subtotal, setSubtotal] = useState('0.00');
  const [tax, setTax] = useState('0.00');
  const [shipping, setShipping] = useState('0.00');
  const [total, setTotal] = useState('');
  const [returnDays, setReturnDays] = useState<number | ''>('');
  const [warrantyMonths, setWarrantyMonths] = useState<number | ''>(12);
  const [calculatedReturnDate, setCalculatedReturnDate] = useState('');
  const [calculatedWarrantyDate, setCalculatedWarrantyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedPolicyNote, setDetectedPolicyNote] = useState<string | null>(null);

  const [items, setItems] = useState<{ name: string; quantity: number; unit_price: number; total_price: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Populate when editing
  useEffect(() => {
    if (initialData) {
      setRetailerName(initialData.retailer_name || '');
      setProductName(initialData.product_name || '');
      setProductUrl(initialData.product_url || '');
      setOrderId(initialData.order_id || '');
      setTrackingNumber(initialData.tracking_number || '');
      setPurchaseDate(initialData.purchase_date || new Date().toISOString().split('T')[0]);
      setCurrency(initialData.currency || 'USD');
      setSubtotal(String(initialData.subtotal ?? '0.00'));
      setTax(String(initialData.tax ?? '0.00'));
      setShipping(String(initialData.shipping ?? '0.00'));
      setTotal(String(initialData.total ?? ''));
      setCalculatedReturnDate(initialData.return_deadline || '');
      setCalculatedWarrantyDate(initialData.warranty_deadline || '');
      setNotes(initialData.notes || '');
      if (initialData.purchase_items) {
        setItems(initialData.purchase_items);
      }
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  // Recalculate deadlines on changes
  useEffect(() => {
    if (!purchaseDate) return;

    const policy = matchRetailerPolicy(retailerName);
    if (policy) {
      setDetectedPolicyNote(policy.notes || null);
    } else {
      setDetectedPolicyNote(null);
    }

    const calculated = calculateDeadlines({
      purchaseDate,
      retailerName,
      customReturnDays: typeof returnDays === 'number' ? returnDays : undefined,
      customWarrantyMonths: typeof warrantyMonths === 'number' ? warrantyMonths : undefined,
    });

    setCalculatedReturnDate(calculated.returnDeadline.toISOString().split('T')[0]);
    setCalculatedWarrantyDate(calculated.warrantyDeadline.toISOString().split('T')[0]);
  }, [retailerName, purchaseDate, returnDays, warrantyMonths]);

  // Recalculate total from subtotal + tax + shipping if user edits subparts
  const handleSubtotalChange = (val: string) => {
    setSubtotal(val);
    const sub = parseFloat(val) || 0;
    const tx = parseFloat(tax) || 0;
    const sh = parseFloat(shipping) || 0;
    setTotal((sub + tx + sh).toFixed(2));
  };

  const resetForm = () => {
    setRetailerName('');
    setProductName('');
    setProductUrl('');
    setOrderId('');
    setTrackingNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setCurrency('USD');
    setSubtotal('0.00');
    setTax('0.00');
    setShipping('0.00');
    setTotal('');
    setReturnDays('');
    setWarrantyMonths(12);
    setNotes('');
    setItems([]);
    setError(null);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = [...items];
    const item = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(val) : item.quantity;
      const u = field === 'unit_price' ? Number(val) : item.unit_price;
      item.total_price = q * u;
    }
    updated[idx] = item;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericTotal = parseFloat(total);
    if (isNaN(numericTotal) || numericTotal < 0) {
      setError('Please provide a valid non-negative total amount.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: PurchaseInput = {
        retailer_name: retailerName,
        product_name: productName,
        product_url: productUrl || undefined,
        order_id: orderId || undefined,
        tracking_number: trackingNumber || undefined,
        purchase_date: purchaseDate,
        currency: currency as any,
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        shipping: parseFloat(shipping) || 0,
        total: numericTotal,
        return_deadline: calculatedReturnDate,
        warranty_deadline: calculatedWarrantyDate,
        notes: notes || undefined,
        items,
      };

      const url = isEditing ? `/api/purchases/${initialData.id}` : '/api/purchases';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save purchase');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving purchase');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEditing ? 'Edit Purchase' : 'Add Purchase'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter purchase details to calculate return deadlines and schedule reminders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Retailer & Auto-detection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Retailer Name *
            </label>
            <input
              type="text"
              required
              value={retailerName}
              onChange={(e) => setRetailerName(e.target.value)}
              placeholder="e.g. Amazon, Best Buy, Target, Apple, Walmart"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {detectedPolicyNote && (
              <p className="mt-1 text-xs text-primary flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Detected rule: {detectedPolicyNote}</span>
              </p>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Apple AirPods Pro (2nd Gen)"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Purchase Date & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Currency *
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
          </div>

          {/* Pricing Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Subtotal
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={subtotal}
                onChange={(e) => handleSubtotalChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Tax
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tax}
                onChange={(e) => {
                  setTax(e.target.value);
                  const sub = parseFloat(subtotal) || 0;
                  const tx = parseFloat(e.target.value) || 0;
                  const sh = parseFloat(shipping) || 0;
                  setTotal((sub + tx + sh).toFixed(2));
                }}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Shipping
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={shipping}
                onChange={(e) => {
                  setShipping(e.target.value);
                  const sub = parseFloat(subtotal) || 0;
                  const tx = parseFloat(tax) || 0;
                  const sh = parseFloat(e.target.value) || 0;
                  setTotal((sub + tx + sh).toFixed(2));
                }}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Total *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-primary bg-background px-2.5 py-1.5 text-xs font-bold text-foreground"
              />
            </div>
          </div>

          {/* Order ID & Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 112-9840291-1029384"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z9999999999999999"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Deadlines Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-card">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase text-foreground">
                  Return Deadline
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {returnDays ? `${returnDays} days` : 'Auto'}
                </span>
              </div>
              <input
                type="date"
                value={calculatedReturnDate}
                onChange={(e) => setCalculatedReturnDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase text-foreground">
                  Warranty End Date
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {warrantyMonths ? `${warrantyMonths} mo` : 'Auto'}
                </span>
              </div>
              <input
                type="date"
                value={calculatedWarrantyDate}
                onChange={(e) => setCalculatedWarrantyDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground"
              />
            </div>
          </div>

          {/* Line items (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Line Items (Optional)
              </label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
              </Button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item description"
                  value={it.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  className="w-16 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={it.unit_price}
                  onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                  className="w-20 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-destructive p-1 rounded hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Store policy notes, return window conditions, or serial numbers..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Save Changes' : 'Save Purchase'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
