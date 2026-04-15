import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, User, Mail, Lock, ShieldCheck, ArrowRight, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = useState({
    nik: '',
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/login');
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
            src="https://picsum.photos/seed/factory/1200/1200" 
            alt="Factory background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-slate-900/90 z-10" />
        
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
              <h2 className="text-4xl font-extrabold text-white mb-8 leading-tight">
                Join our Professional <br /> Engineering Network
              </h2>
              <ul className="space-y-4 mb-10">
                {[
                  "Digitalized PEAF form submission",
                  "Automated multi-level approval routing",
                  "Real-time status notifications",
                  "Centralized project documentation"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-blue-100">
                    <BadgeCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="text-blue-200/60 text-xs">
            © 2026 PT Indofood Fortuna Makmur. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative py-20 overflow-y-auto">
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
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h1>
              <p className="text-slate-500 font-medium">Join us to start managing your engineering requests.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="nik" className="text-sm font-bold text-slate-700 ml-1">NIK</label>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    required
                    placeholder="Employee ID"
                    value={formData.nik}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-bold text-slate-700 ml-1">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all sm:text-sm outline-none border"
                    />
                  </div>
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
                  <>Create Account <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Enterprise Registration</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
