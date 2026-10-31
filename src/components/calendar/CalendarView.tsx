import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Download } from 'lucide-react';
import type { Notice } from '../../types/notice';
import { formatDisplayDate, formatDisplayTime, downloadICS } from '../../utils/priorityEngine';
import { Badge } from '../common/Modal';

interface CalendarViewProps {
  notices: Notice[];
}

export default function CalendarView({ notices }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const dayCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dayNumber: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const iso = `${year}-${mm}-${dd}`;
      cells.push({ dayNumber: d, iso });
    }
    return cells;
  }, [year, month, firstDayIndex, daysInMonth]);

  const categoryColorDot: Record<Notice['category'], string> = {
    'Academic': 'bg-cyan-400',
    'Placement': 'bg-purple-400',
    'Events/Fest': 'bg-pink-400',
    'Clubs': 'bg-emerald-400',
    'Admin/Exam': 'bg-orange-400',
  };

  const selectedNotices = selectedDateISO ? noticesByDate.get(selectedDateISO) || [] : [];

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 space-y-4 text-slate-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
            {monthName} {year} Schedule Matrix
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 pb-1">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label="Month calendar schedule">
        {dayCells.map((cell, idx) => {
          if (!cell.dayNumber || !cell.iso) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-20 bg-slate-950/30 rounded-xl border border-transparent"
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
              className={`h-20 rounded-xl p-2 flex flex-col text-left transition border ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-950/50 ring-2 ring-indigo-500/30'
                  : isToday
                  ? 'border-indigo-500/60 bg-slate-900/90'
                  : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/80'
              }`}
              aria-label={`${cell.dayNumber} ${monthName}, ${dayNotices.length} notices`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold rounded-lg w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>
                {dayNotices.length > 0 && (
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                    {dayNotices.length}
                  </span>
                )}
              </div>

              {/* Event previews in cell */}
              <div className="mt-1 space-y-1 overflow-hidden w-full">
                {dayNotices.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-1.5 text-[10px] font-medium truncate text-slate-300"
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
                  <span className="text-[9px] text-slate-500 block">
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
        <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in" aria-live="polite">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              Timeline for {formatDisplayDate(selectedDateISO)} ({selectedNotices.length} items)
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDateISO(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Hide Day
            </button>
          </div>

          {selectedNotices.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No events scheduled for this calendar slot.</p>
          ) : (
            <div className="space-y-2">
              {selectedNotices.map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${categoryColorDot[n.category]}`}
                        aria-hidden="true"
                      />
                      <span className="font-bold text-slate-100 text-sm">{n.title}</span>
                      <Badge variant={n.urgency === 'Urgent' ? 'urgent' : 'upcoming'}>
                        {n.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      {n.time && (
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          {formatDisplayTime(n.time)}
                        </span>
                      )}
                      {n.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          {n.venue}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadICS(n)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition shrink-0"
                    aria-label={`Export ${n.title} to calendar`}
                  >
                    <Download className="w-3 h-3" />
                    <span>.ics</span>
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
