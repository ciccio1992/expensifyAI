import React, { useState } from 'react';
import { X, Coffee, Heart } from 'lucide-react';

interface DonationModalProps {
    onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
    const [amount, setAmount] = useState('5');
    const [customAmount, setCustomAmount] = useState('');

    const handleDonate = () => {
        const finalAmount = customAmount || amount;
        // Replace this URL with your actual Ko-fi or donation URL
        // You can append the amount if the platform supports it, e.g., ?amount=${finalAmount}
        const donationUrl = import.meta.env.VITE_KOFI_URL;
        window.open(donationUrl, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20" />

                <div className="relative p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                        <Coffee size={32} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Enjoying ExpensifyAI?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your support helps keep the servers running and the updates coming. Consider buying me a coffee!
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-center gap-3">
                            {['3', '5', '10'].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => { setAmount(val); setCustomAmount(''); }}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${amount === val && !customAmount
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    ${val}
                                </button>
                            ))}
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    placeholder="Other"
                                    value={customAmount}
                                    onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                                    className={`w-24 pl-6 pr-3 py-2 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-orange-500 transition-all ${customAmount ? 'ring-2 ring-orange-500' : ''
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleDonate}
                            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <Heart size={18} className="fill-white" />
                            Donate ${customAmount || amount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;
