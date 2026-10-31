import { Inbox } from 'lucide-react';
import type { Notice, StudentContext } from '../../types/notice';
import NoticeCard from './NoticeCard';

interface NoticeGridProps {
  notices: Notice[];
  context: StudentContext;
  getCheckedItems: (noticeId: string) => string[];
  onToggleChecklistItem: (noticeId: string, item: string) => void;
  onDeleteNotice: (id: string) => void;
}

export default function NoticeGrid({
  notices,
  context,
  getCheckedItems,
  onToggleChecklistItem,
  onDeleteNotice,
}: NoticeGridProps) {
  if (notices.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 text-center"
        role="status"
        aria-label="No notices found"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
          <Inbox className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">No matching campus notices</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          Try clearing your search query, switching filters, or pasting a new notice in the Smart Input above.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Campus notices feed">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            context={context}
            checkedItems={getCheckedItems(notice.id)}
            onToggleChecklistItem={onToggleChecklistItem}
            onDeleteNotice={onDeleteNotice}
          />
        ))}
      </div>
    </section>
  );
}
