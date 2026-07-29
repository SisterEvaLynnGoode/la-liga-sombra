/**
 * Bell schedules.
 *
 * A case is always the same FIVE work items. What changes between schedules is
 * how many meetings you get and how long each one is — so the work items are
 * the stable thing and the meetings are the variable thing, not the other way
 * round.
 *
 * That ordering matters for a practical reason: the Pacing tab persists a
 * check-off per task id. If switching schedules changed the number of tasks,
 * every teacher's saved progress would break. Instead there are always five
 * task ids per unit week (w20-t1 … w20-t5) and the schedule only decides which
 * meeting each one lands in.
 */

export const WORK_ITEMS = [
  { key: "briefing", label: "Briefing", blurb: "Story deck → vocab deck → open the case" },
  { key: "field1", label: "Field I", blurb: "Clue-bearing stages" },
  { key: "field2", label: "Field II", blurb: "Finish the case + justify the arrest" },
  { key: "hq", label: "HQ", blurb: "Vocabulary + Grammar files on paper" },
  { key: "culture", label: "Culture", blurb: "Culture file + Pasaporte page" },
] as const;

export type WorkItemKey = (typeof WORK_ITEMS)[number]["key"];

export interface Meeting {
  key: string;
  /** Shown as the block heading, e.g. "Wed / Thu — 80-min block". */
  label: string;
  /** Short form for the Pacing tab task prefix, e.g. "Wed/Thu block". */
  shortLabel: string;
  minutes: number;
}

export interface Schedule {
  id: ScheduleId;
  label: string;
  description: string;
  meetings: Meeting[];
  /** One meeting key per work item, in WORK_ITEMS order. */
  assign: [string, string, string, string, string];
}

export type ScheduleId = "traditional" | "blockAB" | "blockFull";

export const SCHEDULES: Schedule[] = [
  {
    id: "traditional",
    label: "Five 50-minute periods",
    description: "Same length every day. One work item per day, Monday to Friday.",
    meetings: [
      { key: "d1", label: "Day 1 — 50 min", shortLabel: "Day 1", minutes: 50 },
      { key: "d2", label: "Day 2 — 50 min", shortLabel: "Day 2", minutes: 50 },
      { key: "d3", label: "Day 3 — 50 min", shortLabel: "Day 3", minutes: 50 },
      { key: "d4", label: "Day 4 — 50 min", shortLabel: "Day 4", minutes: 50 },
      { key: "d5", label: "Day 5 — 50 min", shortLabel: "Day 5", minutes: 50 },
    ],
    assign: ["d1", "d2", "d3", "d4", "d5"],
  },
  {
    id: "blockAB",
    label: "Block A/B — M/T/F 50 min + one 80-min block",
    description:
      "Mon, Tue and Fri are 50 minutes; the class meets once on Wed OR Thu for an 80-minute block. Four meetings, 230 minutes. Field II and HQ share the block — the long period absorbs the move from screens to paper.",
    meetings: [
      { key: "mon", label: "Monday — 50 min", shortLabel: "Mon", minutes: 50 },
      { key: "tue", label: "Tuesday — 50 min", shortLabel: "Tue", minutes: 50 },
      { key: "block", label: "Wed / Thu — 80-min block", shortLabel: "W/Th block", minutes: 80 },
      { key: "fri", label: "Friday — 50 min", shortLabel: "Fri", minutes: 50 },
    ],
    assign: ["mon", "tue", "block", "block", "fri"],
  },
  {
    id: "blockFull",
    label: "Block — M/T/F 50 min + Wed and Thu 80 min",
    description:
      "The class meets all five days: Mon, Tue and Fri at 50 minutes, Wed and Thu as 80-minute blocks. Five meetings, 310 minutes — the most room of any option.",
    meetings: [
      { key: "mon", label: "Monday — 50 min", shortLabel: "Mon", minutes: 50 },
      { key: "tue", label: "Tuesday — 50 min", shortLabel: "Tue", minutes: 50 },
      { key: "wed", label: "Wednesday — 80-min block", shortLabel: "Wed block", minutes: 80 },
      { key: "thu", label: "Thursday — 80-min block", shortLabel: "Thu block", minutes: 80 },
      { key: "fri", label: "Friday — 50 min", shortLabel: "Fri", minutes: 50 },
    ],
    assign: ["mon", "tue", "wed", "thu", "fri"],
  },
];

export const DEFAULT_SCHEDULE: ScheduleId = "traditional";

/**
 * One key, read by both the Lesson Plans page and the dashboard Pacing tab, so
 * choosing a schedule in one place changes the other. Stored per browser.
 */
export const SCHEDULE_STORAGE_KEY = "lls-bell-schedule";

export function loadScheduleId(): ScheduleId {
  if (typeof window === "undefined") return DEFAULT_SCHEDULE;
  try {
    const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return SCHEDULES.some((s) => s.id === raw) ? (raw as ScheduleId) : DEFAULT_SCHEDULE;
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export function saveScheduleId(id: ScheduleId): void {
  try {
    window.localStorage.setItem(SCHEDULE_STORAGE_KEY, id);
  } catch {
    /* ignore quota/availability errors */
  }
}

export function getSchedule(id: ScheduleId | string | null | undefined): Schedule {
  return SCHEDULES.find((s) => s.id === id) ?? SCHEDULES[0];
}

/** Which meeting does work item `i` (0-based, WORK_ITEMS order) fall in? */
export function meetingForWorkItem(schedule: Schedule, i: number): Meeting {
  const key = schedule.assign[i] ?? schedule.assign[schedule.assign.length - 1];
  return schedule.meetings.find((m) => m.key === key) ?? schedule.meetings[0];
}

/**
 * Prefix used on the Pacing tab, e.g. "Mon" or "W/Th block".
 * Task ids never change; only this label does.
 */
export function taskPrefix(schedule: Schedule, i: number): string {
  return meetingForWorkItem(schedule, i).shortLabel;
}
