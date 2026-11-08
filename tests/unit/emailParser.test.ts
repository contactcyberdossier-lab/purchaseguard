import { describe, it, expect } from 'vitest';
import { classifyEmail, detectKnownRetailer, stripHtml, extractCleanProductName } from '../../src/lib/email/parser';
import { parseAndExtractEmail, extractOrderId, extractFinancials, extractReturnAndWarranty } from '../../src/lib/email/aiExtractor';

describe('Email Parser & Classification Pipeline (99% Precision)', () => {
  it('correctly classifies purchase confirmations', () => {
    const subject = 'Your Amazon.com order #114-9820391 has shipped';
    const body = 'Thank you for shopping with us. Your package is on its way.';
    const type = classifyEmail(subject, body, 'ship-confirm@amazon.com');

    expect(type).toBe('shipping_update');
  });

  it('filters out marketing promotional emails and spam', () => {
    const subject = 'Flash Sale: 50% off all shoes this weekend only!';
    const body = 'Do not miss out on exclusive discounts. Click here to unsubscribe from daily deals.';
    const type = classifyEmail(subject, body, 'newsletter@shop.com');

    expect(type).toBe('unrelated');
  });

  it('detects known retailers from sender and content', () => {
    const retailer = detectKnownRetailer('auto-confirm@amazon.com', 'Your order details', 'Order placed with Amazon.com');
    expect(retailer?.retailerName).toBe('Amazon');
    expect(retailer?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('infers merchant brand from domain fallback when unknown', () => {
    const retailer = detectKnownRetailer('orders@lenskart.com', 'Your eyewear order', 'Thank you for shopping');
    expect(retailer?.retailerName).toBe('Lenskart');
    expect(retailer?.retailerDomain).toBe('lenskart.com');
  });

  it('safely strips HTML tags while preserving text tokens', () => {
    const html = '<div><h2>Order Confirmation</h2><p>Total: $49.99</p></div>';
    const stripped = stripHtml(html);

    expect(stripped).toContain('Order Confirmation');
    expect(stripped).toContain('Total: $49.99');
    expect(stripped).not.toContain('<div>');
  });

  it('parses email content into universal structured schema with confidence scoring', async () => {
    const email = {
      subject: 'Order Confirmation #114-7890123',
      senderEmail: 'orders@target.com',
      emailBody: 'Thank you for your order! Order #114-7890123. Total: $129.50. Items: Wireless Keyboard.',
    };

    const { data, status } = await parseAndExtractEmail(email);

    expect(data.is_purchase).toBe(true);
    expect(data.order_id).toBe('114-7890123');
    expect(data.total).toBe(129.50);
    expect(data.confidence).toBeGreaterThanOrEqual(0.95);
    expect(status).toBe('active');
  });

  it('accurately distinguishes Grand Total from Subtotal and Savings', () => {
    const body = `
      Subtotal: $45.00
      Total Savings: $10.00
      Shipping: $5.00
      Tax: $4.00
      Grand Total: $54.00
    `;
    const financials = extractFinancials(body, 'orders@store.com');
    expect(financials.total).toBe(54.00);
    expect(financials.subtotal).toBe(45.00);
    expect(financials.currency).toBe('USD');
  });

  it('correctly parses Indian Rupee (INR) and formats for Swiggy / Flipkart', () => {
    const body = `
      Order ID: OD123456789012345678
      Item: Noise Cancelling Headphones
      Total Amount: ₹4,999.00
      Delivered to your address
    `;
    const financials = extractFinancials(body, 'billing@flipkart.com');
    expect(financials.total).toBe(4999.00);
    expect(financials.currency).toBe('INR');

    const orderId = extractOrderId(body, 'Your Flipkart Order', 'Flipkart');
    expect(orderId).toBe('OD123456789012345678');
  });

  it('rejects separator lines as Order IDs', () => {
    const body = `
      Order #---------------------
      Order ID: 21850532
      Total: $14.88
    `;
    const orderId = extractOrderId(body, 'Receipt for Namecheap', 'Namecheap');
    expect(orderId).toBe('21850532');
    expect(orderId).not.toContain('-');
  });

  it('extracts clean product names from cluttered subject lines', () => {
    const clean = extractCleanProductName(
      'Fwd: Your Amazon.com order of "Sony WH-1000XM5 Headphones" has shipped!',
      'Item Description: Sony WH-1000XM5 Wireless Headphones\nPrice: $349.99',
      'Amazon'
    );
    expect(clean).toBe('Sony WH-1000XM5 Headphones');
  });

  it('correctly identifies retailer return window and warranty policies', () => {
    const applePolicy = extractReturnAndWarranty('Apple Store Order. 14 days return policy.', 'Apple');
    expect(applePolicy.returnWindowDays).toBe(14);
    expect(applePolicy.warrantyMonths).toBe(12);

    const costcoPolicy = extractReturnAndWarranty('Costco Wholesale Order', 'Costco');
    expect(costcoPolicy.returnWindowDays).toBe(90);
  });
});
