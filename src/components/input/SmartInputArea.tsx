import { useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Zap,
  Image as ImageIcon,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  ScanLine,
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
        `Notice parsed via ${result.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Offline Heuristic Engine'} & synced!`,
        'success'
      );
    } catch {
      showToast('Extraction failed. Check format or try another input.', 'error');
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
      showToast(`OCR scan completed: ${preset.filename}`, 'info');
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedOcrFilename(file.name);
    setIsScanningOcr(true);

    setTimeout(() => {
      setIsScanningOcr(false);
      const simulatedText = `[OCR SCAN RESULT: ${file.name}]
ANNUAL CAMPUS LAB VIVA & EXAMINATION
Date: ${new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]}
Time: 10:00 AM
Venue: Tech Block Lab 301
Prerequisites:
• Bring lab observation record & college ID
• Carry laptop
Official circular from Faculty Coordinator (Prof. K. Verma)`;
      setInputText(simulatedText);
      showToast(`Optical text recognized: ${file.name}`, 'success');
    }, 700);
  };

  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4" aria-label="Smart extraction terminal">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <ClipboardList size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Smart Notice Parser & Poster Scanner
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Paste forwarded WhatsApp messages, email circulars, or scan flyer images
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Input mode selector">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 Text / WhatsApp
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ocr'}
            onClick={() => setActiveTab('ocr')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'ocr'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" aria-hidden="true" />
            <span>📁 Poster OCR Scanner</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Text & WhatsApp Forward */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste forwarded WhatsApp notices, email circulars, exam room updates, or fest poster captions..."
            className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition resize-y placeholder:text-slate-400"
            aria-label="Paste notice text here"
          />

          {/* Sample Input Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
              <Zap size={14} className="text-amber-500" />
              1-Click Demo Inputs:
            </span>
            {sampleMessyInputs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition font-semibold shadow-xs"
                aria-label={`Load sample forward: ${sample.label}`}
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

          {/* Dropzone with laser scanning effect */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            aria-label="Click or drop an event poster image"
          >
            {isScanningOcr && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent scanner-beam pointer-events-none" />
            )}

            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs group-hover:scale-105 transition">
              <UploadCloud className="w-5 h-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {selectedOcrFilename ? `Scanned File: ${selectedOcrFilename}` : 'Drop Event Poster / Flyer Screenshot, or Click to Browse'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulates optical character recognition (OCR) and layout entity detection
              </p>
            </div>
          </div>

          {/* 3 OCR Mock Demo Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ScanLine size={14} className="text-indigo-600" />
              Test 3 Poster OCR Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ocrMockPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleOcrPresetClick(preset)}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl text-left transition flex flex-col justify-between space-y-1.5 shadow-xs"
                  aria-label={`Load OCR scenario: ${preset.label}`}
                >
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md w-max">
                    {preset.badge}
                  </span>
                  <span className="text-sm font-bold text-slate-900 leading-snug">{preset.label}</span>
                  <span className="text-xs font-mono text-slate-500 truncate">{preset.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {inputText && !isScanningOcr && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700">OCR Extracted Text Buffer:</span>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 resize-y"
                aria-label="OCR Raw text buffer"
              />
            </div>
          )}
        </div>
      )}

      {/* Extract Button Row */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500 font-medium">
          {inputText ? `${inputText.length} characters ready` : 'Zero-Key Offline Heuristic Engine + Gemini Fallback'}
        </span>

        <button
          type="button"
          onClick={() => handleExtract()}
          disabled={isExtracting || isScanningOcr || !inputText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Parse and add notice to calendar feed"
        >
          {isExtracting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Parsing Entities...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} aria-hidden="true" />
              <span>Parse & Add to Feed</span>
            </>
          )}
        </button>
      </div>

      {/* Extraction Preview Card */}
      {previewResult && (
        <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-200 text-xs space-y-2 animate-in fade-in" role="status" aria-label="Extraction result preview">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Extracted Structured Notice</h3>
            <div className="flex items-center gap-2">
              {previewResult.verificationStatus === 'Official' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Official Source ({previewResult.verificationScore}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  Community Forward ({previewResult.verificationScore}%)
                </span>
              )}
              <span className="font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-[10px] border border-slate-200">
                {previewResult.source === 'gemini' ? '⚡ Gemini 3.8 Flash' : '🛡️ Offline NLP'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-indigo-100 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 block">Title</span>
              <span className="font-semibold text-slate-900 truncate block">{previewResult.title}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Date & Time</span>
              <span className="font-semibold text-slate-900 block">
                {previewResult.date || 'TBD'} {previewResult.time ? `@ ${previewResult.time}` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Venue</span>
              <span className="font-semibold text-slate-900 truncate block">{previewResult.venue || 'TBD'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Category</span>
              <span className="font-semibold text-slate-900 block">{previewResult.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
