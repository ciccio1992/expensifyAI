
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Auth: React.FC<{ onGuestLogin: () => void; initialIsLogin?: boolean }> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              Welcome to TallyLens
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Sign in to manage your receipts
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-card text-gray-500">Or</span>
            </div>
          </div>

          <div className="">
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

        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;
