import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Navigation } from 'lucide-react-native';
import { MapLibreMap, type MapMarkerSpec } from './maps/MapLibreMap';
import { Drawer } from './ui/Drawer';
import { PlaceDetailsContent } from './PlaceDetailsContent';
import { getGradientFromString, parseCssGradient } from '../lib/utils';
import {
  budgetToPrice,
  distanceKm,
  formatDistance,
  formatPriceRange,
  getOpenStatus,
  type LokiRecommendationCard,
} from '../lib/placePresentation';
import { colors, fonts, radius, tw } from '../lib/theme';
import type { Place } from '../lib/types';

const DUBAI_FALLBACK: [number, number] = [55.2708, 25.1972];

function cardToPlace(card: LokiRecommendationCard): Place {
  return {
    id: card.id,
    name: card.name,
    label: '',
    category: card.category,
    rating: card.rating ?? 0,
    reviews: card.reviews,
    hours: card.hours ?? '',
    image: card.image ?? '',
    gmaps: card.gmaps,
    lng: card.lng ?? 0,
    lat: card.lat ?? 0,
    tags: card.tags,
    description: card.description,
    budget: card.budget,
    priceMin: card.priceMin,
    priceMax: card.priceMax,
    vibes: card.vibes,
    location: card.location,
    popup: card.popup,
    website: card.website,
  };
}

type LokiRecommendationsProps = {
  recommendations: LokiRecommendationCard[];
  userLocation: [number, number] | null;
};

/** 1:1 port of components/loki-recommendations.tsx (chat result cards + mini map). */
export function LokiRecommendations({
  recommendations: rawRecommendations,
  userLocation,
}: LokiRecommendationsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openPlace, setOpenPlace] = useState<LokiRecommendationCard | null>(null);
  const mapRef = React.useRef<React.ElementRef<typeof MapLibreMap>>(null);

  // Last line of defence against the model picking one venue twice.
  const recommendations = useMemo(() => {
    const seen = new Set<string>();
    return rawRecommendations.filter((card) => {
      const key = card.name.trim().toLowerCase();
      if (seen.has(card.id) || seen.has(key)) return false;
      seen.add(card.id);
      seen.add(key);
      return true;
    });
  }, [rawRecommendations]);

  const located = useMemo(
    () =>
      recommendations.filter(
        (r) =>
          typeof r.lat === 'number' &&
          typeof r.lng === 'number' &&
          Number.isFinite(r.lat) &&
          Number.isFinite(r.lng) &&
          !(r.lat === 0 && r.lng === 0)
      ),
    [recommendations]
  );

  const initialCenter = useMemo<[number, number]>(() => {
    if (userLocation) return userLocation;
    if (located.length) {
      const avgLng = located.reduce((s, r) => s + (r.lng ?? 0), 0) / located.length;
      const avgLat = located.reduce((s, r) => s + (r.lat ?? 0), 0) / located.length;
      return [avgLng, avgLat];
    }
    return DUBAI_FALLBACK;
  }, [userLocation, located]);

  const fitPoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = located.map((r) => [r.lng as number, r.lat as number]);
    if (userLocation) points.push(userLocation);
    return points;
  }, [located, userLocation]);

  const markers = useMemo<MapMarkerSpec[]>(() => {
    const specs: MapMarkerSpec[] = [];
    if (userLocation) {
      specs.push({ kind: 'dot', id: '__you__', lng: userLocation[0], lat: userLocation[1] });
    }
    located.forEach((card, idx) => {
      specs.push({
        kind: 'numbered',
        id: card.id,
        lng: card.lng as number,
        lat: card.lat as number,
        index: idx + 1,
        active: activeId === card.id,
        clickable: true,
      });
    });
    return specs;
  }, [located, userLocation, activeId]);

  const focusPin = (id: string) => {
    setActiveId(id);
    const card = located.find((c) => c.id === id);
    if (card && typeof card.lat === 'number' && typeof card.lng === 'number') {
      mapRef.current?.easeTo({ center: [card.lng, card.lat], zoom: 14, duration: 500 });
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <View style={styles.container}>
      {located.length > 0 ? (
        <View style={styles.mapWrap}>
          <MapLibreMap
            ref={mapRef}
            center={initialCenter}
            zoom={12}
            markers={markers}
            onMarkerClick={focusPin}
            fitOnLoad={{ points: fitPoints, padding: 48, maxZoom: 14, duration: 0, singleZoom: 13 }}
            style={styles.map}
          />
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {recommendations.map((card, idx) => (
          <RecommendationCard
            key={card.id}
            index={idx}
            card={card}
            userLocation={userLocation}
            active={activeId === card.id}
            onOpen={() => setOpenPlace(card)}
          />
        ))}
      </View>

      <Drawer open={!!openPlace} onOpenChange={(open) => !open && setOpenPlace(null)} heightPct={0.85}>
        {openPlace ? (
          <PlaceDetailsContent
            place={cardToPlace(openPlace)}
            onClose={() => setOpenPlace(null)}
            isDrawer
          />
        ) : (
          <View />
        )}
      </Drawer>
    </View>
  );
}

type RecommendationCardProps = {
  card: LokiRecommendationCard;
  index: number;
  userLocation: [number, number] | null;
  active: boolean;
  onOpen: () => void;
};

function RecommendationCard({ card, index, userLocation, active, onOpen }: RecommendationCardProps) {
  const [imageError, setImageError] = useState(false);
  const price = budgetToPrice(card.budget);
  const priceRange = formatPriceRange(card.priceMin, card.priceMax);
  const open = getOpenStatus(card.hours);
  const fallback = parseCssGradient(getGradientFromString(card.id));

  const distance =
    userLocation && typeof card.lat === 'number' && typeof card.lng === 'number'
      ? formatDistance(distanceKm(userLocation[1], userLocation[0], card.lat, card.lng))
      : '';

  return (
    <Pressable
      onPress={onOpen}
      style={[styles.card, active ? styles.cardActive : null]}
    >
      <View style={styles.cardImage}>
        {!card.image || imageError ? (
          <LinearGradient
            colors={fallback.colors}
            start={fallback.start}
            end={fallback.end}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Image
            source={{ uri: card.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        )}
        <View style={styles.indexBadge}>
          <Text style={styles.indexBadgeText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {card.name}
          </Text>
          {priceRange || price ? (
            <Text style={styles.cardPrice}>{priceRange || price?.symbol}</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          {typeof card.rating === 'number' && card.rating > 0 ? (
            <View style={styles.metaItem}>
              <Star size={12} color={tw.amber500} fill={tw.amber500} />
              <Text style={[styles.metaText, { color: tw.amber600, fontFamily: fonts.sansMedium }]}>
                {card.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
          {open.status !== 'unknown' ? (
            <Text
              style={[
                styles.metaText,
                { fontFamily: fonts.sansMedium, color: open.status === 'open' ? tw.emerald600 : tw.rose500 },
              ]}
            >
              {open.label}
            </Text>
          ) : null}
          {distance ? (
            <View style={styles.metaItem}>
              <Navigation size={12} color={colors.mutedForeground} />
              <Text style={styles.metaText}>{distance}</Text>
            </View>
          ) : null}
          {!distance && card.location ? (
            <View style={[styles.metaItem, { flexShrink: 1 }]}>
              <MapPin size={12} color={colors.mutedForeground} />
              <Text numberOfLines={1} style={[styles.metaText, { flexShrink: 1 }]}>
                {card.location}
              </Text>
            </View>
          ) : null}
        </View>

        {card.blurb ? (
          <Text numberOfLines={2} style={styles.blurb}>
            {card.blurb}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: '100%',
    gap: 12,
  },
  mapWrap: {
    height: 176, // h-44
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    overflow: 'hidden',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 8,
  },
  cardActive: {
    borderColor: tw.rose400,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  indexBadge: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadgeText: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  cardPrice: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    color: colors.mutedForeground,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 8,
    rowGap: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  blurb: {
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(232,232,232,0.7)',
    fontFamily: fonts.sans,
  },
});
