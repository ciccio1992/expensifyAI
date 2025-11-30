import React, { useState } from 'react';
import { ReceiptData, ExpenseCategory, ExpenseType } from '../types';
import { X, Save, Calendar, MapPin, DollarSign, Tag, Briefcase, Percent } from 'lucide-react';

interface ReceiptDetailProps {
  receipt: ReceiptData;
  onClose: () => void;
  onSave: (updated: ReceiptData) => void;
  onDelete: (id: string) => void;
  targetCurrency: string;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ receipt, onClose, onSave, onDelete, targetCurrency }) => {
  const [formData, setFormData] = useState<ReceiptData>(receipt);

  React.useEffect(() => {
    setFormData(receipt);
  }, [receipt]);

  const handleChange = (field: keyof ReceiptData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'amount' || field === 'exchangeRate') {
        updated.convertedAmount = updated.amount * updated.exchangeRate;
      }
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-card h-full shadow-2xl overflow-y-auto animate-slide-in-right">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-card/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Receipt Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="text-slate-900 dark:text-white" size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shadow-inner min-h-[200px] flex items-center justify-center">
            {formData.imageBase64 ? (
              <img
                src={formData.imageBase64}
                alt="Receipt"
                className="w-full h-auto object-contain max-h-96"
              />
            ) : (
              <p className="text-gray-400">Image loading...</p>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Merchant</label>
              <input
                type="text"
                value={formData.merchantName}
                onChange={(e) => handleChange('merchantName', e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-lg font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                  <DollarSign size={12} /> Total ({formData.currency})
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">In {targetCurrency}</label>
                <div className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-transparent font-mono text-gray-500 dark:text-gray-400">
                  {formData.convertedAmount?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                  <Percent size={12} /> VAT ({formData.currency})
                </label>
                <input
                  type="number"
                  value={formData.vat}
                  onChange={(e) => handleChange('vat', parseFloat(e.target.value))}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                {/* Spacer or Tax Rate if needed later */}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                <Tag size={12} /> Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                {Object.values(ExpenseCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                <Briefcase size={12} /> Expense Type
              </label>
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                  onClick={() => handleChange('type', ExpenseType.Business)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === ExpenseType.Business ? 'bg-white dark:bg-primary shadow text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Business
                </button>
                <button
                  onClick={() => handleChange('type', ExpenseType.Private)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === ExpenseType.Private ? 'bg-white dark:bg-secondary shadow text-secondary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Private
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 flex items-center gap-1">
                <MapPin size={12} /> Address
              </label>
              <textarea
                value={formData.merchantAddress}
                onChange={(e) => handleChange('merchantAddress', e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>

          </div>

          <div className="pt-6 pb-12 flex gap-4">
            <button
              onClick={() => onDelete(formData.id)}
              className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
            >
              <Save size={20} /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReceiptDetail;