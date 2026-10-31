import { ArrowRight, RefreshCw, PlusCircle } from 'lucide-react';
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
      rawText: `${existingNotice.rawText}\n\n[UPDATE]: ${incomingNotice.rawText}`,
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
      title="Corrigendum / Notice Update Detected"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          We noticed this notice appears to be an update or correction to an existing campus notice in your feed. Would you like to merge this update into the existing entry or add it as a new separate notice?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
          {/* Existing notice info */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold text-[10px]">
              EXISTING NOTICE
            </span>
            <p className="font-bold text-gray-900 text-sm">{existingNotice.title}</p>
            <div className="space-y-1 text-gray-600">
              <p><span className="font-medium">Date:</span> {formatDisplayDate(existingNotice.date)}</p>
              <p><span className="font-medium">Time:</span> {formatDisplayTime(existingNotice.time) || 'N/A'}</p>
              <p><span className="font-medium">Venue:</span> {existingNotice.venue || 'Not specified'}</p>
            </div>
          </div>

          {/* Incoming notice update */}
          <div className="space-y-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
            <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-semibold text-[10px]">
              INCOMING UPDATE
            </span>
            <p className="font-bold text-indigo-950 text-sm">{incomingNotice.title}</p>
            <div className="space-y-1 text-indigo-900">
              <p><span className="font-medium">Date:</span> {formatDisplayDate(incomingNotice.date)}</p>
              <p><span className="font-medium">Time:</span> {formatDisplayTime(incomingNotice.time) || 'N/A'}</p>
              <p className="font-semibold text-indigo-700">
                <span className="font-medium text-indigo-900">Venue:</span> {incomingNotice.venue || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Add as Separate Notice
          </button>
          <button
            type="button"
            onClick={handleMerge}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Merge & Update Existing
          </button>
        </div>
      </div>
    </Modal>
  );
}

