export const runtime = 'nodejs';

// ========================================================
// API Route: /api/ocr/scan (Receipt & Invoice OCR Extraction)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateDeadlines } from '@/lib/deadlines';

interface ExtractedReceipt {
  retailer_name: string;
  product_name: string;
  order_id: string | null;
  purchase_date: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  currency: string;
  return_deadline: string | null;
  warranty_deadline: string | null;
  is_non_returnable?: boolean;
  confidence: number;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Receipt file or image is required' }, { status: 400 });
    }

    const fileBytes = await file.arrayBuffer();
    const originalName = file.name || 'receipt.jpg';
    
    // Resolve proper MIME type
    let mimeType = file.type || 'image/jpeg';
    const lowerName = originalName.toLowerCase();
    if (lowerName.endsWith('.png')) mimeType = 'image/png';
    else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
    else if (lowerName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (lowerName.endsWith('.heic')) mimeType = 'image/heic';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';

    // 1. Upload receipt to user's private Supabase 'receipts' bucket
    const fileExt = originalName.split('.').pop() || 'jpg';
    const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    let uploadedPath = '';
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('receipts')
        .upload(storagePath, fileBytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (!uploadErr && uploadData) {
        uploadedPath = uploadData.path;
      }
    } catch (storageErr) {
      console.warn('Receipt storage upload skipped:', storageErr);
    }

    // 2. Perform OCR Extraction via Gemini Vision
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        {
          success: false,
          receiptUrl: uploadedPath,
          fileName: originalName,
          error:
            'AI OCR is not configured. GEMINI_API_KEY is missing from environment variables. Please add your free Gemini API key to Vercel, or enter purchase details manually.',
        },
        { status: 422 }
      );
    }

    const base64Data = Buffer.from(fileBytes).toString('base64');

    const prompt = `You are an expert OCR engine specializing in reading receipts, invoices, store bills, utility bills, and food orders from both Indian and international merchants.
Extract data from this document and output STRICT JSON conforming exactly to this schema without markdown fences:
{
  "retailer_name": "Store/Merchant/Provider name (e.g. Amazon, Flipkart, D-Mart, Reliance Digital, Croma, Swiggy, Zomato, BESCOM, Apple, Target, Walmart)",
  "product_name": "Main item purchased or clear bill summary",
  "order_id": "Order or invoice number, or null",
  "purchase_date": "YYYY-MM-DD",
  "total": 0.00,
  "subtotal": 0.00,
  "tax": 0.00,
  "shipping": 0.00,
  "currency": "INR",
  "is_non_returnable": false,
  "items": [
    { "name": "Item description", "quantity": 1, "unit_price": 0.00, "total_price": 0.00 }
  ]
}

CRITICAL RULES:
1. PURCHASE DATE:
   - Normalize ANY date format (DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, or Month DD, YYYY) into standard ISO "YYYY-MM-DD".
   - If no date is found, use today's date.
2. CURRENCY:
   - If the receipt has '₹', 'Rs', 'Rs.', 'INR', or is from Indian merchants, use "INR".
   - If '$', use "USD". If '€', use "EUR". If '£', use "GBP".
3. TOTAL:
   - Extract the exact grand total / net payable amount. Convert to numeric float.
4. IS_NON_RETURNABLE:
   - Set to true for utility bills (electricity, water, broadband, gas), mobile recharges, food deliveries (Swiggy/Zomato), restaurants, groceries, digital goods.
   - Set to false for returnable consumer merchandise, electronics, clothing, shoes, furniture.
5. ITEMS:
   - Extract up to 10 distinct items if listed on the receipt.`;

    // Models ordered by capability and availability
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
    ];
    let geminiResponse: any = null;
    let geminiError: string | null = null;

    const tryModel = async (modelName: string) => {
      const cleanName = modelName.replace(/^models\//, '');
      return await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );
    };

    // 1. Try prioritized candidate models
    for (const model of candidateModels) {
      try {
        const res = await tryModel(model);
        if (res.ok) {
          geminiResponse = await res.json();
          break;
        } else {
          const errBody = await res.text();
          geminiError = `Model ${model} (${res.status}): ${errBody}`;
          console.warn(geminiError);
        }
      } catch (err: any) {
        geminiError = `Model ${model} network error: ${err.message}`;
        console.warn(geminiError);
      }
    }

    // 2. Dynamic fallback: Auto-discover active models from Google API
    if (!geminiResponse) {
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const available = (listData.models || []).filter(
            (m: any) =>
              m.supportedGenerationMethods?.includes('generateContent') &&
              (m.name?.includes('flash') || m.name?.includes('gemini'))
          );
          for (const m of available) {
            const res = await tryModel(m.name);
            if (res.ok) {
              geminiResponse = await res.json();
              break;
            }
          }
        }
      } catch (discErr) {
        console.warn('Dynamic model discovery error:', discErr);
      }
    }

    if (!geminiResponse) {
      return NextResponse.json(
        {
          success: false,
          receiptUrl: uploadedPath,
          fileName: originalName,
          error: `AI OCR extraction failed (${geminiError || 'AI service unavailable'}). Please enter the details manually.`,
        },
        { status: 502 }
      );
    }

    const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        {
          success: false,
          receiptUrl: uploadedPath,
          fileName: originalName,
          error: 'Could not extract legible text from this image. Please check lighting or enter details manually.',
        },
        { status: 422 }
      );
    }

    // Clean and parse JSON response
    const cleanedText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const parsed = JSON.parse(cleanedText);

    const isNonReturnable = Boolean(parsed.is_non_returnable);
    const purchaseDate = parsed.purchase_date || new Date().toISOString().split('T')[0];
    const retailerName = parsed.retailer_name || 'Retailer';

    const calculated = calculateDeadlines({
      purchaseDate,
      retailerName,
    });

    const extracted: ExtractedReceipt = {
      retailer_name: retailerName,
      product_name: parsed.product_name || parsed.items?.[0]?.name || 'Purchased Item',
      order_id: parsed.order_id || null,
      purchase_date: purchaseDate,
      total: Number(parsed.total) || 0,
      subtotal: Number(parsed.subtotal) || Number(parsed.total) || 0,
      tax: Number(parsed.tax) || 0,
      shipping: Number(parsed.shipping) || 0,
      currency: parsed.currency || 'INR',
      return_deadline: isNonReturnable ? null : calculated.returnDeadline.toISOString().split('T')[0],
      warranty_deadline: isNonReturnable ? null : calculated.warrantyDeadline.toISOString().split('T')[0],
      is_non_returnable: isNonReturnable,
      confidence: 0.95,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };

    return NextResponse.json({
      success: true,
      extracted,
      receiptUrl: uploadedPath,
      fileName: originalName,
    });
  } catch (err: any) {
    console.error('OCR Route unhandled error:', err);
    return NextResponse.json(
      { error: err.message || 'Receipt OCR extraction failed' },
      { status: 500 }
    );
  }
}
