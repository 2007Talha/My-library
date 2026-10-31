import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { toastListeners, type Toast } from '../../utils/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3500);
    };
    toastListeners.push(listener);
    return () => {
      const idx = toastListeners.indexOf(listener);
      if (idx !== -1) {
        toastListeners.splice(idx, 1);
      }
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  const typeConfig: Record<Toast['type'], { border: string; icon: ReactNode }> = {
    success: {
      border: 'border-emerald-200 bg-white text-emerald-800 shadow-lg shadow-emerald-500/5',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    error: {
      border: 'border-red-200 bg-white text-red-800 shadow-lg shadow-red-500/5',
      icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
    },
    info: {
      border: 'border-indigo-200 bg-white text-indigo-800 shadow-lg shadow-indigo-500/5',
      icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
    },
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto" aria-live="polite">
      {toasts.map(toast => {
        const config = typeConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${config.border} animate-in slide-in-from-bottom-2`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {config.icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 transition"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
