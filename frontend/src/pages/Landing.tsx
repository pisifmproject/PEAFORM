import { Link } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle, Shield, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-slate-900 tracking-tight">PEAF SYSTEM</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">PT Indofood Fortuna Makmur</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="hidden sm:block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-indigo-50 rounded-full blur-[100px] opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
              <Zap className="w-3 h-3" /> Enterprise Grade Approval System
            </span>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
              Project & Engineering <span className="text-blue-600">Approval Workflow</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Accelerate your engineering lifecycle with our streamlined digital approval platform. Built for precision, speed, and total transparency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Access Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl tracking-tight">Engineered for Excellence</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to manage complex engineering approvals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Integrity",
                desc: "Replace fragmented paper trails with a single source of truth. Secure, immutable, and fully searchable.",
                icon: Shield,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "Smart Routing",
                desc: "Automated workflow distribution to HOD, HSE, and Factory Managers based on plant location and project scope.",
                icon: Zap,
                color: "text-amber-600",
                bg: "bg-amber-50"
              },
              {
                title: "Real-time Analytics",
                desc: "Monitor approval bottlenecks and project timelines with our centralized tracking dashboard.",
                icon: BarChart3,
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-slate-900">PEAF SYSTEM</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 PT Indofood Fortuna Makmur. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
