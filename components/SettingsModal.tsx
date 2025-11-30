import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface SettingsModalProps {
    currentCurrency: string;
    currentName: string;
    onClose: () => void;
    onSave: (currency: string, name: string) => void;
    isPrompt?: boolean;
}

const CURRENCIES = ['EUR', 'USD', 'SEK', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'NOK', 'DKK'];

const SettingsModal: React.FC<SettingsModalProps> = ({ currentCurrency, currentName, onClose, onSave, isPrompt = false }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
    const [name, setName] = useState(currentName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    preferred_currency: selectedCurrency,
                    full_name: name
                });

            if (error) throw error;

            onSave(selectedCurrency, name);
            if (!isPrompt) onClose();
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
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {isPrompt ? "Welcome! Please setup your profile" : "Settings"}
                    </h2>
                    {!isPrompt && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Your Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Currency Selection */}
                    <div>
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
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    {!isPrompt && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : <><Save size={16} /> {isPrompt ? "Get Started" : "Save Changes"}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
