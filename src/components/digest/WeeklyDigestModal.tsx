import { useState } from 'react';
import { Check, FileText, Share2 } from 'lucide-react';
import type { Notice, StudentContext } from '../../types/notice';
import Modal, { showToast } from '../common/Modal';
import { generateWeeklyDigest } from '../../utils/priorityEngine';

interface WeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  context: StudentContext;
}

export default function WeeklyDigestModal({
  isOpen,
  onClose,
  notices,
  context,
}: WeeklyDigestModalProps) {
  const [copied, setCopied] = useState(false);

  const digestText = generateWeeklyDigest(notices, context);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(digestText);
      setCopied(true);
      showToast('Weekly executive digest copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="What Do I Need to Know This Week? (AI Digest)"
      size="lg"
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <span>Targeted for: <strong className="text-slate-900">{context.year} Year {context.branch}</strong> ({context.focusMode})</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            aria-label="Copy Clean WhatsApp Summary"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>Copy WhatsApp Clip</span>
              </>
            )}
          </button>
        </div>

        {/* Monospace terminal formatted digest preview */}
        <div className="bg-slate-900 p-4 rounded-xl font-mono text-sm text-slate-100 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-inner max-h-[60vh]">
          {digestText}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-500 text-xs">
          <span>Generated client-side with zero telemetry</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
