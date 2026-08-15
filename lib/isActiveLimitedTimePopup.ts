import type { Place } from './types';

/** Parse YYYY-MM-DD (or ISO date prefix) in the user's local calendar. */
function parseLocalDateOnly(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * True when the place is marked popup and today's local date falls between
 * startDate and endDate (inclusive). Requires both dates when popup is true for highlighting.
 */
export function isActiveLimitedTimePopup(
  place: Pick<Place, 'popup' | 'startDate' | 'endDate'>
): boolean {
  if (!place.popup) return false;
  const start = parseLocalDateOnly(place.startDate);
  const end = parseLocalDateOnly(place.endDate);
  if (!start || !end) return false;
  const today = startOfLocalDay(new Date());
  return today >= startOfLocalDay(start) && today <= startOfLocalDay(end);
}

/**
 * True when the place is a limited-time pop-up whose end date is strictly in the
 * past (i.e. the event/weekend is over).
 */
export function isExpiredLimitedTimePopup(
  place: Pick<Place, 'popup' | 'endDate'>,
  now: Date = new Date()
): boolean {
  if (!place.popup) return false;
  const end = parseLocalDateOnly(place.endDate);
  if (!end) return false;
  return startOfLocalDay(now) > startOfLocalDay(end);
}
