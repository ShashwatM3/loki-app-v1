import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Navigation, Info, X, Plus, Globe } from 'lucide-react-native';
import { Button } from './ui/Button';
import { getGradientFromString, parseCssGradient } from '../lib/utils';
import { placeVibeLines, genZBlurb } from '../lib/placeBlurb';
import { colors, fonts, radius, shadows, whiteAlpha } from '../lib/theme';
import { CollectionSelectorDrawer } from './CollectionSelectorDrawer';
import type { Place } from '../lib/types';

interface PlaceDetailsContentProps {
  place: Place;
  onClose?: () => void;
  isDrawer?: boolean;
}

/** 1:1 port of components/place-details-content.tsx. */
export function PlaceDetailsContent({ place, onClose, isDrawer }: PlaceDetailsContentProps) {
  const insets = useSafeAreaInsets();
  const [showCollectionDrawer, setShowCollectionDrawer] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallback = parseCssGradient(getGradientFromString(String(place.id)));

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero image */}
        <View style={styles.hero}>
          {!place.image || imageError ? (
            <LinearGradient
              colors={fallback.colors}
              start={fallback.start}
              end={fallback.end}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <Image
              source={{ uri: place.image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {onClose ? (
            <View style={[styles.heroTopRow, !isDrawer ? { top: Math.max(16, insets.top + 4) } : null]}>
              <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
                <X size={20} color="#000" />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.heroBottom}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{place.category}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{place.name}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.buttonGrid}>
            <Button
              size="lg"
              style={styles.gridButton}
              onPress={() =>
                Linking.openURL(
                  place.gmaps || `https://www.google.com/maps/search/${encodeURIComponent(`${place.name} Dubai`)}/`
                )
              }
            >
              <Navigation size={20} color={colors.primaryForeground} />
              <Text style={styles.primaryBtnText}>Directions</Text>
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={styles.gridButton}
              onPress={() => setShowCollectionDrawer(true)}
            >
              <Plus size={20} color={colors.foreground} />
              <Text style={styles.outlineBtnText}>Add to Collection</Text>
            </Button>
            {place.website ? (
              <Button
                variant="outline"
                size="lg"
                style={[styles.gridButton, styles.gridButtonFull]}
                onPress={() => Linking.openURL(place.website!)}
              >
                <Globe size={20} color={colors.foreground} />
                <Text style={styles.outlineBtnText}>Visit Website</Text>
              </Button>
            ) : null}
          </View>

          {/* THE VIBE */}
          <View style={styles.vibeBox}>
            <View style={styles.vibeHeader}>
              <Info size={16} color={colors.foreground} style={{ opacity: 0.7 }} />
              <Text style={styles.vibeHeaderText}>THE VIBE</Text>
            </View>
            <View style={styles.vibeLines}>
              {placeVibeLines(place).map((line, i) => (
                <Text key={i} style={styles.vibeLine}>
                  {line}
                </Text>
              ))}
            </View>
            <Text style={styles.blurb}>{genZBlurb(place)}</Text>
          </View>
        </View>
      </ScrollView>

      <CollectionSelectorDrawer
        place={place}
        open={showCollectionDrawer}
        onOpenChange={setShowCollectionDrawer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    height: 256, // h-64
    width: '100%',
  },
  heroTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#ff2056', // rose-500
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  body: {
    padding: 16,
    gap: 24,
    flex: 1,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridButton: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 36, // h-9
  },
  gridButtonFull: {
    flexBasis: '100%',
  },
  primaryBtnText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
  },
  outlineBtnText: {
    color: colors.foreground,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
  },
  vibeBox: {
    backgroundColor: 'rgba(16,16,18,0.3)', // bg-secondary/30
    borderRadius: radius['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: whiteAlpha(0.055), // border-border/50
  },
  vibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    opacity: 0.7,
  },
  vibeHeaderText: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  vibeLines: {
    marginBottom: 12,
    gap: 2,
  },
  vibeLine: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'lowercase',
    color: 'rgba(232,232,232,0.9)',
  },
  blurb: {
    fontSize: 14,
    lineHeight: 24,
    textTransform: 'lowercase',
    color: 'rgba(232,232,232,0.8)',
    fontFamily: fonts.sans,
  },
});
