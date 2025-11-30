import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface SettingsModalProps {
    currentCurrency: string;
    onClose: () => void;
    onSave: (currency: string) => void;
}

const CURRENCIES = ['EUR', 'USD', 'SEK', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'NOK', 'DKK'];

const SettingsModal: React.FC<SettingsModalProps> = ({ currentCurrency, onClose, onSave }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, preferred_currency: selectedCurrency });

            if (error) throw error;

            onSave(selectedCurrency);
            onClose();
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Preferred Currency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {CURRENCIES.map((currency) => (
                            <button
                                key={currency}
                                onClick={() => setSelectedCurrency(currency)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCurrency === currency
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {currency}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        This currency will be used for all future receipt scans and dashboard statistics.
                    </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
