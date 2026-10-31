# Campus Pulse — Intelligent Context-Aware Campus Notice & Schedule Assistant

> Built for the **PromptWars × CSSS** Challenge by Google for Developers & H2S.

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success)](#accessibility--wcag-21-aa)
[![Bundle Size](https://img.shields.io/badge/Repository_Size-<10MB_Strict-brightgreen)](#repository--submission-compliance)

---

## 1. Chosen Vertical

### **Campus Pulse — Intelligent Context-Aware Campus Notice & Schedule Assistant**
*College students at every university face the same daily friction: scattered notices across fragmented WhatsApp groups, missed application deadlines, ambiguous event details, and no single source of truth for campus life.*

**Campus Pulse** solves this problem by transforming unstructured, chaotic campus messages (forwarded WhatsApp texts, hasty emails, event poster captions) into clean, actionable, context-prioritized intelligence. It equips students with:
- **Zero-Friction Smart Input:** Paste any messy forwarded notice and extract actionable data in under a second.
- **Student Profile Context Engine:** Dynamically customizes urgency and relevance based on Branch (e.g., CSE, ECE, ME), Year of Study (1st–4th), and Focus Mode (Placements, Academics, Hackathons & Clubs).
- **Hero "Needs Attention Today" Spotlight:** Surfacing critical tasks, 24-hour countdowns, and schedule clash warnings immediately.
- **Multi-Modal Organized Views:** Seamless toggling between an interactive Card Grid and an organized Calendar Schedule.
- **Weekly Executive Digest:** A 1-click summary drawer with clean formatted text ready to copy-paste into study groups and WhatsApp class channels.

---

## 2. Approach and Logic

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RAW MESSY CAMPUS NOTICE                         │
│       (WhatsApp forward, flyer caption, corrigendum, email notice)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INPUT SANITIZATION LAYER                        │
│             (XSS strip, script filter, safe URL validation)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       HYBRID EXTRACTION PIPELINE                       │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ Optional Gemini 2.0 Flash    │ OR │ Heuristic Offline NLP Engine │  │
│  │ (Structured schema parsing)  │    │ (Regex, entity dictionary)   │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CORRIGENDUM & CONTEXT MATCH ENGINE                   │
│  • Title fuzzy-matching for corrigendum updates                        │
│  • Audience parsing: Target branches & graduation years                │
│  • Action checklist extractor & iCalendar (.ics) generator             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    STUDENT CONTEXT PRIORITY MATRIX                     │
│    Urgency Weight (80/50/10) + Branch Boost (+10) + Year Boost (+10)  │
│                 + Focus Mode Category Affinity (+10)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION & TRIAGE VIEWS                      │
│     [Needs Attention Today] ── [Card Grid] ── [Calendar Schedule]      │
│                     [Weekly Executive Digest]                          │
└────────────────────────────────────────────────────────────────────────┘
```

### A. Hybrid AI + Deterministic Heuristic NLP Pipeline (`src/utils/smartExtractor.ts`)
Campus Pulse employs a robust, two-tiered hybrid parsing architecture:
1. **Tier 1 (Zero-Key Local NLP Engine):** Designed for complete offline capability, zero latency, and privacy preservation. It leverages rule-based heuristic tokenizers and regex extractors:
   - **Date Extraction & Normalization:** Resolves standard notations (`DD/MM/YYYY`, `DD-MM-YYYY`, `Month DD`, `YYYY-MM-DD`) and relative dates (`today`, `tomorrow`, `this Friday`, `next Monday`) normalized to ISO `YYYY-MM-DD`.
   - **Time Parser:** Handles both 12-hour (`HH:MM AM/PM`, `H PM`) and 24-hour formats (`HH:MM`), normalizing to military time.
   - **Venue Extraction:** Context-aware entity detection scanning for campus infrastructure keywords (`Auditorium`, `Seminar Hall`, `Lab 204`, `Room 105`, `Online/Zoom`).
   - **Category Classifier:** Multi-word weighted heuristic classification across five distinct domains:
     - `Placement` (recruitment, interviews, aptitude, CTC, LPA, resume, drives)
     - `Admin/Exam` (midsem, endsem, hall ticket, seating, marks, attendance, corrigendum)
     - `Events/Fest` (hackathon, coding challenge, techfest, cultural, conference)
     - `Clubs` (orientation, induction, society, student chapter, meetups)
     - `Academic` (lectures, labs, assignments, project submissions, viva)
   - **Checklist & Action Item Parser:** Identifies prep steps from bullets (`•`, `-`, `*`), numbered lists, and directive verbs (`bring`, `carry`, `submit`, `register`, `download`).
2. **Tier 2 (Cloud AI Enhancement):** When an optional Google Gemini API key is configured in the browser, extraction automatically utilizes `gemini-2.0-flash` with strict JSON schema decoding. If the network call fails or the API key is absent, it seamlessly falls back to the deterministic Tier 1 engine without user disruption.

### B. Student Context Priority Matrix (`src/utils/priorityEngine.ts`)
Each notice dynamically computes a real-time `priorityScore` (0–100) and urgency state calculated against the user's active profile:
- **Base Urgency Tier:**
  - `Urgent` (80 pts): Due today or within 24 hours.
  - `Upcoming` (50 pts): Scheduled for future dates.
  - `Expired` (10 pts): Passed deadlines.
- **Context Affinity Multipliers:**
  - **Branch Match:** +10 points if the notice targets the student's branch (or `All`); -15 points penalty if explicitly restricted to other departments.
  - **Year Match:** +10 points if the student's graduation year matches; -10 points penalty if excluded.
  - **Focus Mode Affinity:** +10 points if the notice aligns with the student's active focus:
    - *Placements:* Prioritizes `Placement` and `Admin/Exam`.
    - *Academics:* Prioritizes `Academic` and `Admin/Exam`.
    - *Hackathons & Clubs:* Prioritizes `Events/Fest` and `Clubs`.

### C. Schedule Clash Detection
Events occurring on the identical date with overlapping time boundaries (within a 60-minute window) are automatically flagged by `detectClashes()`. The system immediately surfaces collision alerts both in the **"Needs Attention Today"** hero strip and within the **Weekly Digest**, helping students prevent missed exams or double-booked interview rounds.

### D. Smart Corrigendum / Notice Merging
Campus notices are frequently amended at the last minute (e.g., room change or postponed timings). When incoming text contains keywords such as `CORRIGENDUM`, `UPDATE`, `VENUE CHANGED`, or `RESCHEDULED`, the app calculates title token similarity against existing notices. If a match is detected (similarity threshold $\ge 0.4$), the user is prompted with an interactive modal to either:
1. **Merge & Update:** Update existing venue, time, date, append action items, and apply an `Updated` status badge.
2. **Add as Separate:** Retain both cards independently.

---

## 3. How the Solution Works

### Step-by-Step User Flow
1. **Student Context Switcher:** The user sets their **Branch** (e.g., CSE), **Year** (e.g., 3rd), and **Focus Mode** (e.g., Placements) or selects one of the 1-click **Demo Presets**. All priority scores and filters re-index instantaneously.
2. **Hero Spotlight ("Needs Attention Today"):** The top banner highlights urgent deadlines occurring today or tomorrow, countdown badges, and immediate schedule clash alerts.
3. **Smart Input & 1-Click Samples:** Users paste unformatted text into the input field or click one of the 4 demo presets (WhatsApp Placement Forward, Hackathon Poster Caption, Exam Room Change Corrigendum, Club Orientation Email).
4. **Extraction & Triage:** The notice is sanitized and parsed. Extracted data fields (title, date, time, venue, category, action checklist, registration link) are structured and inserted into state.
5. **Organized Multi-Modal Views:**
   - **Card Grid:** Shows urgency badges, context badges ("Relevant to You"), expandable preparation checklists with persistent checkbox tracking, external link validation, and a 1-click **Export to Calendar (.ics)** download.
   - **Calendar Schedule:** Visual month/week view color-coded by category with day-selection drill-down.
6. **AI Weekly Digest ("What do I need to know this week?"):** Students can trigger an executive summary modal breaking down immediate deadlines, key events, clash warnings, and a 1-click **"Copy Clean WhatsApp Summary"** button to share with classmates.

---

### Local Setup & Execution Guide

#### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git

#### 1. Clone & Navigate to Repository
```bash
git clone <your-repository-url>
cd promptwarsCSSS
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

#### 4. Run Unit Test Suite
```bash
npm run test
```
To run tests in watch mode:
```bash
npm run test:watch
```

#### 5. Build for Production
```bash
npm run build
```
Generates a strictly tree-shaken, optimized production bundle inside the `dist/` directory.

---

## 4. Testing & Validation

The project includes automated unit test suites using **Vitest** in `src/__tests__/campusPulse.test.ts`:

| # | Test Scenario | Verified Module | Status |
|---|---------------|-----------------|--------|
| 1 | Messy WhatsApp forward extraction (title, date, time, venue, category, links) | `smartExtractor.ts` | **PASS** |
| 2 | Normalization of relative dates ("today", "tomorrow", day names) into ISO format | `smartExtractor.ts` | **PASS** |
| 3 | 12-hour AM/PM to 24-hour time parsing and formatting | `smartExtractor.ts` | **PASS** |
| 4 | Corrigendum & amendment keyword detection | `smartExtractor.ts` | **PASS** |
| 5 | Action items checklist parsing from bullet characters and imperative verbs | `smartExtractor.ts` | **PASS** |
| 6 | Urgency classification (`Urgent`, `Upcoming`, `Expired`) relative to current date | `priorityEngine.ts` | **PASS** |
| 7 | Dynamic context priority boosting (branch, year, and focus mode affinities) | `priorityEngine.ts` | **PASS** |
| 8 | Schedule conflict detection between overlapping event timeframes | `priorityEngine.ts` | **PASS** |
| 9 | XSS prevention: Stripping `<script>` tags, inline handlers, and malicious HTML | `sanitizer.ts` | **PASS** |
| 10 | Strict URL validation: Allowing `http:`/`https:`, rejecting `javascript:`/data URIs | `sanitizer.ts` | **PASS** |

---

## 5. Assumptions Made

1. **Date Normalization:** When a notice does not explicitly specify a calendar year (e.g., "15th November"), the extractor assumes the event belongs to the current academic year. Past dates are automatically categorized into the `Expired` urgency bucket.
2. **Zero-Key Deterministic Fallback:** While an optional Gemini 2.0 Flash API key can be saved in the client's local storage, the application operates 100% offline with zero external dependencies using the embedded heuristic parser.
3. **Client-Side Persistence:** All notice data, checklist completion states, student context choices, and optional API keys are persisted strictly inside the browser's `localStorage` (`campus-pulse-notices`, `campus-pulse-context`, etc.). No student data or secrets ever leave the local machine.
4. **Schedule Collision Window:** Events on the same date with scheduled start times within 60 minutes of each other are assumed to conflict unless explicit end times dictate otherwise.
5. **Initial Persona Presets:** First-time users load with pre-populated realistic campus data (mock tests, lab room changes, hackathons, auditions) so evaluators can test and understand the workflow immediately without onboarding instructions.

---

## 6. Accessibility (WCAG 2.1 AA) & Security

- **Accessible Landmarks:** Semantic HTML5 `<header>`, `<main id="main-content">`, `<section>`, `<nav>`, `<article>`, and `<footer>` elements.
- **Screen Reader Support:** ARIA attributes (`aria-label`, `aria-live="polite"`, `aria-pressed`, `aria-modal`, `role="tablist"`).
- **Keyboard Navigation:** Full support for `Tab`, `Enter`, `Space`, and `Escape` modal dismissal. Visible high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Color Independence:** Status badges pair distinct icons with text labels so color is never the sole indicator of urgency or category.
- **XSS & Link Security:** Every user-submitted notice is sanitized before storage or DOM rendering. All outbound links enforce `rel="noopener noreferrer"` with strict `http:` and `https:` protocol validation.

---

## 7. Repository & Submission Compliance

- **Single Git Branch:** All commits remain strictly on the `main` branch.
- **Repository Size Limit:** Total repository source code is **~0.28 MB** (well below the 10 MB strict limit).
- **Clean `.gitignore`:** Strict exclusion of `node_modules/`, `dist/`, `.env*`, `coverage/`, and OS temp files.
- **Zero Placeholders:** 100% modular, production-ready code with zero `// TODO` or unfinished logic.
