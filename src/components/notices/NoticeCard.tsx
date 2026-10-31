import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
} from 'lucide-react';
import type { Notice, StudentContext } from '../../types/notice';
import { Badge } from '../common/Modal';
import {
  formatDisplayDate,
  formatDisplayTime,
  getCountdown,
  downloadICS,
  isRelevantToContext,
  isAcademicMandatoryNotice,
} from '../../utils/priorityEngine';

interface NoticeCardProps {
  notice: Notice;
  context: StudentContext;
  checkedItems: string[];
  isClashing?: boolean;
  onToggleChecklistItem: (noticeId: string, item: string) => void;
  onDeleteNotice: (id: string) => void;
  onOpenBuddyMatcher: (notice: Notice) => void;
}

export default function NoticeCard({
  notice,
  context,
  checkedItems,
  isClashing,
  onToggleChecklistItem,
  onDeleteNotice,
  onOpenBuddyMatcher,
}: NoticeCardProps) {
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const isRelevant = isRelevantToContext(notice, context);
  const isAttendanceRisk = context.lowAttendanceWarning && isAcademicMandatoryNotice(notice);

  const categoryVariantMap: Record<Notice['category'], 'academic' | 'placement' | 'events' | 'clubs' | 'admin'> = {
    'Academic': 'academic',
    'Placement': 'placement',
    'Events/Fest': 'events',
    'Clubs': 'clubs',
    'Admin/Exam': 'admin',
  };

  const urgencyVariantMap: Record<Notice['urgency'], 'urgent' | 'upcoming' | 'expired'> = {
    'Urgent': 'urgent',
    'Upcoming': 'upcoming',
    'Expired': 'expired',
  };

  const borderLeftColor: Record<Notice['category'], string> = {
    'Academic': 'border-l-cyan-500 shadow-cyan-500/5',
    'Placement': 'border-l-purple-500 shadow-purple-500/5',
    'Events/Fest': 'border-l-pink-500 shadow-pink-500/5',
    'Clubs': 'border-l-emerald-500 shadow-emerald-500/5',
    'Admin/Exam': 'border-l-orange-500 shadow-orange-500/5',
  };

  const visibleChecklist = showFullChecklist
    ? notice.actionChecklist
    : notice.actionChecklist.slice(0, 3);

  return (
    <article
      className={`glass-panel-elevated rounded-2xl p-5 border border-slate-700/70 hover:border-slate-500/80 transition-all flex flex-col justify-between overflow-hidden border-l-4 ${borderLeftColor[notice.category]} group`}
      aria-label={`Notice: ${notice.title}`}
    >
      <div className="space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={categoryVariantMap[notice.category]}>
              {notice.category}
            </Badge>

            <Badge variant={urgencyVariantMap[notice.urgency]}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
              {notice.urgency}
            </Badge>

            {notice.updatedBadge && (
              <Badge variant="updated">
                Updated
              </Badge>
            )}

            {isRelevant && (
              <Badge variant="relevant" className="font-bold">
                <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" />
                Relevant to You
              </Badge>
            )}
          </div>

          <div className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-800/90 text-indigo-300 rounded-md border border-slate-700">
            Score: {notice.priorityScore}
          </div>
        </div>

        {/* Verification Status Badge */}
        <div>
          {notice.verificationStatus === 'Official' ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
              title={notice.verificationReason || 'Official Source Verified'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Official Source ({notice.verificationScore}%)
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30"
              title={notice.verificationReason || 'Community Forward - Unverified'}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              Community Forward ({notice.verificationScore}%)
            </span>
          )}
        </div>

        {/* Title & Countdown */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-200 transition line-clamp-2 leading-snug">
            {notice.title}
          </h3>
          {notice.date && (
            <p className="text-xs font-semibold text-indigo-400 mt-1 flex items-center gap-1">
              <span>{getCountdown(notice.date)}</span>
            </p>
          )}
        </div>

        {/* Attendance Risk Banner if applicable */}
        {isAttendanceRisk && (
          <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300 font-bold attendance-alert-pulse">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            <span>⚠️ High Risk: Mandatory attendance required (&lt;75%)</span>
          </div>
        )}

        {/* Schedule Clash Alert if applicable */}
        {isClashing && (
          <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-center gap-2 text-xs text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Time Overlap: 2 items clash today</span>
          </div>
        )}

        {/* Metadata grid */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span>{formatDisplayDate(notice.date)}</span>
          </div>

          {notice.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>{formatDisplayTime(notice.time)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className={notice.venue ? 'truncate' : 'italic text-slate-500'}>
              {notice.venue || 'Venue TBD / Not specified'}
            </span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1 text-[11px] text-slate-400">
          <span className="font-bold text-slate-300">Target:</span>
          <span>
            {notice.targetBranches.includes('All') ? 'All Branches' : notice.targetBranches.join(', ')}
          </span>
          <span>•</span>
          <span>
            {notice.targetYears.length === 4 ? 'All Years' : notice.targetYears.join(', ') + ' Year'}
          </span>
        </div>

        {/* Checklist */}
        {notice.actionChecklist.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300">Prerequisites & Actions:</span>
              <span className="text-[10px] font-mono text-slate-400">
                {checkedItems.length}/{notice.actionChecklist.length} done
              </span>
            </div>
            <ul className="space-y-1" aria-label="Action checklist">
              {visibleChecklist.map((item, idx) => {
                const isChecked = checkedItems.includes(item);
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleChecklistItem(notice.id, item)}
                      className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition focus:outline-none"
                      aria-label={isChecked ? `Mark "${item}" incomplete` : `Mark "${item}" complete`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      )}
                    </button>
                    <span
                      className={`text-xs ${
                        isChecked ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>

            {notice.actionChecklist.length > 3 && (
              <button
                type="button"
                onClick={() => setShowFullChecklist(!showFullChecklist)}
                className="mt-1.5 flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {showFullChecklist ? (
                  <>
                    <ChevronUp className="w-3 h-3" aria-hidden="true" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                    +{notice.actionChecklist.length - 3} more items
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 rounded-b-xl flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => downloadICS(notice)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="Export to Calendar (.ics)"
            aria-label="Export to Calendar (.ics)"
          >
            <Download className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span>.ics</span>
          </button>

          {/* 1-Click Buddy Matcher Button */}
          <button
            type="button"
            onClick={() => onOpenBuddyMatcher(notice)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition"
            title="Find or match with an attendance / project buddy"
            aria-label={`Open buddy matcher for ${notice.title}`}
          >
            <Users className="w-3 h-3 text-purple-400" aria-hidden="true" />
            <span>Buddies {notice.buddies?.length ? `(${notice.buddies.length})` : ''}</span>
          </button>

          {notice.registrationLink && (
            <a
              href={notice.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-lg transition"
              aria-label={`Open registration link for ${notice.title}`}
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              <span>Register</span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDeleteNotice(notice.id)}
          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          title="Delete notice"
          aria-label={`Delete notice: ${notice.title}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
