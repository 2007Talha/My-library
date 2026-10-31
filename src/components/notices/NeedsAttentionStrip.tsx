import { AlertTriangle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
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
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mx-4 mt-4 p-4"
        aria-label="Status: all clear"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-green-700">
          <Clock size={18} aria-hidden="true" />
          <span className="font-medium">All Clear!</span>
          <span className="text-sm text-green-600">No urgent items need your attention right now.</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200 rounded-xl mx-4 mt-4 p-4"
      aria-label="Needs attention today"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-red-500" aria-hidden="true" />
        <h2 className="font-semibold text-red-800">
          Needs Attention Today
        </h2>
        <Badge variant="urgent">{urgentNotices.length} urgent</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {urgentNotices.map(notice => (
          <div
            key={notice.id}
            className="bg-white/80 rounded-lg p-3 border border-red-100 hover:border-red-300 transition-colors"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{notice.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  {notice.time && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} aria-hidden="true" />
                      {formatDisplayTime(notice.time)}
                    </span>
                  )}
                  <span className="font-medium text-red-600">
                    {getCountdown(notice.date)}
                  </span>
                </div>
                {notice.venue && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{notice.venue}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasClashes && (
        <div className="mt-3 bg-amber-100/60 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={14} aria-hidden="true" />
            <span className="text-sm font-semibold">Schedule Clash Detected!</span>
          </div>
          {clashes.map((clash, idx) => (
            <p key={idx} className="text-xs text-amber-700 mt-1 flex items-center gap-1">
              <ChevronRight size={10} aria-hidden="true" />
              {clash.overlapDescription}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

