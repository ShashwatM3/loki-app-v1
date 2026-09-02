import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { CalendarDays, Check } from 'lucide-react-native';
import {
  AVAILABILITY_WINDOW_DAYS,
  availabilityWindow,
  tallyAvailability,
  toDayKey,
  type CollectionAvailability,
  type DayTally,
} from '../../lib/collectionAvailability';
import { colors, fonts, radius, tw } from '../../lib/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Up to three dots per day; anything beyond is summarised as "+n". */
function AvailabilityDots({ people }: { people: DayTally['people'] }) {
  if (people.length === 0) {
    return <View style={styles.dotsRowEmpty} />;
  }
  const shown = people.slice(0, 3);
  return (
    <View style={styles.dotsRow}>
      {shown.map((person) =>
        person.photo ? (
          <Image key={person.id} source={{ uri: person.photo }} style={styles.dotPhoto} contentFit="cover" />
        ) : person.avatar ? (
          <Text key={person.id} style={styles.dotEmoji}>
            {person.avatar}
          </Text>
        ) : (
          <View key={person.id} style={styles.dotPlain} />
        )
      )}
      {people.length > shown.length ? (
        <Text style={styles.dotOverflow}>+{people.length - shown.length}</Text>
      ) : null}
    </View>
  );
}

/**
 * Two-week group availability picker — 1:1 port of the web's
 * components/collections/availability-calendar.tsx. Tapping a day toggles
 * *your* availability; dots underneath each day show everyone free then.
 */
export function AvailabilityCalendar({
  availability,
  myId,
  onToggleDay,
  title = 'When is everyone free?',
  subtitle = "Tap the days you're free — the next two weeks",
}: {
  availability: CollectionAvailability;
  myId: string;
  onToggleDay: (dayKey: string, nextDates: string[]) => void;
  title?: string;
  subtitle?: string;
}) {
  const window = React.useMemo(() => availabilityWindow(), []);
  const tallies = React.useMemo(
    () => tallyAvailability(availability, window),
    [availability, window]
  );
  const myDates = React.useMemo(
    () => new Set(availability?.[myId]?.dates || []),
    [availability, myId]
  );

  const toggle = (dayKey: string) => {
    const next = new Set(myDates);
    if (next.has(dayKey)) next.delete(dayKey);
    else next.add(dayKey);
    onToggleDay(dayKey, Array.from(next).sort());
  };

  const monthLabel = `${window[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${window[
    window.length - 1
  ].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.titleRow}>
            <CalendarDays size={16} color={colors.mutedForeground} />
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.grid}>
          {window.slice(0, 7).map((date) => (
            <Text key={`head-${toDayKey(date)}`} style={styles.weekday}>
              {WEEKDAYS[date.getDay()]}
            </Text>
          ))}
        </View>
        <View style={[styles.grid, { marginTop: 6 }]}>
          {tallies.map((day) => {
            const mine = myDates.has(day.key);
            return (
              <Pressable
                key={day.key}
                accessibilityState={{ selected: mine }}
                accessibilityLabel={`${day.date.toDateString()} — ${day.people.length} free`}
                onPress={() => toggle(day.key)}
                style={({ pressed }) => [
                  styles.dayCell,
                  mine ? styles.dayCellMine : null,
                  pressed && !mine ? { borderColor: 'rgba(232,232,232,0.3)' } : null,
                ]}
              >
                <View style={styles.dayNumberRow}>
                  <Text style={styles.dayNumber}>{day.date.getDate()}</Text>
                  {mine ? <Check size={12} color={tw.emerald400} strokeWidth={3} /> : null}
                </View>
                <AvailabilityDots people={day.people} />
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.footnote}>
        Showing {AVAILABILITY_WINDOW_DAYS} days · dots show who&apos;s free
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // mb-3 flex items-end justify-between gap-3
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  // flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    color: colors.mutedForeground,
  },
  // mt-1 text-xs text-muted-foreground/80
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(134,134,134,0.8)',
    fontFamily: fonts.sans,
  },
  // text-xs font-medium text-muted-foreground
  monthLabel: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  // rounded-3xl border-border/70 bg-card/40 p-3
  calendarCard: {
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(9,10,12,0.4)',
    padding: 12,
  },
  // grid-cols-7 gap-1.5
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  // text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70
  weekday: {
    width: '12.65%',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.25,
    color: 'rgba(134,134,134,0.7)',
  },
  // flex flex-col items-center rounded-xl border px-1 py-2; inactive border-border/60 bg-background/40
  dayCell: {
    width: '12.65%',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.066)',
    backgroundColor: 'rgba(3,4,5,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  // mine: border-emerald-400/60 bg-emerald-500/10
  dayCellMine: {
    borderColor: 'rgba(0,212,146,0.6)',
    backgroundColor: 'rgba(0,188,125,0.1)',
  },
  // flex items-center gap-0.5 text-sm font-semibold
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  // mt-1 h-4 dots row
  dotsRow: {
    marginTop: 4,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dotsRowEmpty: {
    marginTop: 4,
    height: 16,
  },
  // size-3 rounded-full photo
  dotPhoto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // text-[10px] emoji avatar
  dotEmoji: {
    fontSize: 10,
    lineHeight: 12,
  },
  // size-1.5 rounded-full bg-emerald-400
  dotPlain: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tw.emerald400,
  },
  // text-[9px] font-semibold text-muted-foreground
  dotOverflow: {
    fontSize: 9,
    fontFamily: fonts.sansSemiBold,
    color: colors.mutedForeground,
  },
  // mt-2 text-xs text-muted-foreground/70
  footnote: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(134,134,134,0.7)',
    fontFamily: fonts.sans,
  },
});
