'use client';

// ========================================================
// Manual Purchase Entry & Edit Modal
// ========================================================

import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Plus, Trash2, Camera, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [isNonReturnable, setIsNonReturnable] = useState(false);
  const [warrantyProvider, setWarrantyProvider] = useState('');
  const [warrantyPolicyNumber, setWarrantyPolicyNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedPolicyNote, setDetectedPolicyNote] = useState<string | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);

  const [items, setItems] = useState<{ name: string; quantity: number; unit_price: number; total_price: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

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
      setIsNonReturnable(!initialData.return_deadline);
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

    if (isNonReturnable) {
      setCalculatedReturnDate('');
      return;
    }

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
  }, [retailerName, purchaseDate, returnDays, warrantyMonths, isNonReturnable]);

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
    setIsNonReturnable(false);
    setWarrantyProvider('');
    setWarrantyPolicyNumber('');
    setNotes('');
    setUploadedReceiptUrl(null);
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

  const compressImageForUpload = async (file: File): Promise<File> => {
    // Only compress images, pass PDFs or small files as-is
    if (file.type === 'application/pdf' || file.size < 500 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const safeName = file.name.replace(/\.[^/.]+$/, '.jpg');
                  const compressed = new File([blob], safeName, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressed);
                } else {
                  resolve(file);
                }
              },
              'image/jpeg',
              0.85
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setScanSuccess(null);

    try {
      const uploadFile = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/ocr/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.receiptUrl) {
        setUploadedReceiptUrl(data.receiptUrl);
      }
      if (!res.ok) throw new Error(data.error || 'Failed to scan receipt');

      const ext = data.extracted;
      if (ext) {
        if (ext.retailer_name) setRetailerName(ext.retailer_name);
        if (ext.product_name) setProductName(ext.product_name);
        if (ext.order_id) setOrderId(ext.order_id);
        if (ext.purchase_date) setPurchaseDate(ext.purchase_date);
        if (ext.currency) setCurrency(ext.currency);
        if (ext.total) setTotal(String(ext.total));
        if (ext.subtotal) setSubtotal(String(ext.subtotal));
        if (ext.tax) setTax(String(ext.tax));
        if (ext.shipping) setShipping(String(ext.shipping));
        if (ext.items && ext.items.length > 0) setItems(ext.items);
        if (ext.is_non_returnable) {
          setIsNonReturnable(true);
          setCalculatedReturnDate('');
        } else {
          setIsNonReturnable(false);
          if (ext.return_deadline) setCalculatedReturnDate(ext.return_deadline);
        }
        if (ext.warranty_deadline) setCalculatedWarrantyDate(ext.warranty_deadline);

        setScanSuccess(`Extracted details from ${ext.retailer_name || 'receipt'}! Verify information below.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error scanning receipt. You can still enter details manually.');
    } finally {
      setIsScanning(false);
      e.target.value = '';
    }
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
      let finalNotes = notes?.trim() || '';
      if (warrantyProvider || warrantyPolicyNumber) {
        const extNote = `[Extended Warranty] Provider: ${warrantyProvider || 'Third-Party'} | Policy #${warrantyPolicyNumber || 'N/A'}`;
        if (!finalNotes.includes(extNote)) {
          finalNotes = finalNotes ? `${finalNotes}\n${extNote}` : extNote;
        }
      }

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
        return_deadline: isNonReturnable ? null : (calculatedReturnDate || undefined),
        warranty_deadline: calculatedWarrantyDate || undefined,
        custom_return_days: isNonReturnable ? 0 : (returnDays ? Number(returnDays) : undefined),
        is_non_returnable: isNonReturnable,
        receipt_url: uploadedReceiptUrl || undefined,
        notes: finalNotes || undefined,
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

        {/* OCR Receipt Scanner Banner */}
        {!isEditing && (
          <div className="mt-5 p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>Scan Receipt / Invoice (AI OCR)</span>
                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">AUTO-FILL</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Take a photo with your mobile camera or pick a receipt/bill image or PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Take Photo with Mobile Camera */}
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-all shadow-sm">
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={isScanning}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Browse Files or Gallery */}
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-accent cursor-pointer transition-all shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5 text-primary" />
                  <span>Gallery / PDF</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={isScanning}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploadedReceiptUrl && (
              <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium truncate max-w-[280px]">Receipt image attached to vault</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-primary font-bold">READY</span>
              </div>
            )}

            {scanSuccess && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{scanSuccess}</span>
              </div>
            )}
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

          {/* Non-returnable / Bill Payment Option */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <input
              type="checkbox"
              id="is_non_returnable"
              checked={isNonReturnable}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsNonReturnable(checked);
                if (checked) {
                  setCalculatedReturnDate('');
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-input cursor-pointer"
            />
            <label htmlFor="is_non_returnable" className="text-xs text-foreground cursor-pointer select-none">
              <span className="font-semibold text-foreground block">
                Non-returnable order / Digital service / Bill payment
              </span>
              <span className="text-muted-foreground block text-[11px] mt-0.5">
                Check this for utility bills (electricity, water, broadband), mobile recharges, food orders, or digital gift cards. Preserves the receipt in your vault without triggering return countdown alerts.
              </span>
            </label>
          </div>

          {/* Deadlines Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-card">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase text-foreground">
                  Return Deadline
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {isNonReturnable ? 'None' : returnDays ? `${returnDays} days` : 'Auto'}
                </span>
              </div>
              {isNonReturnable ? (
                <div className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground italic">
                  Non-returnable (Receipt & expense tracking only)
                </div>
              ) : (
                <input
                  type="date"
                  value={calculatedReturnDate}
                  onChange={(e) => setCalculatedReturnDate(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                />
              )}
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
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[12, 24, 36, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setWarrantyMonths(m);
                      if (purchaseDate) {
                        const d = new Date(purchaseDate);
                        d.setUTCMonth(d.getUTCMonth() + m);
                        setCalculatedWarrantyDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      warrantyMonths === m
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'bg-muted/60 text-muted-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {m === 12 ? '1 Yr (Std)' : `${m / 12} Yrs (${m > 12 ? `+${(m - 12) / 12}y Ext` : ''})`}
                  </button>
                ))}
              </div>

              {typeof warrantyMonths === 'number' && warrantyMonths > 12 && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Extended Protection Details (+{(warrantyMonths - 12) / 12} Yr)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Provider (AppleCare+, OneAssist, Asurion)"
                      value={warrantyProvider}
                      onChange={(e) => setWarrantyProvider(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Policy / Certificate #"
                      value={warrantyPolicyNumber}
                      onChange={(e) => setWarrantyPolicyNumber(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}
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
