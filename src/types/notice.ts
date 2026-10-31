export type Branch = 'CSE' | 'ECE' | 'ME' | 'EE' | 'CE' | 'All';
export type Year = '1st' | '2nd' | '3rd' | '4th';
export type FocusMode = 'Placements' | 'Academics' | 'HackathonsClubs' | 'All';

export type Category = 'Academic' | 'Placement' | 'Events/Fest' | 'Clubs' | 'Admin/Exam';
export type Urgency = 'Urgent' | 'Upcoming' | 'Expired';

export type VerificationStatus = 'Official' | 'Unverified';

export interface BuddyProfile {
  id: string;
  name: string;
  branch: Branch;
  year: Year;
  status: 'seeking' | 'matched';
  note: string;
}

export interface Notice {
  id: string;
  title: string;
  rawText: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM 24h format or empty
  venue: string;
  category: Category;
  urgency: Urgency;
  targetBranches: Branch[];
  targetYears: Year[];
  actionChecklist: string[];
  registrationLink: string;
  priorityScore: number;
  isCorrigendum: boolean;
  updatesNoticeId: string | null;
  createdAt: string; // ISO datetime
  updatedBadge: boolean;
  // Advanced Triage & Verification additions
  verificationStatus: VerificationStatus;
  verificationScore: number; // 0 to 100
  verificationReason: string;
  isAttendanceRisk?: boolean;
  buddies?: BuddyProfile[];
  isPinned?: boolean;
  author?: string;
  department?: string;
}

export interface StudentContext {
  branch: Branch;
  year: Year;
  focusMode: FocusMode;
  lowAttendanceWarning: boolean; // true if attendance < 75%
  attendancePercentage: number;  // e.g. 68% or 85%
}

export interface ExtractionResult {
  title: string;
  date: string;
  time: string;
  venue: string;
  category: Category;
  targetBranches: Branch[];
  targetYears: Year[];
  actionChecklist: string[];
  registrationLink: string;
  isCorrigendum: boolean;
  source?: 'gemini' | 'offline';
  verificationStatus?: VerificationStatus;
  verificationScore?: number;
  verificationReason?: string;
}

export interface ScheduleClash {
  noticeA: Notice;
  noticeB: Notice;
  date: string;
  overlapDescription: string;
}

export interface DemoPreset {
  label: string;
  description: string;
  context: StudentContext;
}

export interface SampleInput {
  label: string;
  emoji: string;
  text: string;
}

export type ViewMode = 'grid' | 'calendar';
export type UrgencyFilter = 'All' | 'Urgent' | 'Upcoming' | 'Expired';

