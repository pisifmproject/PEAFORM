import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Eye, EyeOff, ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://picsum.photos/seed/corporate/1200/1200" 
            alt="Corporate background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-slate-900/90 z-10" />
        
        <div className="relative z-20 flex flex-col justify-between p-16 w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-2xl text-white tracking-tight">PEAF SYSTEM</span>
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em]">PT Indofood Fortuna Makmur</span>
            </div>
          </Link>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Secure & Efficient <br /> Engineering Approvals
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Access your centralized dashboard to manage project requests, track real-time approvals, and ensure compliance across all plants.
              </p>
            </motion.div>
          </div>

          <div className="text-blue-200/60 text-xs">
            © 2026 PT Indofood Fortuna Makmur. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        <Link to="/" className="absolute top-8 right-8 flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-500 font-medium">Please enter your credentials to access your account.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-sm font-bold text-slate-700 ml-1">
                  NIK / Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    placeholder="Enter your NIK or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Enterprise Authentication</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
