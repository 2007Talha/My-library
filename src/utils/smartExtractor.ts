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

function extractDateFromString(str: string): string {
  const lower = str.toLowerCase();
  const today = new Date();

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

  // "Month DD, YYYY" or "DD Month YYYY"
  for (const [name, idx] of Object.entries(MONTHS)) {
    const monthFirst = new RegExp(`\\b${name}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:[,\\s]+(\\d{4}))?\\b`, 'i');
    const m1 = str.match(monthFirst);
    if (m1) {
      const day = parseInt(m1[1], 10);
      const year = m1[2] ? parseInt(m1[2], 10) : today.getFullYear();
      return toISO(new Date(year, idx, day));
    }

    const dayFirst = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${name}\\.?(?:[,\\s]+(\\d{4}))?\\b`, 'i');
    const m2 = str.match(dayFirst);
    if (m2) {
      const day = parseInt(m2[1], 10);
      const year = m2[2] ? parseInt(m2[2], 10) : today.getFullYear();
      return toISO(new Date(year, idx, day));
    }
  }

  return '';
}

export function parseDate(text: string): string {
  const today = new Date();
  const lower = text.toLowerCase();

  // 1. Look for explicit labeled date lines first: "Date: ...", "📅 Date: ...", "Date of Exam: ..."
  const dateLabelMatch = text.match(/(?:📅\s*)?(?:date\s+of\s+(?:exam|examination|event)|date|when|scheduled\s+on|held\s+on)\s*[:–—-]\s*([^\n\r,]+)/i);
  if (dateLabelMatch) {
    const fromLabel = extractDateFromString(dateLabelMatch[1]);
    if (fromLabel) return fromLabel;

    // Check if the labeled line mentions "tomorrow" or "today"
    const labelLower = dateLabelMatch[1].toLowerCase();
    if (/\btomorrow\b/.test(labelLower)) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return toISO(d);
    }
    if (/\btoday\b/.test(labelLower)) {
      return toISO(today);
    }
  }

  // 2. Look for any full numeric or month dates anywhere in the text
  const fullDate = extractDateFromString(text);
  if (fullDate) return fullDate;

  // 3. Relative day phrases: "this Friday", "next Monday"
  for (const [name, idx] of Object.entries(DAY_NAMES)) {
    const thisPattern = new RegExp(`\\bthis\\s+${name}\\b`, 'i');
    const nextPattern = new RegExp(`\\bnext\\s+${name}\\b`, 'i');
    if (thisPattern.test(lower) || nextPattern.test(lower)) {
      return toISO(getNextDayOfWeek(idx, today));
    }
  }

  // 4. Relative words: "tomorrow", "day after tomorrow", "today" (ONLY if no explicit date above)
  if (/\bday\s+after\s+tomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return toISO(d);
  }

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }

  if (/\btoday\b/.test(lower)) {
    return toISO(today);
  }

  // 5. Standalone day name: "Orientation this Friday" or "Friday"
  for (const [name, idx] of Object.entries(DAY_NAMES)) {
    if (name.length >= 3 && new RegExp(`\\b${name}\\b`, 'i').test(lower)) {
      return toISO(getNextDayOfWeek(idx, today));
    }
  }

  return '';
}

// ─── Time Parsing ────────────────────────────────────────────────

function extractTimeFromString(str: string): string {
  // 12h format with minutes: "10:30 AM", "2:00 PM", "9:00 AM - 5:00 PM"
  const time12 = str.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  if (time12) {
    let hours = parseInt(time12[1], 10);
    const mins = time12[2];
    const period = time12[3].toLowerCase().replace(/\./g, '');
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }

  // 12h format without minutes: "10 AM", "2 PM"
  const timeSimple = str.match(/\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  if (timeSimple) {
    let hours = parseInt(timeSimple[1], 10);
    const period = timeSimple[2].toLowerCase().replace(/\./g, '');
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:00`;
  }

  // 24h format: "14:30" or "09:00"
  const time24 = str.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24) {
    return `${String(parseInt(time24[1], 10)).padStart(2, '0')}:${time24[2]}`;
  }

  return '';
}

export function parseTime(text: string): string {
  // 1. Look for labeled time line: "Time: 10:00 AM", "⏰ Time: 9:00 AM - 9:00 PM"
  const timeLabel = text.match(/(?:⏰\s*)?(?:time|timings|timing|starts?\s+at|begins?\s+at)\s*[:–—-]\s*([^\n\r]+)/i);
  if (timeLabel) {
    const parsed = extractTimeFromString(timeLabel[1]);
    if (parsed) return parsed;
  }

  // 2. Fall back to searching entire text
  return extractTimeFromString(text);
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
  // 1. Check for Corrigendum / Updated Venue FIRST (so old venue isn't chosen)
  const updatedVenueMatch = text.match(/(?:updated|new|revised)\s*(?:venue|location|room|hall)\s*[:–—-]\s*(.+?)(?:\n|$|,\s*(?:date|time|on))/i);
  if (updatedVenueMatch) {
    return cleanVenueString(updatedVenueMatch[1]);
  }

  // 2. Explicit labeled venue: "Venue: Seminar Hall A, Main Block", "📍 Venue: ..."
  const venueLabel = text.match(/(?:📍\s*)?(?:venue|location|place|where|held\s+at)\s*[:–—-]\s*(.+?)(?:\n|$|,\s*(?:date|time|on))/i);
  if (venueLabel) {
    return cleanVenueString(venueLabel[1]);
  }

  // 3. Fall back to keyword scan with surrounding words
  const lower = text.toLowerCase();
  for (const keyword of VENUE_KEYWORDS) {
    const regex = new RegExp(`((?:\\w+\\s+)?${keyword}(?:\\s+(?:no\\.?|number)?\\s*\\w*(?:\\s+\\w+){0,3}))`, 'i');
    const match = lower.match(regex);
    if (match) {
      const startIdx = lower.indexOf(match[0]);
      return cleanVenueString(text.slice(startIdx, startIdx + match[0].length));
    }
  }

  return '';
}

function cleanVenueString(str: string): string {
  return str
    .replace(/^[\*_~`\s]+/, '')
    .replace(/[\*_~`\s]+$/, '')
    .replace(/[📍🏢🏛️🗺️]+/g, '')
    .trim()
    .slice(0, 100);
}

// ─── Category Classification ─────────────────────────────────────

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Placement': [
    'placement', 'recruit', 'hiring', 'job', 'internship', 'interview',
    'aptitude', 'resume', 'cv', 'ctc', 'lpa', 'package', 'offer letter',
    'pre-placement', 'ppt', 'company', 'nqt', 'off-campus', 'on-campus',
    'dream company', 'mass recruit', 'walk-in', 'shortlist', 'selected',
    'tcs', 'infosys', 'wipro', 'cognizant', 'amazon', 'google', 'microsoft',
  ],
  'Admin/Exam': [
    'exam', 'mid-sem', 'midsem', 'end-sem', 'endsem', 'seating',
    'admit card', 'hall ticket', 'marks', 'result', 'grade',
    'attendance', 'revaluation', 'supplementary', 'backlog', 'cgpa',
    'sgpa', 'corrigendum', 'room change', 'schedule change',
    'circular', 'academic calendar', 'fee', 'scholarship', 'controller of examinations',
  ],
  'Events/Fest': [
    'hackathon', 'fest', 'festival', 'cultural', 'technical', 'tech fest',
    'techfest', 'competition', 'contest', 'workshop', 'webinar', 'seminar',
    'conference', 'summit', 'conclave', 'ideathon', 'makeathon',
    'coding challenge', 'quiz', 'debate', 'cash prize', 'prizes worth',
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
    'research', 'paper', 'thesis', 'dissertation',
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
        // Multi-word matches score higher
        scores[category] += kw.split(' ').length * 2;
      }
    }
  }

  // Strong context boosts
  if (/placement\s+cell|recruitment|ctc|lpa|hiring/i.test(lower)) scores['Placement'] += 5;
  if (/hackathon|techfest|coding\s+challenge|ideathon/i.test(lower)) scores['Events/Fest'] += 6;
  if (/exam|midsem|endsem|hall\s+ticket|corrigendum/i.test(lower)) scores['Admin/Exam'] += 5;
  if (/coding\s+club|student\s+chapter|orientation/i.test(lower)) scores['Clubs'] += 4;

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

// ─── Target Audience (Strict Word Boundaries to avoid false positives) ───────────────

export function parseTargetBranches(text: string): Branch[] {
  const lower = text.toLowerCase();

  // If "all branches" or "open to all"
  if (
    /\b(?:all\s+branches|every\s+branch|all\s+departments|all\s+students|open\s+to\s+all)\b/i.test(lower)
  ) {
    return ['All'];
  }

  const branches: Branch[] = [];

  // Use STRICT word boundaries (\b) so "time", "notice", "physics" don't falsely match
  if (/\b(?:cse|computer\s+science|comp\s*sci|information\s+technology|\bit\b)\b/i.test(lower)) {
    branches.push('CSE');
  }
  if (/\b(?:ece|electronics(?:\s+and\s+communication)?|\benc\b)\b/i.test(lower)) {
    branches.push('ECE');
  }
  if (/\b(?:me|mechanical|mech(?:\s+engineering|\s+dept)?)\b/i.test(lower)) {
    branches.push('ME');
  }
  if (/\b(?:ee|eee|electrical(?:\s+engineering|\s+dept)?)\b/i.test(lower)) {
    branches.push('EE');
  }
  if (/\b(?:ce|civil(?:\s+engineering|\s+dept)?)\b/i.test(lower)) {
    branches.push('CE');
  }

  return branches.length > 0 ? branches : ['All'];
}

export function parseTargetYears(text: string): Year[] {
  const lower = text.toLowerCase();

  if (
    /\b(?:all\s+years|every\s+year|all\s+students|open\s+to\s+all)\b/i.test(lower)
  ) {
    return ['1st', '2nd', '3rd', '4th'];
  }

  const years: Year[] = [];

  if (/\b(?:1st|first)\s*(?:year)?|freshers?|freshman\b/i.test(lower)) {
    years.push('1st');
  }
  if (/\b(?:2nd|second)\s*(?:year)?|sophomores?\b/i.test(lower)) {
    years.push('2nd');
  }
  if (/\b(?:3rd|third)\s*(?:year)?|pre-final\b/i.test(lower)) {
    years.push('3rd');
  }
  if (/\b(?:4th|fourth|final)\s*(?:year)?\b/i.test(lower)) {
    years.push('4th');
  }

  return years.length > 0 ? years : ['1st', '2nd', '3rd', '4th'];
}

// ─── Action Checklist ────────────────────────────────────────────

export function parseActionChecklist(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    let trimmed = line.trim();

    // Bullet point items: "•", "-", "*", "1.", etc.
    const isBullet = /^[•\-*▸▹➤➜→⮕✓☐☑]\s+/.test(trimmed);
    const isNumbered = /^\(?\d+[.)]\s+/.test(trimmed);

    if (isBullet || isNumbered) {
      trimmed = trimmed
        .replace(/^[•\-*▸▹➤➜→⮕✓☐☑]\s+/, '')
        .replace(/^\(?\d+[.)]\s+/, '')
        .trim();

      // Don't add bare URL links as checklist items
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('Register here: http')) {
        continue;
      }

      if (trimmed.length > 3 && trimmed.length < 150) {
        items.push(trimmed);
      }
      continue;
    }

    // Action imperative phrases
    const actionKeywords = /\b(bring|carry|submit|fill|download|print|prepare|wear|arrange|remember|must have|required|prerequisite)\b/i;
    if (actionKeywords.test(trimmed) && trimmed.length > 5 && trimmed.length < 150) {
      // Exclude full administrative disclaimers or forwarded headers
      if (!/(?:forwarded|officer|controller|subject|dean|regards)/i.test(trimmed)) {
        if (!/^https?:\/\//i.test(trimmed) && trimmed.split(' ').length <= 15) {
          items.push(trimmed);
        }
      }
    }
  }

  // Deduplicate and filter out junk
  return [...new Set(items)].slice(0, 8);
}

// ─── Registration Link ──────────────────────────────────────────

export function parseRegistrationLink(text: string): string {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex);
  if (matches) {
    for (const rawUrl of matches) {
      // Clean trailing punctuation like '.' or ')' if at sentence boundary
      const cleaned = rawUrl.replace(/[.,;:!)]+$/, '');
      const validated = validateUrl(cleaned);
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

// ─── Robust Title Extraction ────────────────────────────────────

export function parseTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Look for explicit Subject or Topic line: "Subject: Change in Examination Room..."
  for (const line of lines) {
    const subjectMatch = line.match(/^(?:subject|sub|topic|event|re)\s*[:–—-]\s*(.+)$/i);
    if (subjectMatch) {
      let cleaned = cleanTitleString(subjectMatch[1]);
      if (cleaned.length >= 5) return cleaned;
    }
  }

  // Generic administrative banners to skip
  const GENERIC_BANNERS = [
    /^(?:urgent|urgent notice|important|notice|circular|official circular|memo|memorandum|broadcast|announcement)$/i,
    /^(?:placement cell.*|academic section.*|examination section.*|exam notice.*)$/i,
    /^(?:forwarded.*|\*forwarded.*)$/i,
    /^(?:corrigendum.*|amendment notice.*|urgent update.*)$/i,
    /^(?:ref(?:\s+no)?\s*[:.\-].*)$/i,
    /^(?:all branches.*|all students.*|dear students.*)$/i,
  ];

  for (const line of lines) {
    let cleaned = cleanTitleString(line);

    // Skip generic banners
    const isGeneric = GENERIC_BANNERS.some(rx => rx.test(cleaned));
    if (isGeneric) continue;

    // Skip lines starting with metadata labels
    if (/^(?:date|time|venue|location|place|link|prerequisites?|eligibility|contact)\s*[:–—-]/i.test(cleaned)) {
      continue;
    }

    // Skip lines that are just numbers/dates/URLs
    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(cleaned)) continue;
    if (/^https?:\/\//i.test(cleaned)) continue;

    // Skip very short lines or divider lines
    if (cleaned.length < 5 || /^[-=*_~]{3,}$/.test(cleaned)) continue;

    // Truncate if overly long
    if (cleaned.length > 80) {
      cleaned = cleaned.slice(0, 77) + '...';
    }

    return cleaned;
  }

  return 'Untitled Campus Notice';
}

function cleanTitleString(str: string): string {
  let res = str.trim();
  let prev = '';
  // Strip emojis, quotes, and markdown characters repeatedly until clean
  while (res !== prev) {
    prev = res;
    res = res
      .replace(/^[\*_~`#\-+=\s🚨📢📌⚠️🎉🎊💼📋🔔❗💥🔥⚡🏆📅⏰📍]+/, '')
      .replace(/[\*_~`#\-+=\s🚨📢📌⚠️🎉🎊💼📋🔔❗💥🔥⚡🏆📅⏰📍]+$/, '')
      .trim();
  }
  return res;
}

// ─── Gemini AI Extraction ────────────────────────────────────────

const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash'];

async function extractWithGemini(text: string, apiKey: string): Promise<ExtractionResult | null> {
  const prompt = `Extract structured information from this campus notice/message. Return ONLY valid JSON with these fields:
{
  "title": "concise specific event title",
  "date": "YYYY-MM-DD or empty string",
  "time": "HH:MM in 24h format or empty string",
  "venue": "specific location or empty string",
  "category": one of "Academic", "Placement", "Events/Fest", "Clubs", "Admin/Exam",
  "targetBranches": array of "CSE","ECE","ME","EE","CE","All",
  "targetYears": array of "1st","2nd","3rd","4th",
  "actionChecklist": array of concise action items (things to bring/do/prepare),
  "registrationLink": "URL or empty string",
  "isCorrigendum": boolean (true if this updates/corrects a previous notice)
}

Notice text:
${text}`;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

      if (!response.ok) {
        console.warn(`Gemini (${model}) returned status ${response.status}. Falling back to offline parser.`);
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      const parsed = JSON.parse(content);
      return {
        title: parsed.title || parseTitle(text),
        date: parsed.date || parseDate(text),
        time: parsed.time || parseTime(text),
        venue: parsed.venue || parseVenue(text),
        category: parsed.category || classifyCategory(text),
        targetBranches: parsed.targetBranches || parseTargetBranches(text),
        targetYears: parsed.targetYears || parseTargetYears(text),
        actionChecklist: parsed.actionChecklist || parseActionChecklist(text),
        registrationLink: parsed.registrationLink ? (validateUrl(parsed.registrationLink) || '') : parseRegistrationLink(text),
        isCorrigendum: parsed.isCorrigendum ?? isCorrigendum(text),
        source: 'gemini',
      };
    } catch (err) {
      console.warn(`Gemini API connection error with model ${model}:`, err);
    }
  }

  return null;
}

// ─── Verification Confidence Scoring ───────────────────────────

export function assessVerificationConfidence(text: string): {
  status: 'Official' | 'Unverified';
  score: number;
  reason: string;
} {
  const lower = text.toLowerCase();
  let score = 50;
  const officialHits: string[] = [];
  const unverifiedHits: string[] = [];

  // Official authority indicators
  if (/controller\s+of\s+examination|coe|dean|principal|head\s+of\s+department|hod|registrar/i.test(lower)) {
    score += 25;
    officialHits.push('Official administration signatory');
  }
  if (/dr\.|prof\.|faculty\s+advisor|placement\s+officer|placement\s+cell/i.test(lower)) {
    score += 15;
    officialHits.push('Faculty/Officer designation');
  }
  if (/ref(?:\s+no)?\s*[:.\-]\s*[\w\d\-/]+|circular\s+no|order\s+no/i.test(lower)) {
    score += 20;
    officialHits.push('Document Reference/Circular number');
  }
  if (/@[\w\-.]*(?:ac\.in|edu|college|univ)/i.test(lower)) {
    score += 15;
    officialHits.push('Institutional domain contact');
  }
  if (/room\s+(?:no\.?\s*)?\d+|block\s+[a-z]|cabin\s+\d+/i.test(lower)) {
    score += 10;
    officialHits.push('Verifiable physical office location');
  }

  // Unverified/informal indicators
  if (/\b(?:forwarded\s+as\s+received|forwarded\s+many\s+times|\*forwarded\*)\b/i.test(lower)) {
    score -= 25;
    unverifiedHits.push('Unverified social forwarding chain');
  }
  if (/\b(?:rumour|rumor|unconfirmed|someone\s+said|heard\s+that|might\s+be|unofficial)\b/i.test(lower)) {
    score -= 30;
    unverifiedHits.push('Hearsay/speculative phrasing');
  }
  if (!/(?:date|time|venue|location|room)/i.test(lower)) {
    score -= 15;
    unverifiedHits.push('Missing verifiable event logistics');
  }

  const finalScore = Math.max(15, Math.min(99, score));
  const isOfficial = finalScore >= 65;

  return {
    status: isOfficial ? 'Official' : 'Unverified',
    score: finalScore,
    reason: isOfficial
      ? (officialHits.length > 0 ? officialHits.join(' • ') : 'Direct verified departmental release')
      : (unverifiedHits.length > 0 ? unverifiedHits.join(' • ') : 'Community forward without administrative signature'),
  };
}

// ─── Social & Context Prerequisite Enrichment ────────────────────

export function enrichSocialPrerequisites(checklist: string[], category: Category, text: string): string[] {
  const result = [...checklist];
  const lower = text.toLowerCase();

  // If hackathon/fest and no buddy item, suggest finding a teammate
  if ((category === 'Events/Fest' || lower.includes('hackathon') || lower.includes('ideathon')) &&
      !result.some(i => /team|buddy|partner/i.test(i))) {
    result.push('👥 Connect with a project buddy / assemble team');
  }

  // If academic lab / practical
  if ((category === 'Academic' || lower.includes('lab') || lower.includes('practical')) &&
      !result.some(i => /manual|code|repo/i.test(i))) {
    result.push('💻 Prepare lab manual & push code to Git repo');
  }

  // If placement drive
  if (category === 'Placement' && !result.some(i => /resume|cv/i.test(i))) {
    result.push('📄 Print 2 hardcopies of updated resume & college ID');
  }

  return [...new Set(result)].slice(0, 8);
}

// ─── Main Extraction Pipeline ────────────────────────────────────

export function extractLocal(text: string): ExtractionResult {
  const category = classifyCategory(text);
  const rawChecklist = parseActionChecklist(text);
  const actionChecklist = enrichSocialPrerequisites(rawChecklist, category, text);
  const verification = assessVerificationConfidence(text);

  return {
    title: parseTitle(text),
    date: parseDate(text),
    time: parseTime(text),
    venue: parseVenue(text),
    category,
    targetBranches: parseTargetBranches(text),
    targetYears: parseTargetYears(text),
    actionChecklist,
    registrationLink: parseRegistrationLink(text),
    isCorrigendum: isCorrigendum(text),
    source: 'offline',
    verificationStatus: verification.status,
    verificationScore: verification.score,
    verificationReason: verification.reason,
  };
}

export async function extractNotice(
  text: string,
  apiKey?: string
): Promise<ExtractionResult> {
  // Try AI extraction first if key provided
  if (apiKey && apiKey.trim()) {
    const aiResult = await extractWithGemini(text, apiKey.trim());
    if (aiResult && aiResult.title && aiResult.title !== 'Untitled Campus Notice') {
      const verification = assessVerificationConfidence(text);
      return {
        ...aiResult,
        actionChecklist: enrichSocialPrerequisites(aiResult.actionChecklist, aiResult.category, text),
        verificationStatus: verification.status,
        verificationScore: verification.score,
        verificationReason: verification.reason,
      };
    }
  }

  // Fallback to local heuristic NLP extraction
  return extractLocal(text);
}
