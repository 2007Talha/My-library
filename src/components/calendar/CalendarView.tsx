import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import type { Notice } from '../../types/notice';
import { formatDisplayDate, formatDisplayTime, downloadICS } from '../../utils/priorityEngine';
import { Badge } from '../common/Modal';

interface CalendarViewProps {
  notices: Notice[];
}

export default function CalendarView({ notices }: CalendarViewProps) {
  // Use today's month/year as initial state
  const [currentDate, setCurrentDate] = useState(() => {
    // Current date from metadata or system
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  // Map of notices by ISO date string
  const noticesByDate = useMemo(() => {
    const map = new Map<string, Notice[]>();
    for (const notice of notices) {
      if (!notice.date) continue;
      const list = map.get(notice.date) || [];
      list.push(notice);
      map.set(notice.date, list);
    }
    return map;
  }, [notices]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const dayCells = useMemo(() => {
    const cells = [];
    // Padding before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dayNumber: null, iso: null });
    }
    // Days in this month
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const iso = `${year}-${mm}-${dd}`;
      cells.push({ dayNumber: d, iso });
    }
    return cells;
  }, [year, month, firstDayIndex, daysInMonth]);

  const categoryColorDot: Record<Notice['category'], string> = {
    'Academic': 'bg-blue-500',
    'Placement': 'bg-purple-500',
    'Events/Fest': 'bg-pink-500',
    'Clubs': 'bg-emerald-500',
    'Admin/Exam': 'bg-orange-500',
  };

  const selectedNotices = selectedDateISO ? noticesByDate.get(selectedDateISO) || [] : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-gray-900">
            {monthName} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 pb-1">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Month calendar schedule">
        {dayCells.map((cell, idx) => {
          if (!cell.dayNumber || !cell.iso) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-20 bg-gray-50/50 rounded-lg p-1 border border-transparent"
                aria-hidden="true"
              />
            );
          }

          const dayNotices = noticesByDate.get(cell.iso) || [];
          const isSelected = selectedDateISO === cell.iso;
          const todayISO = new Date().toISOString().split('T')[0];
          const isToday = cell.iso === todayISO;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedDateISO(cell.iso)}
              className={`h-20 rounded-lg p-1.5 flex flex-col text-left transition border ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : isToday
                  ? 'border-indigo-300 bg-white'
                  : 'border-gray-100 hover:border-gray-300 bg-white'
              }`}
              aria-label={`${cell.dayNumber} ${monthName}, ${dayNotices.length} events`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  {cell.dayNumber}
                </span>
                {dayNotices.length > 0 && (
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1 rounded">
                    {dayNotices.length}
                  </span>
                )}
              </div>

              {/* Event previews in cell */}
              <div className="mt-1 space-y-0.5 overflow-hidden w-full">
                {dayNotices.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-1 text-[10px] truncate text-gray-700"
                    title={n.title}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${categoryColorDot[n.category]}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{n.title}</span>
                  </div>
                ))}
                {dayNotices.length > 2 && (
                  <span className="text-[9px] text-gray-400 block">
                    +{dayNotices.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDateISO && (
        <div className="pt-4 border-t border-gray-200 space-y-3" aria-live="polite">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Notices for {formatDisplayDate(selectedDateISO)} ({selectedNotices.length})
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDateISO(null)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Close Details
            </button>
          </div>

          {selectedNotices.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No campus events or notices scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedNotices.map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${categoryColorDot[n.category]}`}
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-gray-900 text-sm">{n.title}</span>
                      <Badge variant={n.urgency === 'Urgent' ? 'urgent' : 'upcoming'}>
                        {n.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      {n.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                          {formatDisplayTime(n.time)}
                        </span>
                      )}
                      {n.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                          {n.venue}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadICS(n)}
                    className="px-2.5 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition shrink-0"
                    aria-label={`Export ${n.title} to calendar`}
                  >
                    Export .ics
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

