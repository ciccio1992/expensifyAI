import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, X, MapPin } from 'lucide-react';
import { resizeImage } from '../services/imageUtils';
import { analyzeReceiptImage } from '../services/geminiService';
import { ReceiptData, ExpenseCategory, ExpenseType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ScannerProps {
  onScanComplete: (receipt: ReceiptData) => void;
  onCancel: () => void;
  targetCurrency: string;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel, targetCurrency }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number, lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Attempt to get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeviceLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.log("Geolocation permission denied or error:", err);
        }
      );
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Resize/Compress Image (Returns Base64 for Gemini)
      const resizedBase64 = await resizeImage(file, 1024);

      // 2. Call Gemini API
      const extractedData = await analyzeReceiptImage(resizedBase64, targetCurrency);

      // 3. Determine Location
      const finalLat = extractedData.latitude || deviceLocation?.lat;
      const finalLng = extractedData.longitude || deviceLocation?.lng;

      // 4. Construct Receipt Object
      // We pass the Base64 here so the App can display it immediately.
      // The App component will handle converting it to a Blob and uploading it to Supabase.
      const newReceipt: ReceiptData = {
        id: uuidv4(),
        imageBase64: resizedBase64,
        merchantName: extractedData.merchantName || "Unknown Merchant",
        merchantAddress: extractedData.merchantAddress || "",
        date: extractedData.date || new Date().toISOString().split('T')[0],
        time: extractedData.time || "12:00",
        amount: extractedData.amount || 0,
        currency: extractedData.currency || "EUR",
        vat: extractedData.vat || 0,
        exchangeRate: extractedData.exchangeRate || 1,
        convertedAmount: (extractedData.amount || 0) * (extractedData.exchangeRate || 1),
        targetCurrency: targetCurrency,
        category: extractedData.category as ExpenseCategory || ExpenseCategory.Other,
        type: extractedData.type as ExpenseType || ExpenseType.Business,
        createdAt: Date.now(),
        latitude: finalLat,
        longitude: finalLng
      };

      onScanComplete(newReceipt);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze receipt. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
      >
        <X size={32} />
      </button>

      <div className="w-full max-w-md bg-card rounded-2xl p-6 text-center shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Receipt</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-gray-300 text-lg font-medium animate-pulse">Analyzing with Gemini AI...</p>
            <p className="text-gray-500 text-sm mt-2">Reading text & identifying location</p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full group relative flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-600 rounded-xl hover:border-primary hover:bg-gray-800 transition-all cursor-pointer"
            >
              <div className="p-4 bg-gray-800 rounded-full group-hover:bg-primary/20 transition-colors mb-4">
                <Camera className="text-gray-400 group-hover:text-primary" size={32} />
              </div>
              <p className="text-lg font-medium text-white">Capture or Upload</p>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className={deviceLocation ? "text-green-500" : "text-gray-600"} />
              {deviceLocation ? "Device Location Active" : "Location Service Inactive"}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;