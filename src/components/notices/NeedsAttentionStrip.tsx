import { AlertTriangle, Clock, ChevronRight, Zap, Flame } from 'lucide-react';
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
        className="glass-panel rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/20"
        aria-label="Status: all clear"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 text-emerald-300">
          <Clock size={16} aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">Campus Radar Clear</span>
          <span className="text-xs text-emerald-400/80">• No urgent actions or schedule collisions detected for today.</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="glass-panel-elevated rounded-2xl p-5 border border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-900/90 to-amber-950/30 space-y-4"
      aria-label="Needs attention today hero spotlight"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Flame size={18} className="text-red-400 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-red-200">
              Needs Attention Today
            </h2>
            <p className="text-[11px] text-red-300/80">
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
            className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-400 transition flex flex-col justify-between space-y-2"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <Zap size={10} />
                  {getCountdown(notice.date)}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                {notice.title}
              </h3>
            </div>

            <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800">
              {notice.time && (
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Clock size={11} className="text-slate-500" />
                  <span>{formatDisplayTime(notice.time)}</span>
                </div>
              )}
              {notice.venue && (
                <p className="text-[10px] truncate text-slate-400">{notice.venue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Clash Box */}
      {hasClashes && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle size={15} className="text-amber-400 animate-bounce" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Schedule Clash Detected ({clashes.length})
            </span>
          </div>
          {clashes.map((clash, idx) => (
            <p key={idx} className="text-xs text-amber-200/90 flex items-start gap-1.5 pl-1">
              <ChevronRight size={12} className="text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{clash.overlapDescription}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
