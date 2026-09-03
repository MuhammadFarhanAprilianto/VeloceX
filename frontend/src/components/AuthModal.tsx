'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('trader@velocex.io');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin
      ? { email, password }
      : { name: name || 'Demo Trader', email, password };

    try {
      const res = await fetch(`http://localhost:8080/api/v1${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setAuth(data.user, data.access_token, data.refresh_token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error with backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1F1E25] p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E163]/15 text-[#00E163] p-1.5 aspect-square shrink-0">
              <img src="/logo.png" alt="VeloceX" className="w-full h-full object-contain aspect-square shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {isLogin ? 'Sign In to VeloceX' : 'Create VeloceX Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {isLogin ? 'Enter credentials to trade live' : 'Real-time institutional trading & portfolio platform'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLogin && (
              <div>
                <label className="mb-1 block font-medium text-slate-300">Trader Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full rounded-xl border border-white/10 bg-[#26252E] py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:border-[#00E163] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block font-medium text-slate-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@velocex.io"
                  className="w-full rounded-xl border border-white/10 bg-[#26252E] py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:border-[#00E163] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#26252E] py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:border-[#00E163] focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-[#362227] p-2.5 text-[#FF5C77] border border-[#FF5C77]/30">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-[#00E163] py-3 text-sm font-bold text-black shadow-lg shadow-[#00E163]/25 transition-transform hover:brightness-110 active:scale-98 cursor-pointer"
            >
              {isLoading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">
            {isLogin ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="font-bold text-[#00E163] hover:underline cursor-pointer"
                >
                  Register Demo Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-bold text-[#00E163] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
