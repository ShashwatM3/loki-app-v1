/**
 * Group availability for a collection: who is free on which day.
 * 1:1 port of the web's lib/collectionAvailability.ts.
 *
 * Dates are plain `YYYY-MM-DD` local-day strings so a day means the same thing
 * to everyone regardless of timezone, and the picker always covers a rolling
 * two-week window starting today.
 */

export interface AvailabilityEntry {
  /** Display name of the participant. */
  name?: string;
  /** Emoji avatar (link guests) — mutually exclusive with `photo` in practice. */
  avatar?: string;
  /** Avatar image URL (signed-in members). */
  photo?: string;
  /** `YYYY-MM-DD` days this participant marked themselves free. */
  dates: string[];
}

/** participantId -> availability */
export type CollectionAvailability = Record<string, AvailabilityEntry>;

/** Number of days the availability calendar shows at a time. */
export const AVAILABILITY_WINDOW_DAYS = 14;

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses a `YYYY-MM-DD` key back into a local-midnight Date. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** The rolling window of days shown in the calendar, starting today. */
export function availabilityWindow(
  from: Date = new Date(),
  days: number = AVAILABILITY_WINDOW_DAYS
): Date[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export interface DayTally {
  key: string;
  date: Date;
  /** Participants free that day, in a stable order. */
  people: { id: string; name: string; avatar?: string; photo?: string }[];
}

/** Counts, per day of the window, who marked themselves free. */
export function tallyAvailability(
  availability: CollectionAvailability,
  window: Date[]
): DayTally[] {
  const byDay = new Map<string, DayTally['people']>();
  Object.entries(availability || {}).forEach(([id, entry]) => {
    (entry?.dates || []).forEach((day) => {
      const people = byDay.get(day) || [];
      if (!people.some((p) => p.id === id)) {
        people.push({
          id,
          name: entry.name || (id.includes('@') ? id.split('@')[0] : id),
          avatar: entry.avatar,
          photo: entry.photo,
        });
      }
      byDay.set(day, people);
    });
  });

  return window.map((date) => {
    const key = toDayKey(date);
    return { key, date, people: byDay.get(key) || [] };
  });
}

/** The day(s) with the most people free — the answer to "when?". */
export function bestDays(tallies: DayTally[]): DayTally[] {
  const top = tallies.reduce((max, t) => Math.max(max, t.people.length), 0);
  if (top === 0) return [];
  return tallies.filter((t) => t.people.length === top);
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
