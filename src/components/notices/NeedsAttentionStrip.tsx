import { AlertTriangle, Clock, ChevronRight, Zap, Flame, CheckCircle2 } from 'lucide-react';
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
        className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between"
        aria-label="Status: all clear"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">Campus Schedule All Clear</span>
          <span className="text-xs text-emerald-700/80">• No urgent actions or schedule collisions detected for today.</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl p-5 border border-red-200/90 bg-gradient-to-r from-red-50/80 via-white to-amber-50/80 shadow-xs space-y-4"
      aria-label="Needs attention today hero spotlight"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
            <Flame size={18} className="animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-red-950">
              Needs Attention Today
            </h2>
            <p className="text-xs text-red-700/90 font-medium">
              High-priority events, submissions & 24h countdowns
            </p>
          </div>
        </div>
        <Badge variant="urgent">
          {urgentNotices.length} Action Items
        </Badge>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {urgentNotices.map(notice => (
          <div
            key={notice.id}
            className="p-3.5 rounded-xl bg-white border border-red-100 hover:border-red-300 shadow-xs transition flex flex-col justify-between space-y-2"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <Zap size={10} />
                  {getCountdown(notice.date)}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                {notice.title}
              </h3>
            </div>

            <div className="text-[11px] text-slate-600 space-y-0.5 pt-1.5 border-t border-slate-100">
              {notice.time && (
                <div className="flex items-center gap-1 text-slate-800 font-semibold font-mono">
                  <Clock size={11} className="text-slate-400" />
                  <span>{formatDisplayTime(notice.time)}</span>
                </div>
              )}
              {notice.venue && (
                <p className="text-[10px] truncate text-slate-500 font-medium">{notice.venue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Clash Box */}
      {hasClashes && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle size={15} className="text-amber-600 animate-bounce" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wide">
              Schedule Clash Detected ({clashes.length})
            </span>
          </div>
          {clashes.map((clash, idx) => (
            <p key={idx} className="text-xs text-amber-800 flex items-start gap-1.5 pl-1 font-medium">
              <ChevronRight size={12} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{clash.overlapDescription}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
