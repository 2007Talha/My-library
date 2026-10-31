import type { Notice, SampleInput, DemoPreset } from '../types/notice';

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

export interface OcrMockPreset {
  id: string;
  label: string;
  badge: string;
  filename: string;
  extractedText: string;
}

export const ocrMockPresets: OcrMockPreset[] = [
  {
    id: 'ocr-1',
    label: 'Chaotic Hackathon Fest Flyer (OCR Scan)',
    badge: '🖼️ Fest Flyer',
    filename: 'techblitz_hackathon_flyer_scan.png',
    extractedText: `[OCR SCAN: techblitz_hackathon_flyer_scan.png]
TECH-BLITZ 2026 🔥 ANNUAL INTER-COLLEGE HACKATHON
ORGANIZED BY CODE CLUB & IEEE STUDENT CHAPTER
PRIZE POOL: ₹1,00,000 CASH + INCUBATION OFFERS
Date: ${formatDDMMYYYY(4)}
Time: 09:30 AM onwards
Venue: Innovation & Incubation Center, Block 4
Open to ALL Branches and ALL Years!
Registration: https://techblitz.dev/register
Prerequisites:
• Bring laptop, power strip & college ID
• Team size 2-4 members (find a teammate if solo!)
• Free refreshments and pizzas provided 🍕`,
  },
  {
    id: 'ocr-2',
    label: 'WhatsApp Forward Chain (Unverified/Rumor)',
    badge: '💬 Forward Chain',
    filename: 'whatsapp_group_forward_chat.jpeg',
    extractedText: `[OCR SCAN: whatsapp_group_forward_chat.jpeg]
*FORWARDED MANY TIMES* 🚨🚨
Urgent update received from senior CR:
Rumour is that tomorrow's Data Structures Lab viva has been cancelled due to faculty meeting!
Postponed to: ${formatDDMMYYYY(3)} at 02:00 PM in Lab 104.
Link to unconfirmed student group discussion: https://chat.whatsapp.com/invite/unofficial-batch26
Please check with class representative before skipping class!!`,
  },
  {
    id: 'ocr-3',
    label: 'Official Academic Circular (Verified Source)',
    badge: '📜 Official Circular',
    filename: 'coe_official_circular_rev2026.pdf',
    extractedText: `[OCR SCAN: coe_official_circular_rev2026.pdf]
OFFICE OF THE CONTROLLER OF EXAMINATIONS
REF NO: COE/CIRCULAR/2026/89-A
DATE: ${formatDDMMYYYY(0)}
SUBJECT: MANDATORY REVISION OF MID-SEM LAB EXAMINATION VENUE & ATTENDANCE AUDIT

This is to formally notify all 2nd and 3rd Year CSE and ECE students that the Mid-Semester Laboratory Examination has been shifted.

Date of Exam: ${formatDDMMYYYY(1)}
Time: 10:00 AM - 01:00 PM
New Venue: Computer Center Lab 204 (Block B)

ATTENDANCE IS STRICTLY MANDATORY. Students with less than 75% overall attendance must submit their verified lab logs or face hall ticket detention.

Prerequisites:
• Bring signed practical record notebook & college ID
• Arrive 15 minutes prior to the slot
• Strictly adhere to formal laboratory attire

(Dr. K. R. Ramanathan, Controller of Examinations)
Email: coe@college.ac.in | Cabin 102, Admin Block`,
  },
];

export const sampleNotices: Notice[] = [
  {
    id: 'seed-1',
    title: 'TCS NQT Mock Test & Placement Drive',
    rawText: 'TCS NQT Mock Test & Placement Orientation session for eligible CSE and ECE students.',
    date: daysFromNow(0),
    time: '10:00',
    venue: 'Seminar Hall A',
    category: 'Placement',
    urgency: 'Urgent',
    targetBranches: ['CSE', 'ECE'],
    targetYears: ['3rd', '4th'],
    actionChecklist: [
      'Bring laptop fully charged',
      'Carry 2 copies of resume & college ID',
      'Review Quantitative Aptitude cheatsheet',
    ],
    registrationLink: 'https://tcs.com/nqt',
    priorityScore: 90,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 95,
    verificationReason: 'Verified release from Training & Placement Cell (Officer Dr. Sengupta)',
    isAttendanceRisk: false,
    buddies: [
      { id: 'b1', name: 'Aarav Sharma', branch: 'CSE', year: '3rd', status: 'seeking', note: 'Looking for a study partner to practice coding round questions together' },
      { id: 'b2', name: 'Rohan Verma', branch: 'ECE', year: '3rd', status: 'matched', note: 'Formed resume review pair' },
    ],
  },
  {
    id: 'seed-2',
    title: 'Mid-Semester Examination Schedule Published',
    rawText: 'Official mid-semester examination timetable released by the Controller of Examinations.',
    date: daysFromNow(2),
    time: '09:00',
    venue: 'Main Academic Exam Halls A-D',
    category: 'Admin/Exam',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Download admit card from student portal',
      'Verify seating row and roll number matrix',
      'Ensure minimum 75% attendance clearance',
    ],
    registrationLink: '',
    priorityScore: 85,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 98,
    verificationReason: 'Official Circular Ref COE/2026/410 signed by Controller of Examinations',
    isAttendanceRisk: true,
    buddies: [
      { id: 'b3', name: 'Ananya Gupta', branch: 'CSE', year: '3rd', status: 'seeking', note: 'Group study session for Operating Systems algorithms' },
    ],
  },
  {
    id: 'seed-3',
    title: 'TechFest 2026: Mega Hackathon Registration',
    rawText: 'Join TechFest 2026: 24-hour hackathon with cash prizes worth ₹1,00,000!',
    date: daysFromNow(5),
    time: '09:00',
    venue: 'Main Auditorium & Innovation Labs',
    category: 'Events/Fest',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Assemble team of 2-4 students or find a buddy',
      'Register project idea on portal',
      'Carry laptop, extension cords and chargers',
    ],
    registrationLink: 'https://unstop.com/hackathons/techfest-2026',
    priorityScore: 70,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 88,
    verificationReason: 'Approved student council fest committee release',
    isAttendanceRisk: false,
    buddies: [
      { id: 'b4', name: 'Kabir Mehta', branch: 'CSE', year: '3rd', status: 'seeking', note: 'Frontend dev looking for a backend/AI teammate for the hackathon' },
      { id: 'b5', name: 'Priya Nair', branch: 'ECE', year: '3rd', status: 'seeking', note: 'Hardware/IoT developer looking for cloud dev' },
    ],
  },
  {
    id: 'seed-4',
    title: 'Fresher Orientation & Campus Tour',
    rawText: 'Welcoming 1st Year students to the university orientation and club expo.',
    date: daysFromNow(1),
    time: '11:00',
    venue: 'Auditorium Block C',
    category: 'Clubs',
    urgency: 'Urgent',
    targetBranches: ['All'],
    targetYears: ['1st'],
    actionChecklist: [
      'Carry temporary college ID badge',
      'Pick up campus map and club handbook',
    ],
    registrationLink: '',
    priorityScore: 75,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 92,
    verificationReason: 'Dean of Student Welfare circular notice',
    isAttendanceRisk: false,
    buddies: [],
  },
  {
    id: 'seed-5',
    title: 'MANDATORY Lab Practical & Makeup Session',
    rawText: 'Compensatory makeup practical for students with attendance shortages below 75%.',
    date: daysFromNow(0),
    time: '14:30',
    venue: 'Advanced Computing Lab 202',
    category: 'Academic',
    urgency: 'Urgent',
    targetBranches: ['CSE', 'ECE'],
    targetYears: ['3rd'],
    actionChecklist: [
      'Complete lab manual experiments 1-8',
      'Get faculty signoff on practical logs',
      'Compulsory for students with <75% attendance',
    ],
    registrationLink: '',
    priorityScore: 95,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 94,
    verificationReason: 'Department HOD Office & Faculty Course Coordinator Notice',
    isAttendanceRisk: true,
    buddies: [
      { id: 'b6', name: 'Devendra Rao', branch: 'CSE', year: '3rd', status: 'seeking', note: 'Need a lab partner for OS thread synchronization code verification' },
    ],
  },
  {
    id: 'seed-6',
    title: 'CORRIGENDUM: Data Structures Lab Room Shifted',
    rawText: 'URGENT: Room change for today\'s Data Structures & Algorithms Lab due to network maintenance.',
    date: daysFromNow(0),
    time: '14:00',
    venue: 'Lab 204 (Changed from Lab 102)',
    category: 'Admin/Exam',
    urgency: 'Urgent',
    targetBranches: ['CSE'],
    targetYears: ['2nd', '3rd'],
    actionChecklist: [
      'Note new venue: Lab 204 Block B',
      'Bring lab observation log and storage drive',
    ],
    registrationLink: '',
    priorityScore: 92,
    isCorrigendum: true,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: true,
    verificationStatus: 'Official',
    verificationScore: 96,
    verificationReason: 'Verified room transfer circular by Head of CS Department',
    isAttendanceRisk: true,
    buddies: [],
  },
  {
    id: 'seed-7',
    title: 'Cultural Fest Dance & Music Auditions',
    rawText: 'Auditions for annual cultural festival showcase open to all students.',
    date: daysFromNow(4),
    time: '16:00',
    venue: 'Open Air Theatre (OAT)',
    category: 'Events/Fest',
    urgency: 'Upcoming',
    targetBranches: ['All'],
    targetYears: ['1st', '2nd', '3rd', '4th'],
    actionChecklist: [
      'Prepare 2-minute audition performance',
      'Submit music track on USB drive',
    ],
    registrationLink: 'https://campus.dance/auditions',
    priorityScore: 55,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Unverified',
    verificationScore: 48,
    verificationReason: 'Student WhatsApp community post; awaiting faculty coordinator stamp',
    isAttendanceRisk: false,
    buddies: [],
  },
  {
    id: 'seed-8',
    title: 'Infosys Campus Placement Pre-Talk',
    rawText: 'Infosys recruitment leadership talk covering roles, eligibility & interview format.',
    date: daysFromNow(3),
    time: '10:30',
    venue: 'Conference Hall B',
    category: 'Placement',
    urgency: 'Upcoming',
    targetBranches: ['CSE', 'ECE', 'EE'],
    targetYears: ['3rd', '4th'],
    actionChecklist: [
      'Prepare questions for HR team',
      'Formal dress code strictly enforced',
      'Carry college ID and registration slip',
    ],
    registrationLink: 'https://infosys.com/campus-drive-2026',
    priorityScore: 78,
    isCorrigendum: false,
    updatesNoticeId: null,
    createdAt: new Date().toISOString(),
    updatedBadge: false,
    verificationStatus: 'Official',
    verificationScore: 92,
    verificationReason: 'Verified Placement Cell bulletin broadcast',
    isAttendanceRisk: false,
    buddies: [
      { id: 'b7', name: 'Tanvi Joshi', branch: 'CSE', year: '4th', status: 'seeking', note: 'Looking for peer mock interview buddy for technical round' },
    ],
  },
];

export const sampleMessyInputs: SampleInput[] = [
  {
    label: 'WhatsApp Placement Forward',
    emoji: '💼',
    text: `***URGENT*** 🚨🚨🚨
*FORWARDED AS RECEIVED*
PLACEMENT CELL CIRCULAR
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
DO NOT MISS THIS!! Your placement eligibility depends on it!! 💼💼
Placement Officer: Dr. R. K. Sen (sen@college.ac.in)
*Forwarded many times*`,
  },
  {
    label: 'Hackathon Poster Caption',
    emoji: '🏆',
    text: `🏆 TECHFEST 2026 - MEGA 24-HR HACKATHON 🏆
ALL BRANCHES | ALL YEARS WELCOME!
📅 Date: ${formatDDMMYYYY(5)}
⏰ Time: 9:00 AM - 9:00 PM (Marathon session!)
📍 Venue: Main Auditorium + Innovation Labs
PRIZES WORTH ₹1,00,000! 🎉
How to participate:
1. Form a team of 2-4 members or connect with a buddy
2. Register on https://unstop.com/hackathons/techfest2026
3. Bring your own laptops and chargers
4. Prepare your problem statement
Categories: AI/ML, Web Dev, Cloud, CyberSecurity
Faculty Coordinator: Prof. Vikas Sharma`,
  },
  {
    label: 'Exam Room Change Corrigendum',
    emoji: '📋',
    text: `CORRIGENDUM / AMENDMENT NOTICE
REF NO: COE/EXAM/REV/2026/88
Subject: Change in Examination Room for Mid-Semester Lab Exams
This is to notify all 2nd and 3rd Year CSE students that the venue for the Data Structures & Algorithms practical examination has been CHANGED.
Previous Venue: Room 301, Block A
Updated Venue: Room 105, Block B
Date of Exam: ${formatDDMMYYYY(2)}
Time: 2:00 PM - 4:00 PM
Students must note the new room number. Bring your admit card, practical log, and college ID.
ATTENDANCE IS MANDATORY for hall ticket eligibility.
- Controller of Examinations (coe@college.ac.in)`,
  },
  {
    label: 'Club Orientation Email',
    emoji: '🎭',
    text: `Subject: Welcome to the Coding Club! 🎉 Orientation this Friday
Hey everyone!
We're super excited to kick off the new session of the Coding Club! 
Our orientation session is happening this week:
📅 Date: ${formatDDMMYYYY(4)}
🕐 Time: 4:30 PM onwards
📍 Venue: Computer Lab 3, CS Block
What to expect:
- Meet the core team & find hackathon buddies
- Overview of activities for this semester
- Mini coding challenge with prizes!
- Free pizzas 🍕
Open to ALL branches and ALL years!
RSVP form: https://forms.google.com/coding-club-2026
See you there! 👋
- Coding Club Core Team`,
  },
];

export const demoPresets: DemoPreset[] = [
  {
    label: '3rd Year CSE — Placement & Hackathon Seeker',
    description: 'Focus on placements, hiring drives, and competitive tech hackathons',
    context: {
      branch: 'CSE',
      year: '3rd',
      focusMode: 'Placements',
      lowAttendanceWarning: false,
      attendancePercentage: 86,
    },
  },
  {
    label: '3rd Year CSE — Urgent Lab & Mid-Term Exam Mode',
    description: 'Prioritizes mandatory practicals, make-up submissions, and viva schedules',
    context: {
      branch: 'CSE',
      year: '3rd',
      focusMode: 'Academics',
      lowAttendanceWarning: true,
      attendancePercentage: 68,
    },
  },
  {
    label: '1st Year Fresher Explorer',
    description: 'Explore campus clubs, orientations, hackathons, and cultural fests',
    context: {
      branch: 'All',
      year: '1st',
      focusMode: 'All',
      lowAttendanceWarning: false,
      attendancePercentage: 92,
    },
  },
  {
    label: '4th Year ECE — Academics & Placements',
    description: 'Focus on core placement talks and research thesis deadlines',
    context: {
      branch: 'ECE',
      year: '4th',
      focusMode: 'Placements',
      lowAttendanceWarning: false,
      attendancePercentage: 79,
    },
  },
];
