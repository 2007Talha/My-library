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
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
          <KeyRound className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-bold text-slate-100">Optional Cloud AI Enhancement</p>
            <p className="text-slate-400 leading-relaxed">
              Campus Pulse includes a 100% offline, deterministic heuristic NLP parser. Providing a Gemini API key enables high-level LLM extraction, but is completely optional.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="gemini-key-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Google Gemini API Key
          </label>
          <input
            id="gemini-key-input"
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="AIzaSy... or AQ.Ab8..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
            aria-label="Gemini API Key"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Security Notice: Stored strictly in local browser storage, never hardcoded in repository.</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 transition"
            aria-label="Remove stored API key"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition"
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
