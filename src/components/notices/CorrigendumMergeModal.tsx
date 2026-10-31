import { RefreshCw, PlusCircle } from 'lucide-react';
import type { Notice } from '../../types/notice';
import Modal from '../common/Modal';
import { formatDisplayDate, formatDisplayTime } from '../../utils/priorityEngine';

interface CorrigendumMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingNotice: Notice | null;
  existingNotice: Notice | null;
  onMerge: (existingId: string, updates: Partial<Notice>) => void;
  onAddNew: (notice: Notice) => void;
}

export default function CorrigendumMergeModal({
  isOpen,
  onClose,
  incomingNotice,
  existingNotice,
  onMerge,
  onAddNew,
}: CorrigendumMergeModalProps) {
  if (!incomingNotice || !existingNotice) return null;

  const handleMerge = () => {
    onMerge(existingNotice.id, {
      title: incomingNotice.title || existingNotice.title,
      venue: incomingNotice.venue || existingNotice.venue,
      date: incomingNotice.date || existingNotice.date,
      time: incomingNotice.time || existingNotice.time,
      actionChecklist: Array.from(new Set([...existingNotice.actionChecklist, ...incomingNotice.actionChecklist])),
      updatedBadge: true,
      rawText: `${existingNotice.rawText}\n\n[CORRIGENDUM UPDATE]: ${incomingNotice.rawText}`,
    });
    onClose();
  };

  const handleAddNew = () => {
    onAddNew(incomingNotice);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notice Amendment / Corrigendum Detected"
      size="lg"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-600 leading-relaxed">
          The incoming message updates an existing campus notice in your calendar feed. You can merge the revision into the existing card (updating venue, date, and time) or save it as a separate entry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          {/* Existing notice */}
          <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              EXISTING NOTICE IN FEED
            </span>
            <p className="font-bold text-slate-900 text-sm">{existingNotice.title}</p>
            <div className="space-y-1 text-slate-600">
              <p><span className="text-slate-800 font-semibold">Date:</span> {formatDisplayDate(existingNotice.date)}</p>
              <p><span className="text-slate-800 font-semibold">Time:</span> {formatDisplayTime(existingNotice.time) || 'N/A'}</p>
              <p><span className="text-slate-800 font-semibold">Venue:</span> {existingNotice.venue || 'Not specified'}</p>
            </div>
          </div>

          {/* Incoming amendment */}
          <div className="space-y-2 p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg shadow-xs">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              INCOMING CORRIGENDUM
            </span>
            <p className="font-bold text-indigo-950 text-sm">{incomingNotice.title}</p>
            <div className="space-y-1 text-indigo-900">
              <p><span className="text-indigo-950 font-semibold">Date:</span> {formatDisplayDate(incomingNotice.date)}</p>
              <p><span className="text-indigo-950 font-semibold">Time:</span> {formatDisplayTime(incomingNotice.time) || 'N/A'}</p>
              <p className="font-bold text-amber-700">
                <span className="text-indigo-950 font-semibold">New Venue:</span> {incomingNotice.venue || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Add as Separate Notice
          </button>
          <button
            type="button"
            onClick={handleMerge}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Merge & Update Existing Card
          </button>
        </div>
      </div>
    </Modal>
  );
}
