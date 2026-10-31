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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            relevantOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
          }`}
          aria-pressed={relevantOnly}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Relevant to My Profile</span>
        </button>

        <div className="h-4 w-px bg-gray-200 hidden sm:block mx-1" aria-hidden="true" />

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              aria-pressed={isActive}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Urgency Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs" role="toolbar" aria-label="Notice urgency filters">
        <span className="text-gray-500 font-medium mr-1 text-[11px]">Urgency:</span>
        {URGENCIES.map((urg) => {
          const isActive = selectedUrgency === urg;
          return (
            <button
              key={urg}
              type="button"
              onClick={() => onUrgencyChange(urg)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium border transition ${
                isActive
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
