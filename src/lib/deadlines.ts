// ========================================================
// Retailer Return Policy & Deadline Engine
// ========================================================

export interface RetailerPolicy {
  name: string;
  domain?: string;
  standardReturnDays: number;
  electronicsReturnDays?: number;
  hasHolidayExtension?: boolean;
  notes?: string;
}

export const KNOWN_RETAILERS: Record<string, RetailerPolicy> = {
  amazon: {
    name: 'Amazon',
    domain: 'amazon.com',
    standardReturnDays: 30,
    hasHolidayExtension: true, // Purchases Nov 1 - Dec 31 returnable until Jan 31
    notes: '30 days standard; holiday returns extended through Jan 31',
  },
  walmart: {
    name: 'Walmart',
    domain: 'walmart.com',
    standardReturnDays: 90,
    electronicsReturnDays: 30,
    hasHolidayExtension: true,
    notes: '90 days standard, 30 days for electronics and major tech',
  },
  target: {
    name: 'Target',
    domain: 'target.com',
    standardReturnDays: 90,
    electronicsReturnDays: 30,
    hasHolidayExtension: true,
    notes: '90 days for most items, 30 days for electronics; Target Circle Card adds 30 days',
  },
  bestbuy: {
    name: 'Best Buy',
    domain: 'bestbuy.com',
    standardReturnDays: 14,
    hasHolidayExtension: true,
    notes: '14 days for standard customers, 60 days for My Best Buy Plus/Total members',
  },
  apple: {
    name: 'Apple',
    domain: 'apple.com',
    standardReturnDays: 14,
    hasHolidayExtension: true,
    notes: '14 calendar days from receipt; holiday purchases eligible for extended return',
  },
  ebay: {
    name: 'eBay',
    domain: 'ebay.com',
    standardReturnDays: 30,
    hasHolidayExtension: false,
    notes: '30 days under eBay Money Back Guarantee if seller does not offer longer',
  },
  costco: {
    name: 'Costco',
    domain: 'costco.com',
    standardReturnDays: 365,
    electronicsReturnDays: 90,
    hasHolidayExtension: false,
    notes: '90 days for electronics, generous risk-free guarantee on general merchandise',
  },
  homedepot: {
    name: 'The Home Depot',
    domain: 'homedepot.com',
    standardReturnDays: 90,
    hasHolidayExtension: false,
    notes: '90 days standard with receipt',
  },
};

export interface DeadlineCalculationParams {
  purchaseDate: Date | string;
  retailerName: string;
  customReturnDays?: number | null;
  customWarrantyMonths?: number | null;
  country?: string;
  isElectronic?: boolean;
}

export interface DeadlineResult {
  returnDeadline: Date;
  warrantyDeadline: Date;
  returnWindowDays: number;
  warrantyMonths: number;
  isHolidayExtensionApplied: boolean;
  notes: string;
}

/**
 * Matches retailer name to known catalog
 */
export function matchRetailerPolicy(retailerName: string): RetailerPolicy | null {
  const normalized = retailerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, policy] of Object.entries(KNOWN_RETAILERS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return policy;
    }
  }
  return null;
}

/**
 * Calculates strict return and warranty deadlines
 */
export function calculateDeadlines({
  purchaseDate,
  retailerName,
  customReturnDays,
  customWarrantyMonths,
  country = 'US',
  isElectronic = false,
}: DeadlineCalculationParams): DeadlineResult {
  const pDate = typeof purchaseDate === 'string' ? new Date(purchaseDate) : new Date(purchaseDate);

  const policy = matchRetailerPolicy(retailerName);
  let returnDays = 30; // default safe fallback
  let isHolidayExtensionApplied = false;

  if (customReturnDays && customReturnDays > 0) {
    returnDays = customReturnDays;
  } else if (policy) {
    returnDays = isElectronic && policy.electronicsReturnDays ? policy.electronicsReturnDays : policy.standardReturnDays;

    // Check holiday extended return period (purchases between Nov 1 and Dec 25)
    if (policy.hasHolidayExtension) {
      const month = pDate.getUTCMonth(); // 10 = Nov, 11 = Dec
      const day = pDate.getUTCDate();
      if ((month === 10 && day >= 1) || (month === 11 && day <= 25)) {
        isHolidayExtensionApplied = true;
      }
    }
  } else {
    // EU/UK Statutory Cooling-Off Minimum is 14 days
    if (['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'PT', 'EU'].includes(country.toUpperCase())) {
      returnDays = 14;
    }
  }

  // Calculate return deadline date
  const returnDeadline = new Date(pDate);
  if (isHolidayExtensionApplied) {
    // Extended until January 31 of next calendar year
    const nextYear = pDate.getUTCFullYear() + 1;
    returnDeadline.setUTCFullYear(nextYear, 0, 31); // Jan 31
  } else {
    returnDeadline.setUTCDate(returnDeadline.getUTCDate() + returnDays);
  }

  // Calculate warranty deadline
  // Default is 12 months in US/CA/AU; 24 months statutory in EU
  let warrantyMonths = 12;
  if (customWarrantyMonths && customWarrantyMonths > 0) {
    warrantyMonths = customWarrantyMonths;
  } else if (['FR', 'DE', 'IT', 'ES', 'NL', 'PT', 'EU'].includes(country.toUpperCase())) {
    warrantyMonths = 24; // EU statutory 2-year guarantee
  }

  const warrantyDeadline = new Date(pDate);
  warrantyDeadline.setUTCMonth(warrantyDeadline.getUTCMonth() + warrantyMonths);

  const notes = policy?.notes || `${returnDays} days estimated return window`;

  return {
    returnDeadline,
    warrantyDeadline,
    returnWindowDays: returnDays,
    warrantyMonths,
    isHolidayExtensionApplied,
    notes,
  };
}

/**
 * Returns countdown metrics for UI
 */
export function getCountdownStatus(targetDate: Date | string | null): {
  daysRemaining: number;
  label: string;
  severity: 'success' | 'warning' | 'danger' | 'expired';
} {
  if (!targetDate) {
    return { daysRemaining: 0, label: 'No deadline', severity: 'expired' };
  }

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();

  // Normalize to UTC midnight for accurate day calculation
  const targetMidnight = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const nowMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const diffTime = targetMidnight - nowMidnight;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { daysRemaining, label: 'Expired', severity: 'expired' };
  }
  if (daysRemaining === 0) {
    return { daysRemaining, label: 'Ends Today', severity: 'danger' };
  }
  if (daysRemaining === 1) {
    return { daysRemaining, label: '1 day left', severity: 'danger' };
  }
  if (daysRemaining <= 7) {
    return { daysRemaining, label: `${daysRemaining} days left`, severity: 'warning' };
  }
  return { daysRemaining, label: `${daysRemaining} days left`, severity: 'success' };
}
