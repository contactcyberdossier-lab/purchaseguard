import { describe, it, expect } from 'vitest';
import { calculateDeadlines, getCountdownStatus, matchRetailerPolicy } from '../../src/lib/deadlines';

describe('Deadlines & Retailer Policy Engine', () => {
  it('correctly matches known retailers by name', () => {
    const amazon = matchRetailerPolicy('Amazon.com Services LLC');
    expect(amazon?.name).toBe('Amazon');
    expect(amazon?.standardReturnDays).toBe(30);

    const bestbuy = matchRetailerPolicy('Best Buy Store #1402');
    expect(bestbuy?.name).toBe('Best Buy');
    expect(bestbuy?.standardReturnDays).toBe(14);

    const target = matchRetailerPolicy('Target');
    expect(target?.name).toBe('Target');
    expect(target?.standardReturnDays).toBe(90);
  });

  it('calculates standard 30-day return window for Amazon', () => {
    const res = calculateDeadlines({
      purchaseDate: '2026-05-10',
      retailerName: 'Amazon',
    });

    expect(res.returnWindowDays).toBe(30);
    // May 10 + 30 days = June 9, 2026
    const expected = new Date('2026-05-10T00:00:00Z');
    expected.setUTCDate(expected.getUTCDate() + 30);
    expect(res.returnDeadline.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0]);
  });

  it('applies holiday extension rule for purchases in November', () => {
    const res = calculateDeadlines({
      purchaseDate: '2026-11-15',
      retailerName: 'Amazon',
    });

    expect(res.isHolidayExtensionApplied).toBe(true);
    // Should extend to January 31, 2027
    expect(res.returnDeadline.getUTCFullYear()).toBe(2027);
    expect(res.returnDeadline.getUTCMonth()).toBe(0); // January
    expect(res.returnDeadline.getUTCDate()).toBe(31);
  });

  it('honors statutory 14-day cooling off period in UK/EU for unknown stores', () => {
    const res = calculateDeadlines({
      purchaseDate: '2026-04-01',
      retailerName: 'Independent Boutique Shop',
      country: 'GB',
    });

    expect(res.returnWindowDays).toBe(14);
  });

  it('correctly reports countdown statuses', () => {
    const today = new Date();
    const future7d = new Date();
    future7d.setUTCDate(today.getUTCDate() + 7);

    const status7d = getCountdownStatus(future7d);
    expect(status7d.severity).toBe('warning');

    const past10d = new Date();
    past10d.setUTCDate(today.getUTCDate() - 10);
    const statusPast = getCountdownStatus(past10d);
    expect(statusPast.severity).toBe('expired');
    expect(statusPast.label).toBe('Expired');
  });
});
