import { Zap, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import type { StudentContext, Branch, Year, FocusMode } from '../../types/notice';
import { demoPresets } from '../../data/sampleNotices';

interface StudentContextBarProps {
  context: StudentContext;
  onContextChange: (context: StudentContext) => void;
}

const BRANCHES: Branch[] = ['All', 'CSE', 'ECE', 'ME', 'EE', 'CE'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];
const FOCUS_MODES: { value: FocusMode; label: string }[] = [
  { value: 'All', label: 'All Updates' },
  { value: 'Placements', label: 'Placements & Hiring' },
  { value: 'Academics', label: 'Academics & Labs' },
  { value: 'HackathonsClubs', label: 'Hackathons & Clubs' },
];

export default function StudentContextBar({ context, onContextChange }: StudentContextBarProps) {
  const isLow = context.lowAttendanceWarning;

  const toggleAttendance = () => {
    onContextChange({
      ...context,
      lowAttendanceWarning: !isLow,
      attendancePercentage: !isLow ? 68 : 86,
    });
  };

  return (
    <section
      className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md"
      aria-label="Student identity and context deck"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Active Profile Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200">
              <UserCheck size={14} className="text-indigo-400" aria-hidden="true" />
              <span>Active Persona:</span>
            </div>

            {/* Branch */}
            <div className="relative">
              <label className="sr-only" htmlFor="branch-select">Branch</label>
              <select
                id="branch-select"
                value={context.branch}
                onChange={(e) => onContextChange({ ...context, branch: e.target.value as Branch })}
                className="text-xs font-semibold bg-slate-950/90 text-slate-200 border border-slate-700 hover:border-indigo-400 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                aria-label="Select student branch"
              >
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Departments' : `${b} Dept`}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="relative">
              <label className="sr-only" htmlFor="year-select">Year</label>
              <select
                id="year-select"
                value={context.year}
                onChange={(e) => onContextChange({ ...context, year: e.target.value as Year })}
                className="text-xs font-semibold bg-slate-950/90 text-slate-200 border border-slate-700 hover:border-indigo-400 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                aria-label="Select student graduation year"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>
            </div>

            {/* Focus Mode */}
            <div className="relative">
              <label className="sr-only" htmlFor="focus-select">Focus Mode</label>
              <select
                id="focus-select"
                value={context.focusMode}
                onChange={(e) => onContextChange({ ...context, focusMode: e.target.value as FocusMode })}
                className="text-xs font-semibold bg-slate-950/90 text-slate-200 border border-slate-700 hover:border-indigo-400 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                aria-label="Select active focus mode"
              >
                {FOCUS_MODES.map(fm => (
                  <option key={fm.value} value={fm.value}>{fm.label}</option>
                ))}
              </select>
            </div>

            {/* Attendance Triage Toggle Pill */}
            <button
              type="button"
              onClick={toggleAttendance}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isLow
                  ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 ring-2 ring-red-500/30 attendance-alert-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
              aria-pressed={isLow}
              title="Click to toggle attendance status simulation (<75% low vs safe)"
            >
              {isLow ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" aria-hidden="true" />
                  <span>⚠️ Attendance: &lt;75% (Critical Triage)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Attendance: {context.attendancePercentage || 86}% (Normal)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Persona Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-1">
              <Zap size={13} className="text-amber-400" aria-hidden="true" />
              <span>1-Click Personas:</span>
            </div>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onContextChange(preset.context)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                aria-label={`Switch persona to: ${preset.label}`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
