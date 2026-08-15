import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, Loader2, Pencil, Plus, Trophy, Users, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { ExpandableCardDemo } from '../../components/ExpandableCardSharedCollection';
import { CollectionMap } from '../../components/maps/CollectionMap';
import { CollectionSwipeDeck } from '../../components/collections/CollectionSwipeDeck';
import FullPageLoader from '../../components/FullPageLoader';
import { placeKey, type CollectionVotes } from '../../lib/collectionVoting';
import { placeMetaLine } from '../../lib/placeBlurb';
import { getGradientFromString, parseCssGradient } from '../../lib/utils';
import { getDocument } from '../../lib/firebaseActions';
import { decryptShareToken } from '../../lib/crypto';
import {
  buildSharedCollectionId,
  SHARED_COLLECTIONS_COLLECTION,
  type SharedCollectionDoc,
} from '../../lib/sharedCollections';
import { useCounterStore } from '../../lib/store';
import { toast } from '../../lib/toast';
import { WEB_BASE_URL } from '../../services/apiClient';
import { colors, fonts, radius, tw, whiteAlpha } from '../../lib/theme';
import type {
  CollectionAccess,
  CollectionType,
  LinkCollaborator,
  Place,
  SharedCollectionMember,
} from '../../lib/types';

type SaveMode = 'personal' | 'shared';

/** Playful emoji avatars a link visitor picks on first open. */
const AVATARS = [
  { id: 'fox', emoji: '🦊' },
  { id: 'panda', emoji: '🐼' },
  { id: 'penguin', emoji: '🐧' },
  { id: 'koala', emoji: '🐨' },
] as const;

/** ~12 vibe/category chips used to narrow down suggestions when adding places. */
const VIBE_CHIPS: { label: string; keywords: string[] }[] = [
  { label: '🎳 Bowling', keywords: ['bowling'] },
  { label: '🎲 Board Games', keywords: ['board games', 'board game', 'games'] },
  { label: '🍽️ Restaurants', keywords: ['restaurant', 'food', 'dining'] },
  { label: '☕ Cafés', keywords: ['café', 'cafe', 'coffee'] },
  { label: '🍸 Bars', keywords: ['bar', 'nightlife', 'club'] },
  { label: '🎨 Arts', keywords: ['art', 'gallery', 'museum'] },
  { label: '🌿 Outdoor', keywords: ['outdoor', 'park', 'beach', 'nature', 'hiking'] },
  { label: '⚽ Sports', keywords: ['sport', 'padel', 'football', 'basketball', 'tennis'] },
  { label: '🎬 Entertainment', keywords: ['entertainment', 'cinema', 'arcade', 'karaoke'] },
  { label: '💻 Work & Chill', keywords: ['coworking', 'work', 'study', 'lounge'] },
  { label: '✨ Experiences', keywords: ['experience', 'escape', 'immersive', 'unique'] },
  { label: '🌙 Late Night', keywords: ['late', 'night', '24'] },
];

const BUDGET_OPTIONS = [
  { label: 'Any', value: 'All' },
  { label: '💵', value: 'Low' },
  { label: '💵💵', value: 'Moderate' },
  { label: '💵💵💵', value: 'High' },
] as const;

const DISTANCE_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
] as const;

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function placeMatchesChips(place: Place, chips: string[]): boolean {
  if (chips.length === 0) return true;
  const blob = [
    place.category,
    place.description ?? '',
    place.location ?? '',
    ...(place.tags ?? []),
    ...(place.vibes ?? []),
  ]
    .join(' ')
    .toLowerCase();
  const selected = VIBE_CHIPS.filter((c) => chips.includes(c.label));
  return selected.some((chip) => chip.keywords.some((kw) => blob.includes(kw)));
}

type ShareData = {
  token: string;
  collectionName: string;
  access: CollectionAccess;
  places: Place[];
  sharedCollectionId?: string;
  initialVotes: CollectionVotes;
  ownerEmail?: string;
  members: SharedCollectionMember[];
  linkCollaborators: LinkCollaborator[];
};

type ScreenRouteParams = { token: string };

/** 1:1 port of app/collection/[token] (server page + SharedCollectionClient). */
export default function SharedCollectionScreen() {
  const route = useRoute<RouteProp<Record<string, ScreenRouteParams>, string>>();
  const insets = useSafeAreaInsets();
  const token = route.params?.token ?? '';

  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const decrypted = (await decryptShareToken(token)) as {
          email?: string;
          collection?: string;
          access?: CollectionAccess;
          sharedCollectionId?: string;
        };
        const email = decrypted?.email;
        const collectionName = decrypted?.collection;
        if (!email || !collectionName) throw new Error('Invalid token');

        const sharedCollectionId =
          decrypted.sharedCollectionId || buildSharedCollectionId(email, collectionName);
        const sharedCollection = (await getDocument(
          SHARED_COLLECTIONS_COLLECTION,
          sharedCollectionId
        )) as SharedCollectionDoc | null;

        let shareData: ShareData | null = null;
        if (sharedCollection) {
          shareData = {
            token,
            collectionName: sharedCollection.name,
            access: decrypted.access ?? 'view',
            places: sharedCollection.places || [],
            sharedCollectionId: sharedCollection.id,
            initialVotes: sharedCollection.votes || {},
            ownerEmail: sharedCollection.ownerEmail,
            members: sharedCollection.members || [],
            linkCollaborators: sharedCollection.linkCollaborators || [],
          };
        } else {
          const userDocument = (await getDocument('users', email)) as {
            collections?: CollectionType[];
          } | null;
          const legacyCollection =
            (userDocument?.collections || []).filter((c) => c.name === collectionName)[0] ?? null;
          shareData = legacyCollection
            ? {
                token,
                collectionName: legacyCollection.name,
                access: decrypted.access ?? 'view',
                places: legacyCollection.places || [],
                sharedCollectionId: undefined,
                initialVotes: legacyCollection.votes || {},
                ownerEmail: email,
                members: [],
                linkCollaborators: legacyCollection.linkCollaborators || [],
              }
            : null;
        }

        if (!cancelled) {
          setData(shareData);
          setLoadingData(false);
        }
      } catch (err) {
        console.error('Error:', err);
        if (!cancelled) {
          setLoadError(true);
          setLoadingData(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loadingData) return <FullPageLoader />;

  if (loadError) {
    return (
      <View style={styles.errorRoot}>
        <Text style={styles.errorTitle}>Invalid or Expired Link</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.unavailableRoot, { paddingTop: insets.top + 64 }]}>
        <Text style={styles.unavailableTitle}>Collection unavailable</Text>
        <Text style={styles.unavailableSubtitle}>
          This shared collection may have been deleted or renamed by its owner.
        </Text>
      </View>
    );
  }

  return <SharedCollectionClient {...data} />;
}

function SharedCollectionClient({
  token,
  collectionName,
  access,
  places,
  sharedCollectionId,
  initialVotes = {},
  ownerEmail,
  members = [],
  linkCollaborators = [],
}: ShareData) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const swipeSectionY = useRef(0);
  const userData = useCounterStore((s) => s.userData);
  const isAuthLoading = useCounterStore((s) => s.isAuthLoading);
  const refreshUserData = useCounterStore((s) => s.refreshUserData);
  const [livePlaces, setLivePlaces] = useState<Place[]>(places);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>('shared');
  const [saving, setSaving] = useState(false);
  const [mutatingPlaceId, setMutatingPlaceId] = useState<string | null>(null);

  // Add-places flow
  const [addOpen, setAddOpen] = useState(false);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('All');
  const [maxDistance, setMaxDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // First-open experience
  const [avatar, setAvatar] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [pickedAvatar, setPickedAvatar] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [showSwipePopup, setShowSwipePopup] = useState(false);

  // Collaborative swipe votes.
  const [votes, setVotes] = useState<CollectionVotes>(initialVotes);
  const [guests, setGuests] = useState<LinkCollaborator[]>(linkCollaborators);

  const canEditFromLink = access === 'edit';

  // Name + avatar picker on first open (persisted per token), then a delayed swipe nudge.
  useEffect(() => {
    (async () => {
      let storedAvatar: string | null = null;
      let storedName: string | null = null;
      try {
        storedAvatar = await AsyncStorage.getItem(`loki-avatar-${token}`);
        storedName = await AsyncStorage.getItem(`loki-name-${token}`);
      } catch {
        storedAvatar = null;
        storedName = null;
      }
      if (storedAvatar && storedName) {
        setAvatar(storedAvatar);
        setVisitorName(storedName);
      } else {
        setPickedAvatar(storedAvatar);
        setNameInput(storedName ?? '');
        setAvatarOpen(true);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (avatarOpen) return;
    const t = setTimeout(() => setShowSwipePopup(true), 3000);
    return () => clearTimeout(t);
  }, [avatarOpen]);

  const confirmIdentity = () => {
    const name = nameInput.trim();
    if (!name || !pickedAvatar) return;
    setAvatar(pickedAvatar);
    setVisitorName(name);
    setAvatarOpen(false);
    AsyncStorage.setItem(`loki-avatar-${token}`, pickedAvatar).catch(() => {});
    AsyncStorage.setItem(`loki-name-${token}`, name).catch(() => {});
  };

  const mapCollection = useMemo(
    () => ({ name: collectionName, places: livePlaces }) as CollectionType,
    [collectionName, livePlaces]
  );
  const currentUser = useMemo(
    () => ({
      email: userData.email || 'guest',
      name: userData.name || visitorName || 'Guest',
    }),
    [userData.email, userData.name, visitorName]
  );

  // A stable per-visitor id used to key their swipe votes.
  const voterId = useMemo(
    () => userData.email || visitorName || 'guest',
    [userData.email, visitorName]
  );

  const openSaveFlow = () => {
    if (isAuthLoading) return;
    if (!userData.email) {
      navigation.navigate('Authentication', {
        returnTo: 'SharedCollection',
        returnToParams: { token },
      });
      return;
    }
    setSaveOpen(true);
  };

  const saveCollection = async () => {
    if (!userData.email) {
      openSaveFlow();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${WEB_BASE_URL}/api/shared-collection/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userEmail: userData.email, mode: saveMode, sharedCollectionId }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Failed to save collection');
      await refreshUserData(userData.email);
      setSaveOpen(false);
      toast.success(
        saveMode === 'shared'
          ? 'Shared collection saved to your collections'
          : 'Personal copy saved to your collections'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save collection';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const mutate = async (action: 'add' | 'remove', placeId: string) => {
    setMutatingPlaceId(placeId);
    try {
      const res = await fetch(`${WEB_BASE_URL}/api/shared-collection/mutate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          actorName: userData.email || currentUser.name || 'Link editor',
          action,
          placeId,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || 'Could not update collection');
      if (Array.isArray(resData?.collection?.places)) {
        setLivePlaces(resData.collection.places);
      }
      toast.success(action === 'add' ? 'Place added' : 'Place removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update collection';
      toast.error(message);
    } finally {
      setMutatingPlaceId(null);
    }
  };

  const openAddFlow = useCallback(async () => {
    setAddOpen(true);
    if (allPlaces.length > 0 || loadingAll) return;
    setLoadingAll(true);
    try {
      const res = await fetch(`${WEB_BASE_URL}/api/shared-collection/search-places?q=&limit=100`);
      const resData = await res.json();
      setAllPlaces(Array.isArray(resData.results) ? resData.results : []);
    } catch {
      toast.error('Could not load places');
    } finally {
      setLoadingAll(false);
    }
  }, [allPlaces.length, loadingAll]);

  const requestDistance = (km: number) => {
    setMaxDistance(km);
    if (km > 0 && !userLocation) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            toast.info('Enable location to filter by distance');
            return;
          }
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation([pos.coords.longitude, pos.coords.latitude]);
        } catch {
          toast.info('Enable location to filter by distance');
        }
      })();
    }
  };

  const existingIds = useMemo(() => new Set(livePlaces.map((p) => String(p.id))), [livePlaces]);

  const suggestions = useMemo(() => {
    return allPlaces.filter((p) => {
      if (existingIds.has(String(p.id))) return false;
      if (!placeMatchesChips(p, selectedChips)) return false;
      if (budget !== 'All' && p.budget !== budget) return false;
      if (maxDistance > 0 && userLocation && typeof p.lng === 'number' && typeof p.lat === 'number') {
        if (haversineKm(userLocation, [p.lng, p.lat]) > maxDistance) return false;
      }
      return true;
    });
  }, [allPlaces, existingIds, selectedChips, budget, maxDistance, userLocation]);

  const toggleChip = (label: string) =>
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );

  const scrollToSwipe = () => {
    setShowSwipePopup(false);
    scrollRef.current?.scrollTo({ y: swipeSectionY.current, animated: true });
  };

  // One card per distinct place.
  const deckPlaces = useMemo(() => {
    const seen = new Set<string>();
    return livePlaces.filter((p) => {
      const key = placeKey(p);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [livePlaces]);

  // Cards this visitor hasn't decided on yet.
  const remainingToSwipe = useMemo(() => {
    const mine = votes[voterId] ?? {};
    return deckPlaces.filter((p) => !mine[placeKey(p)]);
  }, [deckPlaces, votes, voterId]);

  const recordVote = useCallback(
    (place: Place, vote: 'yes' | 'no') => {
      const key = placeKey(place);
      setVotes((prev) => ({
        ...prev,
        [voterId]: { ...(prev[voterId] || {}), [key]: vote },
      }));
      fetch(`${WEB_BASE_URL}/api/shared-collection/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          voterId,
          placeKey: key,
          vote,
          voterName: currentUser.name,
          voterAvatar: avatar ? (AVATARS.find((a) => a.id === avatar)?.emoji ?? '') : '',
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (Array.isArray(resData?.linkCollaborators)) setGuests(resData.linkCollaborators);
        })
        .catch(() => {
          /* best-effort; local state already updated */
        });
    },
    [token, voterId, currentUser.name, avatar]
  );

  // Leaderboard: every place ranked by how many people swiped "yes".
  const { leaderboard, allEqual } = useMemo(() => {
    const yesByPlace = new Map<string, number>();
    Object.values(votes).forEach((voterVotes) => {
      Object.entries(voterVotes).forEach(([key, v]) => {
        if (v === 'yes') yesByPlace.set(key, (yesByPlace.get(key) ?? 0) + 1);
      });
    });
    const rows = deckPlaces.map((p) => ({ place: p, yes: yesByPlace.get(placeKey(p)) ?? 0 }));
    const tied = rows.length > 0 && rows.every((r) => r.yes === rows[0].yes);
    if (tied) return { leaderboard: rows.slice(0, 3), allEqual: true };
    return {
      leaderboard: [...rows].sort((a, b) => b.yes - a.yes).filter((row) => row.yes > 0),
      allEqual: false,
    };
  }, [votes, deckPlaces]);

  // Everyone in the plan: signed-in members plus guests who opened the link.
  const crew = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; photo?: string; emoji?: string; isHost: boolean }
    >();
    const push = (key: string, name: string, photo?: string, emoji?: string, isHost = false) => {
      const id = key.trim();
      if (!id || map.has(id)) return;
      map.set(id, { key: id, name: name || id.split('@')[0], photo, emoji, isHost });
    };
    members.forEach((m) =>
      push(m.email, m.name || m.email.split('@')[0], m.photo, undefined, m.email === ownerEmail)
    );
    if (ownerEmail) push(ownerEmail, ownerEmail.split('@')[0], undefined, undefined, true);
    guests.forEach((g) => push(g.name, g.name, undefined, g.avatar));
    if (visitorName || userData.email) {
      push(
        userData.email || visitorName,
        userData.name || visitorName,
        userData.photo,
        avatar ? AVATARS.find((a) => a.id === avatar)?.emoji : undefined
      );
    }
    return Array.from(map.values());
  }, [members, guests, ownerEmail, visitorName, userData.email, userData.name, userData.photo, avatar]);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 24,
          paddingBottom: 64,
        }}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {avatar ? (
              <View style={styles.avatarEmoji}>
                <Text style={{ fontSize: 18 }}>{AVATARS.find((a) => a.id === avatar)?.emoji}</Text>
              </View>
            ) : null}
            <Button
              variant="outline"
              style={{ height: 36 }}
              onPress={() => navigation.navigate('Landing')}
            >
              <Text style={styles.outlineBtnText}>Home →</Text>
            </Button>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {canEditFromLink ? (
              <Button variant="outline" style={{ height: 36 }} onPress={openAddFlow}>
                <Plus size={16} color={colors.foreground} />
                <Text style={styles.outlineBtnText}>Add places</Text>
              </Button>
            ) : null}
            <Button style={{ height: 36 }} onPress={openSaveFlow} disabled={isAuthLoading}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </Button>
          </View>
        </View>

        {/* Title */}
        <View style={{ paddingVertical: 8, gap: 8 }}>
          <Text style={styles.title}>{collectionName}</Text>
        </View>

        {/* Who's here */}
        {crew.length > 0 ? (
          <View style={{ paddingTop: 12 }}>
            <View style={styles.crewHeader}>
              <Users size={14} color={colors.mutedForeground} />
              <Text style={styles.crewHeaderText}>Who's here · {crew.length}</Text>
            </View>
            <View style={styles.crewChips}>
              {crew.map((person) => (
                <View key={person.key} style={styles.crewChip}>
                  <View style={styles.crewAvatar}>
                    {person.photo ? (
                      <Image
                        source={{ uri: person.photo }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        contentFit="cover"
                      />
                    ) : person.emoji ? (
                      <Text style={{ fontSize: 14 }}>{person.emoji}</Text>
                    ) : (
                      <Text style={styles.crewInitials}>{person.name.slice(0, 2).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.crewName}>
                    {person.name}
                  </Text>
                  {person.isHost ? <Text style={styles.hostTag}>HOST</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {livePlaces.length > 0 ? (
          <View style={{ gap: 40, paddingTop: 16 }}>
            {/* 1. Map first */}
            <CollectionMap
              places={livePlaces}
              collection={mapCollection}
              currentUser={currentUser}
              interactive
              style={styles.map}
            />

            {/* 2. Aesthetic vertical list */}
            <View>
              <Text style={styles.sectionLabel}>The lineup</Text>
              <ExpandableCardDemo
                places={livePlaces}
                canRemove={canEditFromLink}
                removingPlaceId={mutatingPlaceId}
                onRemove={(place) => mutate('remove', String(place.id))}
              />
            </View>

            {/* 3. Swipe feature */}
            <View onLayout={(e) => (swipeSectionY.current = e.nativeEvent.layout.y)}>
              <Text style={styles.swipeTitle}>Start swiping to pick a spot</Text>
              <Text style={styles.swipeSubtitle}>
                Swipe right on the ones you love — the most-loved spots climb the leaderboard below.
              </Text>
              {remainingToSwipe.length > 0 ? (
                <CollectionSwipeDeck
                  places={remainingToSwipe}
                  totalCount={deckPlaces.length}
                  votedCount={deckPlaces.length - remainingToSwipe.length}
                  onVote={recordVote}
                />
              ) : (
                <View style={styles.swipedAllBox}>
                  <Text style={styles.swipedAllTitle}>You've swiped through everything 🎉</Text>
                  <Text style={styles.swipedAllSubtitle}>
                    Check the leaderboard to see what the group loves most.
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Leaderboard */}
            {leaderboard.length > 0 && (!allEqual || remainingToSwipe.length === 0) ? (
              <View>
                <View style={styles.leaderboardHeader}>
                  <Trophy size={16} color={tw.amber500} />
                  <Text style={styles.sectionLabelInline}>
                    {allEqual ? "Everyone's tied — start with these 3" : 'Leaderboard'}
                  </Text>
                </View>
                <View style={{ gap: 8 }}>
                  {leaderboard.map((row, i) => {
                    const fallback = parseCssGradient(
                      getGradientFromString(String(row.place.id ?? row.place.name))
                    );
                    return (
                      <View
                        key={placeKey(row.place)}
                        style={[styles.leaderRow, i === 0 ? styles.leaderRowFirst : null]}
                      >
                        <View style={[styles.rankCircle, i === 0 ? styles.rankFirst : null]}>
                          <Text style={[styles.rankText, i === 0 ? { color: '#000' } : null]}>
                            {i + 1}
                          </Text>
                        </View>
                        <View style={styles.leaderImage}>
                          {row.place.image ? (
                            <Image
                              source={{ uri: row.place.image }}
                              style={StyleSheet.absoluteFill}
                              contentFit="cover"
                            />
                          ) : (
                            <LinearGradient
                              colors={fallback.colors}
                              start={fallback.start}
                              end={fallback.end}
                              style={StyleSheet.absoluteFill}
                            />
                          )}
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text numberOfLines={1} style={styles.leaderName}>
                            {row.place.name}
                          </Text>
                          <Text numberOfLines={1} style={styles.leaderMeta}>
                            {placeMetaLine(row.place)}
                          </Text>
                        </View>
                        <View style={styles.leaderYes}>
                          <Users size={16} color={tw.emerald500} />
                          <Text style={styles.leaderYesCount}>{row.yes}</Text>
                          <Text style={styles.leaderYesLabel}>{row.yes === 1 ? 'yes' : 'yeses'}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.noPlacesBox}>
            <Text style={styles.noPlacesTitle}>No places yet</Text>
            <Text style={styles.noPlacesSubtitle}>
              {canEditFromLink
                ? 'Use Add places to start building this shared collection.'
                : 'The owner has not added places to this collection yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Delayed "start swiping" nudge */}
      {showSwipePopup && livePlaces.length > 0 ? (
        <View style={[styles.nudgeWrap, { bottom: insets.bottom + 16 }]}>
          <View style={styles.nudge}>
            <Text style={styles.nudgeText}>Start swiping to pick a spot 👉</Text>
            <Button size="sm" style={{ borderRadius: 999, height: 32 }} onPress={scrollToSwipe}>
              Let's go
            </Button>
            <Pressable onPress={() => setShowSwipePopup(false)} accessibilityLabel="Dismiss">
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Name + avatar picker on first open */}
      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen} showCloseButton={false}>
        <DialogHeader style={{ alignItems: 'center' }}>
          <DialogTitle>Who's here?</DialogTitle>
          <DialogDescription style={{ textAlign: 'center' }}>
            Add your name and pick an avatar so everyone knows who's here.
          </DialogDescription>
        </DialogHeader>
        <View style={{ marginTop: 8, gap: 16 }}>
          <View>
            <Text style={styles.dialogFieldLabel}>YOUR NAME</Text>
            <Input
              value={nameInput}
              onChangeText={setNameInput}
              onSubmitEditing={confirmIdentity}
              placeholder="e.g. Alex"
              maxLength={40}
              autoFocus
            />
          </View>
          <View>
            <Text style={styles.dialogFieldLabel}>AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setPickedAvatar(a.id)}
                  style={[styles.avatarOption, pickedAvatar === a.id ? styles.avatarOptionActive : null]}
                >
                  <Text style={{ fontSize: 28 }}>{a.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <Button
          style={{ marginTop: 8, height: 40, width: '100%' }}
          onPress={confirmIdentity}
          disabled={!nameInput.trim() || !pickedAvatar}
        >
          Continue
        </Button>
      </Dialog>

      {/* Add places flow: chips + constraints + swipe tiles */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false}>
          <DialogHeader>
            <DialogTitle>Add places</DialogTitle>
            <DialogDescription>Pick a vibe, set your limits, then swipe to add.</DialogDescription>
          </DialogHeader>

          <View style={{ gap: 16, marginTop: 12 }}>
            <View>
              <Text style={styles.dialogFieldLabel}>VIBE</Text>
              <View style={styles.chipsWrap}>
                {VIBE_CHIPS.map((chip) => {
                  const active = selectedChips.includes(chip.label);
                  return (
                    <Pressable
                      key={chip.label}
                      onPress={() => toggleChip(chip.label)}
                      style={[styles.filterChip, active ? styles.filterChipActive : null]}
                    >
                      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
              <View>
                <Text style={styles.dialogFieldLabel}>BUDGET</Text>
                <View style={styles.chipsWrap}>
                  {BUDGET_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setBudget(opt.value)}
                      style={[styles.filterChip, budget === opt.value ? styles.filterChipActive : null]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          budget === opt.value ? styles.filterChipTextActive : null,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View>
                <Text style={styles.dialogFieldLabel}>DISTANCE</Text>
                <View style={styles.chipsWrap}>
                  {DISTANCE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => requestDistance(opt.value)}
                      style={[
                        styles.filterChip,
                        maxDistance === opt.value ? styles.filterChipActive : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          maxDistance === opt.value ? styles.filterChipTextActive : null,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.dialogFieldLabel}>
                {loadingAll ? 'LOADING…' : `${suggestions.length} SUGGESTIONS — SWIPE RIGHT TO ADD`}
              </Text>
              {loadingAll ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator size="small" color={colors.mutedForeground} />
                </View>
              ) : suggestions.length > 0 ? (
                <CollectionSwipeDeck
                  key={`${selectedChips.join(',')}-${budget}-${maxDistance}`}
                  places={suggestions}
                  totalCount={suggestions.length}
                  votedCount={0}
                  onVote={(place, vote) => {
                    if (vote === 'yes') mutate('add', String(place.id));
                  }}
                />
              ) : (
                <View style={styles.noMatchesBox}>
                  <Text style={styles.noMatchesText}>No matches — try different filters.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Dialog>

      {/* Save flow */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 24, fontFamily: fonts.sansBold, letterSpacing: -0.6 }}>
            Save Collection
          </DialogTitle>
          <DialogDescription>
            Choose whether this stays connected to everyone else or becomes your own copy.
          </DialogDescription>
        </DialogHeader>

        <View style={{ marginTop: 12, gap: 12 }}>
          <SaveOption
            active={saveMode === 'shared'}
            icon={<Users size={16} color={colors.mutedForeground} />}
            title="Save as shared collection"
            description={
              access === 'edit'
                ? 'Stay synced with everyone and keep edit access.'
                : 'Stay synced with everyone, but remain view only.'
            }
            onPress={() => setSaveMode('shared')}
          />
          <SaveOption
            active={saveMode === 'personal'}
            icon={<Pencil size={16} color={colors.mutedForeground} />}
            title="Duplicate as personal collection"
            description="Create your own independent copy that only you can edit."
            onPress={() => setSaveMode('personal')}
          />
        </View>

        <Button
          style={{ marginTop: 12, height: 40, width: '100%' }}
          onPress={saveCollection}
          disabled={saving}
          loading={saving}
        >
          Save to Collections
        </Button>
      </Dialog>
    </View>
  );
}

function SaveOption({
  active,
  icon,
  title,
  description,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.saveOption, active ? styles.saveOptionActive : null]}
    >
      <View style={styles.saveOptionIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.saveOptionTitle}>{title}</Text>
        <Text style={styles.saveOptionDescription}>{description}</Text>
      </View>
      <View style={[styles.saveOptionCheck, active ? styles.saveOptionCheckActive : null]}>
        {active ? <Check size={12} color={colors.background} strokeWidth={3.5} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },
  errorTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.5,
    color: tw.red400,
  },
  unavailableRoot: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    gap: 12,
  },
  unavailableTitle: {
    fontSize: 24,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -1.2,
    color: colors.foreground,
  },
  unavailableSubtitle: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  avatarEmoji: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.primaryForeground,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -1.5,
    color: colors.foreground,
  },
  crewHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crewHeaderText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  crewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  crewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.5)',
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
  },
  crewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewInitials: {
    fontSize: 11,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },
  crewName: {
    maxWidth: 140,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  hostTag: {
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 0.5,
    color: tw.amber500,
  },
  map: {
    height: 280,
    width: '100%',
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.066),
    overflow: 'hidden',
  },
  sectionLabel: {
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: colors.mutedForeground,
  },
  sectionLabelInline: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: colors.mutedForeground,
  },
  swipeTitle: {
    marginBottom: 4,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -1.5,
    color: colors.foreground,
  },
  swipeSubtitle: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  swipedAllBox: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  swipedAllTitle: {
    fontSize: 16,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  swipedAllSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
  leaderboardHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leaderRowFirst: {
    borderColor: 'rgba(255,210,48,0.5)',
    backgroundColor: 'rgba(254,154,0,0.06)',
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankFirst: {
    backgroundColor: tw.amber400,
  },
  rankText: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  leaderImage: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  leaderName: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  leaderMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  leaderYes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaderYesCount: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  leaderYesLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  noPlacesBox: {
    marginTop: 24,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  noPlacesTitle: {
    fontSize: 16,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  noPlacesSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  nudgeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(3,4,5,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  nudgeText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  dialogFieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  avatarGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.5)',
    paddingVertical: 16,
  },
  avatarOptionActive: {
    borderColor: colors.foreground,
    backgroundColor: 'rgba(16,16,18,0.6)',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: colors.foreground,
    backgroundColor: colors.foreground,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  filterChipTextActive: {
    color: colors.background,
  },
  noMatchesBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingVertical: 40,
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  saveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: whiteAlpha(0.077),
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  saveOptionActive: {
    borderColor: 'rgba(166,132,255,0.4)',
    backgroundColor: 'rgba(142,81,255,0.08)',
  },
  saveOptionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(16,16,18,0.7)',
  },
  saveOptionTitle: {
    fontSize: 15,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  saveOptionDescription: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  saveOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveOptionCheckActive: {
    borderColor: tw.violet400,
    backgroundColor: tw.violet400,
  },
});
