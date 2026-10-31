import { useMemo, useCallback } from 'react';
import type { Notice, StudentContext, Category, UrgencyFilter, ScheduleClash } from '../types/notice';
import { useLocalStorage } from './useLocalStorage';
import { classifyUrgency, computePriorityScore, detectClashes, isRelevantToContext } from '../utils/priorityEngine';
import { sampleNotices } from '../data/sampleNotices';

const NOTICES_KEY = 'campus-pulse-notices';
const CHECKED_ITEMS_KEY = 'campus-pulse-checked-items';

export function useNotices(context: StudentContext) {
  const [notices, setNotices] = useLocalStorage<Notice[]>(NOTICES_KEY, sampleNotices);
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, string[]>>(CHECKED_ITEMS_KEY, {});

  // Recalculate urgency and priority scores based on current date and context
  const processedNotices = useMemo(() => {
    return notices.map(notice => ({
      ...notice,
      urgency: classifyUrgency(notice.date),
      priorityScore: computePriorityScore(
        { ...notice, urgency: classifyUrgency(notice.date) },
        context
      ),
    }));
  }, [notices, context]);

  // Add a new notice
  const addNotice = useCallback((notice: Notice) => {
    setNotices(prev => [notice, ...prev]);
  }, [setNotices]);

  // Update an existing notice (for corrigendum merging)
  const updateNotice = useCallback((id: string, updates: Partial<Notice>) => {
    setNotices(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedBadge: true } : n
    ));
  }, [setNotices]);

  // Delete a notice
  const deleteNotice = useCallback((id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  }, [setNotices]);

  // Find potential corrigendum match
  const findCorrigendumMatch = useCallback((title: string): Notice | null => {
    const lowerTitle = title.toLowerCase();
    const words = lowerTitle.split(/\s+/).filter(w => w.length > 3);

    for (const notice of notices) {
      const noticeWords = notice.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchCount = words.filter(w => noticeWords.some(nw => nw.includes(w) || w.includes(nw))).length;
      const matchRatio = matchCount / Math.max(words.length, 1);
      if (matchRatio >= 0.4) return notice;
    }
    return null;
  }, [notices]);

  // Toggle checklist item
  const toggleChecklistItem = useCallback((noticeId: string, item: string) => {
    setCheckedItems(prev => {
      const current = prev[noticeId] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [noticeId]: updated };
    });
  }, [setCheckedItems]);

  // Get checked items for a notice
  const getCheckedItems = useCallback((noticeId: string): string[] => {
    return checkedItems[noticeId] || [];
  }, [checkedItems]);

  // Filtered and sorted notices
  const getFilteredNotices = useCallback((
    searchQuery: string,
    categoryFilter: Category | 'All',
    urgencyFilter: UrgencyFilter,
    relevantOnly: boolean,
  ): Notice[] => {
    let filtered = processedNotices;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.venue.toLowerCase().includes(query) ||
        n.rawText.toLowerCase().includes(query) ||
        n.actionChecklist.some(item => item.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(n => n.category === categoryFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'All') {
      filtered = filtered.filter(n => n.urgency === urgencyFilter);
    }

    // Relevant to profile filter
    if (relevantOnly) {
      filtered = filtered.filter(n => isRelevantToContext(n, context));
    }

    // Sort by priority score descending
    return filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [processedNotices, context]);

  // Schedule clashes
  const clashes: ScheduleClash[] = useMemo(() => {
    return detectClashes(processedNotices);
  }, [processedNotices]);

  // Reset to sample data
  const resetToSampleData = useCallback(() => {
    setNotices(sampleNotices);
    setCheckedItems({});
  }, [setNotices, setCheckedItems]);

  return {
    notices: processedNotices,
    addNotice,
    updateNotice,
    deleteNotice,
    findCorrigendumMatch,
    toggleChecklistItem,
    getCheckedItems,
    getFilteredNotices,
    clashes,
    resetToSampleData,
  };
}

