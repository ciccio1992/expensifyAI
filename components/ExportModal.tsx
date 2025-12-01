import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { X, Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    receipts: ReceiptData[];
    userName: string;
    targetCurrency: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, receipts, userName, targetCurrency }) => {
    // Default to last 30 days
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

    if (!isOpen) return null;

    const handleExport = () => {
        // Filter receipts
        let filteredReceipts = receipts.filter(r => {
            if (!startDate && !endDate) return true;
            const rDate = new Date(r.date);
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date('2100-01-01');
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            return rDate >= start && rDate <= end;
        });

        // Sort Chronologically (Oldest to Newest)
        filteredReceipts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (filteredReceipts.length === 0) {
            alert("No receipts found for the selected date range.");
            return;
        }

        if (format === 'pdf') {
            generatePDF(filteredReceipts);
        } else {
            generateCSV(filteredReceipts);
        }
        onClose();
    };

    const generatePDF = (data: ReceiptData[]) => {
        const doc = new jsPDF();
        const now = new Date();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Expense Report", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${now.toLocaleString()}`, 14, 30);
        doc.text(`Account Holder: ${userName || 'N/A'}`, 14, 35);

        if (startDate || endDate) {
            doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'Present'}`, 14, 40);
        }

        // Table
        const tableColumn = ["Date", "Merchant", "Category", "Type", "Amount", `Amount (${targetCurrency})`];
        const tableRows = data.map(r => [
            r.date,
            r.merchantName,
            r.category,
            r.type,
            `${r.currency} ${r.amount.toFixed(2)}`,
            `${targetCurrency} ${r.convertedAmount?.toFixed(2) || 'N/A'}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [66, 66, 66], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didDrawPage: (data) => {
                // Footer
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`expense_report_${now.toISOString().split('T')[0]}.pdf`);
    };

    const generateCSV = (data: ReceiptData[]) => {
        const headers = ["Date", "Time", "Merchant", "Address", "Category", "Type", "Original Amount", "Currency", "Converted Amount", "Target Currency"];
        const rows = data.map(r => [
            r.date,
            r.time,
            `"${r.merchantName.replace(/"/g, '""')}"`, // Escape quotes
            `"${r.merchantAddress.replace(/"/g, '""')}"`,
            r.category,
            r.type,
            r.amount.toFixed(2),
            r.currency,
            r.convertedAmount?.toFixed(2) || '0.00',
            targetCurrency
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expense_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Download size={24} className="text-primary" />
                        Export Expenses
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Range */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={16} /> Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${format === 'pdf'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500'
                                    }`}
                            >
                                <FileText size={32} />
                                <span className="font-bold">PDF</span>
                            </button>
                            <button
                                onClick={() => setFormat('csv')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${format === 'csv'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500'
                                    }`}
                            >
                                <FileSpreadsheet size={32} />
                                <span className="font-bold">CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={handleExport}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Export {format.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
