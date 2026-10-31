import { useState, useCallback, useRef } from 'react';
import {
  ClipboardPaste,
  Sparkles,
  Loader2,
  Zap,
  Image as ImageIcon,
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitizer';
import { extractNotice } from '../../utils/smartExtractor';
import type { Notice, ExtractionResult } from '../../types/notice';
import { classifyUrgency, computePriorityScore } from '../../utils/priorityEngine';
import type { StudentContext } from '../../types/notice';
import { sampleMessyInputs, ocrMockPresets, type OcrMockPreset } from '../../data/sampleNotices';
import { showToast } from '../common/Modal';

interface SmartInputAreaProps {
  onNoticeExtracted: (notice: Notice, isCorrigendum: boolean) => void;
  apiKey: string;
  context: StudentContext;
}

export default function SmartInputArea({ onNoticeExtracted, apiKey, context }: SmartInputAreaProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'ocr'>('text');
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [previewResult, setPreviewResult] = useState<ExtractionResult | null>(null);
  const [selectedOcrFilename, setSelectedOcrFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = useCallback(async (customText?: string) => {
    const raw = (customText || inputText).trim();
    if (!raw) {
      showToast('Please paste or scan a notice first', 'error');
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
        verificationStatus: result.verificationStatus || 'Official',
        verificationScore: result.verificationScore || 85,
        verificationReason: result.verificationReason || 'Direct submission',
        isAttendanceRisk: result.category === 'Academic' || result.category === 'Admin/Exam',
        buddies: [],
      };
      notice.priorityScore = computePriorityScore(notice, context);

      onNoticeExtracted(notice, result.isCorrigendum);
      setInputText('');
      setPreviewResult(null);
      setSelectedOcrFilename(null);
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

  const handleOcrPresetClick = (preset: OcrMockPreset) => {
    setSelectedOcrFilename(preset.filename);
    setIsScanningOcr(true);
    setTimeout(() => {
      setIsScanningOcr(false);
      setInputText(preset.extractedText);
      showToast(`OCR scan complete for "${preset.filename}"!`, 'info');
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedOcrFilename(file.name);
    setIsScanningOcr(true);

    // Simulate OCR extraction from uploaded image
    setTimeout(() => {
      setIsScanningOcr(false);
      const simulatedText = `[OCR SCAN RESULT: ${file.name}]
ANNUAL CAMPUS EVENT & WORKSHOP
Date: ${new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]}
Time: 11:00 AM
Venue: Tech Auditorium Room 201
Prerequisites:
• Bring college ID card
• Carry laptop
Official circular from Department Coordinator`;
      setInputText(simulatedText);
      showToast(`Image scanned via OCR engine: ${file.name}`, 'success');
    }, 800);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4" aria-label="Smart notice input">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ClipboardPaste size={18} className="text-indigo-500" aria-hidden="true" />
          <h2 className="font-semibold text-gray-900">Smart Input & OCR Extractor</h2>
        </div>

        {/* Tab switch */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5" role="tablist" aria-label="Input mode selector">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === 'text' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 WhatsApp / Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ocr'}
            onClick={() => setActiveTab('ocr')}
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === 'ocr' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>📁 Poster OCR Mock</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Text & WhatsApp Forward */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste messy forwarded WhatsApp message, email notice, or event flyer text here..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
            aria-label="Paste notice text here"
          />

          {/* Sample Input Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Zap size={14} className="text-amber-500 shrink-0" aria-hidden="true" />
            <span className="text-xs text-gray-500">1-Click Presets:</span>
            {sampleMessyInputs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                aria-label={`Load sample: ${sample.label}`}
              >
                {sample.emoji} {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Poster OCR Dropzone & Presets */}
      {activeTab === 'ocr' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            aria-label="Upload event poster image"
          />

          {/* Drag & drop upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            aria-label="Click or drop an event poster image"
          >
            <UploadCloud className="w-8 h-8 text-indigo-500 mb-0.5" />
            <p className="text-xs font-semibold text-gray-800">
              {selectedOcrFilename ? `Loaded: ${selectedOcrFilename}` : 'Click to drop or upload Event Poster Image / Flyer'}
            </p>
            <p className="text-[11px] text-gray-500">
              Simulates optical character recognition (OCR) parsing from chaotic screenshot or poster flyers
            </p>
          </div>

          {/* 3 OCR Mock Demo Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Try OCR Poster Scans:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ocrMockPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleOcrPresetClick(preset)}
                  className="p-2.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-left transition flex flex-col justify-between"
                  aria-label={`Load OCR preset: ${preset.label}`}
                >
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded w-max mb-1">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 leading-snug">{preset.label}</span>
                  <span className="text-[10px] text-gray-400 mt-1 truncate">{preset.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OCR Scanning Progress Animation */}
          {isScanningOcr && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3 text-xs text-indigo-900 animate-pulse">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Scanning image optical characters & identifying schedule coordinates...</span>
            </div>
          )}

          {inputText && !isScanningOcr && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-600">OCR Extracted Text Buffer:</span>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 resize-y"
                aria-label="OCR Extracted raw text"
              />
            </div>
          )}
        </div>
      )}

      {/* Extract Button Row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {inputText ? `${inputText.length} characters ready` : 'Zero-key offline deterministic parsing'}
        </span>

        <button
          type="button"
          onClick={() => handleExtract()}
          disabled={isExtracting || isScanningOcr || !inputText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs"
          aria-label="Extract and add notice to calendar"
        >
          {isExtracting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} aria-hidden="true" />
              <span>Extract & Add to Feed</span>
            </>
          )}
        </button>
      </div>

      {/* Extraction Preview Card */}
      {previewResult && (
        <div className="mt-3 bg-indigo-50 rounded-xl p-3.5 border border-indigo-200 text-xs space-y-2" role="status" aria-label="Extraction result preview">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-indigo-950">Extracted Structured Notice</h3>
            <div className="flex items-center gap-1.5">
              {previewResult.verificationStatus === 'Official' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                  Official Source ({previewResult.verificationScore}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                  <ShieldAlert className="w-3 h-3 text-amber-600" aria-hidden="true" />
                  Community Forward ({previewResult.verificationScore}%)
                </span>
              )}
              <span className="font-semibold px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-[10px]">
                {previewResult.source === 'gemini' ? '⚡ Gemini 3.8 Flash' : '🛡️ Offline NLP'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-gray-500 block">Title</span>
              <span className="font-semibold text-gray-900 truncate block">{previewResult.title}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Date & Time</span>
              <span className="font-semibold text-gray-900">
                {previewResult.date || 'TBD'} {previewResult.time ? `@ ${previewResult.time}` : ''}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Venue</span>
              <span className="font-semibold text-gray-900 truncate block">{previewResult.venue || 'TBD'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Category</span>
              <span className="font-semibold text-gray-900">{previewResult.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
