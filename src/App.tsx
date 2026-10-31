import { useState, useMemo } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
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
import BuddyMatcherModal from './components/notices/BuddyMatcherModal';
import { ViewToggle, ToastContainer, showToast } from './components/common/Modal';

const DEFAULT_CONTEXT: StudentContext = {
  branch: 'CSE',
  year: '3rd',
  focusMode: 'Placements',
  lowAttendanceWarning: false,
  attendancePercentage: 86,
};

export default function App() {
  const [context, setContext] = useLocalStorage<StudentContext>('campus-pulse-context', DEFAULT_CONTEXT);
  const envKey = (import.meta as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';
  const [apiKey, setApiKey] = useLocalStorage<string>('campus-pulse-gemini-key', envKey);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [activeBuddyNotice, setActiveBuddyNotice] = useState<Notice | null>(null);

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 bg-grid-pattern selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onResetData={handleResetAllData}
      />

      {/* Student Identity Deck & Attendance Bar */}
      <StudentContextBar
        context={context}
        onContextChange={(newContext) => {
          setContext(newContext);
          showToast(`Persona updated: ${newContext.year} Year ${newContext.branch}`, 'info');
        }}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Spotlight: Needs Attention Today + Clashes */}
        <NeedsAttentionStrip notices={notices} clashes={clashes} />

        {/* Action Hero Bar: AI Weekly Digest Co-Pilot */}
        <section className="glass-panel-elevated rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                AI Context-Aware Executive Dispatch
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Live intelligence indexed for <strong className="text-indigo-300">{context.year} Year {context.branch}</strong> (Focus: {context.focusMode})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDigestOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            aria-label="Generate weekly executive digest"
          >
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            <span>What do I need to know this week?</span>
          </button>
        </section>

        {/* Smart Input & OCR Extractor Terminal */}
        <SmartInputArea
          onNoticeExtracted={handleNoticeExtracted}
          apiKey={apiKey}
          context={context}
        />

        {/* Search, Filter & View Controls */}
        <section className="glass-panel rounded-2xl p-4 space-y-4" aria-label="Notice search and view controls">
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

        {/* Organized Multi-Modal View (Card Grid OR Calendar) */}
        {viewMode === 'grid' ? (
          <NoticeGrid
            notices={filteredNotices}
            context={context}
            clashes={clashes}
            getCheckedItems={getCheckedItems}
            onToggleChecklistItem={toggleChecklistItem}
            onDeleteNotice={(id) => {
              deleteNotice(id);
              showToast('Notice archived from feed', 'info');
            }}
            onOpenBuddyMatcher={(notice) => setActiveBuddyNotice(notice)}
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
          showToast('Existing card updated with corrigendum details!', 'success');
        }}
        onAddNew={(notice) => {
          addNotice(notice);
          showToast('Added as separate notice', 'success');
        }}
      />

      <BuddyMatcherModal
        isOpen={!!activeBuddyNotice}
        onClose={() => setActiveBuddyNotice(null)}
        notice={activeBuddyNotice}
        context={context}
        onUpdateNoticeBuddies={(noticeId, updatedBuddies) => {
          updateNotice(noticeId, { buddies: updatedBuddies });
          setActiveBuddyNotice(prev => prev && prev.id === noticeId ? { ...prev, buddies: updatedBuddies } : prev);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
