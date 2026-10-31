import { Sparkles, RotateCcw } from 'lucide-react';
import type { Category, UrgencyFilter } from '../../types/notice';

interface FilterPillsProps {
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  selectedUrgency: UrgencyFilter;
  onUrgencyChange: (urgency: UrgencyFilter) => void;
  relevantOnly: boolean;
  onRelevantOnlyToggle: (enabled: boolean) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Academic',
  'Placement',
  'Events/Fest',
  'Clubs',
  'Admin/Exam',
];

const URGENCIES: UrgencyFilter[] = ['All', 'Urgent', 'Upcoming', 'Expired'];

export default function FilterPills({
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  relevantOnly,
  onRelevantOnlyToggle,
  onResetFilters,
  hasActiveFilters,
}: FilterPillsProps) {
  return (
    <div className="space-y-2.5">
      {/* Category Pills & Profile Toggle */}
      <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Notice category and profile filters">
        {/* Profile relevance toggle pill */}
        <button
          type="button"
          onClick={() => onRelevantOnlyToggle(!relevantOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
            relevantOnly
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              : 'bg-slate-900/90 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10'
          }`}
          aria-pressed={relevantOnly}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Relevant to My Profile</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block mx-1" aria-hidden="true" />

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-slate-100 text-slate-900 border-white shadow-xs font-bold'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
              aria-pressed={isActive}
            >
              {cat === 'All' ? 'All Domains' : cat}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-xl transition"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Urgency Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs" role="toolbar" aria-label="Notice urgency filters">
        <span className="text-slate-400 font-semibold mr-1 text-[11px]">Timeline:</span>
        {URGENCIES.map((urg) => {
          const isActive = selectedUrgency === urg;
          return (
            <button
              key={urg}
              type="button"
              onClick={() => onUrgencyChange(urg)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                isActive
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-xs'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              aria-pressed={isActive}
            >
              {urg}
            </button>
          );
        })}
      </div>
    </div>
  );
}
