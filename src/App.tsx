import { useState, useMemo } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import type { StudentContext, Category, UrgencyFilter, Notice, ViewMode } from './types/notice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotices } from './hooks/useNotices';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StudentContextBar from './components/context/StudentContextBar';
import NeedsAttentionStrip from './components/notices/NeedsAttentionStrip';
import SmartInputArea from './components/input/SmartInputArea';
import SearchBar from './components/filters/SearchBar';
import FilterPills from './components/filters/FilterPills';
import NoticeGrid from './components/notices/NoticeGrid';
import CalendarView from './components/calendar/CalendarView';
import WeeklyDigestModal from './components/digest/WeeklyDigestModal';
import ApiKeyModal from './components/input/ApiKeyModal';
import CorrigendumMergeModal from './components/notices/CorrigendumMergeModal';
import { ViewToggle, ToastContainer, showToast } from './components/common/Modal';

const DEFAULT_CONTEXT: StudentContext = {
  branch: 'CSE',
  year: '3rd',
  focusMode: 'Placements',
};

export default function App() {
  const [context, setContext] = useLocalStorage<StudentContext>('campus-pulse-context', DEFAULT_CONTEXT);
  const envKey = (import.meta as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';
  const [apiKey, setApiKey] = useLocalStorage<string>('campus-pulse-gemini-key', envKey);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyFilter>('All');
  const [relevantOnly, setRelevantOnly] = useState(false);

  // Corrigendum modal state
  const [corrigendumState, setCorrigendumState] = useState<{
    isOpen: boolean;
    incoming: Notice | null;
    existing: Notice | null;
  }>({
    isOpen: false,
    incoming: null,
    existing: null,
  });

  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    findCorrigendumMatch,
    toggleChecklistItem,
    getCheckedItems,
    getFilteredNotices,
    clashes,
    resetToSampleData,
  } = useNotices(context);

  const filteredNotices = useMemo(() => {
    return getFilteredNotices(searchQuery, selectedCategory, selectedUrgency, relevantOnly);
  }, [getFilteredNotices, searchQuery, selectedCategory, selectedUrgency, relevantOnly]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'All' ||
    selectedUrgency !== 'All' ||
    relevantOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedUrgency('All');
    setRelevantOnly(false);
  };

  const handleNoticeExtracted = (notice: Notice, isCorrigendumFlag: boolean) => {
    if (isCorrigendumFlag) {
      const match = findCorrigendumMatch(notice.title);
      if (match) {
        setCorrigendumState({
          isOpen: true,
          incoming: notice,
          existing: match,
        });
        return;
      }
    }
    addNotice(notice);
  };

  const handleResetAllData = () => {
    if (window.confirm('Reset all campus notices back to initial sample demo data?')) {
      resetToSampleData();
      showToast('Sample campus data restored', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onResetData={handleResetAllData}
      />

      {/* Student Profile Context Switcher */}
      <StudentContextBar
        context={context}
        onContextChange={(newContext) => {
          setContext(newContext);
          showToast(`Profile updated: ${newContext.year} Year ${newContext.branch}`, 'info');
        }}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Hero Spotlight: Needs Attention Today + Clashes */}
        <NeedsAttentionStrip notices={notices} clashes={clashes} />

        {/* Top Action Bar: AI Digest Button */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-xl p-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              Campus Life Assistant
            </h2>
            <p className="text-xs text-indigo-700 mt-0.5">
              Filtered & prioritized for <span className="font-semibold">{context.year} Year {context.branch}</span> ({context.focusMode})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDigestOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition"
            aria-label="Generate weekly executive digest"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>What do I need to know this week?</span>
          </button>
        </section>

        {/* Smart Input Area with 4 Demo Presets */}
        <SmartInputArea
          onNoticeExtracted={handleNoticeExtracted}
          apiKey={apiKey}
          context={context}
        />

        {/* Search, Filter & View Controls */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4" aria-label="Notice search and view controls">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredNotices.length}
            />

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          <FilterPills
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            relevantOnly={relevantOnly}
            onRelevantOnlyToggle={setRelevantOnly}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </section>

        {/* Organized View (Card Grid OR Calendar) */}
        {viewMode === 'grid' ? (
          <NoticeGrid
            notices={filteredNotices}
            context={context}
            getCheckedItems={getCheckedItems}
            onToggleChecklistItem={toggleChecklistItem}
            onDeleteNotice={(id) => {
              deleteNotice(id);
              showToast('Notice removed', 'info');
            }}
          />
        ) : (
          <CalendarView notices={filteredNotices} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <WeeklyDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        notices={notices}
        context={context}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(key) => {
          setApiKey(key);
          showToast(key ? 'Gemini API key saved securely' : 'API key removed', 'success');
        }}
      />

      <CorrigendumMergeModal
        isOpen={corrigendumState.isOpen}
        onClose={() => setCorrigendumState({ isOpen: false, incoming: null, existing: null })}
        incomingNotice={corrigendumState.incoming}
        existingNotice={corrigendumState.existing}
        onMerge={(existingId, updates) => {
          updateNotice(existingId, updates);
          showToast('Existing notice updated with corrigendum details!', 'success');
        }}
        onAddNew={(notice) => {
          addNotice(notice);
          showToast('Added as separate notice', 'success');
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
