import { useState } from 'react';
import {
  Library,
  Zap,
  Sparkles,
  KeyRound,
  RotateCcw,
  X,
  Menu,
  GraduationCap,
} from 'lucide-react';
import type { StudentContext, Branch, Year, FocusMode } from '../../types/notice';
import { demoPresets } from '../../data/sampleNotices';

interface SidebarProps {
  context: StudentContext;
  onContextChange: (context: StudentContext) => void;
  onOpenApiKeyModal: () => void;
  onOpenDigest: () => void;
  onResetData: () => void;
}

const BRANCHES: Branch[] = ['All', 'CSE', 'ECE', 'ME', 'EE', 'CE'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];
const FOCUS_MODES: { value: FocusMode; label: string }[] = [
  { value: 'All', label: 'All Updates' },
  { value: 'Placements', label: 'Placements & Hiring' },
  { value: 'Academics', label: 'Academics & Labs' },
  { value: 'HackathonsClubs', label: 'Hackathons & Clubs' },
];

export default function Sidebar({
  context,
  onContextChange,
  onOpenApiKeyModal,
  onOpenDigest,
  onResetData,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLow = context.lowAttendanceWarning;

  const toggleAttendance = () => {
    onContextChange({
      ...context,
      lowAttendanceWarning: !isLow,
      attendancePercentage: !isLow ? 68 : 86,
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-5 space-y-6 overflow-y-auto">
      {/* Top Branding */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0">
              <Library className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                My <span className="text-indigo-600">Library</span>
              </span>
              <p className="text-xs font-medium text-slate-500">
                Student Life Portal
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary AI Summary Action */}
        <button
          type="button"
          onClick={() => {
            onOpenDigest();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer group"
          aria-label="What do I need to know this week?"
        >
          <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" aria-hidden="true" />
          <span>What do I need to know this week?</span>
        </button>

        {/* Active Student Persona & Context Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Student Profile</span>
            </div>
            <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">Active</span>
          </div>

          {/* Selectors */}
          <div className="space-y-3">
            <div>
              <label htmlFor="sidebar-branch" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Department / Branch
              </label>
              <select
                id="sidebar-branch"
                value={context.branch}
                onChange={(e) => onContextChange({ ...context, branch: e.target.value as Branch })}
                className="w-full text-sm font-medium bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer shadow-xs"
                aria-label="Select student department"
              >
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Departments' : `${b} Department`}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sidebar-year" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Academic Year
              </label>
              <select
                id="sidebar-year"
                value={context.year}
                onChange={(e) => onContextChange({ ...context, year: e.target.value as Year })}
                className="w-full text-sm font-medium bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer shadow-xs"
                aria-label="Select academic graduation year"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sidebar-focus" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Priority Focus Mode
              </label>
              <select
                id="sidebar-focus"
                value={context.focusMode}
                onChange={(e) => onContextChange({ ...context, focusMode: e.target.value as FocusMode })}
                className="w-full text-sm font-medium bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer shadow-xs"
                aria-label="Select priority focus mode"
              >
                {FOCUS_MODES.map(fm => (
                  <option key={fm.value} value={fm.value}>{fm.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Attendance Triage Shield */}
          <div className="pt-2">
            <button
              type="button"
              onClick={toggleAttendance}
              className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer ${
                isLow
                  ? 'bg-red-50 border-red-300 hover:bg-red-100/80 attendance-alert-pulse text-red-900'
                  : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100/80 text-emerald-950'
              }`}
              aria-pressed={isLow}
              title="Click to toggle attendance status (<75% low vs safe) to test conflict triage"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isLow ? '⚠️ Low Attendance (<75%)' : '🛡️ Attendance Normal'}
                </span>
                <span className="text-sm font-extrabold font-mono">
                  {context.attendancePercentage || 86}%
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {isLow
                  ? 'Academic labs & classes boosted to Urgent. Fests deprioritized.'
                  : 'Normal priority across all categories.'}
              </p>
            </button>
          </div>
        </div>

        {/* 1-Click Personas */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Zap size={14} className="text-amber-500" aria-hidden="true" />
            <span>1-Click Personas</span>
          </div>
          <div className="space-y-2">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onContextChange(preset.context);
                  setIsMobileOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                aria-label={`Switch persona to: ${preset.label}`}
                title={preset.description}
              >
                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                  {preset.label}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Utility Controls */}
      <div className="pt-4 space-y-2">
        <button
          type="button"
          onClick={() => {
            onOpenApiKeyModal();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition shadow-xs"
          aria-label="Configure Gemini API Key"
        >
          <KeyRound size={15} className="text-slate-500" />
          <span>Configure API Key</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onResetData();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          aria-label="Reset campus notices back to default state"
        >
          <RotateCcw size={15} />
          <span>Reset Sample Data</span>
        </button>

        <div className="text-xs text-slate-400 text-center pt-2">
          Client-Side Privacy Engine
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Library className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-base">
            My <span className="text-indigo-600">Library</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAttendance}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isLow
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {isLow ? '⚠️ <75%' : '🛡️ 86%'}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Open navigation sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Sticky Left Sidebar */}
      <aside
        className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-30"
        aria-label="Primary application sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation sidebar"
        >
          <div
            className="w-80 max-w-[85vw] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
