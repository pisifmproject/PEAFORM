import { useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string; show: boolean }>>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...options, id, show: true }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          show={toast.show}
          onClose={() => hideToast(toast.id)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          position={toast.position}
        />
      ))}
    </>
  ), [toasts, hideToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
    ToastContainer
  };
}
