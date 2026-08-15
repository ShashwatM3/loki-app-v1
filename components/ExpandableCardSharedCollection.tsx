import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ExternalLink, Info, MapPin, Star, Trash2 } from 'lucide-react-native';
import { colors, fonts, radius, tw, whiteAlpha } from '../lib/theme';
import type { Place } from '../lib/types';

interface ExpandableCardProps {
  places: Place[];
  canRemove?: boolean;
  removingPlaceId?: string | null;
  onRemove?: (place: Place) => void;
}

/** 1:1 port of components/expandable-card-shared-collection.tsx (2-col info grid). */
export function ExpandableCardDemo({
  places,
  canRemove = false,
  removingPlaceId,
  onRemove,
}: ExpandableCardProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <View style={styles.grid}>
      {places.map((place) => {
        const id = String(place.id ?? place.name);
        const expanded = expandedId === id;

        return (
          <View key={id} style={[styles.card, expanded ? { flexBasis: '100%' } : null]}>
            <View style={styles.imageWrap}>
              {place.image ? (
                <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <LinearGradient
                  colors={['rgba(76,29,149,0.7)', tw.neutral900]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.imageBottom}>
                <Text numberOfLines={2} style={styles.cardName}>
                  {place.name}
                </Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.bodyTopRow}>
                <View style={{ minWidth: 0, flexShrink: 1 }}>
                  <Text numberOfLines={1} style={styles.category}>
                    {place.category}
                  </Text>
                  {place.rating > 0 ? (
                    <View style={styles.ratingRow}>
                      <Star size={12} color={tw.yellow400} fill={tw.yellow400} />
                      <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {canRemove && onRemove ? (
                    <Pressable
                      onPress={() => onRemove(place)}
                      disabled={removingPlaceId === id}
                      style={styles.iconBtn}
                      accessibilityLabel={`Remove ${place.name}`}
                    >
                      {removingPlaceId === id ? (
                        <ActivityIndicator size="small" color={colors.mutedForeground} />
                      ) : (
                        <Trash2 size={16} color={colors.mutedForeground} />
                      )}
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => setExpandedId(expanded ? null : id)}
                    style={styles.infoBtn}
                  >
                    <Info size={14} color={colors.foreground} />
                    <Text style={styles.infoBtnText}>Info</Text>
                    <ChevronDown
                      size={14}
                      color={colors.foreground}
                      style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                    />
                  </Pressable>
                </View>
              </View>

              {expanded ? (
                <View style={styles.expanded}>
                  <Text style={styles.description}>
                    {place.description
                      ? place.description
                      : 'No extra description has been added for this place yet.'}
                  </Text>

                  <View style={styles.chipsRow}>
                    {place.location ? (
                      <View style={styles.chip}>
                        <MapPin size={12} color={colors.secondaryForeground} />
                        <Text style={styles.chipText}>{place.location}</Text>
                      </View>
                    ) : null}
                    {place.budget ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{place.budget}</Text>
                      </View>
                    ) : null}
                    {place.addedBy ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>Added by {place.addedBy}</Text>
                      </View>
                    ) : null}
                  </View>

                  {place.tags?.length ? (
                    <View style={styles.chipsRow}>
                      {place.tags.slice(0, 6).map((tag) => (
                        <View key={tag} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.chipsRow}>
                    {place.gmaps ? (
                      <Pressable onPress={() => Linking.openURL(place.gmaps!)} style={styles.mapBtn}>
                        <Text style={styles.mapBtnText}>Open map</Text>
                        <ExternalLink size={14} color={colors.primaryForeground} />
                      </Pressable>
                    ) : null}
                    {place.website ? (
                      <Pressable onPress={() => Linking.openURL(place.website!)} style={styles.webBtn}>
                        <Text style={styles.webBtnText}>Website</Text>
                        <ExternalLink size={14} color={colors.secondaryForeground} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.55)',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 11,
    backgroundColor: colors.muted,
  },
  imageBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.sansSemiBold,
    color: '#fff',
  },
  body: {
    padding: 12,
    gap: 12,
  },
  bodyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  category: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  ratingRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  infoBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: whiteAlpha(0.048),
    paddingHorizontal: 10,
  },
  infoBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  expanded: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: whiteAlpha(0.077),
    paddingTop: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: colors.secondaryForeground,
    fontFamily: fonts.sans,
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagChipText: {
    fontSize: 12,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  mapBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
  },
  mapBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.primaryForeground,
  },
  webBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
  },
  webBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.secondaryForeground,
  },
});
