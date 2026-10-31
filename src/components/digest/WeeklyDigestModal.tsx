import { useState } from 'react';
import { Copy, Check, FileText, Share2 } from 'lucide-react';
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
      showToast('Weekly digest copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="What Do I Need to Know This Week?"
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>Tailored for {context.year} Year {context.branch} • Mode: {context.focusMode}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
            aria-label="Copy Clean WhatsApp Summary"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Clean WhatsApp Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted digest preview in monospace card */}
        <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed border border-gray-800 shadow-inner max-h-[60vh]">
          {digestText}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

