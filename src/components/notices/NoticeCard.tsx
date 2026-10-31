import { useState } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Compass,
  FileText,
  Flame,
  CalendarPlus,
  UserCheck,
  ArrowUpRight,
  Pin,
  Bookmark,
  User,
} from 'lucide-react';
import type { Notice, StudentContext } from '../../types/notice';
import { Badge } from '../common/Modal';
import {
  formatDisplayDate,
  formatDisplayTime,
  getCountdown,
  downloadICS,
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
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export default function NoticeCard({
  notice,
  context,
  checkedItems,
  isClashing,
  onToggleChecklistItem,
  onDeleteNotice,
  onOpenBuddyMatcher,
  isBookmarked = false,
  onToggleBookmark,
}: NoticeCardProps) {
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const isAttendanceRisk = context.lowAttendanceWarning && isAcademicMandatoryNotice(notice);

  const categoryVariantMap: Record<Notice['category'], 'academic' | 'placement' | 'events' | 'clubs' | 'admin'> = {
    'Academic': 'academic',
    'Placement': 'placement',
    'Events/Fest': 'events',
    'Clubs': 'clubs',
    'Admin/Exam': 'admin',
  };

  const getCategoryIcon = (category: Notice['category']) => {
    switch (category) {
      case 'Academic':
        return <BookOpen className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />;
      case 'Placement':
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />;
      case 'Events/Fest':
        return <Flame className="w-3.5 h-3.5 text-pink-600" aria-hidden="true" />;
      case 'Clubs':
        return <Compass className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />;
      case 'Admin/Exam':
        return <FileText className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />;
    }
  };

  const visibleChecklist = showFullChecklist
    ? notice.actionChecklist
    : notice.actionChecklist.slice(0, 3);

  return (
    <article
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group"
      aria-label={`Notice: ${notice.title}`}
    >
      <div className="space-y-3">
        {/* Top Header Row matching photo layout */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <Pin size={11} className="fill-amber-600 text-amber-600" aria-hidden="true" />
                <span>Pinned</span>
              </span>
            )}

            <Badge variant={categoryVariantMap[notice.category]}>
              {getCategoryIcon(notice.category)}
              <span>{notice.category}</span>
            </Badge>

            {notice.urgency === 'Urgent' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
                <Flame className="w-3 h-3 text-red-600" />
                <span>Urgent</span>
              </span>
            )}
          </div>

          {/* Right Status Dot & Bookmark Icon */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                notice.verificationStatus === 'Official' ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-400 ring-2 ring-amber-100'
              }`}
              title={notice.verificationReason || (notice.verificationStatus === 'Official' ? 'Official Department Source' : 'Community Forward')}
              aria-label={notice.verificationStatus}
            />

            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(notice.id)}
                className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this notice'}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark notice'}
              >
                <Bookmark size={16} className={isBookmarked ? 'fill-blue-600 text-blue-600' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Title, Description Snippet & Countdown */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
            {notice.title}
          </h3>

          {notice.rawText && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
              {notice.rawText}
            </p>
          )}

          {notice.date && (
            <p className="text-xs font-bold text-blue-600 mt-1.5 flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Due {getCountdown(notice.date)}</span>
            </p>
          )}
        </div>

        {/* Attendance Risk Banner if applicable */}
        {isAttendanceRisk && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-900 font-bold attendance-alert-pulse"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>⚠️ High Risk / Urgent Alert: Mandatory attendance required (&lt;75%)</span>
          </div>
        )}

        {/* Schedule Clash Alert if applicable */}
        {isClashing && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Time Overlap: 2 items clash today</span>
          </div>
        )}

        {/* Metadata Details */}
        <div className="space-y-1.5 text-xs text-slate-700 pt-0.5">
          <div className="flex items-center gap-2 font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
            <span>{formatDisplayDate(notice.date)}</span>
            {notice.time && (
              <span className="font-mono text-slate-500">• {formatDisplayTime(notice.time)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" aria-hidden="true" />
            <span className={notice.venue ? 'truncate font-medium text-slate-800' : 'italic text-slate-400'}>
              {notice.venue ? `Venue: ${notice.venue}` : 'Venue TBD / Online'}
            </span>
          </div>

          {/* Target Audience */}
          <div className="flex items-center gap-2 text-slate-500 pt-0.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Target: {notice.targetBranches.includes('All') ? 'All Branches' : notice.targetBranches.join(', ')} • {notice.targetYears.length === 4 ? 'All Years' : notice.targetYears.join(', ') + ' Year'}
            </span>
          </div>
        </div>

        {/* Action Checklist Container */}
        {notice.actionChecklist.length > 0 && (
          <div className="p-3 bg-slate-50/80 rounded-xl space-y-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Action Checklist
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                {checkedItems.length}/{notice.actionChecklist.length} done
              </span>
            </div>
            <ul className="space-y-1.5" aria-label="Action checklist">
              {visibleChecklist.map((item, idx) => {
                const isChecked = checkedItems.includes(item);
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleChecklistItem(notice.id, item)}
                      className="mt-0.5 text-indigo-600 hover:text-indigo-800 transition focus:outline-none cursor-pointer"
                      aria-label={isChecked ? `Mark "${item}" incomplete` : `Mark "${item}" complete`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      )}
                    </button>
                    <span
                      className={`text-xs leading-normal ${
                        isChecked ? 'line-through text-slate-400' : 'text-slate-800'
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
                className="pt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {showFullChecklist ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>+{notice.actionChecklist.length - 3} more items</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Author info on left + Action buttons on right (matching photo) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0 max-w-[55%]">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate font-semibold text-slate-700">
            {notice.author || (notice.verificationStatus === 'Official' ? 'Academic Dean Office' : 'Student Coordinator')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Buddy Matcher Button */}
          <button
            type="button"
            onClick={() => onOpenBuddyMatcher(notice)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition cursor-pointer"
            title="1-Click Attendance & Peer Buddy Matcher"
            aria-label={`Open 1-Click Attendance Buddy Matcher for ${notice.title}`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
            <span>Buddies {notice.buddies?.length ? `(${notice.buddies.length})` : ''}</span>
          </button>

          {notice.registrationLink && (
            <a
              href={notice.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition"
              aria-label={`Register for ${notice.title}`}
            >
              <span>Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={() => downloadICS(notice)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Export notice to iCalendar (.ics)"
            aria-label={`Download .ics calendar event for ${notice.title}`}
          >
            <CalendarPlus size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDeleteNotice(notice.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            title="Archive this notice"
            aria-label={`Archive notice ${notice.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
