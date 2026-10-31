import { useState, useCallback } from 'react';
import { ClipboardPaste, Sparkles, Loader2, Zap } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitizer';
import { extractNotice } from '../../utils/smartExtractor';
import type { Notice, ExtractionResult } from '../../types/notice';
import { classifyUrgency, computePriorityScore } from '../../utils/priorityEngine';
import type { StudentContext } from '../../types/notice';
import { sampleMessyInputs } from '../../data/sampleNotices';
import { showToast } from '../common/Modal';

interface SmartInputAreaProps {
  onNoticeExtracted: (notice: Notice, isCorrigendum: boolean) => void;
  apiKey: string;
  context: StudentContext;
}

export default function SmartInputArea({ onNoticeExtracted, apiKey, context }: SmartInputAreaProps) {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewResult, setPreviewResult] = useState<ExtractionResult | null>(null);

  const handleExtract = useCallback(async () => {
    const raw = inputText.trim();
    if (!raw) {
      showToast('Please paste or type a notice first', 'error');
      return;
    }

    setIsExtracting(true);
    setPreviewResult(null);

    try {
      const sanitized = sanitizeInput(raw);
      const result = await extractNotice(sanitized, apiKey || undefined);
      setPreviewResult(result);

      const urgency = classifyUrgency(result.date);
      const notice: Notice = {
        id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...result,
        rawText: sanitized,
        urgency,
        priorityScore: 0,
        updatesNoticeId: null,
        createdAt: new Date().toISOString(),
        updatedBadge: false,
      };
      notice.priorityScore = computePriorityScore(notice, context);

      onNoticeExtracted(notice, result.isCorrigendum);
      setInputText('');
      setPreviewResult(null);
      showToast(
        `Notice extracted via ${result.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Offline Heuristic NLP'} and added!`,
        'success'
      );
    } catch {
      showToast('Failed to extract notice. Please try again.', 'error');
    } finally {
      setIsExtracting(false);
    }
  }, [inputText, apiKey, context, onNoticeExtracted]);

  const handleSampleClick = useCallback((text: string) => {
    setInputText(text);
    setPreviewResult(null);
  }, []);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4" aria-label="Smart notice input">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardPaste size={18} className="text-indigo-500" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">Smart Input</h2>
        <span className="text-xs text-gray-500">Paste any messy notice, email, or WhatsApp forward</span>
      </div>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste a campus notice here... (e.g., a forwarded WhatsApp message, email, event poster caption)"
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
        aria-label="Paste notice text here"
      />

      {/* Sample Input Buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Zap size={14} className="text-amber-500" aria-hidden="true" />
        <span className="text-xs text-gray-500">Try a sample:</span>
        {sampleMessyInputs.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSampleClick(sample.text)}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            aria-label={`Load sample: ${sample.label}`}
          >
            {sample.emoji} {sample.label}
          </button>
        ))}
      </div>

      {/* Extract Button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={handleExtract}
          disabled={isExtracting || !inputText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Extract and add notice"
        >
          {isExtracting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Extracting...
            </>
          ) : (
            <>
              <Sparkles size={16} aria-hidden="true" />
              Extract & Add
            </>
          )}
        </button>
      </div>

      {/* Extraction Preview */}
      {previewResult && (
        <div className="mt-3 bg-indigo-50 rounded-lg p-3 border border-indigo-200" role="status" aria-label="Extraction result preview">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-indigo-800">Extracted Fields:</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-700">
              {previewResult.source === 'gemini' ? '⚡ Gemini 3.8 Flash' : '🛡️ Offline Heuristic NLP'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-gray-600">Title:</span>
            <span className="font-medium">{previewResult.title}</span>
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{previewResult.date || 'Not found'}</span>
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{previewResult.time || 'Not found'}</span>
            <span className="text-gray-600">Venue:</span>
            <span className="font-medium">{previewResult.venue || 'Not found'}</span>
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{previewResult.category}</span>
          </div>
        </div>
      )}
    </section>
  );
}

