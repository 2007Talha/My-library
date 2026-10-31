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
      <div className="space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span>Targeted for: <strong className="text-slate-200">{context.year} Year {context.branch}</strong> ({context.focusMode})</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition shrink-0"
            aria-label="Copy Clean WhatsApp Summary"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy WhatsApp Clip</span>
              </>
            )}
          </button>
        </div>

        {/* Monospace terminal formatted digest preview */}
        <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-inner max-h-[60vh]">
          {digestText}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-500 text-[11px]">
          <span>Generated client-side with zero telemetry</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
