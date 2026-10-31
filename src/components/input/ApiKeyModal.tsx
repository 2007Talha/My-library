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
    }, 800);
  };

  const handleClear = () => {
    setKeyValue('');
    onSaveApiKey('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Gemini API Key" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
          <KeyRound className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">Optional Cloud AI Enhancement</p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Campus Pulse includes a 100% offline, deterministic heuristic NLP parser. Providing a Gemini API key enables high-level LLM extraction, but is completely optional.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="gemini-key-input" className="block text-sm font-semibold text-gray-700">
            Google Gemini API Key
          </label>
          <input
            id="gemini-key-input"
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            aria-label="Gemini API Key"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>Security Notice: Your key is kept strictly in your local browser storage and is never sent to any server.</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            aria-label="Remove stored API key"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm"
              aria-label="Save API key"
            >
              {showSavedNotification ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Saved!
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
