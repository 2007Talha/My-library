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
    'Academic': 'border-l-blue-500',
    'Placement': 'border-l-purple-500',
    'Events/Fest': 'border-l-pink-500',
    'Clubs': 'border-l-emerald-500',
    'Admin/Exam': 'border-l-orange-500',
  };

  const visibleChecklist = showFullChecklist
    ? notice.actionChecklist
    : notice.actionChecklist.slice(0, 3);

  return (
    <article
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden border-l-4 ${borderLeftColor[notice.category]}`}
      aria-label={`Notice: ${notice.title}`}
    >
      <div className="p-5 space-y-3">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={categoryVariantMap[notice.category]}>
              {notice.category}
            </Badge>

            <Badge variant={urgencyVariantMap[notice.urgency]}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
              {notice.urgency}
            </Badge>

            {notice.updatedBadge && (
              <Badge variant="updated">
                Updated
              </Badge>
            )}

            {isRelevant && (
              <Badge variant="relevant" className="font-semibold">
                <Sparkles className="w-3 h-3 text-green-700" aria-hidden="true" />
                Relevant to You
              </Badge>
            )}
          </div>

          <div className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
            Score: {notice.priorityScore}
          </div>
        </div>

        {/* Verification Status Badge */}
        <div>
          {notice.verificationStatus === 'Official' ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              title={notice.verificationReason || 'Official Source Verified'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              Verified Official ({notice.verificationScore}%)
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
              title={notice.verificationReason || 'Community Forward - Unverified'}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              Community Forward ({notice.verificationScore}%)
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
            {notice.title}
          </h3>
          {notice.date && (
            <p className="text-xs font-medium text-indigo-600 mt-0.5">
              {getCountdown(notice.date)}
            </p>
          )}
        </div>

        {/* Attendance Risk Banner if applicable */}
        {isAttendanceRisk && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-900 font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>⚠️ High Risk Alert: Mandatory lab/class attendance required (&lt;75%)</span>
          </div>
        )}

        {/* Schedule Clash Alert if applicable */}
        {isClashing && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Time Overlap: 2 items clash today</span>
          </div>
        )}

        {/* Metadata grid */}
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
            <span>{formatDisplayDate(notice.date)}</span>
          </div>

          {notice.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              <span>{formatDisplayTime(notice.time)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
            <span className={notice.venue ? 'truncate' : 'italic text-gray-400'}>
              {notice.venue || 'Venue TBD / Not specified'}
            </span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1 text-[11px] text-gray-500">
          <span className="font-medium text-gray-700">Target:</span>
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
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-700">Prerequisites & Action Checklist:</span>
              <span className="text-[11px] text-gray-500">
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
                      className="mt-0.5 text-indigo-600 hover:text-indigo-800 transition focus:outline-none"
                      aria-label={isChecked ? `Mark "${item}" incomplete` : `Mark "${item}" complete`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      )}
                    </button>
                    <span
                      className={`text-xs ${
                        isChecked ? 'line-through text-gray-400' : 'text-gray-700'
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
                className="mt-1.5 flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
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
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => downloadICS(notice)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 transition"
            title="Export to Calendar (.ics)"
            aria-label="Export to Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
            <span>.ics</span>
          </button>

          {/* 1-Click Buddy Matcher Button */}
          <button
            type="button"
            onClick={() => onOpenBuddyMatcher(notice)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 transition"
            title="Find or match with an attendance / project buddy"
            aria-label={`Open buddy matcher for ${notice.title}`}
          >
            <Users className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
            <span>Buddies {notice.buddies?.length ? `(${notice.buddies.length})` : ''}</span>
          </button>

          {notice.registrationLink && (
            <a
              href={notice.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-500 transition"
              aria-label={`Open registration link for ${notice.title}`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Register</span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDeleteNotice(notice.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete notice"
          aria-label={`Delete notice: ${notice.title}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
