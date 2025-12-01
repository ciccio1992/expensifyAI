
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle, HelpCircle } from 'lucide-react';

const Auth: React.FC<{ onGuestLogin: () => void; initialIsLogin?: boolean }> = ({ onGuestLogin, initialIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (!error && !isLogin) {
          alert("Account created! You may need to verify your email depending on your settings.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Returns user to this app after Google logic
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
          },
        }
      });
      console.log("OAuth Redirect URL:", window.location.origin);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">

        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo.svg" alt="ExpensifyAI Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-primary/30 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {isLogin ? 'Sign in to access your receipts' : 'Sign up to start tracking expenses'}
          </p>
        </div>

        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-sm text-red-600 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p className="break-words">{error}</p>
            </div>

            {/* Contextual Help for Google Errors */}
            {error.includes('google') || error.includes('403') ? (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <HelpCircle size={14} />
                  <span>Google 403 Error Troubleshooting</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>Go to <strong>Google Cloud Console &gt; Credentials</strong>.</li>
                  <li>Check "Authorized redirect URIs". It <strong>must</strong> match exactly: <br /> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{`https://<project-id>.supabase.co/auth/v1/callback`}</code></li>
                  <li>If testing, ensure your email is added to "Test Users" in OAuth Consent Screen.</li>
                </ul>
              </div>
            ) : null}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              <>
                <LogIn size={20} /> Sign In with Email
              </>
            ) : (
              <>
                <UserPlus size={20} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-card text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6">
          <button
            onClick={onGuestLogin}
            className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            Proceed without account
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Data stored locally. Cleared on cache reset.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-primary hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Auth;
