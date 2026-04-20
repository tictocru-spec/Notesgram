'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);
    let error = null;

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    }

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h2 className="text-center text-3xl font-semibold tracking-tight">Access Notes</h2>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] border-none focus:ring-2 focus:ring-[#E4AF0A] outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] border-none focus:ring-2 focus:ring-[#E4AF0A] outline-none"
            />
          </div>
          <div className="space-y-3 pt-4">
            <button
              onClick={(e) => handleAuth(e, false)}
              disabled={loading}
              className="w-full py-3 bg-[#E4AF0A] text-white font-semibold rounded-xl hover:bg-yellow-500 disabled:opacity-50 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={(e) => handleAuth(e, true)}
              disabled={loading}
              className="w-full py-3 bg-transparent text-[#E4AF0A] font-semibold rounded-xl hover:bg-[#F2F2F7] dark:hover:bg-[#1C1C1E] transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
