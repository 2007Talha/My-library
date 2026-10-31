import type { ExtractionResult, Category, Branch, Year } from '../types/notice';
import { validateUrl } from './sanitizer';

// ─── Date Parsing ────────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
  august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
};

const DAY_NAMES: Record<string, number> = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5, saturday: 6, sat: 6,
};

function toISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getNextDayOfWeek(dayIndex: number, fromDate: Date): Date {
  const result = new Date(fromDate);
  const current = result.getDay();
  const daysAhead = (dayIndex - current + 7) % 7 || 7;
  result.setDate(result.getDate() + daysAhead);
  return result;
}

export function parseDate(text: string): string {
  const lower = text.toLowerCase();
  const today = new Date();

  // "today"
  if (/\btoday\b/.test(lower)) return toISO(today);

  // "tomorrow"
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }

  // "day after tomorrow"
  if (/\bday\s+after\s+tomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return toISO(d);
  }

  // "this <dayname>" / "next <dayname>"
  for (const [name, idx] of Object.entries(DAY_NAMES)) {
    const thisPattern = new RegExp(`\\bthis\\s+${name}\\b`, 'i');
    const nextPattern = new RegExp(`\\bnext\\s+${name}\\b`, 'i');
    if (thisPattern.test(lower) || nextPattern.test(lower)) {
      return toISO(getNextDayOfWeek(idx, today));
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = lower.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return toISO(new Date(year, month, day));
    }
  }

  // YYYY-MM-DD (ISO)
  const iso = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  // "Month DD" or "DD Month" with optional year
  for (const [name, idx] of Object.entries(MONTHS)) {
    // "October 31" or "October 31, 2026"
    const monthFirst = new RegExp(`\\b${name}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:[,\\s]+(\\d{4}))?\\b`, 'i');
    const m1 = text.match(monthFirst);
    if (m1) {
      const day = parseInt(m1[1], 10);
      const year = m1[2] ? parseInt(m1[2], 10) : today.getFullYear();
      return toISO(new Date(year, idx, day));
    }

    // "31 October" or "31st October 2026"
    const dayFirst = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${name}\\.?(?:[,\\s]+(\\d{4}))?\\b`, 'i');
    const m2 = text.match(dayFirst);
    if (m2) {
      const day = parseInt(m2[1], 10);
      const year = m2[2] ? parseInt(m2[2], 10) : today.getFullYear();
      return toISO(new Date(year, idx, day));
    }
  }

  // Standalone day name without "this"/"next" — assume this coming one
  for (const [name, idx] of Object.entries(DAY_NAMES)) {
    if (name.length >= 3 && new RegExp(`\\b${name}\\b`, 'i').test(lower)) {
      return toISO(getNextDayOfWeek(idx, today));
    }
  }

  return '';
}

// ─── Time Parsing ────────────────────────────────────────────────

export function parseTime(text: string): string {
  // "10:30 AM", "2:00PM", "14:30", "10 AM"
  const time12 = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  if (time12) {
    let hours = parseInt(time12[1], 10);
    const mins = time12[2];
    const period = time12[3].toLowerCase().replace(/\./g, '');
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }

  // "10 AM" / "2 PM" without minutes
  const timeSimple = text.match(/\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  if (timeSimple) {
    let hours = parseInt(timeSimple[1], 10);
    const period = timeSimple[2].toLowerCase().replace(/\./g, '');
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:00`;
  }

  // 24h format "14:30" or "09:00"
  const time24 = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24) {
    return `${String(parseInt(time24[1], 10)).padStart(2, '0')}:${time24[2]}`;
  }

  return '';
}

// ─── Venue Extraction ────────────────────────────────────────────

const VENUE_KEYWORDS = [
  'auditorium', 'seminar hall', 'lecture hall', 'conference room',
  'room no', 'room number', 'room', 'hall', 'lab', 'laboratory',
  'block', 'building', 'ground', 'playground', 'canteen', 'library',
  'amphitheatre', 'amphitheater', 'audi', 'classroom',
  'online', 'zoom', 'google meet', 'microsoft teams', 'teams',
  'virtual', 'webinar',
];

export function parseVenue(text: string): string {
  const lower = text.toLowerCase();

  // Match "Venue: <something>" or "Location: <something>" or "Place: <something>" or "Where: <something>"
  const venueLabel = text.match(/(?:venue|location|place|where)\s*[:–—-]\s*(.+?)(?:\n|$|,\s*(?:date|time|on))/i);
  if (venueLabel) return venueLabel[1].trim().slice(0, 100);

  // Match known venue keywords with surrounding context
  for (const keyword of VENUE_KEYWORDS) {
    const regex = new RegExp(`((?:\\w+\\s+)?${keyword}(?:\\s+(?:no\\.?|number)?\\s*\\w*(?:\\s+\\w+){0,3}))`, 'i');
    const match = lower.match(regex);
    if (match) {
      // Get the original case version
      const startIdx = lower.indexOf(match[0]);
      return text.slice(startIdx, startIdx + match[0].length).trim().slice(0, 100);
    }
  }

  return '';
}

// ─── Category Classification ─────────────────────────────────────

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Placement': [
    'placement', 'recruit', 'hiring', 'job', 'internship', 'interview',
    'aptitude', 'resume', 'cv', 'ctc', 'lpa', 'package', 'offer letter',
    'pre-placement', 'ppt', 'company', 'nqt', 'off-campus', 'on-campus',
    'dream company', 'mass recruit', 'walk-in', 'shortlist', 'selected',
  ],
  'Admin/Exam': [
    'exam', 'mid-sem', 'midsem', 'end-sem', 'endsem', 'seating',
    'admit card', 'hall ticket', 'marks', 'result', 'grade',
    'attendance', 'revaluation', 'supplementary', 'backlog', 'cgpa',
    'sgpa', 'corrigendum', 'room change', 'schedule change',
    'notice', 'circular', 'academic calendar', 'fee', 'scholarship',
  ],
  'Events/Fest': [
    'hackathon', 'fest', 'festival', 'cultural', 'technical', 'tech fest',
    'competition', 'contest', 'workshop', 'webinar', 'seminar',
    'conference', 'summit', 'conclave', 'ideathon', 'makeathon',
    'coding challenge', 'quiz', 'debate', 'event', 'registration open',
    'register now', 'participate',
  ],
  'Clubs': [
    'club', 'society', 'orientation', 'induction', 'recruitment drive',
    'core team', 'member', 'joining', 'community', 'chapter',
    'ieee', 'acm', 'gdg', 'gdsc', 'coding club', 'robotics club',
    'drama', 'music', 'dance', 'sports', 'nss', 'ncc',
  ],
  'Academic': [
    'lecture', 'class', 'tutorial', 'assignment', 'project',
    'submission', 'deadline', 'syllabus', 'timetable', 'faculty',
    'professor', 'lab', 'practical', 'viva', 'presentation',
    'research', 'paper', 'thesis', 'dissertation', 'seminar',
  ],
};

export function classifyCategory(text: string): Category {
  const lower = text.toLowerCase();
  const scores: Record<Category, number> = {
    'Academic': 0,
    'Placement': 0,
    'Events/Fest': 0,
    'Clubs': 0,
    'Admin/Exam': 0,
  };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[category] += kw.split(' ').length; // Multi-word matches score higher
      }
    }
  }

  let maxScore = 0;
  let bestCategory: Category = 'Academic';
  for (const [cat, score] of Object.entries(scores) as [Category, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

// ─── Target Audience ─────────────────────────────────────────────

export function parseTargetBranches(text: string): Branch[] {
  const lower = text.toLowerCase();
  const branches: Branch[] = [];

  if (/\ball\s+branch/i.test(lower) || /\bevery\s+branch/i.test(lower) || /\ball\s+department/i.test(lower)) {
    return ['All'];
  }

  const branchMap: Record<string, Branch> = {
    'cse': 'CSE', 'computer science': 'CSE', 'cs': 'CSE', 'comp': 'CSE',
    'ece': 'ECE', 'electronics': 'ECE', 'electrical and electronics': 'ECE',
    'me': 'ME', 'mechanical': 'ME', 'mech': 'ME',
    'ee': 'EE', 'electrical': 'EE', 'eee': 'EE',
    'ce': 'CE', 'civil': 'CE',
  };

  for (const [keyword, branch] of Object.entries(branchMap)) {
    if (lower.includes(keyword) && !branches.includes(branch)) {
      branches.push(branch);
    }
  }

  return branches.length > 0 ? branches : ['All'];
}

export function parseTargetYears(text: string): Year[] {
  const lower = text.toLowerCase();
  const years: Year[] = [];

  if (/\ball\s+year/i.test(lower) || /\bevery\s+year/i.test(lower) || /\ball\s+student/i.test(lower)) {
    return ['1st', '2nd', '3rd', '4th'];
  }

  const yearMap: Record<string, Year> = {
    '1st year': '1st', 'first year': '1st', 'freshers': '1st', 'fresher': '1st', 'freshman': '1st',
    '2nd year': '2nd', 'second year': '2nd', 'sophomore': '2nd',
    '3rd year': '3rd', 'third year': '3rd', 'pre-final': '3rd',
    '4th year': '4th', 'fourth year': '4th', 'final year': '4th',
  };

  for (const [keyword, year] of Object.entries(yearMap)) {
    if (lower.includes(keyword) && !years.includes(year)) {
      years.push(year);
    }
  }

  return years.length > 0 ? years : ['1st', '2nd', '3rd', '4th'];
}

// ─── Action Checklist ────────────────────────────────────────────

export function parseActionChecklist(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet point items
    if (/^[•\-*▸▹➤➜→⮕✓☐☑]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^[•\-*▸▹➤➜→⮕✓☐☑]\s+/, '').trim();
      if (item.length > 2 && item.length < 200) items.push(item);
      continue;
    }

    // Numbered items: "1.", "1)", "(1)"
    if (/^\(?\d+[.)]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^\(?\d+[.)]\s+/, '').trim();
      if (item.length > 2 && item.length < 200) items.push(item);
      continue;
    }

    // Action keywords
    const actionKeywords = /\b(bring|carry|submit|register|fill|download|print|prepare|wear|arrange|note|remember|must have|required|prerequisite|mandatory)\b/i;
    if (actionKeywords.test(trimmed) && trimmed.length < 200 && trimmed.length > 5) {
      // Avoid adding full paragraphs, only concise action lines
      if (trimmed.split(' ').length <= 20) {
        items.push(trimmed);
      }
    }
  }

  // Deduplicate
  return [...new Set(items)].slice(0, 10);
}

// ─── Registration Link ──────────────────────────────────────────

export function parseRegistrationLink(text: string): string {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex);
  if (matches) {
    for (const url of matches) {
      const validated = validateUrl(url);
      if (validated) return validated;
    }
  }
  return '';
}

// ─── Corrigendum Detection ──────────────────────────────────────

const CORRIGENDUM_KEYWORDS = [
  'update', 'updated', 'corrigendum', 'revised', 'revision',
  'change', 'changed', 'amendment', 'amended', 'correction',
  'erratum', 'modification', 'modified', 'new venue', 'new date',
  'new time', 'rescheduled', 'postponed', 'preponed', 'shifted',
  'venue changed', 'date changed', 'time changed',
];

export function isCorrigendum(text: string): boolean {
  const lower = text.toLowerCase();
  return CORRIGENDUM_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Title Extraction ────────────────────────────────────────────

export function parseTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (const line of lines) {
    // Clean up leading/trailing markdown and emojis first
    let cleaned = line
      .replace(/^[\*_~`#\s]+/, '')
      .replace(/[\*_~`#\s]+$/, '')
      .replace(/^[🚨📢📌⚠️🎉🎊💼📋🔔❗💥🔥⚡]+\s*/u, '')
      .replace(/[🚨📢📌⚠️🎉🎊💼📋🔔❗💥🔥⚡]+$/u, '')
      .trim();

    // Skip forwarded message headers
    if (/^(forwarded|fwd|from:|to:|cc:|date:|sent:|------|\*{3})/i.test(cleaned)) continue;
    if (/^forwarded as received/i.test(cleaned)) continue;

    // Skip purely generic department banners
    if (/^(placement cell notice|placement cell urgent update|placement notice|academic section notice|circular|official notice|urgent notice)$/i.test(cleaned)) continue;

    // Skip lines that are just dates/times
    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(cleaned)) continue;

    // Skip lines that are just URLs
    if (/^https?:\/\//i.test(cleaned)) continue;

    // Skip very short lines (likely artifacts)
    if (cleaned.length < 5) continue;

    // Truncate to reasonable title length
    if (cleaned.length > 80) {
      cleaned = cleaned.slice(0, 77) + '...';
    }

    if (cleaned.length >= 5) return cleaned;
  }

  return 'Untitled Notice';
}

// ─── Gemini AI Extraction ────────────────────────────────────────

async function extractWithGemini(text: string, apiKey: string): Promise<ExtractionResult | null> {
  try {
    const prompt = `Extract structured information from this campus notice/message. Return ONLY valid JSON with these fields:
{
  "title": "concise title",
  "date": "YYYY-MM-DD or empty string",
  "time": "HH:MM in 24h format or empty string",
  "venue": "location or empty string",
  "category": one of "Academic", "Placement", "Events/Fest", "Clubs", "Admin/Exam",
  "targetBranches": array of "CSE","ECE","ME","EE","CE","All",
  "targetYears": array of "1st","2nd","3rd","4th",
  "actionChecklist": array of action items (things to bring/do/prepare),
  "registrationLink": "URL or empty string",
  "isCorrigendum": boolean (true if this updates/corrects a previous notice)
}

Notice text:
${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      title: parsed.title || parseTitle(text),
      date: parsed.date || '',
      time: parsed.time || '',
      venue: parsed.venue || '',
      category: parsed.category || 'Academic',
      targetBranches: parsed.targetBranches || ['All'],
      targetYears: parsed.targetYears || ['1st', '2nd', '3rd', '4th'],
      actionChecklist: parsed.actionChecklist || [],
      registrationLink: parsed.registrationLink ? (validateUrl(parsed.registrationLink) || '') : '',
      isCorrigendum: parsed.isCorrigendum || false,
    };
  } catch {
    return null;
  }
}

// ─── Main Extraction Pipeline ────────────────────────────────────

export function extractLocal(text: string): ExtractionResult {
  return {
    title: parseTitle(text),
    date: parseDate(text),
    time: parseTime(text),
    venue: parseVenue(text),
    category: classifyCategory(text),
    targetBranches: parseTargetBranches(text),
    targetYears: parseTargetYears(text),
    actionChecklist: parseActionChecklist(text),
    registrationLink: parseRegistrationLink(text),
    isCorrigendum: isCorrigendum(text),
  };
}

export async function extractNotice(
  text: string,
  apiKey?: string
): Promise<ExtractionResult> {
  // Try AI extraction first if key provided
  if (apiKey) {
    const aiResult = await extractWithGemini(text, apiKey);
    if (aiResult && aiResult.title && aiResult.title !== 'Untitled Notice') {
      return aiResult;
    }
  }

  // Fallback to local NLP extraction
  return extractLocal(text);
}

