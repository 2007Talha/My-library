import { AlertTriangle, Clock3, ChevronRight, Flame, CheckCircle2, MapPin } from 'lucide-react';
import type { Notice, ScheduleClash } from '../../types/notice';
import { Badge } from '../common/Modal';
import { formatDisplayTime, getCountdown } from '../../utils/priorityEngine';

interface NeedsAttentionStripProps {
  notices: Notice[];
  clashes: ScheduleClash[];
}

export default function NeedsAttentionStrip({ notices, clashes }: NeedsAttentionStripProps) {
  const urgentNotices = notices.filter(n => n.urgency === 'Urgent').slice(0, 4);
  const hasClashes = clashes.length > 0;

  if (urgentNotices.length === 0 && !hasClashes) {
    return (
      <section
        id="attention-section"
        className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between scroll-mt-20"
        aria-label="Status: all clear"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" aria-hidden="true" />
          <span className="text-sm font-bold uppercase tracking-wider">All Clear Today</span>
          <span className="text-sm text-emerald-700 font-medium">• No urgent actions or schedule collisions detected for today.</span>
        </div>
      </section>
    );
  }

  return (
    <section
      id="attention-section"
      className="space-y-3.5 pt-1 scroll-mt-20"
      aria-label="Needs attention today hero spotlight"
      aria-live="polite"
    >
      {/* Unstop Section Heading with Blue/Red Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-6 bg-red-600 rounded-full" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Needs Attention Today
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
            {urgentNotices.length} Must-Dos
          </span>
        </div>
        <Badge variant="urgent" className="text-xs font-bold px-3 py-1">
          Within 24 Hours
        </Badge>
      </div>

      {/* Cards list (Unstop Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {urgentNotices.map(notice => (
          <div
            key={notice.id}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-300 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
                  {notice.category}
                </span>
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <Flame size={12} />
                  {getCountdown(notice.date)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {notice.title}
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1">
              {notice.time && (
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold font-mono">
                  <Clock3 size={13} className="text-slate-500 shrink-0" />
                  <span>{formatDisplayTime(notice.time)}</span>
                </div>
              )}
              {notice.venue && (
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <MapPin size={13} className="text-rose-500 shrink-0" />
                  <span className="truncate">{notice.venue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Clash Box */}
      {hasClashes && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle size={18} className="text-amber-600 animate-bounce" aria-hidden="true" />
            <span className="text-sm uppercase tracking-wide">
              Schedule Clash Detected ({clashes.length})
            </span>
          </div>
          {clashes.map((clash, idx) => (
            <p key={idx} className="text-sm text-amber-900 flex items-start gap-2 pl-1 font-medium">
              <ChevronRight size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{clash.overlapDescription}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
