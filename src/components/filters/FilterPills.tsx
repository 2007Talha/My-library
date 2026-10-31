import {
  Sparkles,
  RotateCcw,
  BookOpen,
  Briefcase,
  Compass,
  FileText,
  Layers,
  Flame,
  Clock3,
  History,
} from 'lucide-react';
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

const CATEGORIES: { value: Category | 'All'; label: string }[] = [
  { value: 'All', label: 'All Categories' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Placement', label: 'Placement' },
  { value: 'Events/Fest', label: 'Events/Fest' },
  { value: 'Clubs', label: 'Clubs' },
  { value: 'Admin/Exam', label: 'Admin/Exam' },
];

const URGENCIES: { value: UrgencyFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Expired', label: 'Expired' },
];

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
  const getCategoryIcon = (cat: Category | 'All') => {
    switch (cat) {
      case 'All':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Academic':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Placement':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Events/Fest':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Clubs':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Admin/Exam':
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyIcon = (urg: UrgencyFilter) => {
    switch (urg) {
      case 'Urgent':
        return <Flame className="w-3.5 h-3.5 text-red-500" />;
      case 'Upcoming':
        return <Clock3 className="w-3.5 h-3.5 text-amber-500" />;
      case 'Expired':
        return <History className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Pills & Profile Toggle */}
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Notice category and profile filters">
        {/* Profile relevance toggle pill */}
        <button
          type="button"
          onClick={() => onRelevantOnlyToggle(!relevantOnly)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition ${
            relevantOnly
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70'
          }`}
          aria-pressed={relevantOnly}
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>Relevant to My Profile</span>
        </button>

        {/* Categories */}
        {CATEGORIES.map(({ value, label }) => {
          const isActive = selectedCategory === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onCategoryChange(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
              }`}
              aria-pressed={isActive}
            >
              {getCategoryIcon(value)}
              <span>{label}</span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Urgency Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-sm" role="toolbar" aria-label="Notice urgency filters">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs mr-1">Timeline:</span>
        {URGENCIES.map(({ value, label }) => {
          const isActive = selectedUrgency === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onUrgencyChange(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
              }`}
              aria-pressed={isActive}
            >
              {getUrgencyIcon(value)}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
