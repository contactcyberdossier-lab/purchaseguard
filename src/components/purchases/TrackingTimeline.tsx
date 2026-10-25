'use client';

// ========================================================
// Package Delivery Progress Timeline Component
// ========================================================

import { CheckCircle2, Truck, Package, Clock, AlertCircle } from 'lucide-react';
import { type TrackingResult } from '@/lib/tracking';
import { formatDate } from '@/lib/i18n';

interface TrackingTimelineProps {
  tracking: TrackingResult;
  locale: string;
}

export function TrackingTimeline({ tracking, locale }: TrackingTimelineProps) {
  const steps = [
    { id: 'info_received', label: 'Order Shipped', icon: Package },
    { id: 'in_transit', label: 'In Transit', icon: Truck },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Clock },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const statusOrder = ['info_received', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIdx = statusOrder.indexOf(tracking.status);

  return (
    <div className="space-y-6">
      {/* Top Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <span className="text-xs uppercase font-semibold text-muted-foreground">Carrier & Number</span>
          <div className="text-sm font-bold text-foreground font-mono">
            {tracking.carrier} • {tracking.trackingNumber}
          </div>
        </div>
        {tracking.estimatedDeliveryDate && (
          <div className="sm:text-right">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Est. Delivery</span>
            <div className="text-sm font-bold text-foreground">
              {formatDate(tracking.estimatedDeliveryDate, locale)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Line */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 ${
                  isDone
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-muted'
                } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isDone ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Checkpoints Log */}
      {tracking.checkpoints.length > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
            Tracking History
          </h5>
          <div className="space-y-3">
            {tracking.checkpoints.map((cp, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{cp.message}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {cp.location ? `${cp.location} • ` : ''}
                    {formatDate(cp.timestamp, locale, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
