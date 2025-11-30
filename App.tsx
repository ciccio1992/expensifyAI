
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import ReceiptList from './components/ReceiptList';
import ReceiptDetail from './components/ReceiptDetail';
import MapView from './components/MapView';
import Auth from './components/Auth';
import { ReceiptData } from './types';
import { Moon, Sun, Loader2, WifiOff, Database, Save as SaveIcon, AlertTriangle, Copy, Terminal, LogOut, Settings } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import {
  supabase,
  mapReceiptFromDB,
  mapReceiptToDB,
  uploadReceiptImage,
  getReceiptImageUrl
} from './services/supabaseClient';
import { base64ToBlob } from './services/imageUtils';
import { fetchExchangeRates, convertCurrency, ExchangeRates } from './services/currencyService';

const App: React.FC = () => {
  // State
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'map'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [uploadingState, setUploadingState] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [showSettings, setShowSettings] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  // Setup Form State
  const [setupUrl, setSetupUrl] = useState('');
  const [setupKey, setSetupKey] = useState('');

  // Fetch User Settings
  const fetchSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('preferred_currency')
        .eq('user_id', userId)
        .single();

      if (data?.preferred_currency) {
        setTargetCurrency(data.preferred_currency);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  // Initialize Auth & Theme
  useEffect(() => {
    // Theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Load saved settings for UI if available
    const savedUrl = localStorage.getItem('sb_url');
    const savedKey = localStorage.getItem('sb_key');
    if (savedUrl) setSetupUrl(savedUrl);
    if (savedKey) setSetupKey(savedKey);

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session check error:", error);
        setConnectionError(true);
        setIsLoading(false);
      } else {
        setSession(session);
        if (session) {
          fetchSettings(session.user.id);
          fetchReceipts();
        } else {
          setIsLoading(false); // Stop loading to show Login screen
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchSettings(session.user.id);
        fetchReceipts();
      } else {
        setReceipts([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Exchange Rates
  useEffect(() => {
    const loadRates = async () => {
      const rates = await fetchExchangeRates();
      if (rates) {
        setExchangeRates(rates);
      }
    };
    loadRates();
  }, []);

  // Fetch Receipts from DB and resolve Images
  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB data to App data
        const mappedReceipts = data.map(mapReceiptFromDB);

        // Fetch signed URLs for all images in parallel
        const receiptsWithImages = await Promise.all(mappedReceipts.map(async (receipt) => {
          if (receipt.storagePath) {
            const signedUrl = await getReceiptImageUrl(receipt.storagePath);
            if (signedUrl) {
              return { ...receipt, imageBase64: signedUrl };
            }
          }
          return receipt;
        }));

        setReceipts(receiptsWithImages);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      // If table doesn't exist at all, we might need migration too
      if (err?.code === '42P01') { // undefined_table
        setMigrationNeeded(true);
      } else if (err?.message !== "Fetch Failed") {
        // Only show connection error if it's not a simple empty list or auth issue
        // setConnectionError(true); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Display Receipts (Dynamic Conversion)
  const displayReceipts = React.useMemo(() => {
    if (!exchangeRates) return receipts;

    return receipts.map(receipt => {
      const converted = convertCurrency(
        receipt.amount,
        receipt.currency,
        targetCurrency,
        exchangeRates
      );

      return {
        ...receipt,
        targetCurrency: targetCurrency,
        convertedAmount: converted,
        exchangeRate: exchangeRates[targetCurrency] / exchangeRates[receipt.currency]
      };
    });
  }, [receipts, targetCurrency, exchangeRates]);

  // Apply Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers
  const handleScanComplete = async (newReceipt: ReceiptData) => {
    if (!session?.user?.id) return;

    // 1. Apply Dynamic Conversion immediately if rates are available
    let processedReceipt = { ...newReceipt };

    if (exchangeRates) {
      const converted = convertCurrency(
        newReceipt.amount,
        newReceipt.currency,
        targetCurrency,
        exchangeRates
      );
      // Calculate rate relative to target
      const sourceRate = exchangeRates[newReceipt.currency] || 1;
      const targetRate = exchangeRates[targetCurrency] || 1;
      const rate = targetRate / sourceRate;

      processedReceipt = {
        ...newReceipt,
        convertedAmount: converted,
        exchangeRate: rate,
        targetCurrency: targetCurrency
      };
    }

    // 2. Optimistic UI update
    setReceipts(prev => [processedReceipt, ...prev]);
    setIsScanning(false);
    setSelectedReceipt(processedReceipt); // Open detail view with corrected values
    setUploadingState(true);

    try {
      // 3. Convert Base64 back to Blob for upload
      const imageBlob = base64ToBlob(processedReceipt.imageBase64);

      // 4. Upload to Storage
      let storagePath = null;
      try {
        storagePath = await uploadReceiptImage(session.user.id, imageBlob);
      } catch (uploadErr) {
        console.error("Upload failed (Bucket likely missing):", uploadErr);
      }

      // 5. Update the receipt object with the storage path
      const receiptToSave = { ...processedReceipt, storagePath: storagePath || undefined };

      // 6. Save metadata to Database
      const dbPayload = mapReceiptToDB(receiptToSave, session.user.id);
      const { error } = await supabase.from('receipts').insert([dbPayload]);

      if (error) throw error;

      // 7. Update local state with the storage path to ensure consistency
      setReceipts(prev => prev.map(r => r.id === processedReceipt.id ? receiptToSave : r));

    } catch (err: any) {
      console.error("Save Error:", err);

      // DETECT SCHEMA ERROR (Missing Column)
      if (err?.code === 'PGRST204' || (err?.message && err.message.includes('image_path'))) {
        setMigrationNeeded(true);
      } else {
        alert("Failed to save receipt to cloud: " + (err.message || "Unknown Error"));
      }
    } finally {
      setUploadingState(false);
    }
  };

  const handleSettingsSave = (newCurrency: string) => {
    setTargetCurrency(newCurrency);
    // Optionally refetch receipts if we want to try and re-convert (but we can't really without rates)
    // For now, just the new setting applies to new scans and display of existing converted amounts
  };

  const handleUpdateReceipt = async (updated: ReceiptData) => {
    if (!session?.user?.id) return;

    // Optimistic Update
    setReceipts(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedReceipt(null);

    try {
      const dbPayload = mapReceiptToDB(updated, session.user.id);
      const { error } = await supabase
        .from('receipts')
        .update(dbPayload)
        .eq('id', updated.id);

      if (error) throw error;
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update in cloud.");
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      // Optimistic Update
      setReceipts(prev => prev.filter(r => r.id !== id));
      setSelectedReceipt(null);

      try {
        const { error } = await supabase.from('receipts').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('dashboard');
  };

  const saveConfiguration = () => {
    if (!setupUrl || !setupKey) {
      alert("Please enter both URL and Key.");
      return;
    }
    localStorage.setItem('sb_url', setupUrl);
    localStorage.setItem('sb_key', setupKey);
    window.location.reload();
  };

  const copySQL = () => {
    const sql = `-- 1. Reset Table
drop table if exists receipts;

-- 2. Create Table
create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  merchant_name text,
  merchant_address text,
  date text,
  time text,
  amount numeric,
  currency text,
  vat numeric,
  exchange_rate numeric,
  converted_amount numeric,
  target_currency text,
  category text,
  type text,
  image_path text,
  created_at bigint,
  latitude float,
  longitude float
);

-- 3. Security
alter table receipts enable row level security;

create policy "Users can perform all actions on own receipts"
on receipts for all using (auth.uid() = user_id);

-- 4. Storage (Run only if bucket missing)
insert into storage.buckets (id, name, public) 
values ('receipts', 'receipts', false) 
on conflict do nothing;

drop policy if exists "Authenticated users can upload receipts" on storage.objects;
create policy "Authenticated users can upload receipts"
on storage.objects for insert to authenticated
with check ( bucket_id = 'receipts' );

drop policy if exists "Users can view own receipts" on storage.objects;
create policy "Users can view own receipts"
on storage.objects for select to authenticated
using ( bucket_id = 'receipts' and auth.uid() = owner );

-- 5. User Settings
create table user_settings (
  user_id uuid references auth.users not null primary key,
  preferred_currency text default 'EUR'
);
alter table user_settings enable row level security;
create policy "Users can manage own settings" on user_settings for all using (auth.uid() = user_id);
`;

    navigator.clipboard.writeText(sql);
    alert("SQL copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // CONNECTION ERROR SCREEN
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full mb-4">
              <Database size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Setup Backend</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Connect to your Supabase project to store receipts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Project URL</label>
              <input
                type="text"
                value={setupUrl}
                onChange={(e) => setSetupUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Anon Public Key</label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="eyJh..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
              />
            </div>

            <button
              onClick={saveConfiguration}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              <SaveIcon size={18} /> Connect & Reload
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Don't have a project? Create one at <a href="https://supabase.com" target="_blank" className="text-primary underline">supabase.com</a>
          </p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (If no session)
  if (!session) {
    return <Auth />;
  }

  // MIGRATION MODAL
  if (migrationNeeded) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertTriangle size={32} />
            <h2 className="text-2xl font-bold text-white">Database Repair Required</h2>
          </div>

          <p className="text-gray-300 mb-4">
            Your Supabase database table is outdated or missing. We switched from storing raw images (Base64) to efficient file paths to save space, but your database column <code>image_path</code> is missing.
          </p>

          <div className="bg-black rounded-lg border border-gray-800 p-4 mb-6 relative group">
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={copySQL} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 flex items-center gap-1">
                <Copy size={12} /> Copy SQL
              </button>
            </div>
            <code className="text-xs text-green-400 font-mono block overflow-x-auto whitespace-pre-wrap h-64 overflow-y-auto no-scrollbar">
              {`-- 1. Reset Table
drop table if exists receipts;

-- 2. Create Table
create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  merchant_name text,
  merchant_address text,
  date text,
  time text,
  amount numeric,
  currency text,
  vat numeric,
  exchange_rate numeric,
  converted_amount numeric,
  target_currency text,
  category text,
  type text,
  image_path text,
  created_at bigint,
  latitude float,
  longitude float
);

-- 3. Security
alter table receipts enable row level security;

create policy "Users can perform all actions on own receipts"
on receipts for all using (auth.uid() = user_id);

-- 4. Storage Bucket
insert into storage.buckets (id, name, public) 
values ('receipts', 'receipts', false)
on conflict do nothing;

drop policy if exists "Authenticated users can upload receipts" on storage.objects;
create policy "Authenticated users can upload receipts"
on storage.objects for insert to authenticated
with check ( bucket_id = 'receipts' );

drop policy if exists "Users can view own receipts" on storage.objects;
create policy "Users can view own receipts"
on storage.objects for select to authenticated
using ( bucket_id = 'receipts' and auth.uid() = owner );

-- 5. User Settings
create table user_settings (
  user_id uuid references auth.users not null primary key,
  preferred_currency text default 'EUR'
);
alter table user_settings enable row level security;
create policy "Users can manage own settings" on user_settings for all using (auth.uid() = user_id);`}
            </code>
          </div>

          <div className="flex gap-4">
            <a
              href={setupUrl || "https://supabase.com/dashboard"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Terminal size={18} /> Open Supabase SQL Editor
            </a>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 flex items-center justify-center gap-2"
            >
              I Ran The SQL, Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-dark transition-colors duration-300">

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-card/80 backdrop-blur-md z-30 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
          <img src="/logo.svg" alt="ExpensifyAI Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ExpensifyAI</h1>
        </div>
        <div className="flex items-center gap-2">
          {uploadingState && <Loader2 className="animate-spin text-primary" size={20} />}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-2xl mx-auto pb-10">
        {view === 'dashboard' && (
          <Dashboard
            receipts={displayReceipts}
            onAdd={() => setIsScanning(true)}
            onViewAll={() => setView('list')}
            onViewMap={() => setView('map')}
            onSelectReceipt={setSelectedReceipt}
            targetCurrency={targetCurrency}
          />
        )}

        {view === 'list' && (
          <ReceiptList
            receipts={displayReceipts}
            onBack={() => setView('dashboard')}
            onSelectReceipt={setSelectedReceipt}
            targetCurrency={targetCurrency}
          />
        )}
      </main>

      {/* Full Screen Overlays */}
      {view === 'map' && (
        <MapView
          receipts={displayReceipts}
          onClose={() => setView('dashboard')}
          onSelectReceipt={setSelectedReceipt}
          targetCurrency={targetCurrency}
        />
      )}

      {/* Modals/Overlays */}
      {isScanning && (
        <Scanner
          onScanComplete={handleScanComplete}
          onCancel={() => setIsScanning(false)}
          targetCurrency={targetCurrency}
        />
      )}

      {selectedReceipt && (
        <ReceiptDetail
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onSave={handleUpdateReceipt}
          onDelete={handleDeleteReceipt}
          targetCurrency={targetCurrency}
        />
      )}

      {showSettings && (
        <SettingsModal
          currentCurrency={targetCurrency}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}

    </div>
  );
};

export default App;
