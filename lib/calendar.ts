/**
 * Calendar helpers for booking reminders — port of the web's lib/calendar.ts.
 * `buildIcs`, `eventEnd` and `googleCalendarUrl` are byte-for-byte the same
 * logic; the web's `downloadIcs` (an <a download> click) becomes `shareIcs`,
 * which writes the .ics to the cache directory and opens the native share
 * sheet so the device calendar can import it (the platform equivalent of a
 * browser download).
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface CalendarEvent {
  title: string;
  /** Local start time. */
  start: Date;
  /** Defaults to 2 hours. */
  durationMinutes?: number;
  location?: string;
  description?: string;
  /** Minutes before the start to fire the reminder. Defaults to 60. */
  reminderMinutesBefore?: number;
}

function toUtcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function eventEnd(event: CalendarEvent): Date {
  return new Date(event.start.getTime() + (event.durationMinutes ?? 120) * 60_000);
}

export function buildIcs(event: CalendarEvent): string {
  const reminder = event.reminderMinutesBefore ?? 60;
  const uid = `${toUtcStamp(event.start)}-${Math.random().toString(36).slice(2, 10)}@lokidxb.com`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//loki//booking reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(eventEnd(event))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.location ? `LOCATION:${escapeIcs(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : null,
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminder}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/** Native counterpart of the web's `downloadIcs`: share the event as an `.ics` file. */
export async function shareIcs(event: CalendarEvent, filename = 'loki-booking.ics'): Promise<void> {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, buildIcs(event));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/calendar',
      dialogTitle: filename,
      UTI: 'com.apple.ical.ics',
    });
  }
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(eventEnd(event))}`,
  });
  if (event.location) params.set('location', event.location);
  if (event.description) params.set('details', event.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
