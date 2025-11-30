
import React, { useMemo, useState } from 'react';
import { ReceiptData, ExpenseType } from '../types';
import { Search, ChevronLeft, BarChart3, List as ListIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReceiptListProps {
  receipts: ReceiptData[];
  onBack: () => void;
  onSelectReceipt: (r: ReceiptData) => void;
}

type TimeRange = '1W' | '1M' | '1Y' | '5Y';

const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onBack, onSelectReceipt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showChart, setShowChart] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');

  // 1. Prepare Chart Data based on TimeRange
  const chartData = useMemo(() => {
    const now = new Date();
    // Normalize "now" to end of day to include all receipts from today
    now.setHours(23, 59, 59, 999);

    const dataMap: Record<string, { name: string, sortKey: number, Business: number, Private: number }> = {};
    const buckets: { key: string, name: string, start: number, end: number }[] = [];

    // Helper to generate buckets
    if (timeRange === '1W') {
        // Last 7 Days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            d.setHours(0,0,0,0);
            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
            buckets.push({
                key,
                name: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
                start: d.getTime(),
                end: d.getTime() + 86400000 - 1
            });
        }
    } else if (timeRange === '1M') {
        // Last 4 Weeks (4 buckets of 7 days)
        for (let i = 3; i >= 0; i--) {
            const end = new Date(now);
            end.setDate(end.getDate() - (i * 7));
            end.setHours(23, 59, 59, 999);
            
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            const name = `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.getDate()}`;
            buckets.push({
                key: `week-${i}`,
                name,
                start: start.getTime(),
                end: end.getTime()
            });
        }
    } else if (timeRange === '1Y') {
        // Last 12 Months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            d.setDate(1); // Start of month
            d.setHours(0,0,0,0);
            
            const end = new Date(d);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0); // End of month
            end.setHours(23,59,59,999);

            buckets.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                name: d.toLocaleDateString('en-US', { month: 'short' }), // Jan, Feb
                start: d.getTime(),
                end: end.getTime()
            });
        }
    } else if (timeRange === '5Y') {
        // Last 5 Years
        for (let i = 4; i >= 0; i--) {
            const d = new Date(now);
            d.setFullYear(d.getFullYear() - i);
            d.setMonth(0, 1);
            d.setHours(0,0,0,0);
            
            const end = new Date(d);
            end.setFullYear(end.getFullYear() + 1);
            end.setMonth(0, 0); // Dec 31
            end.setHours(23,59,59,999);

            buckets.push({
                key: d.getFullYear().toString(),
                name: d.getFullYear().toString(),
                start: d.getTime(),
                end: end.getTime()
            });
        }
    }

    // Initialize buckets with 0
    buckets.forEach(b => {
        dataMap[b.key] = { name: b.name, sortKey: b.start, Business: 0, Private: 0 };
    });

    // Distribute receipts into buckets
    receipts.forEach(r => {
        const rDate = new Date(r.date + 'T12:00:00'); // Midday to avoid timezone shifting issues on boundaries
        const rTime = rDate.getTime();

        const bucket = buckets.find(b => rTime >= b.start && rTime <= b.end);
        if (bucket) {
            if (r.type === ExpenseType.Business) {
                dataMap[bucket.key].Business += r.amountInEur;
            } else {
                dataMap[bucket.key].Private += r.amountInEur;
            }
        }
    });

    return Object.values(dataMap).sort((a, b) => a.sortKey - b.sortKey);
  }, [receipts, timeRange]);

  // 2. Prepare List Data (Group by Month Display String)
  const groupedReceipts = useMemo(() => {
    const filtered = receipts.filter(r => 
      r.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: { [key: string]: ReceiptData[] } = {};

    filtered.forEach(receipt => {
      const date = new Date(receipt.date);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(receipt);
    });

    // Sort keys (newest month first for list)
    return Object.entries(groups).sort((a, b) => {
       return new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime();
    });
  }, [receipts, searchTerm]);

  return (
    <div className="h-full flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ChevronLeft className="text-slate-900 dark:text-white" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>
        </div>
        <button 
            onClick={() => setShowChart(!showChart)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-slate-600 dark:text-gray-300"
        >
            {showChart ? <ListIcon size={20} /> : <BarChart3 size={20} />}
        </button>
      </div>

      {/* Analytics Chart Section */}
      {showChart && (
        <div className="mb-6 bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spending History</h3>
               
               {/* Time Range Tabs */}
               <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                   {(['1W', '1M', '1Y', '5Y'] as const).map(range => (
                       <button
                           key={range}
                           onClick={() => setTimeRange(range)}
                           className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                               timeRange === range 
                               ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm' 
                               : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                           }`}
                       >
                           {range}
                       </button>
                   ))}
               </div>
           </div>

           <div className="w-full" style={{ height: 300, minWidth: 0 }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    dy={10}
                    interval={0} // Force show all labels if possible
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                 />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                 />
                 <Legend wrapperStyle={{ paddingTop: '20px' }} />
                 <Bar dataKey="Business" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                 <Bar dataKey="Private" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search merchant or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
        />
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {groupedReceipts.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No receipts found.</p>
        ) : (
            groupedReceipts.map(([month, groupItems]) => (
                <div key={month} className="animate-fade-in">
                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3 tracking-wider sticky top-0 bg-gray-50 dark:bg-dark py-2 z-10">{month}</h3>
                    <div className="space-y-3">
                        {groupItems.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(receipt => (
                            <div 
                                key={receipt.id}
                                onClick={() => onSelectReceipt(receipt)}
                                className="bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{receipt.merchantName}</h4>
                                    <p className="text-xs text-gray-500">{receipt.date} • {receipt.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">€{receipt.amountInEur.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ReceiptList;
