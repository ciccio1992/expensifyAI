import React, { useState } from 'react';
import { X, Save, Calendar, Clock, DollarSign, Tag, Briefcase, AlignLeft, Type } from 'lucide-react';
import { ReceiptData, ExpenseCategory, ExpenseType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ManualEntryModalProps {
    onClose: () => void;
    onSubmit: (receipt: ReceiptData) => void;
    targetCurrency: string;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onClose, onSubmit, targetCurrency }) => {
    const [merchantName, setMerchantName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(targetCurrency);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Other);
    const [type, setType] = useState<ExpenseType>(ExpenseType.Business);
    const [note, setNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!merchantName || !amount) {
            alert('Please fill in at least Merchant Name and Amount.');
            return;
        }

        // Create a simple colored placeholder image with text
        // This is a 1x1 pixel transparent GIF as a fallback, but we can do better with an SVG data URI
        const placeholderImage = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" style="background-color: #f3f4f6;">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#9ca3af">
          Manual Entry
        </text>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#d1d5db">
          📝
        </text>
      </svg>
    `)}`;

        const newReceipt: ReceiptData = {
            id: uuidv4(),
            merchantName,
            merchantAddress: note, // Using address field for notes for now
            date,
            time,
            amount: parseFloat(amount),
            currency,
            vat: 0,
            exchangeRate: 1, // Will be updated by App.tsx logic
            convertedAmount: parseFloat(amount), // Will be updated by App.tsx logic
            targetCurrency,
            category,
            type,
            imageBase64: placeholderImage,
            createdAt: Date.now(),
        };

        onSubmit(newReceipt);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Type size={24} className="text-primary" />
                        Manual Entry
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Merchant */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Merchant Name</label>
                            <input
                                type="text"
                                value={merchantName}
                                onChange={(e) => setMerchantName(e.target.value)}
                                placeholder="e.g. Starbucks, Uber"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-semibold"
                                autoFocus
                            />
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                    <DollarSign size={12} /> Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-mono text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none cursor-pointer"
                                >
                                    {['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar size={12} /> Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                    <Clock size={12} /> Time
                                </label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                <Tag size={12} /> Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none cursor-pointer"
                            >
                                {Object.values(ExpenseCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                <Briefcase size={12} /> Expense Type
                            </label>
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType(ExpenseType.Business)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === ExpenseType.Business ? 'bg-white dark:bg-primary shadow text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Business
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType(ExpenseType.Private)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === ExpenseType.Private ? 'bg-white dark:bg-secondary shadow text-secondary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Private
                                </button>
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
                                <AlignLeft size={12} /> Note (Optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a description..."
                                rows={3}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                        >
                            <Save size={20} /> Save Expense
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualEntryModal;
