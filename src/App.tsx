import { useState, useMemo } from 'react';
import type { StudentContext, Category, UrgencyFilter, Notice, ViewMode } from './types/notice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotices } from './hooks/useNotices';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import NeedsAttentionStrip from './components/notices/NeedsAttentionStrip';
import SmartInputArea from './components/input/SmartInputArea';
import FilterPills from './components/filters/FilterPills';
import NoticeGrid from './components/notices/NoticeGrid';
import CalendarView from './components/calendar/CalendarView';
import WeeklyDigestModal from './components/digest/WeeklyDigestModal';
import ApiKeyModal from './components/input/ApiKeyModal';
import CorrigendumMergeModal from './components/notices/CorrigendumMergeModal';
import BuddyMatcherModal from './components/notices/BuddyMatcherModal';
import { ViewToggle } from './components/common/Modal';
import ToastContainer from './components/common/Toast';
import { showToast } from './utils/toast';

const DEFAULT_CONTEXT: StudentContext = {
  branch: 'CSE',
  year: '3rd',
  focusMode: 'Placements',
  lowAttendanceWarning: false,
  attendancePercentage: 86,
};

export default function App() {
  const [context, setContext] = useLocalStorage<StudentContext>('my-library-context', DEFAULT_CONTEXT);
  const envKey = (import.meta as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';
  const [apiKey, setApiKey] = useLocalStorage<string>('my-library-gemini-key', envKey);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [activeBuddyNotice, setActiveBuddyNotice] = useState<Notice | null>(null);

  // Unstop-style Sidebar toggle states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const handleScrollToInput = () => {
    document.getElementById('smart-input-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToAttention = () => {
    setViewMode('grid');
    setSelectedUrgency('Urgent');
    setTimeout(() => {
      document.getElementById('attention-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleShowNoticeFeed = () => {
    setViewMode('grid');
    setSelectedUrgency('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Navbar (Unstop Style) */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenDigest={() => setIsDigestOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Body with Sidebar + Content */}
      <div className="flex-1 flex min-w-0">
        {/* Left Sidebar */}
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedUrgency={selectedUrgency}
          onSelectFeed={handleShowNoticeFeed}
          context={context}
          onContextChange={(newContext) => {
            setContext(newContext);
            showToast(`Persona updated: ${newContext.year} Year ${newContext.branch}`, 'info');
          }}
          onScrollToInput={handleScrollToInput}
          onScrollToAttention={handleScrollToAttention}
          onResetData={handleResetAllData}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Feed Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
            {/* Clean Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Campus Life <span className="text-blue-600">Assistant</span>
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Unified intelligent notice stream, clash detection & task triage
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Profile: <strong>{context.year} Year {context.branch}</strong> ({context.focusMode})</span>
              </div>
            </div>

            {/* Hero Spotlight: Needs Attention Today + Clash Triage */}
            <div id="attention-section" className="scroll-mt-20">
              <NeedsAttentionStrip notices={notices} clashes={clashes} />
            </div>

            {/* Smart Input & OCR Extractor Terminal */}
            <div id="smart-input-section">
              <SmartInputArea
                onNoticeExtracted={handleNoticeExtracted}
                apiKey={apiKey}
                context={context}
              />
            </div>

            {/* Notices Header with Blue Accent Bar (Unstop Style) */}
            <section className="space-y-4" aria-label="Campus notices and filters">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-1 h-6 bg-blue-600 rounded-full" aria-hidden="true" />
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Campus Notices
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {filteredNotices.length} items
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
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
              </div>
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
