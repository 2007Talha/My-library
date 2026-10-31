import { useState } from 'react';
import { Users, UserPlus, CheckCircle2, MessageSquare, Sparkles, Send } from 'lucide-react';
import type { Notice, BuddyProfile, StudentContext } from '../../types/notice';
import Modal, { showToast } from '../common/Modal';

interface BuddyMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  context: StudentContext;
  onUpdateNoticeBuddies: (noticeId: string, updatedBuddies: BuddyProfile[]) => void;
}

export default function BuddyMatcherModal({
  isOpen,
  onClose,
  notice,
  context,
  onUpdateNoticeBuddies,
}: BuddyMatcherModalProps) {
  const [newNote, setNewNote] = useState('');
  const [userName, setUserName] = useState('');

  if (!notice) return null;

  const buddies: BuddyProfile[] = notice.buddies || [];

  const handleConnect = (buddyId: string) => {
    const updated = buddies.map(b =>
      b.id === buddyId
        ? { ...b, status: (b.status === 'matched' ? 'seeking' : 'matched') as 'seeking' | 'matched' }
        : b
    );
    onUpdateNoticeBuddies(notice.id, updated);
    const targetBuddy = buddies.find(b => b.id === buddyId);
    showToast(
      targetBuddy?.status === 'matched'
        ? `Disconnected from ${targetBuddy.name}`
        : `Connected with ${targetBuddy?.name}! Contact shared in student portal.`,
      'success'
    );
  };

  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim() || 'You';
    const note = newNote.trim();
    if (!note) {
      showToast('Please enter what you are looking for (e.g., lab partner or carpool)', 'error');
      return;
    }

    const newProfile: BuddyProfile = {
      id: `buddy-${Date.now()}`,
      name,
      branch: context.branch === 'All' ? 'CSE' : context.branch,
      year: context.year,
      status: 'seeking',
      note,
    };

    onUpdateNoticeBuddies(notice.id, [newProfile, ...buddies]);
    setNewNote('');
    setUserName('');
    showToast('Your buddy request has been posted!', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance & Event Buddy Matcher"
      size="lg"
    >
      <div className="space-y-4">
        {/* Header notice snippet */}
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-start justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md inline-block mb-1">
              {notice.category} Buddy Hub
            </span>
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{notice.title}</h3>
            <p className="text-gray-600 mt-0.5">
              Targeted for: <span className="font-semibold text-indigo-800">{context.year} Year {context.branch}</span> batchmates
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-indigo-200 text-indigo-800 font-semibold shrink-0">
            <Users className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>{buddies.length} available</span>
          </div>
        </div>

        {/* Info card */}
        <p className="text-xs text-gray-600 leading-relaxed">
          Pair up with students from your batch for mandatory laboratory sessions, group project submissions, placement preparation, or rideshare to off-campus hackathons.
        </p>

        {/* Existing Buddies List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {buddies.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-gray-700">No students seeking buddies yet</p>
              <p className="text-[11px] text-gray-500">Be the first to post a study or lab partner request below!</p>
            </div>
          ) : (
            buddies.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition shadow-xs gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{b.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                      {b.year} Year {b.branch}
                    </span>
                    {b.status === 'matched' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 italic truncate">{b.note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(b.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                    b.status === 'matched'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                  }`}
                  aria-label={b.status === 'matched' ? `Disconnect with ${b.name}` : `Connect with ${b.name}`}
                >
                  {b.status === 'matched' ? (
                    'Connected'
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Buddy Up</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Post new request form */}
        <form onSubmit={handlePostRequest} className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Post Your Buddy Request:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name (optional)"
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              aria-label="Your name"
            />
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Need lab partner for DSA / Carpool to fest"
              className="sm:col-span-2 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              aria-label="Buddy request details"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs"
              aria-label="Post request"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Post Request</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
