import { Search, X, Sparkles, KeyRound, ChevronLeft, ChevronRight, Menu, Library, Bookmark, Bell } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenDigest: () => void;
  onOpenApiKeyModal: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  savedCount?: number;
  urgentCount?: number;
  onToggleSavedOnly?: () => void;
  isSavedOnly?: boolean;
  onScrollToAttention?: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  onOpenDigest,
  onOpenApiKeyModal,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  savedCount = 0,
  urgentCount = 0,
  onToggleSavedOnly,
  isSavedOnly = false,
  onScrollToAttention,
}: NavbarProps) {
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
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            <Library size={19} />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-slate-900 tracking-tight text-base uppercase">
                MY LIBRARY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              CENTRALIZED COLLEGE PORTAL
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Center Wide Search Bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search circulars, assignments, events, notes..."
            className="w-full pl-10 pr-9 py-2 text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border border-slate-200 focus:border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition placeholder:text-slate-400"
            aria-label="Search notices and circulars"
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

      {/* Right Action Icons (Saved Bookmarks + Urgent Notifications + AI Digest + Settings) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Saved Bookmarks button */}
        {onToggleSavedOnly && (
          <button
            type="button"
            onClick={onToggleSavedOnly}
            className={`relative p-2 rounded-xl transition cursor-pointer ${
              isSavedOnly
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isSavedOnly ? 'Show all updates' : 'Show saved bookmarks'}
            aria-label="Filter saved bookmarks"
          >
            <Bookmark size={18} className={isSavedOnly ? 'fill-blue-600' : ''} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Bell button */}
        {onScrollToAttention && (
          <button
            type="button"
            onClick={onScrollToAttention}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Jump to urgent deadlines & clash notifications"
            aria-label="Urgent notifications"
          >
            <Bell size={18} />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {urgentCount}
              </span>
            )}
          </button>
        )}

        {/* AI Weekly Digest */}
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

        {/* Configure Key */}
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

