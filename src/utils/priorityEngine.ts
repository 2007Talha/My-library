import type { Notice, StudentContext, Urgency, ScheduleClash, Category, FocusMode } from '../types/notice';

// ─── Urgency Classification ─────────────────────────────────────

export function classifyUrgency(noticeDate: string): Urgency {
  if (!noticeDate) return 'Upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notice = new Date(noticeDate + 'T00:00:00');
  notice.setHours(0, 0, 0, 0);

  const diffMs = notice.getTime() - today.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return 'Expired';
  if (diffHours < 24) return 'Urgent';
  return 'Upcoming';
}

// ─── Focus Mode → Category Affinity ─────────────────────────────

const FOCUS_CATEGORY_MAP: Record<FocusMode, Category[]> = {
  'Placements': ['Placement', 'Admin/Exam'],
  'Academics': ['Academic', 'Admin/Exam'],
  'HackathonsClubs': ['Events/Fest', 'Clubs'],
  'All': [],
};

// ─── Priority Score Computation ─────────────────────────────────

export function isAcademicMandatoryNotice(notice: Notice): boolean {
  if (notice.category === 'Academic' || notice.category === 'Admin/Exam') return true;
  const lower = (notice.title + ' ' + (notice.rawText || '')).toLowerCase();
  return /lab|lecture|practical|viva|midsem|mid-sem|endsem|makeup|attendance|exam|submission/i.test(lower);
}

export function computePriorityScore(notice: Notice, context: StudentContext): number {
  let score = 0;

  // Base score from urgency
  switch (notice.urgency) {
    case 'Urgent': score = 80; break;
    case 'Upcoming': score = 50; break;
    case 'Expired': score = 10; break;
  }

  // Branch match boost
  if (notice.targetBranches.includes('All') || notice.targetBranches.includes(context.branch) || context.branch === 'All') {
    score += 10;
  } else {
    score -= 15; // Penalty for irrelevant branch
  }

  // Year match boost
  if (notice.targetYears.includes(context.year)) {
    score += 10;
  } else {
    score -= 10; // Penalty for irrelevant year
  }

  // Focus mode category boost
  if (context.focusMode !== 'All') {
    const affinities = FOCUS_CATEGORY_MAP[context.focusMode];
    if (affinities.includes(notice.category)) {
      score += 10;
    }
  }

  // Attendance triage: If attendance is <75%, heavily boost academics/labs/exams and lower fests
  if (context.lowAttendanceWarning) {
    if (isAcademicMandatoryNotice(notice)) {
      score += 35;
    } else if (notice.category === 'Events/Fest' || notice.category === 'Clubs') {
      score -= 25;
    }
  }

  // Clamp to 0–100
  return Math.max(0, Math.min(100, score));
}

// ─── Context Relevance Check ────────────────────────────────────

export function isRelevantToContext(notice: Notice, context: StudentContext): boolean {
  const branchMatch = notice.targetBranches.includes('All') ||
    notice.targetBranches.includes(context.branch) ||
    context.branch === 'All';

  const yearMatch = notice.targetYears.includes(context.year);

  return branchMatch && yearMatch;
}

// ─── Schedule Clash Detection ───────────────────────────────────

function parseTimeToMinutes(time: string): number {
  if (!time) return -1;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function detectClashes(notices: Notice[]): ScheduleClash[] {
  const clashes: ScheduleClash[] = [];
  const activeNotices = notices.filter(n => n.urgency !== 'Expired' && n.date && n.time);

  for (let i = 0; i < activeNotices.length; i++) {
    for (let j = i + 1; j < activeNotices.length; j++) {
      const a = activeNotices[i];
      const b = activeNotices[j];

      if (a.date !== b.date) continue;

      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);

      if (timeA < 0 || timeB < 0) continue;

      // Assume each event is ~1 hour; clash if within 60 minutes of each other
      const diff = Math.abs(timeA - timeB);
      if (diff < 60) {
        clashes.push({
          noticeA: a,
          noticeB: b,
          date: a.date,
          overlapDescription: `"${a.title}" at ${a.time} and "${b.title}" at ${b.time} overlap on ${formatDisplayDate(a.date)}`,
        });
      }
    }
  }

  return clashes;
}

// ─── Needs Attention Today ──────────────────────────────────────

export function getNeedsAttentionToday(notices: Notice[], context: StudentContext): Notice[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  return notices
    .filter(n => {
      if (n.urgency === 'Expired') return false;
      // Today or tomorrow
      if (n.date === todayISO || n.date === tomorrowISO) return true;
      // High priority and within this week
      if (n.priorityScore >= 80) return true;
      return false;
    })
    .sort((a, b) => {
      // Today first, then by priority
      if (a.date === todayISO && b.date !== todayISO) return -1;
      if (b.date === todayISO && a.date !== todayISO) return 1;
      return b.priorityScore - a.priorityScore;
    })
    .map(n => ({ ...n, priorityScore: computePriorityScore(n, context) }))
    .slice(0, 5);
}

// ─── Date Formatting Utilities ──────────────────────────────────

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return 'Date TBD';
  try {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function formatDisplayTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function getCountdown(isoDate: string): string {
  if (!isoDate) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + 'T00:00:00');
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  return `In ${Math.ceil(diffDays / 7)} weeks`;
}

// ─── Weekly Digest Generator ────────────────────────────────────

export function generateWeeklyDigest(notices: Notice[], context: StudentContext): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayISO = today.toISOString().split('T')[0];

  const thisWeek = notices.filter(n => {
    if (!n.date || n.urgency === 'Expired') return false;
    const d = new Date(n.date + 'T00:00:00');
    return d >= today && d <= weekEnd;
  });

  const todayItems = thisWeek.filter(n => n.date === todayISO);
  const upcoming = thisWeek.filter(n => n.date !== todayISO);
  const clashes = detectClashes(thisWeek);
  const missingVenue = thisWeek.filter(n => !n.venue);

  let digest = `📊 MY LIBRARY WEEKLY EXECUTIVE DIGEST\n`;
  digest += `Target Student: ${context.year} Year ${context.branch} • Focus: ${context.focusMode}\n`;
  if (context.lowAttendanceWarning) {
    digest += `⚠️ ATTENDANCE STATUS: CRITICAL (< 75%) — Mandatory Academic Recovery Mode Active\n`;
  } else {
    digest += `✅ Attendance Status: Good (${context.attendancePercentage || 85}%)\n`;
  }
  digest += `${'═'.repeat(45)}\n\n`;

  // Attendance Alert Block
  if (context.lowAttendanceWarning) {
    digest += `🚨 ATTENDANCE RECOVERY PRIORITIES:\n`;
    digest += `   Notice: Skipping scheduled practicals, lab submissions, or makeup classes will trigger detention.\n`;
    digest += `   Action: Prioritize lab viva and makeup lectures over non-mandatory fests.\n\n`;
  }

  // Today's must-dos
  digest += `🚨 IMMEDIATE DEADLINES & TODAY'S MUST-DOS (${todayItems.length})\n`;
  if (todayItems.length === 0) {
    digest += `   ✅ No urgent items scheduled for today. You're clear!\n`;
  } else {
    todayItems.forEach(n => {
      const verifiedTag = n.verificationStatus === 'Official' ? '🛡️' : '⚠️';
      digest += `   • ${verifiedTag} ${n.title}${n.time ? ` at ${formatDisplayTime(n.time)}` : ''}${n.venue ? ` | ${n.venue}` : ''}\n`;
      if (n.actionChecklist.length > 0) {
        digest += `     📋 Prep: ${n.actionChecklist.slice(0, 3).join(', ')}\n`;
      }
    });
  }
  digest += '\n';

  // Upcoming this week
  digest += `📅 KEY UPCOMING EVENTS THIS WEEK (${upcoming.length})\n`;
  if (upcoming.length === 0) {
    digest += `   No upcoming events this week.\n`;
  } else {
    upcoming.sort((a, b) => a.date.localeCompare(b.date)).forEach(n => {
      const verifiedTag = n.verificationStatus === 'Official' ? '🛡️' : '⚠️';
      digest += `   • ${formatDisplayDate(n.date)} — ${verifiedTag} ${n.title}${n.time ? ` at ${formatDisplayTime(n.time)}` : ''}\n`;
    });
  }
  digest += '\n';

  // Clashes
  if (clashes.length > 0) {
    digest += `⚠️ SCHEDULE CONFLICTS DETECTED (${clashes.length})\n`;
    clashes.forEach(c => {
      digest += `   ⚡ ${c.overlapDescription}\n`;
    });
    digest += '\n';
  }

  // Next Actions Grouping
  const allActionItems: { notice: string; item: string }[] = [];
  thisWeek.forEach(n => {
    n.actionChecklist.forEach(i => allActionItems.push({ notice: n.title, item: i }));
  });

  if (allActionItems.length > 0) {
    digest += `✅ NEXT ACTIONS GROUPING (ACTION CHECKLIST):\n`;
    allActionItems.slice(0, 6).forEach((act) => {
      digest += `   [ ] ${act.item} (${act.notice.slice(0, 25)}...)\n`;
    });
    digest += '\n';
  }

  // Missing venue warnings
  if (missingVenue.length > 0) {
    digest += `📍 MISSING VENUE WARNINGS\n`;
    missingVenue.forEach(n => {
      digest += `   • "${n.title}" — venue not specified yet\n`;
    });
    digest += '\n';
  }

  digest += `${'═'.repeat(45)}\n`;
  digest += `Forwarded via My Library 🎓 Stay organized & stay ahead.\n`;

  return digest;
}

// ─── ICS Calendar Export ─────────────────────────────────────────

export function generateICS(notice: Notice): string {
  const dtStart = notice.date
    ? notice.time
      ? `${notice.date.replace(/-/g, '')}T${notice.time.replace(':', '')}00`
      : `${notice.date.replace(/-/g, '')}`
    : '';

  const dtEnd = notice.date
    ? notice.time
      ? (() => {
        const [h, m] = notice.time.split(':').map(Number);
        const endH = h + 1; // Assume 1-hour duration
        return `${notice.date.replace(/-/g, '')}T${String(endH).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
      })()
      : `${notice.date.replace(/-/g, '')}`
    : '';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyLibrary//EN',
    'BEGIN:VEVENT',
    dtStart ? (notice.time ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`) : '',
    dtEnd ? (notice.time ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`) : '',
    `SUMMARY:${notice.title}`,
    notice.venue ? `LOCATION:${notice.venue}` : '',
    `DESCRIPTION:${notice.category} | ${notice.actionChecklist.join(', ')}`,
    `CATEGORIES:${notice.category}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function downloadICS(notice: Notice): void {
  const icsContent = generateICS(notice);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${notice.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

