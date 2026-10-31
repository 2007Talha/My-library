import { useState } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import type { Notice } from '../../types/notice';

interface AnnouncementTickerProps {
  urgentNotices: Notice[];
  onSelectNotice?: (notice: Notice) => void;
}

export default function AnnouncementTicker({ urgentNotices, onSelectNotice }: AnnouncementTickerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const featuredNotice = urgentNotices[0];
  if (!featuredNotice || isDismissed) return null;

  return (
    <aside
      className="bg-blue-600 text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs"
      aria-label="Urgent campus announcement ticker"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-700/80 text-white font-extrabold uppercase text-[11px] shrink-0 border border-blue-400/40">
          <Megaphone size={12} className="animate-pulse" aria-hidden="true" />
          Urgent
        </span>
        <p className="truncate">
          <strong className="font-bold">{featuredNotice.title}: </strong>
          <span className="opacity-95">{featuredNotice.rawText?.slice(0, 120) || 'Immediate action required for active campus deadline.'}...</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onSelectNotice && (
          <button
            type="button"
            onClick={() => onSelectNotice(featuredNotice)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>Read</span>
            <ArrowRight size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-blue-200 hover:text-white rounded-md transition cursor-pointer"
          aria-label="Dismiss announcement banner"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}

