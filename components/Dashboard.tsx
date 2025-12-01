
import React from 'react';
import { ReceiptData, ExpenseType } from '../types';
import { Plus, ArrowRight, TrendingUp, Briefcase, User, Map } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  receipts: ReceiptData[];
  onAdd: () => void;
  onViewAll: () => void;
  onViewMap: () => void;
  onSelectReceipt: (r: ReceiptData) => void;
  targetCurrency: string;
  userName: string;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ receipts, onAdd, onViewAll, onViewMap, onSelectReceipt, targetCurrency, userName }) => {
  // Calculate Totals
  const totalBusiness = receipts
    .filter(r => r.type === ExpenseType.Business)
    .reduce((sum, r) => sum + (r.convertedAmount || 0), 0);

  const totalPrivate = receipts
    .filter(r => r.type === ExpenseType.Private)
    .reduce((sum, r) => sum + (r.convertedAmount || 0), 0);

  const totalAll = totalBusiness + totalPrivate;

  // Recent Receipts (Top 5)
  const recentReceipts = [...receipts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  // Chart Data (Type)
  const typeChartData = [
    { name: 'Business', value: totalBusiness, color: '#6366f1' },
    { name: 'Private', value: totalPrivate, color: '#a855f7' },
  ].filter(d => d.value > 0);

  // Chart Data (Category)
  const categoryChartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    receipts.forEach(r => {
      data[r.category] = (data[r.category] || 0) + (r.convertedAmount || 0);
    });
    return Object.entries(data)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [receipts]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {getGreeting()}, <span className="text-primary">{userName || 'User'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your spending overview.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Briefcase size={64} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Expenses</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{targetCurrency} {totalBusiness.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${totalAll > 0 ? (totalBusiness / totalAll) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User size={64} className="text-secondary" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Private Expenses</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{targetCurrency} {totalPrivate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary"
              style={{ width: `${totalAll > 0 ? (totalPrivate / totalAll) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex gap-2">
        <button
          onClick={onViewMap}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Map size={18} className="text-blue-500" /> View Map
        </button>
        <button
          onClick={onViewAll}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <TrendingUp size={18} className="text-green-500" /> Analytics
        </button>
      </div>

      {/* Charts Section */}
      {totalAll > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Distribution */}
          <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Type Distribution</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `${targetCurrency} ${value.toFixed(2)}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Category Distribution</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `${targetCurrency} ${value.toFixed(2)}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Receipts</h3>
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No receipts yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-600">Start by scanning a new receipt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReceipts.map(receipt => (
              <div
                key={receipt.id}
                onClick={() => onSelectReceipt(receipt)}
                className="group bg-white dark:bg-card p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    <img src={receipt.imageBase64} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{receipt.merchantName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{receipt.date} • <span className={receipt.type === ExpenseType.Business ? "text-primary" : "text-secondary"}>{receipt.type}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{targetCurrency} {receipt.convertedAmount?.toFixed(2)}</p>
                  {receipt.currency !== targetCurrency && (
                    <p className="text-xs text-gray-400">{receipt.currency} {receipt.amount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onAdd}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-primary to-secondary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform z-30"
        title="Add Receipt"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Dashboard;
