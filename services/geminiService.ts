import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ExpenseCategory, ExpenseType } from '../types';

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing Gemini API Key. Please set VITE_GEMINI_API_KEY in your .env file.");
}
const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");


// Define the response schema strictly
const getReceiptSchema = (targetCurrency: string) => ({
  type: SchemaType.OBJECT,
  properties: {
    merchantName: { type: SchemaType.STRING, description: "Name of the business or issuer." },
    merchantAddress: { type: SchemaType.STRING, description: "Full address if available, or city/country." },
    date: { type: SchemaType.STRING, description: "Date of the transaction in YYYY-MM-DD format." },
    time: { type: SchemaType.STRING, description: "Time of transaction in HH:MM format (24h)." },
    amount: { type: SchemaType.NUMBER, description: "Total amount paid (Gross)." },
    currency: { type: SchemaType.STRING, description: "3-letter currency code (e.g., USD, EUR, GBP, JPY)." },
    vat: { type: SchemaType.NUMBER, description: "Total VAT or Tax amount. If not found, return 0." },
    exchangeRate: { type: SchemaType.NUMBER, description: `Estimated exchange rate to ${targetCurrency} on the transaction date. If currency is ${targetCurrency}, use 1.` },
    category: {
      type: SchemaType.STRING,
      enum: Object.values(ExpenseCategory),
      description: "Best fitting category based on the merchant."
    },
    type: {
      type: SchemaType.STRING,
      enum: [ExpenseType.Business, ExpenseType.Private],
      description: "Suggest if this looks like a business expense (e.g. office supplies, travel, client dinner) or private (e.g. groceries, clothes)."
    },
    latitude: { type: SchemaType.NUMBER, description: "Estimated latitude of the business location based on address/name. If unknown, leave empty." },
    longitude: { type: SchemaType.NUMBER, description: "Estimated longitude of the business location based on address/name. If unknown, leave empty." }
  },
  required: ["merchantName", "date", "amount", "currency", "category", "type", "exchangeRate"],
});

export const analyzeReceiptImage = async (base64Image: string, targetCurrency: string = 'EUR'): Promise<any> => {
  // Remove data URL prefix if present for the API call
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in your settings or .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: getReceiptSchema(targetCurrency),
      },
      systemInstruction: "You are an expert accountant and data entry specialist. Analyze receipt images, even handwritten ones, with high precision. If the date is missing, use today's date. If time is missing, use 12:00. If address is missing, infer from merchant name or leave empty. Always attempt to find the VAT/Tax amount.",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      },
      `Analyze this receipt. Extract the merchant, address, date, time, total amount, and total VAT/Tax amount. Identify the currency. Estimate the historical exchange rate to ${targetCurrency} for that specific date. Categorize the expense. Try to estimate the latitude and longitude of the business if the address is present or the business is a known chain in a specific city found on the receipt.`,
    ]);

    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};