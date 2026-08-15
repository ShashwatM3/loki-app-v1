import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import * as Location from 'expo-location';
import { MapLibreMap, type MapMarkerSpec, type MapPopupSpec, type MapLibreMapRef } from './MapLibreMap';
import { persistParticipantLocation } from '../../lib/collectionPersistence';
import { getGradientFromString } from '../../lib/utils';
import type { CollectionType, ParticipantLocation, Place } from '../../lib/types';

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const avatarColor = (text: string) => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#0ea5e9'];
  let hash = 0;
  const str = text || 'guest';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Captures the current user's live location (when `enabled`) and persists it to
 * the collection so other participants can see where everyone is.
 */
function useLiveLocation(
  collection: CollectionType,
  currentUser: { email: string; name?: string; photo?: string },
  enabled: boolean
) {
  const [you, setYou] = useState<ParticipantLocation | null>(null);
  const lastPersist = useRef(0);

  useEffect(() => {
    if (!enabled || !currentUser.email) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (pos) => {
          const loc: ParticipantLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: currentUser.name || currentUser.email.split('@')[0],
            photo: currentUser.photo,
            updatedAt: new Date().toISOString(),
          };
          setYou(loc);
          const now = Date.now();
          if (now - lastPersist.current > 15000) {
            lastPersist.current = now;
            persistParticipantLocation(collection, currentUser.email, loc, currentUser.email).catch(
              (e) => console.error('Failed to persist location:', e)
            );
          }
        }
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, currentUser.email]);

  return you;
}

export interface CollectionMapProps {
  places: Place[];
  collection: CollectionType;
  currentUser: { email: string; name?: string; photo?: string };
  /** Enable pan/zoom + place taps. Preview cards pass false. */
  interactive?: boolean;
  /** Capture + share the current user's live location. */
  shareLocation?: boolean;
  activePlaceId?: string | null;
  onPlaceClick?: (place: Place) => void;
  popup?: MapPopupSpec | null;
  onPopupAction?: (action: string, id: string) => void;
  onPopupClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 1:1 port of app/dashboard/collections/collection-map.tsx. */
export function CollectionMap({
  places,
  collection,
  currentUser,
  interactive = true,
  shareLocation = false,
  activePlaceId = null,
  onPlaceClick,
  popup,
  onPopupAction,
  onPopupClose,
  style,
}: CollectionMapProps) {
  const mapRef = useRef<MapLibreMapRef>(null);
  const you = useLiveLocation(collection, currentUser, shareLocation);

  // Merge stored participant locations with the live "you" reading.
  const participantLocations = useMemo(() => {
    const stored = collection.participantLocations || {};
    const merged: Record<string, ParticipantLocation> = { ...stored };
    if (you) merged[currentUser.email] = you;
    return Object.entries(merged).map(([id, loc]) => ({ ...loc, id }));
  }, [collection.participantLocations, you, currentUser.email]);

  const markers = useMemo<MapMarkerSpec[]>(() => {
    const specs: MapMarkerSpec[] = places.map((place, i) => ({
      kind: 'thumb' as const,
      id: String(place.id ?? `place-marker-${i}`),
      lng: place.lng,
      lat: place.lat,
      name: place.name,
      image: place.image || undefined,
      gradient: place.image ? undefined : getGradientFromString(String(place.id ?? place.name)),
      active: activePlaceId != null && String(place.id) === String(activePlaceId),
      clickable: interactive && !!onPlaceClick,
    }));
    participantLocations.forEach((loc) => {
      specs.push({
        kind: 'participant',
        id: `participant-${loc.id}`,
        lng: loc.lng,
        lat: loc.lat,
        color: avatarColor(loc.id),
        photo: loc.photo,
        initials: getInitials(loc.name),
        isYou: loc.id === currentUser.email,
      });
    });
    return specs;
  }, [places, participantLocations, activePlaceId, interactive, onPlaceClick, currentUser.email]);

  const fitPoints = useMemo<[number, number][]>(() => {
    return [
      ...places.map((p) => [p.lng, p.lat] as [number, number]),
      ...participantLocations.map((l) => [l.lng, l.lat] as [number, number]),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places.length]);

  return (
    <MapLibreMap
      ref={mapRef}
      center={places[0] ? [places[0].lng, places[0].lat] : [55.2708, 25.1972]}
      zoom={12}
      interactive={interactive}
      markers={markers}
      popup={popup}
      onMarkerClick={(id) => {
        const place = places.find((p) => String(p.id) === id);
        if (place && onPlaceClick) onPlaceClick(place);
      }}
      onPopupAction={onPopupAction}
      onPopupClose={onPopupClose}
      fitOnLoad={{
        points: fitPoints,
        padding: interactive ? 70 : 40,
        duration: 700,
        maxZoom: 15,
      }}
      style={style}
    />
  );
}
