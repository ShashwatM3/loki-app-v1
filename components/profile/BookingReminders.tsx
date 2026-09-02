import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays, CalendarPlus, Trash2 } from 'lucide-react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from '../../lib/toast';
import { shareIcs, googleCalendarUrl, type CalendarEvent } from '../../lib/calendar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, fonts, radius, whiteAlpha } from '../../lib/theme';
import type { CollectionType, EventBooking } from '../../lib/types';

/** Web parity: components/profile/booking-reminders.tsx */
const REMINDER_OPTIONS = [
  { label: '30 min before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '3 hours before', value: 180 },
  { label: '1 day before', value: 1440 },
] as const;

function toCalendarEvent(booking: EventBooking): CalendarEvent {
  return {
    title: `${booking.placeName} · booked with loki`,
    start: new Date(booking.startsAt),
    location: booking.location,
    reminderMinutesBefore: booking.reminderMinutesBefore ?? 60,
  };
}

function formatWhen(startsAt: string): string {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return startsAt;
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * "Calendar" on the profile: the user records when they've booked a place and
 * gets a reminder — either as a device-calendar event (.ics with an alarm,
 * delivered through the native share sheet) or through Google Calendar.
 * 1:1 port of the web BookingReminders; the web's date/time <input>s become
 * the platform date/time pickers, its .ics download becomes a share sheet.
 */
export function BookingReminders({
  userEmail,
  collections,
  bookings,
  onChange,
}: {
  userEmail: string;
  collections: CollectionType[];
  bookings: EventBooking[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [reminder, setReminder] = useState<number>(60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const savedPlaces = useMemo(() => {
    const seen = new Map<string, { name: string; location?: string }>();
    (collections || []).forEach((collection) =>
      (collection.places || []).forEach((place) => {
        if (!seen.has(place.name)) seen.set(place.name, { name: place.name, location: place.location });
      })
    );
    return Array.from(seen.values());
  }, [collections]);

  const upcoming = useMemo(
    () =>
      [...(bookings || [])].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [bookings]
  );

  const persist = async (next: EventBooking[]) => {
    await updateDoc(doc(db, 'users', userEmail), { bookings: next });
    onChange();
  };

  const addBooking = async () => {
    if (!placeName.trim() || !date) {
      toast.error('Pick a place and a date');
      return;
    }
    const startsAt = `${date}T${time || '19:00'}`;
    const booking: EventBooking = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placeName: placeName.trim(),
      location: savedPlaces.find((p) => p.name === placeName.trim())?.location,
      startsAt,
      reminderMinutesBefore: reminder,
      createdAt: new Date().toISOString(),
    };
    setSaving(true);
    try {
      await persist([...(bookings || []), booking]);
      setOpen(false);
      setPlaceName('');
      setDate('');
      toast.success('Booking saved — add it to your calendar to get reminded');
      await shareIcs(
        toCalendarEvent(booking),
        `loki-${booking.placeName.toLowerCase().replace(/\s+/g, '-')}.ics`
      );
    } catch (error) {
      console.error('Failed to save booking:', error);
      toast.error('Could not save your booking');
    } finally {
      setSaving(false);
    }
  };

  const removeBooking = async (id: string) => {
    try {
      await persist((bookings || []).filter((b) => b.id !== id));
      toast.success('Booking removed');
    } catch (error) {
      console.error('Failed to remove booking:', error);
      toast.error('Could not remove that booking');
    }
  };

  const dateValue = date ? new Date(`${date}T00:00`) : new Date();
  const timeValue = new Date(`2000-01-01T${time || '19:00'}`);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Calendar</Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.addButton, pressed && { backgroundColor: whiteAlpha(0.06) }]}
        >
          <CalendarPlus size={14} color={colors.foreground} />
          <Text style={styles.addButtonText}>Add booking</Text>
        </Pressable>
      </View>

      <View style={styles.listCard}>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySub}>
              Add the date you booked a place for and we&apos;ll drop a reminder into your calendar.
            </Text>
          </View>
        ) : (
          upcoming.map((booking, i) => (
            <View key={booking.id} style={[styles.row, i !== 0 && styles.rowBorder]}>
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {booking.placeName}
                </Text>
                <View style={styles.rowWhen}>
                  <CalendarDays size={14} color="rgba(134,134,134,0.6)" />
                  <Text style={styles.rowWhenText}>{formatWhen(booking.startsAt)}</Text>
                </View>
              </View>
              <View style={styles.rowActions}>
                <Pressable
                  onPress={() =>
                    shareIcs(
                      toCalendarEvent(booking),
                      `loki-${booking.placeName.toLowerCase().replace(/\s+/g, '-')}.ics`
                    )
                  }
                  style={({ pressed }) => [styles.rowAction, pressed && { backgroundColor: whiteAlpha(0.06) }]}
                >
                  <Text style={styles.rowActionText}>Remind me</Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(googleCalendarUrl(toCalendarEvent(booking)))}
                  style={styles.rowAction}
                  hitSlop={4}
                >
                  <Text style={styles.rowGoogleText}>Google</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove booking for ${booking.placeName}`}
                  onPress={() => removeBooking(booking.id)}
                  style={styles.rowDelete}
                  hitSlop={4}
                >
                  <Trash2 size={16} color="rgba(134,134,134,0.5)" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>When did you book it for?</DialogTitle>
          <DialogDescription>
            We&apos;ll create a calendar event with a reminder so you don&apos;t forget.
          </DialogDescription>
        </DialogHeader>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={styles.fieldLabel}>Place</Text>
            <Input
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="e.g. Arabian Tea House"
            />
            {savedPlaces.length > 0 && placeName.length > 0 ? (
              <View style={styles.suggestions}>
                {savedPlaces
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(placeName.toLowerCase()) &&
                      p.name !== placeName
                  )
                  .slice(0, 4)
                  .map((p) => (
                    <Pressable
                      key={p.name}
                      onPress={() => setPlaceName(p.name)}
                      style={({ pressed }) => [
                        styles.suggestionRow,
                        pressed && { backgroundColor: whiteAlpha(0.06) },
                      ]}
                    >
                      <Text style={styles.suggestionText}>{p.name}</Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerField}>
                <Text style={date ? styles.pickerValue : styles.pickerPlaceholder}>
                  {date || 'Select date'}
                </Text>
              </Pressable>
            </View>
            <View style={{ width: 128 }}>
              <Text style={styles.fieldLabel}>Time</Text>
              <Pressable onPress={() => setShowTimePicker(true)} style={styles.pickerField}>
                <Text style={styles.pickerValue}>{time}</Text>
              </Pressable>
            </View>
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              themeVariant="dark"
              onChange={(event, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) {
                  setDate(
                    `${selected.getFullYear()}-${pad(selected.getMonth() + 1)}-${pad(selected.getDate())}`
                  );
                  if (Platform.OS === 'ios') setShowDatePicker(false);
                }
              }}
            />
          ) : null}
          {showTimePicker ? (
            <DateTimePicker
              value={timeValue}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="dark"
              onChange={(event, selected) => {
                setShowTimePicker(false);
                if (selected) {
                  setTime(`${pad(selected.getHours())}:${pad(selected.getMinutes())}`);
                }
              }}
            />
          ) : null}

          <View>
            <Text style={styles.fieldLabel}>Remind me</Text>
            <View style={styles.reminderRow}>
              {REMINDER_OPTIONS.map((option) => {
                const active = reminder === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityState={{ selected: active }}
                    onPress={() => setReminder(option.value)}
                    style={[styles.reminderChip, active && styles.reminderChipActive]}
                  >
                    <Text style={[styles.reminderChipText, active && styles.reminderChipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <Button onPress={addBooking} loading={saving} style={{ width: '100%' }}>
          Save &amp; add to calendar
        </Button>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  // mb-2.5 flex items-end justify-between gap-3 px-1
  headerRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
  },
  // text-base font-serif italic text-muted-foreground/60
  headerLabel: {
    fontSize: 16,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: 'rgba(134,134,134,0.6)',
  },
  // h-8 gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 text-xs
  addButton: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  // rounded-lg border border-white/[0.07] bg-white/[0.025]
  listCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  // px-5 py-6 text-left
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  // text-sm font-medium text-foreground/90
  emptyTitle: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: 'rgba(232,232,232,0.9)',
  },
  // mt-1 text-xs text-muted-foreground/60
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(134,134,134,0.6)',
    fontFamily: fonts.sans,
  },
  // flex items-center justify-between gap-3 px-5 py-[15px]
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  // truncate text-sm font-medium text-foreground/90
  rowTitle: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: 'rgba(232,232,232,0.9)',
  },
  // mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground/60
  rowWhen: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowWhenText: {
    fontSize: 12,
    color: 'rgba(134,134,134,0.6)',
    fontFamily: fonts.sans,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // h-8 rounded-lg px-2.5 text-xs (ghost button)
  rowAction: {
    height: 32,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActionText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  // text-xs text-muted-foreground/70
  rowGoogleText: {
    fontSize: 12,
    color: 'rgba(134,134,134,0.7)',
    fontFamily: fonts.sans,
  },
  // rounded-lg p-1.5 text-muted-foreground/50
  rowDelete: {
    borderRadius: radius.lg,
    padding: 6,
  },
  // mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: colors.mutedForeground,
  },
  suggestions: {
    marginTop: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  // matches Input: h-8 rounded-md border border-input bg-input/30 px-3 text-sm
  pickerField: {
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: whiteAlpha(0.048),
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  // flex flex-wrap gap-2
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // rounded-full border px-3 py-1.5 text-xs font-medium; inactive border-border bg-muted/40
  reminderChip: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // active: border-foreground bg-foreground text-background
  reminderChipActive: {
    borderColor: colors.foreground,
    backgroundColor: colors.foreground,
  },
  reminderChipText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  reminderChipTextActive: {
    color: colors.background,
  },
});
