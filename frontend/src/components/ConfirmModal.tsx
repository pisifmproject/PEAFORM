import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
          confirmBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
          icon: <AlertTriangle className="h-10 w-10" />
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          confirmBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
          icon: <CheckCircle2 className="h-10 w-10" />
        };
      case 'info':
        return {
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
          icon: <AlertTriangle className="h-10 w-10" />
        };
      default: // warning
        return {
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          confirmBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
          icon: <AlertTriangle className="h-10 w-10" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              <div className={`${styles.iconBg} p-4 rounded-2xl mb-6 ${styles.iconColor}`}>
                {styles.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full ${styles.confirmBg} text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95`}
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl font-bold transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
