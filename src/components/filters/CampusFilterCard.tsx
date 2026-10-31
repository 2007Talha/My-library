import { Search, X, Pin, Bookmark, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import type { Branch, Year, Category, UrgencyFilter, ViewMode } from '../../types/notice';

interface CampusFilterCardProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  selectedYear: Year | 'All';
  onYearChange: (year: Year | 'All') => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  selectedUrgency: UrgencyFilter;
  onUrgencyChange: (urgency: UrgencyFilter) => void;
  isPinnedOnly: boolean;
  onTogglePinnedOnly: () => void;
  isSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const BRANCHES: { value: Branch; label: string }[] = [
  { value: 'All', label: 'All Departments' },
  { value: 'CSE', label: 'CSE (Computer Science)' },
  { value: 'ECE', label: 'ECE (Electronics)' },
  { value: 'ME', label: 'ME (Mechanical)' },
  { value: 'EE', label: 'EE (Electrical)' },
  { value: 'CE', label: 'CE (Civil)' },
];

const YEARS: { value: Year | 'All'; label: string }[] = [
  { value: 'All', label: 'All Semesters / Years' },
  { value: '1st', label: '1st Year (Sem 1-2)' },
  { value: '2nd', label: '2nd Year (Sem 3-4)' },
  { value: '3rd', label: '3rd Year (Sem 5-6)' },
  { value: '4th', label: '4th Year (Sem 7-8)' },
];

const CATEGORIES: { value: Category | 'All'; label: string }[] = [
  { value: 'All', label: 'All Sections' },
  { value: 'Academic', label: 'Academic & Labs' },
  { value: 'Placement', label: 'Placements & Jobs' },
  { value: 'Events/Fest', label: 'Campus Events & Fests' },
  { value: 'Clubs', label: 'Clubs & Societies' },
  { value: 'Admin/Exam', label: 'Official Circulars & Exams' },
];

const URGENCIES: { value: UrgencyFilter; label: string }[] = [
  { value: 'All', label: 'All Priorities' },
  { value: 'Urgent', label: 'Urgent Priority' },
  { value: 'Upcoming', label: 'Upcoming Priority' },
  { value: 'Expired', label: 'Archived / Expired' },
];

export default function CampusFilterCard({
  searchQuery,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  selectedYear,
  onYearChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  isPinnedOnly,
  onTogglePinnedOnly,
  isSavedOnly,
  onToggleSavedOnly,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  onResetFilters,
  hasActiveFilters,
}: CampusFilterCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
      {/* Search Input Bar inside Card */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search keywords, subjects, faculty names, venues..."
          className="w-full pl-10 pr-9 py-2.5 text-sm font-medium bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition placeholder:text-slate-400"
          aria-label="Filter notices by keywords"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* 4 Dropdown Selects in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Department / Branch */}
        <div>
          <label htmlFor="filter-branch" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            DEPARTMENT / BRANCH
          </label>
          <select
            id="filter-branch"
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value as Branch)}
            className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          >
            {BRANCHES.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Semester / Year */}
        <div>
          <label htmlFor="filter-year" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            SEMESTER / YEAR
          </label>
          <select
            id="filter-year"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value as Year | 'All')}
            className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          >
            {YEARS.map(y => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
        </div>

        {/* Section / Category */}
        <div>
          <label htmlFor="filter-category" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            SECTION / CATEGORY
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category | 'All')}
            className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Priority Level */}
        <div>
          <label htmlFor="filter-priority" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            PRIORITY LEVEL
          </label>
          <select
            id="filter-priority"
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value as UrgencyFilter)}
            className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          >
            {URGENCIES.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Card Footer: Count & Quick Action Toggles */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 text-xs">
        <span className="font-semibold text-slate-500">
          Showing <strong className="text-slate-800 font-bold">{totalFilteredCount}</strong> published updates
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pinned Only Toggle */}
          <button
            type="button"
            onClick={onTogglePinnedOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
              isPinnedOnly
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            aria-pressed={isPinnedOnly}
          >
            <Pin size={13} className={isPinnedOnly ? 'fill-amber-600 text-amber-600' : 'text-slate-400'} />
            <span>Pinned Only</span>
          </button>

          {/* Saved Only Toggle */}
          <button
            type="button"
            onClick={onToggleSavedOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
              isSavedOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            aria-pressed={isSavedOnly}
          >
            <Bookmark size={13} className={isSavedOnly ? 'fill-blue-600 text-blue-600' : 'text-slate-400'} />
            <span>Saved Only</span>
          </button>

          {/* Calendar View Toggle */}
          <button
            type="button"
            onClick={() => onViewModeChange(viewMode === 'grid' ? 'calendar' : 'grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon size={13} />
            <span>{viewMode === 'calendar' ? 'Grid View' : 'Calendar View'}</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
