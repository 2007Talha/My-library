import { useState, useMemo } from 'react';
import type { StudentContext, Category, UrgencyFilter, Notice, ViewMode, Branch, Year } from './types/notice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotices } from './hooks/useNotices';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AnnouncementTicker from './components/layout/AnnouncementTicker';
import Footer from './components/layout/Footer';
import NeedsAttentionStrip from './components/notices/NeedsAttentionStrip';
import SmartInputArea from './components/input/SmartInputArea';
import CampusFilterCard from './components/filters/CampusFilterCard';
import NoticeGrid from './components/notices/NoticeGrid';
import CalendarView from './components/calendar/CalendarView';
import WeeklyDigestModal from './components/digest/WeeklyDigestModal';
import ApiKeyModal from './components/input/ApiKeyModal';
import CorrigendumMergeModal from './components/notices/CorrigendumMergeModal';
import BuddyMatcherModal from './components/notices/BuddyMatcherModal';
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

  // Saved Bookmarks & Pinned State
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('my-library-saved-notices', ['seed-1', 'seed-2']);
  const [isSavedOnly, setIsSavedOnly] = useState(false);
  const [isPinnedOnly, setIsPinnedOnly] = useState(false);

  // Unstop / Campus Pulse Sidebar toggle states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // View state & Dropdown filter states matching photo
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch>('All');
  const [selectedYear, setSelectedYear] = useState<Year | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyFilter>('All');

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

  // Category counts and urgent count for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: notices.length };
    notices.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notices]);

  const urgentNotices = useMemo(() => {
    return notices.filter(n => n.urgency === 'Urgent');
  }, [notices]);

  // Comprehensive filtered notices
  const filteredNotices = useMemo(() => {
    let list = getFilteredNotices(searchQuery, selectedCategory, selectedUrgency, false);

    if (selectedBranch !== 'All') {
      list = list.filter(n => n.targetBranches.includes('All') || n.targetBranches.includes(selectedBranch));
    }
    if (selectedYear !== 'All') {
      list = list.filter(n => n.targetYears.includes(selectedYear));
    }
    if (isPinnedOnly) {
      list = list.filter(n => n.isPinned);
    }
    if (isSavedOnly) {
      list = list.filter(n => savedIds.includes(n.id));
    }
    return list;
  }, [getFilteredNotices, searchQuery, selectedCategory, selectedUrgency, selectedBranch, selectedYear, isPinnedOnly, isSavedOnly, savedIds]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedBranch !== 'All' ||
    selectedYear !== 'All' ||
    selectedCategory !== 'All' ||
    selectedUrgency !== 'All' ||
    isPinnedOnly ||
    isSavedOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBranch('All');
    setSelectedYear('All');
    setSelectedCategory('All');
    setSelectedUrgency('All');
    setIsPinnedOnly(false);
    setIsSavedOnly(false);
  };

  const handleToggleBookmark = (id: string) => {
    const isCurrentlySaved = savedIds.includes(id);
    setSavedIds(prev => isCurrentlySaved ? prev.filter(x => x !== id) : [...prev, id]);
    showToast(isCurrentlySaved ? 'Notice removed from saved bookmarks' : 'Notice saved to bookmarks', 'info');
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
    setSelectedCategory('All');
    setSelectedUrgency('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenDigest={() => setIsDigestOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        savedCount={savedIds.length}
        urgentCount={urgentNotices.length}
        onToggleSavedOnly={() => setIsSavedOnly(!isSavedOnly)}
        isSavedOnly={isSavedOnly}
        onScrollToAttention={handleScrollToAttention}
      />

      {/* Top Urgent Announcement Banner Ticker */}
      <AnnouncementTicker
        urgentNotices={urgentNotices}
        onSelectNotice={() => handleScrollToAttention()}
      />

      {/* Body with Sidebar + Content */}
      <div className="flex-1 flex min-w-0">
        {/* Left Sidebar */}
        <Sidebar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedUrgency={selectedUrgency}
          onSelectFeed={handleShowNoticeFeed}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
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
          categoryCounts={categoryCounts}
          urgentCount={urgentNotices.length}
        />

        {/* Main Feed Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header matching laptop screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  All Campus Updates
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Chronological institutional stream across all faculties and departments
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto shadow-2xs border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Profile: <strong>{context.year} Year {context.branch}</strong> ({context.focusMode})</span>
              </div>
            </div>

            {/* Central Filter Panel matching laptop photo */}
            <CampusFilterCard
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              isPinnedOnly={isPinnedOnly}
              onTogglePinnedOnly={() => setIsPinnedOnly(!isPinnedOnly)}
              isSavedOnly={isSavedOnly}
              onToggleSavedOnly={() => setIsSavedOnly(!isSavedOnly)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFilteredCount={filteredNotices.length}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

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

            {/* Multi-Modal View: Grid of Cards (matching photo) OR Calendar */}
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
                savedNoticeIds={new Set(savedIds)}
                onToggleBookmark={handleToggleBookmark}
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
