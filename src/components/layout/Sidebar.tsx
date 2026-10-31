import {
  LayoutGrid,
  Calendar,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Plus,
  RotateCcw,
  Zap,
  X,
  User,
} from 'lucide-react';
import type { StudentContext, Branch, Year, FocusMode, ViewMode } from '../../types/notice';
import { demoPresets } from '../../data/sampleNotices';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  context: StudentContext;
  onContextChange: (context: StudentContext) => void;
  onScrollToInput: () => void;
  onScrollToAttention: () => void;
  onResetData: () => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const BRANCHES: Branch[] = ['All', 'CSE', 'ECE', 'ME', 'EE', 'CE'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];
const FOCUS_MODES: { value: FocusMode; label: string }[] = [
  { value: 'All', label: 'All Updates' },
  { value: 'Placements', label: 'Placements' },
  { value: 'Academics', label: 'Academics & Labs' },
  { value: 'HackathonsClubs', label: 'Fests & Clubs' },
];

export default function Sidebar({
  viewMode,
  onViewModeChange,
  context,
  onContextChange,
  onScrollToInput,
  onScrollToAttention,
  onResetData,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const isLow = context.lowAttendanceWarning;

  const toggleAttendance = () => {
    onContextChange({
      ...context,
      lowAttendanceWarning: !isLow,
      attendancePercentage: !isLow ? 68 : 86,
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-100">
          <span className="font-extrabold text-slate-900 text-base">Menu</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top "+ Post Notice" Action Button */}
        <button
          type="button"
          onClick={() => {
            onScrollToInput();
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs transition cursor-pointer ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
          title="Paste or scan new notice"
          aria-label="Paste or scan notice"
        >
          <Plus size={18} className="shrink-0" />
          {!isCollapsed && <span>Post Notice</span>}
        </button>

        {/* Clean Essential Navigation (Zero Fluff) */}
        <nav className="space-y-1" aria-label="Essential navigation">
          {/* Feed View */}
          <button
            type="button"
            onClick={() => {
              onViewModeChange('grid');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
            title="Campus Notice Feed"
          >
            <LayoutGrid size={18} className={viewMode === 'grid' ? 'text-blue-600 shrink-0' : 'text-slate-500 shrink-0'} />
            {!isCollapsed && <span>Notice Feed</span>}
          </button>

          {/* Calendar View */}
          <button
            type="button"
            onClick={() => {
              onViewModeChange('calendar');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
            title="Calendar Schedule Matrix"
          >
            <Calendar size={18} className={viewMode === 'calendar' ? 'text-blue-600 shrink-0' : 'text-slate-500 shrink-0'} />
            {!isCollapsed && <span>Calendar View</span>}
          </button>

          {/* Needs Attention Jump */}
          <button
            type="button"
            onClick={() => {
              onScrollToAttention();
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Jump to Needs Attention Today"
          >
            <Flame size={18} className="text-red-500 shrink-0" />
            {!isCollapsed && <span>Needs Attention</span>}
          </button>

          {/* Attendance Radar Toggle */}
          <button
            type="button"
            onClick={toggleAttendance}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isLow
                ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                : 'text-slate-700 hover:bg-slate-100'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
            title="Click to toggle low attendance warning"
          >
            {isLow ? (
              <AlertTriangle size={18} className="text-red-600 shrink-0 animate-bounce" />
            ) : (
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            )}
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Attendance Radar</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {isLow ? '<75% Risk' : '86% Safe'}
                </span>
              </div>
            )}
          </button>
        </nav>

        {/* Student Context Card (Expanded only) */}
        {!isCollapsed && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-blue-600" />
                Profile Context
              </span>
              <span className="text-blue-700 font-semibold">{context.branch} • {context.year}</span>
            </div>

            <div className="space-y-2">
              <div>
                <label htmlFor="sidebar-branch" className="block text-xs font-semibold text-slate-600 mb-1">
                  Department / Branch
                </label>
                <select
                  id="sidebar-branch"
                  value={context.branch}
                  onChange={(e) => onContextChange({ ...context, branch: e.target.value as Branch })}
                  className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  {BRANCHES.map(b => (
                    <option key={b} value={b}>{b === 'All' ? 'All Departments' : `${b} Dept`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sidebar-year" className="block text-xs font-semibold text-slate-600 mb-1">
                  Academic Year
                </label>
                <select
                  id="sidebar-year"
                  value={context.year}
                  onChange={(e) => onContextChange({ ...context, year: e.target.value as Year })}
                  className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y} Year</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sidebar-focus" className="block text-xs font-semibold text-slate-600 mb-1">
                  Focus Mode
                </label>
                <select
                  id="sidebar-focus"
                  value={context.focusMode}
                  onChange={(e) => onContextChange({ ...context, focusMode: e.target.value as FocusMode })}
                  className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  {FOCUS_MODES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Personas (Expanded only) */}
        {!isCollapsed && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Zap size={13} className="text-amber-500" />
              1-Click Demo Profiles:
            </span>
            <div className="space-y-1.5">
              {demoPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onContextChange(preset.context);
                    onCloseMobile();
                  }}
                  className="w-full text-left p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 transition text-xs group cursor-pointer"
                  title={preset.description}
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 leading-snug">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Reset & Status */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={() => {
            onResetData();
            onCloseMobile();
          }}
          className={`w-full flex items-center gap-2 p-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Reset to sample campus notices"
        >
          <RotateCcw size={14} />
          {!isCollapsed && <span>Reset Sample Data</span>}
        </button>

        {!isCollapsed && (
          <div className="text-[11px] text-slate-400 text-center">
            My Library • Privacy Engine
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white border-r border-slate-200/90 h-[calc(100vh-4rem)] sticky top-16 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-60 lg:w-64'
        }`}
        aria-label="Navigation sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-2xs md:hidden"
          onClick={onCloseMobile}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="w-72 max-w-[80vw] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
