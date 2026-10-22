/* =========================================================
   DATE UTILITIES
   Central place for every date/time calculation used
   across the app. Everything uses the browser's local
   timezone — no UTC conversions, no external date library.
   ========================================================= */

/* ---------------------------------------------------------
   Parse a "YYYY-MM-DD" string into a local Date at midnight.
   (new Date("YYYY-MM-DD") parses as UTC and can shift the
   day backward depending on the user's timezone — this avoids
   that bug.)
--------------------------------------------------------- */
export function parseDateOnly(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

/* ---------------------------------------------------------
   Format a Date object as "YYYY-MM-DD" (for storage/comparison)
--------------------------------------------------------- */
export function toISODateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ---------------------------------------------------------
   Start-of-day helper (strips hours/min/sec/ms)
--------------------------------------------------------- */
export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isSameDate(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/* ---------------------------------------------------------
   GREETING — based on current local hour
--------------------------------------------------------- */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";

  return "Good night";
}

/* ---------------------------------------------------------
   "WEDNESDAY, SEPTEMBER 2" — for the dashboard eyebrow
--------------------------------------------------------- */
export function getFormattedToday(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return formatter.format(date).toUpperCase();
}

/* ---------------------------------------------------------
   "02 Sept 2026" — for task due-date display
--------------------------------------------------------- */
export function formatDate(dateString) {
  const date = parseDateOnly(dateString);

  if (!date) return "No due date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ---------------------------------------------------------
   OVERDUE — due date is strictly before today AND
   the task is not Completed. A task due today is not
   overdue yet.
--------------------------------------------------------- */
export function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") {
    return false;
  }

  const due = parseDateOnly(task.dueDate);

  if (!due) return false;

  return startOfDay(due) < startOfDay(new Date());
}

/* ---------------------------------------------------------
   RELATIVE TIME — "Just now", "5 minutes ago", "Yesterday"...
   Used by the Recent Activity feed.
--------------------------------------------------------- */
export function getRelativeTime(timestamp) {
  if (!timestamp) return "";

  const then = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return then.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/* ---------------------------------------------------------
   CALENDAR MONTH MATH
--------------------------------------------------------- */
export function getDaysInMonth(year, month) {
  // Day 0 of next month = last day of this month.
  // This naturally handles leap years (Feb 29 vs 28).
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstWeekdayOfMonth(year, month) {
  // 0 = Sunday ... 6 = Saturday
  return new Date(year, month, 1).getDay();
}

/* ---------------------------------------------------------
   CURRENT WEEK (Monday → Sunday) — for the weekly chart
--------------------------------------------------------- */
export function getCurrentWeekDates(referenceDate = new Date()) {
  const date = startOfDay(referenceDate);
  const day = date.getDay(); // 0 = Sunday

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const week = [];

  for (let i = 0; i < 7; i += 1) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    week.push(current);
  }

  return week;
}

export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];