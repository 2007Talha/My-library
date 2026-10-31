import { describe, it, expect } from 'vitest';
import {
  extractLocal,
  parseDate,
  parseTime,
  isCorrigendum,
  parseActionChecklist,
  assessVerificationConfidence,
  enrichSocialPrerequisites,
} from '../utils/smartExtractor';
import { classifyUrgency, computePriorityScore, detectClashes } from '../utils/priorityEngine';
import { sanitizeInput, validateUrl } from '../utils/sanitizer';
import type { Notice, StudentContext } from '../types/notice';

describe('My Library: Smart Extraction Engine', () => {
  it('1. extracts structured fields from messy WhatsApp forwarded text', () => {
    const rawMessyWhatsApp = `
      *FORWARDED AS RECEIVED* 🚨🚨🚨
      PLACEMENT CELL URGENT UPDATE
      TCS NQT Registration is closing!
      Date: 25/11/2026
      Time: 10:30 AM
      Venue: Seminar Hall A, CS Block
      All 3rd and 4th year CSE students must attend.
      Prerequisites:
      - Bring college ID card
      - Carry printed resume
      Link: https://tcs.com/careers
    `;

    const extracted = extractLocal(rawMessyWhatsApp);

    expect(extracted.title).toContain('TCS NQT');
    expect(extracted.date).toBe('2026-11-25');
    expect(extracted.time).toBe('10:30');
    expect(extracted.venue.toLowerCase()).toContain('seminar hall a');
    expect(extracted.category).toBe('Placement');
    expect(extracted.targetBranches).toContain('CSE');
    expect(extracted.actionChecklist.length).toBeGreaterThanOrEqual(2);
    expect(extracted.registrationLink).toBe('https://tcs.com/careers');
  });

  it('2. normalizes relative dates like "today" and "tomorrow" to ISO YYYY-MM-DD', () => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    expect(parseDate('Meeting is scheduled for today at 3pm')).toBe(todayISO);
    expect(parseDate('Submissions are due tomorrow by 5pm')).toBe(tomorrowISO);
  });

  it('3. accurately extracts time in 24-hour format from 12-hour AM/PM inputs', () => {
    expect(parseTime('Event starts at 10:30 AM')).toBe('10:30');
    expect(parseTime('Workshop begins at 2:15 PM')).toBe('14:15');
    expect(parseTime('Session at 4 PM in room 101')).toBe('16:00');
  });

  it('4. detects corrigendum and updates in notice content', () => {
    const notice1 = 'CORRIGENDUM: Venue changed to Auditorium for Data Structures midsem';
    const notice2 = 'Annual Sports Day schedule announced';

    expect(isCorrigendum(notice1)).toBe(true);
    expect(isCorrigendum(notice2)).toBe(false);
  });

  it('5. parses action checklists from bullets and action verbs', () => {
    const text = `
      Instructions for candidates:
      • Bring laptop fully charged
      • Carry college ID card
      1. Submit hardcopy of application
    `;
    const checklist = parseActionChecklist(text);
    expect(checklist).toContain('Bring laptop fully charged');
    expect(checklist).toContain('Carry college ID card');
    expect(checklist).toContain('Submit hardcopy of application');
  });

  it('6. assesses verification confidence between official admin sources and community forwards', () => {
    const officialText = `
      OFFICE OF THE CONTROLLER OF EXAMINATIONS
      REF NO: COE/CIRCULAR/2026/102
      Subject: Mid-Sem Practical Schedule
      All students must report to Lab 204.
      (Dr. S. K. Roy, Controller of Examinations, coe@college.ac.in)
    `;
    const unverifiedText = `
      *FORWARDED MANY TIMES*
      Guys rumour is exam might be postponed tomorrow, someone said so on group.
    `;

    const officialAssessment = assessVerificationConfidence(officialText);
    const unverifiedAssessment = assessVerificationConfidence(unverifiedText);

    expect(officialAssessment.status).toBe('Official');
    expect(officialAssessment.score).toBeGreaterThanOrEqual(75);

    expect(unverifiedAssessment.status).toBe('Unverified');
    expect(unverifiedAssessment.score).toBeLessThan(65);
  });

  it('7. auto-enriches social prerequisites with buddy matching for hackathons', () => {
    const baseChecklist = ['Install Python 3.12'];
    const enriched = enrichSocialPrerequisites(baseChecklist, 'Events/Fest', 'TECHFEST Hackathon 2026');

    expect(enriched).toContain('Install Python 3.12');
    expect(enriched.some(item => item.includes('buddy'))).toBe(true);
  });
});

describe('My Library: Priority & Context Engine', () => {
  it('8. classifies urgency correctly into Urgent, Upcoming, and Expired', () => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastISO = pastDate.toISOString().split('T')[0];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureISO = futureDate.toISOString().split('T')[0];

    expect(classifyUrgency(todayISO)).toBe('Urgent');
    expect(classifyUrgency(pastISO)).toBe('Expired');
    expect(classifyUrgency(futureISO)).toBe('Upcoming');
  });

  it('9. boosts priority score when notice matches student branch, year, and focus mode', () => {
    const studentContext: StudentContext = {
      branch: 'CSE',
      year: '3rd',
      focusMode: 'Placements',
      lowAttendanceWarning: false,
      attendancePercentage: 85,
    };

    const matchingNotice: Notice = {
      id: 'n1',
      title: 'TCS Placement Drive',
      rawText: '...',
      date: '2026-11-20',
      time: '10:00',
      venue: 'Auditorium',
      category: 'Placement',
      urgency: 'Upcoming',
      targetBranches: ['CSE', 'ECE'],
      targetYears: ['3rd', '4th'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 0,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 90,
      verificationReason: 'Verified',
    };

    const nonMatchingNotice: Notice = {
      id: 'n2',
      title: 'Mechanical Workshop for 1st Years',
      rawText: '...',
      date: '2026-11-20',
      time: '10:00',
      venue: 'Workshop Lab',
      category: 'Academic',
      urgency: 'Upcoming',
      targetBranches: ['ME'],
      targetYears: ['1st'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 0,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 90,
      verificationReason: 'Verified',
    };

    const matchScore = computePriorityScore(matchingNotice, studentContext);
    const nonMatchScore = computePriorityScore(nonMatchingNotice, studentContext);

    expect(matchScore).toBeGreaterThan(nonMatchScore);
    expect(matchScore).toBeGreaterThanOrEqual(70);
  });

  it('10. prioritizes mandatory labs over extracurricular fests when low attendance warning is active', () => {
    const lowAttendanceContext: StudentContext = {
      branch: 'CSE',
      year: '3rd',
      focusMode: 'All',
      lowAttendanceWarning: true,
      attendancePercentage: 68,
    };

    const labMakeupNotice: Notice = {
      id: 'lab-1',
      title: 'Operating Systems Mandatory Makeup Lab Practical',
      rawText: 'Compensatory lab session for attendance shortage',
      date: '2026-11-15',
      time: '14:00',
      venue: 'Lab 204',
      category: 'Academic',
      urgency: 'Upcoming',
      targetBranches: ['CSE'],
      targetYears: ['3rd'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 0,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 95,
      verificationReason: 'HOD Circular',
      isAttendanceRisk: true,
    };

    const festNotice: Notice = {
      id: 'fest-1',
      title: 'Annual Cultural Fest DJ Night',
      rawText: 'Celebration night with DJ and food stalls',
      date: '2026-11-15',
      time: '18:00',
      venue: 'Grounds',
      category: 'Events/Fest',
      urgency: 'Upcoming',
      targetBranches: ['All'],
      targetYears: ['1st', '2nd', '3rd', '4th'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 0,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 85,
      verificationReason: 'Fest team',
    };

    const labScore = computePriorityScore(labMakeupNotice, lowAttendanceContext);
    const festScore = computePriorityScore(festNotice, lowAttendanceContext);

    expect(labScore).toBeGreaterThan(festScore);
    expect(labScore).toBeGreaterThanOrEqual(90);
  });

  it('11. detects schedule clashes between overlapping notices on the same date and time', () => {
    const noticeA: Notice = {
      id: 'event-1',
      title: 'Operating Systems Midsem Exam',
      rawText: '...',
      date: '2026-11-15',
      time: '10:00',
      venue: 'Hall A',
      category: 'Admin/Exam',
      urgency: 'Upcoming',
      targetBranches: ['CSE'],
      targetYears: ['3rd'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 80,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 95,
      verificationReason: 'Verified',
    };

    const noticeB: Notice = {
      id: 'event-2',
      title: 'Google Developer Student Club Orientation',
      rawText: '...',
      date: '2026-11-15',
      time: '10:30', // Within 60 min -> Clash!
      venue: 'Auditorium',
      category: 'Clubs',
      urgency: 'Upcoming',
      targetBranches: ['CSE'],
      targetYears: ['3rd'],
      actionChecklist: [],
      registrationLink: '',
      priorityScore: 70,
      isCorrigendum: false,
      updatesNoticeId: null,
      createdAt: new Date().toISOString(),
      updatedBadge: false,
      verificationStatus: 'Official',
      verificationScore: 90,
      verificationReason: 'Verified',
    };

    const clashes = detectClashes([noticeA, noticeB]);
    expect(clashes.length).toBe(1);
    expect(clashes[0].overlapDescription).toContain('Operating Systems Midsem Exam');
    expect(clashes[0].overlapDescription).toContain('Google Developer Student Club Orientation');
  });
});

describe('My Library: Security & Sanitization', () => {
  it('12. strips dangerous script tags and event handlers to prevent XSS attacks', () => {
    const maliciousInput = '<script>alert("pwned")</script>Important Exam Notice <img src=x onerror=alert(1)>';
    const sanitized = sanitizeInput(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('Important Exam Notice');
  });

  it('13. validates URLs strictly permitting http/https while rejecting javascript: schemes', () => {
    expect(validateUrl('https://campus.edu/events')).toBe('https://campus.edu/events');
    expect(validateUrl('http://unstop.com/contest')).toBe('http://unstop.com/contest');
    expect(validateUrl('javascript:alert(document.cookie)')).toBeNull();
    expect(validateUrl('data:text/html,<script>evil()</script>')).toBeNull();
  });

  it('14. accurately parses WhatsApp placement circular without false-positive branches', () => {
    const raw = `
***URGENT*** 🚨🚨🚨
*FORWARDED AS RECEIVED*
PLACEMENT CELL CIRCULAR
TCS NQT registration is CLOSING TOMORROW!! 
All 3rd and 4th year CSE and ECE students MUST register before tomorrow 5 PM.
Date: 15/11/2026
Time: 10:00 AM
Venue: Seminar Hall A, Main Block
Prerequisites:
- Bring your laptop (fully charged)
- Carry 2 copies of updated resume
- College ID card is MANDATORY
- Register here: https://tcs.com/nqt-register
DO NOT MISS THIS!! Your placement eligibility depends on it!!
    `;
    const res = extractLocal(raw);
    expect(res.title).toContain('TCS NQT');
    expect(res.category).toBe('Placement');
    expect(res.date).toBe('2026-11-15');
    expect(res.time).toBe('10:00');
    expect(res.venue).toBe('Seminar Hall A, Main Block');
    expect(res.targetBranches).toContain('CSE');
    expect(res.targetBranches).toContain('ECE');
    expect(res.targetBranches).not.toContain('ME'); // Verify no false positive ME from "placement" or "time"
    expect(res.targetBranches).not.toContain('CE'); // Verify no false positive CE from "officer"
    expect(res.registrationLink).toBe('https://tcs.com/nqt-register');
  });

  it('15. accurately extracts Hackathon poster text with category and registration link', () => {
    const raw = `
🏆 TECHFEST 2026 - MEGA 24-HR HACKATHON 🏆
ALL BRANCHES | ALL YEARS WELCOME!
📅 Date: 20/12/2026
⏰ Time: 9:00 AM - 9:00 PM (Marathon session!)
📍 Venue: Main Auditorium + Innovation Labs
PRIZES WORTH ₹1,00,000! 🎉
How to participate:
1. Form a team of 2-4 members or connect with a buddy
2. Register on https://unstop.com/hackathons/techfest2026
3. Bring your own laptops and chargers
    `;
    const res = extractLocal(raw);
    expect(res.title).toContain('TECHFEST 2026');
    expect(res.category).toBe('Events/Fest');
    expect(res.date).toBe('2026-12-20');
    expect(res.time).toBe('09:00');
    expect(res.venue).toBe('Main Auditorium + Innovation Labs');
    expect(res.targetBranches).toEqual(['All']);
    expect(res.registrationLink).toBe('https://unstop.com/hackathons/techfest2026');
  });

  it('16. prioritizes updated venue over previous venue in corrigendum circulars', () => {
    const raw = `
CORRIGENDUM / AMENDMENT NOTICE
REF NO: COE/EXAM/REV/2026/88
Subject: Change in Examination Room for Mid-Semester Lab Exams
This is to notify all 2nd and 3rd Year CSE students that the venue for the Data Structures practical examination has been CHANGED.
Previous Venue: Room 301, Block A
Updated Venue: Room 105, Block B
Date: 12/11/2026
Time: 2:00 PM - 4:00 PM
- Controller of Examinations (coe@college.ac.in)
    `;
    const res = extractLocal(raw);
    expect(res.title).toBe('Change in Examination Room for Mid-Semester Lab Exams');
    expect(res.isCorrigendum).toBe(true);
    expect(res.venue).toBe('Room 105, Block B');
    expect(res.category).toBe('Admin/Exam');
    expect(res.time).toBe('14:00');
    expect(res.date).toBe('2026-11-12');
  });

  it('17. parses club orientation email with Google Form RSVP', () => {
    const raw = `
Subject: Welcome to the Coding Club! 🎉 Orientation this Friday
Hey everyone!
Our orientation session is happening this week:
📅 Date: 18/11/2026
🕐 Time: 4:30 PM onwards
📍 Venue: Computer Lab 3, CS Block
RSVP form: https://forms.google.com/coding-club-2026
    `;
    const res = extractLocal(raw);
    expect(res.title).toContain('Welcome to the Coding Club');
    expect(res.category).toBe('Clubs');
    expect(res.date).toBe('2026-11-18');
    expect(res.time).toBe('16:30');
    expect(res.venue).toBe('Computer Lab 3, CS Block');
    expect(res.registrationLink).toBe('https://forms.google.com/coding-club-2026');
  });
});
