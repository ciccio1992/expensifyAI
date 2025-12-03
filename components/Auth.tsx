
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      if (credentialResponse.credential) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: credentialResponse.credential,
        });
        if (error) throw error;
      } else {
        throw new Error("No credential received from Google");
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Google authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Login Failed");
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">

          <div className="flex flex-col items-center text-center mb-8">
            <img src="/nanobanana.png" alt="ExpensifyAI Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-primary/30 mb-4" />
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

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={true}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

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
    </GoogleOAuthProvider>
  );
};

export default Auth;
