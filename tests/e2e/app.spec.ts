import { test, expect } from '@playwright/test';

test.describe('PurchaseGuard Public Landing & Marketing Features', () => {
  test('renders homepage with correct value proposition and claims disclaimer', async ({ page }) => {
    await page.goto('/en');

    // Check main hero headline
    await expect(page.locator('h1')).toContainText('Track purchases');
    await expect(page.locator('h1')).toContainText('Never miss a return deadline');

    // Check claims compliance statement in footer
    const footerText = page.locator('footer');
    await expect(footerText).toContainText(
      'PurchaseGuard helps you track purchases and prepare return, refund, warranty, and price-match requests. The retailer or manufacturer makes the final decision.'
    );
  });

  test('switches language and adjusts text correctly', async ({ page }) => {
    await page.goto('/en');

    // Navigate to Spanish locale
    await page.goto('/es');
    await expect(page.locator('h1')).toContainText('Rastrea compras');
    await expect(page.locator('h1')).toContainText('Nunca pierdas un plazo de devolución');
  });

  test('supports full RTL layout on Arabic locale', async ({ page }) => {
    await page.goto('/ar');

    // Verify HTML dir="rtl"
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    await expect(page.locator('h1')).toContainText('تتبع مشترياتك');
  });

  test('navigates to login page and displays validation errors on empty submission', async ({ page }) => {
    await page.goto('/en/login');

    // Submit without input
    await page.click('button[type="submit"]');

    // Verify input validation triggers
    await expect(page.locator('input[type="email"]')).toBeFocused();
  });
});
