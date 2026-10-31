import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4" aria-hidden="true" />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notices by title, venue, checklist items..."
        className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition placeholder:text-gray-400"
        aria-label="Search campus notices"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" aria-hidden="true" />
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
