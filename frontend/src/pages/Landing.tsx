import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
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
      <section className="relative flex-grow flex flex-col justify-center pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-indigo-50 rounded-full blur-[100px] opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
              Project & Engineering <span className="text-blue-600">Approval Workflow</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Accelerate your engineering lifecycle with our streamlined digital approval platform. Built for precision and total transparency.
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

      {/* Footer */}
      <footer className="py-8 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-sm text-slate-500 text-center">© 2026 PT Indofood Fortuna Makmur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
