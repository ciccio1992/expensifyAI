export enum ExpenseType {
  Business = 'Business',
  Private = 'Private',
}

export enum ExpenseCategory {
  FoodAndDining = 'Food & Dining',
  Transportation = 'Transportation',
  Accommodation = 'Accommodation',
  Supplies = 'Supplies',
  Services = 'Services',
  Entertainment = 'Entertainment',
  Health = 'Health',
  Shopping = 'Shopping',
  Utilities = 'Utilities',
  Other = 'Other',
}

export interface ReceiptData {
  id: string;
  merchantName: string;
  merchantAddress: string;
  date: string; // ISO Date String YYYY-MM-DD
  time: string; // HH:MM
  amount: number;
  currency: string;
  vat: number; // Value Added Tax amount
  exchangeRate: number;
  convertedAmount: number;
  targetCurrency: string;
  category: ExpenseCategory;
  type: ExpenseType;
  imageBase64: string; // Used for display (either local preview or signed URL)
  storagePath?: string; // Used for DB reference
  createdAt: number;
  latitude?: number;
  longitude?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface UserSettings {
  userId: string;
  preferredCurrency: string;
  fullName?: string;
}

export interface Feedback {
  id?: string;
  user_id: string;
  message: string;
  created_at?: string;
}