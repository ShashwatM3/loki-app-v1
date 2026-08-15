import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { isActiveLimitedTimePopup } from '../../lib/isActiveLimitedTimePopup';
import { colors, fonts, radius, tw, whiteAlpha, shadows } from '../../lib/theme';
import type { Place } from '../../lib/types';

type VibePlacesGridProps = {
  places: Place[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  onSelect: (place: Place) => void;
};

/** 1:1 port of components/browse/vibe-places-grid.tsx (2-col 3:4 poster grid). */
export function VibePlacesGrid({
  places,
  title,
  subtitle,
  emptyMessage = 'No places match this vibe yet.',
  onSelect,
}: VibePlacesGridProps) {
  return (
    <View style={{ minWidth: 0 }}>
      {title ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      {places.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {places.map((place) => {
            const activeNow = isActiveLimitedTimePopup(place);
            return (
              <Pressable
                key={String(place.id)}
                onPress={() => onSelect(place)}
                style={[styles.card, activeNow ? styles.cardActiveNow : null]}
              >
                {place.image ? (
                  <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                ) : null}
                <LinearGradient
                  colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0)']}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardBottom}>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{place.category}</Text>
                    </View>
                    {place.popup ? (
                      <View style={styles.popupBadge}>
                        <Text style={styles.categoryBadgeText}>Popup</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text numberOfLines={2} style={styles.cardName}>
                    {place.name}
                  </Text>
                  {place.location ? (
                    <Text numberOfLines={1} style={styles.cardLocation}>
                      {place.location}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  emptyBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: whiteAlpha(0.066), // border-border/60
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    aspectRatio: 3 / 4,
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: whiteAlpha(0.055),
    backgroundColor: 'rgba(16,16,18,0.3)',
    ...shadows.sm,
  },
  cardActiveNow: {
    borderColor: 'rgba(248,113,113,0.45)',
    shadowColor: '#ef4444',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  cardBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  popupBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,100,182,0.5)',
    backgroundColor: tw.pink600,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: '#fff',
  },
  cardName: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.sansSemiBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  cardLocation: {
    marginTop: 2,
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fonts.sans,
  },
});
