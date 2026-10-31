import { useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Zap,
  Image as ImageIcon,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  Terminal,
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
    <section className="glass-panel-elevated rounded-2xl p-5 space-y-4" aria-label="Smart extraction terminal">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Terminal size={16} className="text-indigo-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Smart Input & Poster OCR Terminal
            </h2>
            <p className="text-[11px] text-slate-400">
              Paste chaotic text, raw forwards, or scan event flyers with OCR
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="inline-flex rounded-xl border border-slate-700/80 bg-slate-950/80 p-1" role="tablist" aria-label="Input mode selector">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Text / WhatsApp
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ocr'}
            onClick={() => setActiveTab('ocr')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'ocr'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            placeholder="Paste forwarded WhatsApp notices, email circulars, exam room updates, or fest poster captions..."
            className="w-full h-32 px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition resize-y placeholder:text-slate-500"
            aria-label="Paste notice text here"
          />

          {/* Sample Input Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Zap size={12} className="text-amber-400" />
              1-Click Demo Messy Forwards:
            </span>
            {sampleMessyInputs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
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
            className="relative overflow-hidden border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-950/60 hover:bg-slate-950/80 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            aria-label="Click or drop an event poster image"
          >
            {isScanningOcr && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent scanner-beam pointer-events-none" />
            )}

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200">
                {selectedOcrFilename ? `Scanned File: ${selectedOcrFilename}` : 'Drop Event Poster / Flyer Screenshot, or Click to Browse'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulates full optical character recognition & entity coordinate bounding
              </p>
            </div>
          </div>

          {/* 3 OCR Mock Demo Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ScanLine size={12} className="text-cyan-400" />
              Test 3 Poster OCR Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ocrMockPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleOcrPresetClick(preset)}
                  className="p-3 bg-slate-950/80 border border-slate-700/80 hover:border-indigo-500/60 hover:bg-slate-900 rounded-xl text-left transition flex flex-col justify-between space-y-1.5"
                  aria-label={`Load OCR scenario: ${preset.label}`}
                >
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md w-max">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-200 leading-snug">{preset.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">{preset.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {inputText && !isScanningOcr && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold text-slate-400">OCR Extracted Text Buffer:</span>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 resize-y"
                aria-label="OCR Raw text buffer"
              />
            </div>
          )}
        </div>
      )}

      {/* Extract Button Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-[11px] text-slate-400">
          {inputText ? `${inputText.length} chars ready` : '100% Offline-Ready Heuristic + Cloud AI Fallback'}
        </span>

        <button
          type="button"
          onClick={() => handleExtract()}
          disabled={isExtracting || isScanningOcr || !inputText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Parse and add notice to calendar feed"
        >
          {isExtracting ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              <span>Parsing Entities...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} aria-hidden="true" />
              <span>Parse & Add to Feed</span>
            </>
          )}
        </button>
      </div>

      {/* Extraction Preview Card */}
      {previewResult && (
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-indigo-500/30 text-xs space-y-2 animate-in fade-in" role="status" aria-label="Extraction result preview">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200">Extracted Structured Notice</h3>
            <div className="flex items-center gap-2">
              {previewResult.verificationStatus === 'Official' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  Official Source ({previewResult.verificationScore}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  Community Forward ({previewResult.verificationScore}%)
                </span>
              )}
              <span className="font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                {previewResult.source === 'gemini' ? '⚡ Gemini 3.8 Flash' : '🛡️ Offline NLP'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block">Title</span>
              <span className="font-semibold truncate block">{previewResult.title}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Date & Time</span>
              <span className="font-semibold block">
                {previewResult.date || 'TBD'} {previewResult.time ? `@ ${previewResult.time}` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Venue</span>
              <span className="font-semibold truncate block">{previewResult.venue || 'TBD'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Category</span>
              <span className="font-semibold block">{previewResult.category}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
