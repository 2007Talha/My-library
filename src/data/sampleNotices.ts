import type { Notice, SampleInput, DemoPreset } from '../types/notice';

// ---------------------------------------------------------------------------
// Date helpers – all dates are computed relative to "right now" so the seed
// data always looks fresh no matter when the app is loaded.
// ---------------------------------------------------------------------------

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatDDMMYYYY(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// 1. Pre-built notices
// ---------------------------------------------------------------------------

export const sampleNotices: Notice[] = [
  {
    id: 'seed-1',
    title: 'TCS NQT Mock Test & Orientation',
    rawText:
      'TCS NQT Mock Test & Orientation session for all eligible CSE and ECE students.',
    date: daysFromNow(0),
    time: '10:00',
    venue: 'Seminar Hall A',
    category: 'Placement',
    urgency: 'Urgent',
    targetBranches: ['CSE', 'ECE'],
    targetYears: ['3rd', '4th'],
    actionChecklist: [
      'Bring laptop',
      'Carry resume copies',
      'College ID mandatory',
    ],
    registrationLink: 'https://tcs.com/nqt',
    priorityScore: 90,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-2',
    title: 'Mid-Semester Exam Schedule Released',
    rawText:
      'Mid-semester examination schedule has been published for all branches and years.',
    date: daysFromNow(2),
    time: '09:00',
    venue: 'Check department notice board',
    category: 'Admin/Exam',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Download admit card from portal',
      'Check seating arrangement',
    ],
    registrationLink: '',
    priorityScore: 75,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-3',
    title: 'TechFest Hackathon Registration Open',
    rawText:
      'TechFest 2026 mega hackathon registrations are now open for all branches and years.',
    date: daysFromNow(5),
    time: '09:00',
    venue: 'Main Auditorium',
    category: 'Events/Fest',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Form team of 3-4 members',
      'Register on unstop.com',
      'Bring laptops and chargers',
    ],
    registrationLink: 'https://unstop.com/hackathon/techfest2026',
    priorityScore: 70,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-4',
    title: 'Fresher Orientation & Campus Tour',
    rawText:
      'Orientation and campus tour for all first-year students across every branch.',
    date: daysFromNow(1),
    time: '11:00',
    venue: 'Auditorium Block C',
    category: 'Clubs',
    urgency: 'Urgent',
    targetBranches: ['All'],
    targetYears: ['1st'],
    actionChecklist: ['Carry college ID', 'Wear formal attire'],
    registrationLink: '',
    priorityScore: 80,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-5',
    title: 'Research Paper Submission Deadline',
    rawText:
      'Last date for submitting research papers in IEEE format for CSE and ECE final-year students.',
    date: daysFromNow(7),
    time: '23:59',
    venue: 'Online submission portal',
    category: 'Academic',
    urgency: 'Upcoming',
    targetBranches: ['CSE', 'ECE'],
    targetYears: ['4th'],
    actionChecklist: [
      'Submit via IEEE format',
      'Include plagiarism report',
    ],
    registrationLink: 'https://ieee.org/submit',
    priorityScore: 65,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-6',
    title: 'URGENT: Data Structures Lab Room Change',
    rawText:
      'Data Structures lab for 2nd year CSE has been moved from Lab 102 to Lab 204 effective today.',
    date: daysFromNow(0),
    time: '14:00',
    venue: 'Lab 204 (Changed from Lab 102)',
    category: 'Admin/Exam',
    urgency: 'Urgent',
    targetBranches: ['CSE'],
    targetYears: ['2nd'],
    actionChecklist: ['Note new room number', 'Bring lab manual'],
    registrationLink: '',
    priorityScore: 95,
    isCorrigendum: true,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: true,
  },
  {
    id: 'seed-7',
    title: 'Cultural Fest Dance Auditions',
    rawText:
      'Dance auditions for the upcoming cultural fest — all branches and years welcome.',
    date: daysFromNow(4),
    time: '16:00',
    venue: 'Open Air Theatre',
    category: 'Events/Fest',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Prepare 2-min solo piece',
      'Wear comfortable clothes',
    ],
    registrationLink: '',
    priorityScore: 50,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
  {
    id: 'seed-8',
    title: 'Infosys Pre-Placement Talk',
    rawText:
      'Infosys pre-placement talk for 3rd and 4th year CSE, ECE, and EE students.',
    date: daysFromNow(3),
    time: '10:30',
    venue: 'Conference Hall B',
    category: 'Placement',
    urgency: 'Upcoming',
    targetBranches: ['CSE', 'ECE', 'EE'],
    targetYears: ['3rd', '4th'],
    actionChecklist: [
      'Carry updated resume',
      'Formal dress code mandatory',
      'Note your registration ID',
    ],
    registrationLink: '',
    priorityScore: 78,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
  },
];

// ---------------------------------------------------------------------------
// 2. Messy sample inputs for 1-click demo testing
// ---------------------------------------------------------------------------

export const sampleMessyInputs: SampleInput[] = [
  {
    label: 'WhatsApp Placement Forward',
    emoji: '💼',
    text: `***URGENT*** 🚨🚨🚨

Forwarded as received:
------
PLACEMENT CELL NOTICE

TCS NQT registration is CLOSING TOMORROW!! 

All 3rd and 4th year CSE and ECE students MUST register before tomorrow 5 PM.

Date: ${formatDDMMYYYY(1)}
Time: 10:00 AM
Venue: Seminar Hall A, Main Block

Prerequisites:
- Bring your laptop (fully charged)
- Carry 2 copies of updated resume
- College ID card is MANDATORY
- Register here: https://tcs.com/nqt-register

DO NOT MISS THIS!! Your placement depends on it!! 💼💼

*Forwarded many times*`,
  },
  {
    label: 'Hackathon Poster Caption',
    emoji: '🏆',
    text: `🏆 TECHFEST 2026 - MEGA HACKATHON 🏆

ALL BRANCHES | ALL YEARS WELCOME!

📅 Date: ${formatDDMMYYYY(5)}  
⏰ Time: 9:00 AM - 9:00 PM (12-hour marathon!)
📍 Venue: Main Auditorium + CS Labs

PRIZES WORTH ₹50,000! 🎉

How to participate:
1. Form a team of 3-4 members
2. Register on https://unstop.com/hackathon/techfest2026
3. Bring your own laptops and chargers
4. Prepare your problem statement

Categories: AI/ML, Web Dev, IoT, Blockchain

Last date to register: ${formatDDMMYYYY(3)}

#TechFest2026 #Hackathon #CodeToWin`,
  },
  {
    label: 'Exam Room Change Corrigendum',
    emoji: '📋',
    text: `CORRIGENDUM / AMENDMENT

Reference: Academic Section Notice dated ${formatDDMMYYYY(-2)}
Subject: Change in Examination Room for Mid-Semester Exams

This is to notify all 2nd Year CSE students that the venue for the Data Structures & Algorithms mid-semester examination has been CHANGED.

Previous Venue: Room 301, Block A
Updated Venue: Room 105, Block B

Date of Exam: ${formatDDMMYYYY(2)}
Time: 2:00 PM - 4:00 PM

Students must note the new room number. Bring your admit card and college ID.

- Controller of Examinations`,
  },
  {
    label: 'Club Orientation Email',
    emoji: '🎭',
    text: `Subject: Welcome to the Coding Club! 🎉 Orientation this Friday

Hey everyone!

We're super excited to kick off the new session of the Coding Club! 

Our orientation session is happening this Friday:

📅 ${formatDDMMYYYY(4)}
🕐 4:30 PM onwards
📍 Computer Lab 3, CS Block

What to expect:
- Meet the core team
- Overview of activities for this semester
- Mini coding challenge with prizes!
- Free pizzas 🍕

Open to ALL branches and ALL years!

Please fill this form to RSVP: https://forms.google.com/coding-club-2026

See you there! 👋
- Coding Club Core Team`,
  },
];

// ---------------------------------------------------------------------------
// 3. Demo presets for student persona switching
// ---------------------------------------------------------------------------

export const demoPresets: DemoPreset[] = [
  {
    label: '3rd Year CSE — Placement & Hackathon Seeker',
    description: 'Focus on placements and tech events',
    context: { branch: 'CSE', year: '3rd', focusMode: 'Placements' },
  },
  {
    label: '1st Year Fresher Explorer',
    description: 'See everything happening on campus',
    context: { branch: 'All', year: '1st', focusMode: 'All' },
  },
  {
    label: '4th Year ECE — Academics & Research',
    description: 'Focus on academic deadlines and research',
    context: { branch: 'ECE', year: '4th', focusMode: 'Academics' },
  },
];
