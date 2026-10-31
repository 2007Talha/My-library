import { useState, useMemo } from 'react';
import type { StudentContext, Category, UrgencyFilter, Notice, ViewMode } from './types/notice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotices } from './hooks/useNotices';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 bg-light-grid selection:bg-indigo-600 selection:text-white">
      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Left Sidebar Navigation & Student Identity Deck */}
      <Sidebar
        context={context}
        onContextChange={(newContext) => {
          setContext(newContext);
          showToast(`Persona updated: ${newContext.year} Year ${newContext.branch}`, 'info');
        }}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenDigest={() => setIsDigestOpen(true)}
        onResetData={handleResetAllData}
      />

      {/* Main Studio Feed Area on the Right */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Hero Spotlight: Needs Attention Today + Clash Triage */}
          <NeedsAttentionStrip notices={notices} clashes={clashes} />

          {/* Smart Input & OCR Extractor Terminal */}
          <SmartInputArea
            onNoticeExtracted={handleNoticeExtracted}
            apiKey={apiKey}
            context={context}
          />

          {/* Search, Filter & View Controls */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4" aria-label="Notice search and view controls">
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
      </div>

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
