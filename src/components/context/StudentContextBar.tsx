import { Users, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
  { value: 'Placements', label: 'Placements' },
  { value: 'Academics', label: 'Academics' },
  { value: 'HackathonsClubs', label: 'Hackathons & Clubs' },
];

export default function StudentContextBar({ context, onContextChange }: StudentContextBarProps) {
  return (
    <section
      className="bg-white border-b border-gray-200 shadow-sm"
      aria-label="Student profile context"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users size={16} className="text-indigo-500" aria-hidden="true" />
              <span>My Profile:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Branch Selector */}
              <label className="sr-only" htmlFor="branch-select">Branch</label>
              <select
                id="branch-select"
                value={context.branch}
                onChange={(e) => onContextChange({ ...context, branch: e.target.value as Branch })}
                className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                aria-label="Select your branch"
              >
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>
                ))}
              </select>

              {/* Year Selector */}
              <label className="sr-only" htmlFor="year-select">Year</label>
              <select
                id="year-select"
                value={context.year}
                onChange={(e) => onContextChange({ ...context, year: e.target.value as Year })}
                className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                aria-label="Select your year"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>

              {/* Focus Mode */}
              <label className="sr-only" htmlFor="focus-select">Focus Mode</label>
              <select
                id="focus-select"
                value={context.focusMode}
                onChange={(e) => onContextChange({ ...context, focusMode: e.target.value as FocusMode })}
                className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                aria-label="Select focus mode"
              >
                {FOCUS_MODES.map(fm => (
                  <option key={fm.value} value={fm.value}>{fm.label}</option>
                ))}
              </select>

              {/* Attendance Triage Toggle */}
              <button
                type="button"
                onClick={() => {
                  const isNowLow = !context.lowAttendanceWarning;
                  onContextChange({
                    ...context,
                    lowAttendanceWarning: isNowLow,
                    attendancePercentage: isNowLow ? 68 : 86,
                  });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
                  context.lowAttendanceWarning
                    ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 ring-2 ring-red-400/20'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                aria-pressed={context.lowAttendanceWarning}
                title={
                  context.lowAttendanceWarning
                    ? 'Low attendance mode is ACTIVE (<75%). Makeup classes and labs are heavily boosted!'
                    : 'Click to simulate low attendance warning (<75%) and test conflict triage'
                }
              >
                {context.lowAttendanceWarning ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" aria-hidden="true" />
                    <span>⚠️ Attendance: &lt;75% (Critical)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Attendance: {context.attendancePercentage || 85}% (Good)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Demo Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            <Zap size={14} className="text-amber-500 shrink-0" aria-hidden="true" />
            <span className="text-xs text-gray-500 mr-1 shrink-0">Personas:</span>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onContextChange(preset.context)}
                className="text-xs px-2 py-1 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                aria-label={`Apply preset: ${preset.label}`}
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

