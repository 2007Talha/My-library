import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`bg-slate-900 border border-slate-700/80 text-slate-100 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Badge Component ────────────────────────────────────────────

interface BadgeProps {
  variant: 'urgent' | 'upcoming' | 'expired' | 'academic' | 'placement' | 'events' | 'clubs' | 'admin' | 'relevant' | 'updated';
  children: ReactNode;
  className?: string;
}

const BADGE_STYLES: Record<BadgeProps['variant'], string> = {
  urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
  upcoming: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  expired: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
  academic: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  placement: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  events: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  clubs: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  admin: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  relevant: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs',
  updated: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BADGE_STYLES[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── ViewToggle Component ───────────────────────────────────────

interface ViewToggleProps {
  view: 'grid' | 'calendar';
  onViewChange: (view: 'grid' | 'calendar') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-700/80 bg-slate-900/90 p-1" role="tablist" aria-label="View mode">
      <button
        role="tab"
        aria-selected={view === 'grid'}
        onClick={() => onViewChange('grid')}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
          view === 'grid'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Card Feed
      </button>
      <button
        role="tab"
        aria-selected={view === 'calendar'}
        onClick={() => onViewChange('calendar')}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
          view === 'calendar'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Calendar Schedule
      </button>
    </div>
  );
}

// ─── Notification Toast ─────────────────────────────────────────

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: Toast['type'] = 'success') {
  const toast: Toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach(l => l(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3500);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  const typeConfig = {
    success: {
      border: 'border-emerald-500/40 bg-slate-900/95 text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    error: {
      border: 'border-red-500/40 bg-slate-900/95 text-red-300',
      icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
    },
    info: {
      border: 'border-indigo-500/40 bg-slate-900/95 text-indigo-300',
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
    },
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto" aria-live="polite">
      {toasts.map(toast => {
        const config = typeConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 ${config.border}`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {config.icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-200 transition"
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
