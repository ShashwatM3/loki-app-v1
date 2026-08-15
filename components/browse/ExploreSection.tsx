import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft } from 'lucide-react-native';
import {
  placeIs21Plus,
  placeMatchesExploreGroup,
  placeMatchesExploreSubfilter,
} from '../../lib/categories';
import { useExploreGroups } from '../../hooks/useExploreGroups';
import { colors, fonts, radius } from '../../lib/theme';
import type { Place } from '../../lib/types';

type ExploreSectionProps = {
  places: Place[];
  onSelectPlace: (place: Place) => void;
};

/**
 * 1:1 port of components/browse/explore-section.tsx — the Explore browser
 * (vibe groups → sub-filters → spots).
 */
export function ExploreSection({ places, onSelectPlace }: ExploreSectionProps) {
  const exploreGroups = useExploreGroups();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [only21Plus, setOnly21Plus] = useState(false);

  const activeGroup = exploreGroups.find((g) => g.id === groupId) ?? null;
  const activeSub = activeGroup?.subfilters.find((s) => s.label === sub) ?? null;

  const results = useMemo(() => {
    if (!activeGroup) return [];
    return places.filter(
      (p) =>
        (activeSub
          ? placeMatchesExploreSubfilter(p, activeGroup, activeSub)
          : placeMatchesExploreGroup(p, activeGroup)) &&
        (!only21Plus || placeIs21Plus(p))
    );
  }, [places, activeGroup, activeSub, only21Plus]);

  return (
    <View>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          {places.length} place{places.length === 1 ? '' : 's'} · curated by vibe & category
        </Text>
      </View>

      {activeGroup ? (
        <View>
          <Pressable
            onPress={() => {
              setGroupId(null);
              setSub(null);
            }}
            style={styles.backRow}
          >
            <ChevronLeft size={14} color={colors.mutedForeground} />
            <Text style={styles.backText}>All categories</Text>
          </Pressable>

          <Text style={styles.groupLabel}>
            <Text>{activeGroup.emoji}</Text> {activeGroup.label}
          </Text>

          <View style={styles.pillsWrap}>
            <FilterPill active={!activeSub} onPress={() => setSub(null)} label="All" />
            {activeGroup.subfilters.map((sf) => (
              <FilterPill
                key={sf.label}
                active={activeSub?.label === sf.label}
                onPress={() => setSub(activeSub?.label === sf.label ? null : sf.label)}
                label={`${sf.emoji} ${sf.label}`}
              />
            ))}
            <FilterPill active={only21Plus} onPress={() => setOnly21Plus((v) => !v)} label="🍸 21+ only" />
          </View>

          <Text style={styles.countText}>
            {results.length} spot{results.length === 1 ? '' : 's'}
          </Text>

          {results.length === 0 ? (
            <Text style={styles.emptyText}>No spots here yet — try another sub-filter.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {results.map((place) => (
                <Pressable key={String(place.id)} onPress={() => onSelectPlace(place)} style={styles.resultRow}>
                  <View style={styles.resultImage}>
                    {place.image ? (
                      <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.resultName}>
                      {place.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.resultMeta}>
                      {place.category}
                      {place.location ? ` · ${place.location}` : ''}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.groupGrid}>
          {exploreGroups.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => {
                setGroupId(g.id);
                setSub(null);
              }}
              style={styles.groupCard}
            >
              <Text style={styles.groupEmoji}>{g.emoji}</Text>
              <Text numberOfLines={2} style={styles.groupCardLabel}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function FilterPill({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active ? styles.pillActive : null]}>
      <Text style={[styles.pillText, active ? styles.pillTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  backRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  groupLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)', // bg-muted/40
    paddingHorizontal: 12,
  },
  pillActive: {
    borderColor: colors.foreground,
    backgroundColor: colors.foreground,
  },
  pillText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  pillTextActive: {
    color: colors.background,
  },
  countText: {
    marginBottom: 8,
    marginTop: 16,
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.3)', // bg-card/30
    padding: 10,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.muted,
  },
  resultName: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  resultMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)', // bg-muted/40
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  groupEmoji: {
    fontSize: 20,
  },
  groupCardLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
});
