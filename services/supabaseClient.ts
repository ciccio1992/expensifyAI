
import { createClient } from '@supabase/supabase-js';
import { ReceiptData } from '../types';

// Helper to retrieve credentials prioritizing Env Vars -> LocalStorage -> Default
const getSupabaseConfig = () => {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_KEY;

  // 1. Check if Env vars are valid (not undefined and not the placeholder text)
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('placeholder')) {
    return { url: envUrl, key: envKey || '' };
  }



  // 3. Fallback to placeholders (will cause connection error, triggering the UI setup screen)
  return {
    url: 'https://jfovetspnxevnaafqukn.supabase.co',
    key: 'sb_publishable_7ug_NqKBXIunK03JLcCMIg_diO2AqFd'
  };
};

const config = getSupabaseConfig();

// DEBUG: Log the configured URL to ensure it matches the user's project
console.log("Initializing Supabase Client with URL:", config.url);

export const supabase = createClient(config.url, config.key, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});

// Storage Bucket Name
const STORAGE_BUCKET = 'receipts';

/**
 * Uploads a receipt image blob to Supabase Storage.
 * Returns the storage path (e.g., "user_id/timestamp_receipt.jpg").
 */
export const uploadReceiptImage = async (userId: string, imageBlob: Blob): Promise<string | null> => {
  if (!imageBlob || imageBlob.size === 0) {
    console.warn("Invalid image blob provided for upload");
    return null;
  }

  const fileName = `${userId}/${Date.now()}_receipt.jpg`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    console.error("Storage Upload Error:", error);
    throw error;
  }

  return data?.path || null;
};

/**
 * Generates a signed URL for a private storage path.
 * This URL allows the frontend to display the image for a limited time (e.g., 1 hour).
 */
export const getReceiptImageUrl = async (storagePath: string): Promise<string | null> => {
  if (!storagePath) return null;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600); // URL valid for 1 hour

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data.signedUrl;
};

// Helper to map DB Snake Case to App Camel Case
export const mapReceiptFromDB = (data: any): ReceiptData => ({
  id: data.id,
  merchantName: data.merchant_name,
  merchantAddress: data.merchant_address,
  date: data.date,
  time: data.time,
  amount: data.amount,
  currency: data.currency,
  vat: data.vat || 0,
  exchangeRate: data.exchange_rate,
  convertedAmount: data.converted_amount,
  targetCurrency: data.target_currency,
  category: data.category,
  type: data.type,
  imageBase64: '', // We load this asynchronously via signed URL
  storagePath: data.image_path, // Store the reference
  createdAt: data.created_at,
  latitude: data.latitude,
  longitude: data.longitude,
});

// Helper to map App Camel Case to DB Snake Case
export const mapReceiptToDB = (receipt: ReceiptData, userId: string) => ({
  id: receipt.id,
  user_id: userId,
  merchant_name: receipt.merchantName,
  merchant_address: receipt.merchantAddress,
  date: receipt.date,
  time: receipt.time,
  amount: receipt.amount,
  currency: receipt.currency,
  vat: receipt.vat,
  exchange_rate: receipt.exchangeRate,
  converted_amount: receipt.convertedAmount,
  target_currency: receipt.targetCurrency,
  category: receipt.category,
  type: receipt.type,
  image_path: receipt.storagePath, // Save the path, not the base64
  created_at: receipt.createdAt,
  latitude: receipt.latitude,
  longitude: receipt.longitude
});

export const submitFeedback = async (userId: string, message: string) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ user_id: userId, message }]);

  if (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
  return data;
};
