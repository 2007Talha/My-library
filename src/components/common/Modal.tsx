import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-in fade-in`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
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
  urgent: 'bg-red-100 text-red-800 border-red-200',
  upcoming: 'bg-amber-100 text-amber-800 border-amber-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  academic: 'bg-blue-100 text-blue-800 border-blue-200',
  placement: 'bg-purple-100 text-purple-800 border-purple-200',
  events: 'bg-pink-100 text-pink-800 border-pink-200',
  clubs: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  admin: 'bg-orange-100 text-orange-800 border-orange-200',
  relevant: 'bg-green-100 text-green-800 border-green-200',
  updated: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${BADGE_STYLES[variant]} ${className}`}>
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
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5" role="tablist" aria-label="View mode">
      <button
        role="tab"
        aria-selected={view === 'grid'}
        onClick={() => onViewChange('grid')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          view === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Card Grid
      </button>
      <button
        role="tab"
        aria-selected={view === 'calendar'}
        onClick={() => onViewChange('calendar')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          view === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Calendar
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
      }, 3000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${typeStyles[toast.type]}`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70" aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

