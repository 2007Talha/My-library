import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" aria-hidden="true" />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notices by keyword, lab room, venue, checklist item..."
        className="w-full pl-10 pr-9 py-2.5 text-sm font-medium bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition placeholder:text-slate-400"
        aria-label="Search campus notices"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
      {resultCount !== undefined && value && (
        <span className="sr-only" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'notice' : 'notices'} found
        </span>
      )}
    </div>
  );
}
