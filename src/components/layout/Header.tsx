import { GraduationCap, Settings, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
  onResetData: () => void;
}

export default function Header({ onOpenApiKeyModal, onResetData }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" role="banner">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <GraduationCap size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Campus Pulse</h1>
            <p className="text-xs text-indigo-200">Intelligent Campus Notice Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Reset to sample data"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Configure Gemini API key"
          >
            <Settings size={14} aria-hidden="true" />
            <span className="hidden sm:inline">API Key</span>
          </button>
        </div>
      </div>
    </header>
  );
}

