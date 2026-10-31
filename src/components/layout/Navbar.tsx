import { Search, X, Sparkles, KeyRound, ChevronLeft, ChevronRight, Menu, Library } from 'lucide-react';
import type { StudentContext } from '../../types/notice';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  context: StudentContext;
  onContextChange: (context: StudentContext) => void;
  onOpenDigest: () => void;
  onOpenApiKeyModal: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  context,
  onContextChange,
  onOpenDigest,
  onOpenApiKeyModal,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: NavbarProps) {
  const isLow = context.lowAttendanceWarning;

  const toggleAttendance = () => {
    onContextChange({
      ...context,
      lowAttendanceWarning: !isLow,
      attendancePercentage: !isLow ? 68 : 86,
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs h-16 flex items-center px-4 sm:px-6 justify-between gap-4">
      {/* Left Branding & Sidebar Collapse */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            <Library size={18} />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg hidden sm:inline-block">
            my<span className="text-blue-600">library</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Center Wide Pill Search Bar (Unstop Style) */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notices, exams, hackathons, placements, venues..."
            className="w-full pl-10 pr-9 py-2 text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border border-slate-200 focus:border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition placeholder:text-slate-400"
            aria-label="Search notices"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions (Unstop Style) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Attendance radar pill toggle */}
        <button
          type="button"
          onClick={toggleAttendance}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
            isLow
              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Toggle attendance status to test triage"
        >
          <span>{isLow ? '⚠️ <75% Risk' : '🛡️ Attendance 86%'}</span>
        </button>

        {/* AI Digest pill (like "For Business" in Unstop) */}
        <button
          type="button"
          onClick={onOpenDigest}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 shadow-2xs transition cursor-pointer"
          aria-label="Open weekly executive digest"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span className="hidden sm:inline">AI Digest</span>
          <span className="sm:hidden">Digest</span>
        </button>

        {/* API Key button (like "Login" blue pill in Unstop) */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition cursor-pointer"
          aria-label="Configure API Key"
        >
          <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Configure API</span>
          <span className="md:hidden">Key</span>
        </button>
      </div>
    </header>
  );
}

