import { Inbox } from 'lucide-react';
import type { Notice, StudentContext, ScheduleClash } from '../../types/notice';
import NoticeCard from './NoticeCard';

interface NoticeGridProps {
  notices: Notice[];
  context: StudentContext;
  clashes?: ScheduleClash[];
  getCheckedItems: (noticeId: string) => string[];
  onToggleChecklistItem: (noticeId: string, item: string) => void;
  onDeleteNotice: (id: string) => void;
  onOpenBuddyMatcher: (notice: Notice) => void;
  savedNoticeIds?: Set<string>;
  onToggleBookmark?: (id: string) => void;
}

export default function NoticeGrid({
  notices,
  context,
  clashes = [],
  getCheckedItems,
  onToggleChecklistItem,
  onDeleteNotice,
  onOpenBuddyMatcher,
  savedNoticeIds,
  onToggleBookmark,
}: NoticeGridProps) {
  if (notices.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-xs"
        role="status"
        aria-label="No notices found"
      >
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No matching campus notices</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Try clearing your search query, switching filters, or pasting a new notice in the Smart Input above.
        </p>
      </div>
    );
  }

  // Set of notice IDs that have a schedule clash
  const clashingNoticeIds = new Set<string>();
  clashes.forEach(c => {
    clashingNoticeIds.add(c.noticeA.id);
    clashingNoticeIds.add(c.noticeB.id);
  });

  return (
    <section aria-label="Campus notices feed">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            context={context}
            checkedItems={getCheckedItems(notice.id)}
            isClashing={clashingNoticeIds.has(notice.id)}
            onToggleChecklistItem={onToggleChecklistItem}
            onDeleteNotice={onDeleteNotice}
            onOpenBuddyMatcher={onOpenBuddyMatcher}
            isBookmarked={savedNoticeIds?.has(notice.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </section>
  );
}

