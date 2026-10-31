import { useState } from 'react';
import { KeyRound, ShieldAlert, Check } from 'lucide-react';
import Modal from '../common/Modal';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}: ApiKeyModalProps) {
  const [keyValue, setKeyValue] = useState(apiKey);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSave = () => {
    onSaveApiKey(keyValue.trim());
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    setKeyValue('');
    onSaveApiKey('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Gemini 3.8 Flash API Key" size="md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
          <KeyRound className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs">Optional Cloud AI Enhancement</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              My Library includes a 100% offline, deterministic heuristic NLP parser. Providing a Gemini API key enables high-level LLM extraction, but is completely optional.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="gemini-key-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Google Gemini API Key
          </label>
          <input
            id="gemini-key-input"
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="AIzaSy... or AQ.Ab8..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            aria-label="Gemini API Key"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>Security Notice: Stored strictly in local browser storage, never hardcoded in repository.</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 transition"
            aria-label="Remove stored API key"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              aria-label="Save API key"
            >
              {showSavedNotification ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Saved!</span>
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
