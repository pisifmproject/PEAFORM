import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, FileText } from 'lucide-react';
// import { ArrowRight } from 'lucide-react'; // Commented out - not used yet
import { useEffect } from 'react';

interface SuccessNotificationProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  documentNo?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  onViewDetails?: () => void;
}

export default function SuccessNotification({
  show,
  onClose,
  title = 'Request Submitted Successfully',
  message = 'Your PEAF request has been submitted and is now pending approval.',
  documentNo,
  autoClose = true,
  autoCloseDelay = 5000,
  onViewDetails
}: SuccessNotificationProps) {
  
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              opacity: { duration: 0.2 }
            }}
            className="w-full max-w-md pointer-events-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Success Header with Gradient */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 py-5">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                </div>
                
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 15,
                        delay: 0.1
                      }}
                      className="flex-shrink-0 bg-white/20 backdrop-blur-sm p-2.5 rounded-xl"
                    >
                      <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </motion.div>
                    
                    {/* Title */}
                    <div className="flex-1 pt-0.5">
                      <motion.h3 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-lg font-bold text-white leading-tight"
                      >
                        {title}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-emerald-50 mt-1 leading-relaxed"
                      >
                        {message}
                      </motion.p>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors group"
                    aria-label="Close notification"
                  >
                    <X className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                {/* Document Number */}
                {documentNo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Number</p>
                      <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{documentNo}</p>
                    </div>
                  </motion.div>
                )}

                {/* Action Button - Commented out for now */}
                {/* {onViewDetails && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={onViewDetails}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all active:scale-[0.98] group"
                  >
                    <span>View Request Details</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )} */}
              </div>

              {/* Progress Bar (Auto-close indicator) */}
              {autoClose && (
                <div className="h-1 bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
