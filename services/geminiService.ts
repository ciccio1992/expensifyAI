import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, ExpenseType } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema strictly
const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    merchantName: { type: Type.STRING, description: "Name of the business or issuer." },
    merchantAddress: { type: Type.STRING, description: "Full address if available, or city/country." },
    date: { type: Type.STRING, description: "Date of the transaction in YYYY-MM-DD format." },
    time: { type: Type.STRING, description: "Time of transaction in HH:MM format (24h)." },
    amount: { type: Type.NUMBER, description: "Total amount paid (Gross)." },
    currency: { type: Type.STRING, description: "3-letter currency code (e.g., USD, EUR, GBP, JPY)." },
    vat: { type: Type.NUMBER, description: "Total VAT or Tax amount. If not found, return 0." },
    exchangeRateToEur: { type: Type.NUMBER, description: "Estimated exchange rate to Euro on the transaction date. If EUR, use 1." },
    category: { 
      type: Type.STRING, 
      enum: Object.values(ExpenseCategory),
      description: "Best fitting category based on the merchant." 
    },
    type: {
      type: Type.STRING,
      enum: [ExpenseType.Business, ExpenseType.Private],
      description: "Suggest if this looks like a business expense (e.g. office supplies, travel, client dinner) or private (e.g. groceries, clothes)."
    },
    latitude: { type: Type.NUMBER, description: "Estimated latitude of the business location based on address/name. If unknown, leave empty." },
    longitude: { type: Type.NUMBER, description: "Estimated longitude of the business location based on address/name. If unknown, leave empty." }
  },
  required: ["merchantName", "date", "amount", "currency", "category", "type"],
};

export const analyzeReceiptImage = async (base64Image: string): Promise<any> => {
  // Remove data URL prefix if present for the API call
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this receipt. Extract the merchant, address, date, time, total amount, and total VAT/Tax amount. Identify the currency. Estimate the historical exchange rate to EUR for that specific date. Categorize the expense. Try to estimate the latitude and longitude of the business if the address is present or the business is a known chain in a specific city found on the receipt.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
        systemInstruction: "You are an expert accountant and data entry specialist. Analyze receipt images, even handwritten ones, with high precision. If the date is missing, use today's date. If time is missing, use 12:00. If address is missing, infer from merchant name or leave empty. Always attempt to find the VAT/Tax amount.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};