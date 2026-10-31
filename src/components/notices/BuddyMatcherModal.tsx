import { useState } from 'react';
import { Users, UserPlus, CheckCircle2, Sparkles, Send } from 'lucide-react';
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
        : `Connected with ${targetBuddy?.name}! Contact coordinate saved.`,
      'success'
    );
  };

  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim() || 'You';
    const note = newNote.trim();
    if (!note) {
      showToast('Please specify what you need (e.g. lab partner or hackathon teammate)', 'error');
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
      title="Attendance & Lab Buddy Matcher"
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Header notice snippet */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md inline-block mb-1">
              {notice.category} Peer Hub
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">{notice.title}</h3>
            <p className="text-slate-600 mt-0.5">
              Targeted for: <span className="font-bold text-indigo-700">{context.year} Year {context.branch}</span> batchmates
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-indigo-200 text-indigo-700 font-bold shrink-0 shadow-xs">
            <Users className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>{buddies.length} peers</span>
          </div>
        </div>

        {/* Existing Buddies List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {buddies.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">No batchmates registered yet</p>
              <p className="text-[11px] text-slate-500">Post a request below to find lab or study partners.</p>
            </div>
          ) : (
            buddies.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition gap-3 shadow-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{b.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {b.year} Year {b.branch}
                    </span>
                    {b.status === 'matched' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 italic truncate">{b.note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(b.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                    b.status === 'matched'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
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
        <form onSubmit={handlePostRequest} className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Post Your Buddy Request:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
              aria-label="Your name"
            />
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Need partner for OS Lab / Carpool to techfest"
              className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
              aria-label="Buddy request details"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
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
