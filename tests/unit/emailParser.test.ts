import { describe, it, expect } from 'vitest';
import { classifyEmail, detectKnownRetailer, stripHtml } from '../../src/lib/email/parser';
import { parseAndExtractEmail } from '../../src/lib/email/aiExtractor';

describe('Email Parser & Classification Pipeline', () => {
  it('correctly classifies purchase confirmations', () => {
    const subject = 'Your Amazon.com order #114-9820391 has shipped';
    const body = 'Thank you for shopping with us. Your package is on its way.';
    const type = classifyEmail(subject, body);

    expect(type).toBe('shipping_update');
  });

  it('filters out marketing promotional emails', () => {
    const subject = 'Flash Sale: 50% off all shoes this weekend only!';
    const body = 'Do not miss out on exclusive discounts. Click here to unsubscribe from daily deals.';
    const type = classifyEmail(subject, body);

    expect(type).toBe('unrelated');
  });

  it('detects known retailers from sender and content', () => {
    const retailer = detectKnownRetailer('auto-confirm@amazon.com', 'Your order details', 'Order placed with Amazon.com');
    expect(retailer?.retailerName).toBe('Amazon');
    expect(retailer?.confidence).toBeGreaterThanOrEqual(0.95);
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
    expect(data.confidence).toBeGreaterThanOrEqual(0.90);
    expect(status).toBe('active');
  });
});
