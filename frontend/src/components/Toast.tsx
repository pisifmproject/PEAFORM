import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  show: boolean;
  onClose: () => void;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export default function Toast({
  show,
  onClose,
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right'
}: ToastProps) {
  
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" strokeWidth={2.5} />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={2.5} />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" strokeWidth={2.5} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-50',
          title: 'text-slate-900',
          message: 'text-slate-600'
        };
      case 'error':
        return {
          bg: 'bg-white',
          border: 'border-red-200',
          iconBg: 'bg-red-50',
          title: 'text-slate-900',
          message: 'text-slate-600'
        };
      case 'warning':
        return {
          bg: 'bg-white',
          border: 'border-amber-200',
          iconBg: 'bg-amber-50',
          title: 'text-slate-900',
          message: 'text-slate-600'
        };
      case 'info':
        return {
          bg: 'bg-white',
          border: 'border-blue-200',
          iconBg: 'bg-blue-50',
          title: 'text-slate-900',
          message: 'text-slate-600'
        };
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-right':
        return 'top-6 right-6';
      case 'top-center':
        return 'top-6 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
    }
  };

  const getAnimation = () => {
    if (position.includes('right')) {
      return {
        initial: { opacity: 0, x: 100, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 100, scale: 0.95 }
      };
    } else {
      return {
        initial: { opacity: 0, y: -50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -50, scale: 0.95 }
      };
    }
  };

  const colors = getColors();
  const animation = getAnimation();

  return (
    <AnimatePresence>
      {show && (
        <div className={`fixed ${getPosition()} z-[9999] pointer-events-none`}>
          <motion.div
            {...animation}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              opacity: { duration: 0.2 }
            }}
            className="pointer-events-auto"
          >
            <div className={`${colors.bg} ${colors.border} border rounded-xl shadow-2xl overflow-hidden max-w-md`}>
              <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  {getIcon()}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className={`${colors.title} font-semibold text-sm leading-tight`}>
                    {title}
                  </h3>
                  {message && (
                    <p className={`${colors.message} text-sm mt-1 leading-relaxed`}>
                      {message}
                    </p>
                  )}
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors group"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>
              
              {/* Progress Bar */}
              {duration > 0 && (
                <div className="h-1 bg-slate-100">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                    className={`h-full ${
                      type === 'success' ? 'bg-emerald-500' :
                      type === 'error' ? 'bg-red-500' :
                      type === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
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
