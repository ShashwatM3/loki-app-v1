import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { BROWSE_VIBES, type BrowseVibeDefinition } from '../../lib/browseVibes';
import { getGradientFromString, parseCssGradient } from '../../lib/utils';
import { colors, fonts, radius, shadows, whiteAlpha } from '../../lib/theme';
import type { Place } from '../../lib/types';

const PLACES_PER_ALBUM = 5;

type CuratedAlbumsProps = {
  places: Place[];
  onSelectVibe: (vibe: BrowseVibeDefinition) => void;
  onSelectPlace: (place: Place) => void;
};

function AlbumPlaceCard({ place, onSelect }: { place: Place; onSelect: (p: Place) => void }) {
  const fallback = parseCssGradient(getGradientFromString(String(place.id ?? place.name)));
  return (
    <Pressable onPress={() => onSelect(place)} style={styles.albumCard}>
      <View style={styles.albumCardImageWrap}>
        {place.image ? (
          <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <LinearGradient colors={fallback.colors} start={fallback.start} end={fallback.end} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.albumCardBottom}>
          <Text numberOfLines={1} style={styles.albumCardName}>
            {place.name}
          </Text>
          {place.location ? (
            <Text numberOfLines={1} style={styles.albumCardLocation}>
              {place.location}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function CuratedAlbumRow({
  vibe,
  places,
  onSelectVibe,
  onSelectPlace,
}: {
  vibe: BrowseVibeDefinition;
  places: Place[];
  onSelectVibe: (vibe: BrowseVibeDefinition) => void;
  onSelectPlace: (place: Place) => void;
}) {
  const grad = parseCssGradient(vibe.gradient);
  return (
    <View style={styles.row}>
      {/* soft vibe-colored aura in the corner */}
      <View pointerEvents="none" style={styles.aura}>
        <LinearGradient
          colors={grad.colors}
          locations={grad.locations}
          start={grad.start}
          end={grad.end}
          style={styles.auraGradient}
        />
      </View>
      <View style={styles.rowHeader}>
        <View style={styles.rowHeaderLeft}>
          <LinearGradient
            colors={grad.colors}
            locations={grad.locations}
            start={grad.start}
            end={grad.end}
            style={styles.emojiTile}
          >
            <Text style={styles.emojiTileText}>{vibe.emoji}</Text>
          </LinearGradient>
          <View style={{ flexShrink: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={styles.rowTitle}>
              {vibe.label}
            </Text>
            {vibe.blurb ? (
              <Text numberOfLines={1} style={styles.rowBlurb}>
                {vibe.blurb}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable onPress={() => onSelectVibe(vibe)} style={styles.seeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <ArrowRight size={12} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
        {places.map((place) => (
          <AlbumPlaceCard key={String(place.id)} place={place} onSelect={onSelectPlace} />
        ))}
      </ScrollView>
    </View>
  );
}

/** 1:1 port of components/browse/curated-albums.tsx. */
export function CuratedAlbums({ places, onSelectVibe, onSelectPlace }: CuratedAlbumsProps) {
  const albums = useMemo(() => {
    return BROWSE_VIBES.map((vibe) => ({
      vibe,
      matches: places.filter((p) => vibe.predicate(p)).slice(0, PLACES_PER_ALBUM),
    })).filter((album) => album.matches.length > 0);
  }, [places]);

  if (albums.length === 0) return null;

  return (
    <View style={{ gap: 16 }}>
      {albums.map(({ vibe, matches }) => (
        <CuratedAlbumRow
          key={vibe.id}
          vibe={vibe}
          places={matches}
          onSelectVibe={onSelectVibe}
          onSelectPlace={onSelectPlace}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.055), // border-border/50
    backgroundColor: 'rgba(9,10,12,0.4)', // bg-card/40
    padding: 16,
    ...shadows.sm,
  },
  aura: {
    position: 'absolute',
    right: -64,
    top: -64,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.4,
    overflow: 'hidden',
  },
  auraGradient: {
    flex: 1,
    borderRadius: 80,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  rowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  emojiTile: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiTileText: {
    fontSize: 18,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.35,
    color: colors.foreground,
  },
  rowBlurb: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seeAllText: {
    fontSize: 11,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  cardsRow: {
    gap: 12,
    paddingBottom: 4,
  },
  albumCard: {
    width: 144, // w-36
  },
  albumCardImageWrap: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.044), // border-border/40
    ...shadows.sm,
  },
  albumCardBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
  albumCardName: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.sansSemiBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  albumCardLocation: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    color: 'rgba(255,255,255,0.7)',
  },
});
