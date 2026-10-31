import { useEffect, useRef, type ReactNode } from 'react';
import { X, LayoutGrid, Calendar } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-slate-700">
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
  urgent: 'bg-red-50 text-red-700 border-red-200',
  upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
  academic: 'bg-sky-50 text-sky-700 border-sky-200',
  placement: 'bg-purple-50 text-purple-700 border-purple-200',
  events: 'bg-pink-50 text-pink-700 border-pink-200',
  clubs: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  admin: 'bg-orange-50 text-orange-700 border-orange-200',
  relevant: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
  updated: 'bg-blue-50 text-blue-700 border-blue-200',
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
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="View mode">
      <button
        role="tab"
        aria-selected={view === 'grid'}
        onClick={() => onViewChange('grid')}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition ${
          view === 'grid'
            ? 'bg-white text-indigo-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Cards</span>
      </button>
      <button
        role="tab"
        aria-selected={view === 'calendar'}
        onClick={() => onViewChange('calendar')}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition ${
          view === 'calendar'
            ? 'bg-white text-indigo-600 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>Calendar</span>
      </button>
    </div>
  );
}
