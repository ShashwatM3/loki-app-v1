import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  TextInput,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import {
  ChevronLeft,
  Search,
  Shuffle,
  Sparkles,
  GraduationCap,
  ArrowUpRight,
  X,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Drawer, DrawerTitle } from '../../components/ui/Drawer';
import { MapLibreMap, type MapMarkerSpec, type MapPopupSpec, type MapLibreMapRef } from '../../components/maps/MapLibreMap';
import { MapsAreaSearch, type AreaResult } from '../../components/maps/MapsAreaSearch';
import { MapsEntryInterstitial } from '../../components/maps/MapsEntryInterstitial';
import { PlaceDetailsContent } from '../../components/PlaceDetailsContent';
import { FilterPill } from '../../components/browse/ExploreSection';
import { useCounterStore } from '../../lib/store';
import { usePlaceImages } from '../../lib/usePlaceImages';
import { useExploreGroups } from '../../hooks/useExploreGroups';
import { isActiveLimitedTimePopup, isExpiredLimitedTimePopup } from '../../lib/isActiveLimitedTimePopup';
import {
  CATEGORY_GROUPS,
  getChildrenForGroup,
  placeMatchesCategoryGroup,
  placeIs21Plus,
  placeMatchesExploreGroup,
  placeMatchesExploreSubfilter,
} from '../../lib/categories';
import { placeMatchesBudgetLevel, type BudgetLevel } from '../../lib/priceRange';
import { getGradientFromString } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { colors, fonts, radius, tw, whiteAlpha } from '../../lib/theme';
import type { Place } from '../../lib/types';

// Default fallback: Downtown Dubai
const FALLBACK_CENTER: [number, number] = [55.2708, 25.1972];
const DEFAULT_ZOOM = 9.5;

/** Constrain panning to the UAE (MapLibre maxBounds). */
const UAE_MAX_BOUNDS: [[number, number], [number, number]] = [
  [51.35, 22.5], // SW
  [56.55, 26.15], // NE
];

/** Zoom used after picking an area from the search bar. */
const AREA_SEARCH_ZOOM = 13;

/** Show university campus filter in the filter drawer (kept in code, hidden for now). */
const SHOW_UNIVERSITY_FILTER = false;

/** [lng, lat] — dense dining / retail / nightlife pockets. */
const DUBAI_HOTSPOTS: { name: string; lng: number; lat: number }[] = [
  { name: 'Downtown Dubai', lng: 55.2744, lat: 25.1972 },
  { name: 'Dubai Marina', lng: 55.1378, lat: 25.0772 },
  { name: 'JBR & Beach', lng: 55.1325, lat: 25.0778 },
  { name: 'Jumeirah Beach Rd', lng: 55.2625, lat: 25.2167 },
  { name: 'Deira & Al Rigga', lng: 55.3167, lat: 25.2667 },
];

const HOTSPOT_EXPLORE_ZOOM = 14.25;

const DUBAI_UNIVERSITIES: { id: string; name: string; lng: number; lat: number }[] = [
  { id: 'heriot-watt', name: 'Heriot-Watt University', lng: 55.1611, lat: 25.0995 },
  { id: 'birmingham', name: 'University of Birmingham', lng: 55.4048, lat: 25.1288 },
  { id: 'wollongong', name: 'University of Wollongong', lng: 55.1588, lat: 25.1022 },
];

const UNIVERSITY_ZOOM = 14;

type UniSpot = { name: string; emoji: string; vibe: string; gmaps?: string };

const UNIVERSITY_SPOTS: Record<string, UniSpot[]> = {
  'heriot-watt': [
    { name: 'Ski Dubai', emoji: '⛷️', vibe: 'Indoor skiing & snow park at Mall of the Emirates', gmaps: 'https://maps.google.com/?q=Ski+Dubai' },
    { name: 'Dubai Marina Walk', emoji: '🌊', vibe: 'Sunset walks & waterfront vibes', gmaps: 'https://maps.google.com/?q=Dubai+Marina+Walk' },
    { name: 'XLine Dubai Marina', emoji: '🪂', vibe: "World's longest urban zipline", gmaps: 'https://maps.google.com/?q=XLine+Dubai+Marina' },
    { name: 'Aquaventure Waterpark', emoji: '🌊', vibe: 'Insane water slides & lazy rivers', gmaps: 'https://maps.google.com/?q=Aquaventure+Waterpark+Dubai' },
    { name: 'iFLY Dubai', emoji: '🪂', vibe: 'Indoor skydiving experience', gmaps: 'https://maps.google.com/?q=iFLY+Dubai' },
    { name: 'Bounce Dubai', emoji: '🤸', vibe: 'Trampoline park & freestyle fun', gmaps: 'https://maps.google.com/?q=Bounce+Dubai+Al+Quoz' },
  ],
  birmingham: [
    { name: 'IMG Worlds of Adventure', emoji: '🎢', vibe: 'Massive indoor theme park', gmaps: 'https://maps.google.com/?q=IMG+Worlds+of+Adventure' },
    { name: 'Global Village', emoji: '🎪', vibe: 'Cultural pavilions, rides & live shows', gmaps: 'https://maps.google.com/?q=Global+Village+Dubai' },
    { name: 'Dubai Autodrome', emoji: '🏎️', vibe: 'Go-karting & racing experiences', gmaps: 'https://maps.google.com/?q=Dubai+Autodrome' },
    { name: 'Last Exit Al Khawaneej', emoji: '🛹', vibe: 'Chill outdoor hangout with food trucks', gmaps: 'https://maps.google.com/?q=Last+Exit+Al+Khawaneej' },
    { name: "Hamza's Paintball", emoji: '🔫', vibe: 'Paintball battles with your squad', gmaps: 'https://maps.google.com/?q=Hamza+Paintball+Dubai' },
    { name: 'Hub Zero', emoji: '🎮', vibe: 'Gaming & VR theme park', gmaps: 'https://maps.google.com/?q=Hub+Zero+Dubai' },
  ],
  wollongong: [
    { name: 'Ski Dubai', emoji: '⛷️', vibe: 'Indoor skiing & snow park at Mall of the Emirates', gmaps: 'https://maps.google.com/?q=Ski+Dubai' },
    { name: 'Flipout Dubai', emoji: '🤸', vibe: 'Massive trampoline & parkour arena', gmaps: 'https://maps.google.com/?q=Flipout+Dubai' },
    { name: 'Escape Hunt', emoji: '🔐', vibe: 'Escape rooms with your crew', gmaps: 'https://maps.google.com/?q=Escape+Hunt+Dubai' },
    { name: 'XLine Dubai Marina', emoji: '🪂', vibe: "World's longest urban zipline", gmaps: 'https://maps.google.com/?q=XLine+Dubai+Marina' },
    { name: 'VR Park', emoji: '🥽', vibe: 'Virtual reality rides & games', gmaps: 'https://maps.google.com/?q=VR+Park+Dubai+Mall' },
    { name: 'Kite Beach', emoji: '🏖️', vibe: 'Beach sports, volleyball & skating', gmaps: 'https://maps.google.com/?q=Kite+Beach+Dubai' },
  ],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Hiking: '⛰️',
  Chai: '☕',
  Experience: '✨',
  'Watch Sports': '⚽',
  'Running Trails': '🏃',
  'Coworking Spots': '💻',
};

const SHEET_PEEK_HEIGHT = 210;

/** Animated flowing gradient — the sheet's 2px top border. */
function SheetGradientBorder() {
  const progress = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });

  return (
    <View style={styles.sheetBorderClip}>
      <Animated.View style={{ width: width * 2, height: 2, transform: [{ translateX }] }}>
        <LinearGradient
          colors={['#f43f5e', '#a855f7', '#6366f1', '#38bdf8', '#a855f7', '#f43f5e']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

type MapsRouteParams = { place?: string } | undefined;

/** 1:1 port of app/dashboard/maps/page.tsx (mobile layout). */
export default function MapsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, MapsRouteParams>, string>>();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const places = useCounterStore((state) => state.places);
  const userData = useCounterStore((state) => state.userData);
  const fetchPlaces = useCounterStore((state) => state.fetchPlaces);
  const fetchCategories = useCounterStore((state) => state.fetchCategories);
  const mapRef = useRef<MapLibreMapRef | null>(null);
  const handledPlaceParamRef = useRef<string | null>(null);

  const [extendedPlace, setExpandedPlace] = useState<Place | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [showOnlyPopups, setShowOnlyPopups] = useState(false);
  const [showOnly21Plus, setShowOnly21Plus] = useState(false);
  const [budgetLevel, setBudgetLevel] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [showUniSpots, setShowUniSpots] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Browse bottom sheet — drag state in refs, no re-render during drag
  const sheetTranslate = useRef(new Animated.Value(0)).current;
  const sheetPosRef = useRef(0);
  const sheetDragRef = useRef({ startTranslate: 0, currentTranslate: 0, maxTranslate: 0 });
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = Math.round(screenH * 0.88);
  const maxTranslate = sheetHeight - SHEET_PEEK_HEIGHT;

  // Browse content state
  const [browseSearch, setBrowseSearch] = useState('');
  const [exploreGroupId, setExploreGroupId] = useState<string | null>(null);
  const [exploreSub, setExploreSub] = useState<string | null>(null);
  const [mapsEntered, setMapsEntered] = useState(false);

  const [mapReady, setMapReady] = useState(false);
  const mapOverlayOpacity = useRef(new Animated.Value(1)).current;
  const handleMapLoad = useCallback(() => {
    setMapReady(true);
    Animated.timing(mapOverlayOpacity, { toValue: 0, duration: 700, useNativeDriver: true }).start();
  }, [mapOverlayOpacity]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Initialize sheet position at peek.
  useEffect(() => {
    sheetTranslate.setValue(maxTranslate);
    sheetPosRef.current = maxTranslate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxTranslate]);

  const mapCenter = userLocation ?? FALLBACK_CENTER;

  const HIDDEN_FROM_ALL = ['Chai'];

  const filteredPlaces = places.filter((p) => {
    if (isExpiredLimitedTimePopup(p)) return false;
    const matchesPopup = showOnlyPopups ? p.popup : true;
    const matches21Plus = showOnly21Plus ? placeIs21Plus(p) : true;
    const matchesBudget =
      budgetLevel === 'All' ? true : placeMatchesBudgetLevel(p, budgetLevel as BudgetLevel);

    let matchesCategory = true;
    if (categoryFilter !== 'All') {
      matchesCategory =
        p.category === categoryFilter ||
        (Array.isArray(p.tags) && p.tags.includes(categoryFilter));
    } else if (selectedGroup !== 'All') {
      const group = CATEGORY_GROUPS.find((g) => g.id === selectedGroup);
      matchesCategory = group
        ? group.children.includes(p.category) ||
          (Array.isArray(p.tags) && p.tags.some((t) => group.children.includes(t)))
        : true;
    } else {
      matchesCategory = !HIDDEN_FROM_ALL.includes(p.category);
    }

    return matchesPopup && matches21Plus && matchesBudget && matchesCategory;
  });

  const imageStatuses = usePlaceImages(places);
  const exploreGroups = useExploreGroups();
  const visiblePlaces = filteredPlaces.filter((p) => imageStatuses.get(String(p.id)) === 'ready');

  const activePlace = useMemo(
    () => (activePlaceId != null ? filteredPlaces.find((p) => String(p.id) === activePlaceId) ?? null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlaceId, filteredPlaces.length, places]
  );

  useEffect(() => {
    if (activePlaceId != null && !places.some((p) => String(p.id) === activePlaceId)) {
      setActivePlaceId(null);
      setExpandedPlace(null);
    }
  }, [places, activePlaceId]);

  const clearMapSelection = useCallback(() => {
    setActivePlaceId(null);
    setExpandedPlace(null);
  }, []);

  const handleMarkerClick = useCallback(
    (id: string) => {
      const place = filteredPlaces.find((p) => String(p.id) === id);
      if (!place) return;
      setActivePlaceId((prev) => {
        if (prev === id) {
          setExpandedPlace(null);
          return null;
        }
        setExpandedPlace(place);
        return id;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredPlaces.length, places]
  );

  const handleListPlaceClick = useCallback((place: Place) => {
    setActivePlaceId(String(place.id));
    setExpandedPlace(place);
    mapRef.current?.flyTo({
      center: [place.lng, place.lat],
      minTargetZoom: 15,
      duration: 1000,
    });
  }, []);

  // Deep-link ?place= support.
  useEffect(() => {
    const placeId = route.params?.place;
    if (!placeId || places.length === 0) return;
    if (handledPlaceParamRef.current === placeId) return;

    const place = places.find((p) => String(p.id) === placeId);
    if (!place) return;

    handledPlaceParamRef.current = placeId;
    setSelectedGroup('All');
    setCategoryFilter('All');
    setBudgetLevel('All');
    setShowOnlyPopups(false);
    setShowOnly21Plus(false);
    setMapsEntered(true);
    handleListPlaceClick(place);
    navigation.setParams({ place: undefined });
  }, [route.params?.place, places, handleListPlaceClick, navigation]);

  const handleUniversitySelect = useCallback(
    (uniId: string | null) => {
      setSelectedUniversity(uniId);
      if (!uniId) {
        setShowUniSpots(false);
        return;
      }
      const uni = DUBAI_UNIVERSITIES.find((u) => u.id === uniId);
      if (!uni) return;
      clearMapSelection();
      setShowUniSpots(true);
      mapRef.current?.flyTo({ center: [uni.lng, uni.lat], zoom: UNIVERSITY_ZOOM, duration: 1400 });
      toast.message(`Viewing near ${uni.name}`, { description: 'Showing fun spots around campus' });
    },
    [clearMapSelection]
  );

  const handleShuffleHotspot = useCallback(() => {
    const spot = DUBAI_HOTSPOTS[Math.floor(Math.random() * DUBAI_HOTSPOTS.length)];
    clearMapSelection();
    mapRef.current?.flyTo({ center: [spot.lng, spot.lat], zoom: HOTSPOT_EXPLORE_ZOOM, duration: 1400 });
    toast.message(`Exploring ${spot.name}`);
  }, [clearMapSelection]);

  const handleAreaSearchSelect = useCallback(
    (area: AreaResult) => {
      clearMapSelection();
      mapRef.current?.flyTo({ center: [area.lng, area.lat], zoom: AREA_SEARCH_ZOOM, duration: 1400 });
      toast.message(`Going to ${area.name}`);
    },
    [clearMapSelection]
  );

  const setSheetOpen = useCallback(
    (expand: boolean) => {
      const target = expand ? 0 : maxTranslate;
      sheetPosRef.current = target;
      Animated.timing(sheetTranslate, {
        toValue: target,
        duration: 380,
        useNativeDriver: true,
      }).start();
      setSheetExpanded(expand);
    },
    [maxTranslate, sheetTranslate]
  );

  const handleBrowsePlaceSelect = useCallback(
    (place: Place) => {
      handleListPlaceClick(place);
      setSheetOpen(false);
    },
    [handleListPlaceClick, setSheetOpen]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        const drag = sheetDragRef.current;
        drag.maxTranslate = maxTranslate;
        drag.startTranslate = sheetPosRef.current;
        drag.currentTranslate = drag.startTranslate;
      },
      onPanResponderMove: (_e, g) => {
        const drag = sheetDragRef.current;
        const newT = Math.max(0, Math.min(drag.maxTranslate, drag.startTranslate + g.dy));
        drag.currentTranslate = newT;
        sheetPosRef.current = newT;
        sheetTranslate.setValue(newT);
      },
      onPanResponderRelease: () => {
        const drag = sheetDragRef.current;
        const willExpand = drag.currentTranslate < drag.maxTranslate / 2;
        const target = willExpand ? 0 : drag.maxTranslate;
        sheetPosRef.current = target;
        Animated.timing(sheetTranslate, {
          toValue: target,
          duration: 380,
          useNativeDriver: true,
        }).start();
        setSheetExpanded(willExpand);
      },
    })
  ).current;

  // Browse content filtering
  const browseFeaturedGroups = useMemo(
    () => CATEGORY_GROUPS.filter((g) => g.id !== 'food-drink').slice(0, 4),
    []
  );

  const browseFilteredPlaces = useMemo(() => {
    const sq = browseSearch.toLowerCase().trim();
    return places.filter((p) => {
      if (!p) return false;
      const matchesSearch =
        !sq ||
        p.name?.toLowerCase().includes(sq) ||
        p.category?.toLowerCase().includes(sq) ||
        p.location?.toLowerCase().includes(sq) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(sq))) ||
        (p.description && p.description.toLowerCase().includes(sq));
      return matchesSearch;
    });
  }, [places, browseSearch]);

  const browseVisiblePlaces = browseFilteredPlaces.filter(
    (p) => imageStatuses.get(String(p.id)) === 'ready'
  );

  const browseHappeningNow = browseVisiblePlaces.filter((p) => isActiveLimitedTimePopup(p)).slice(0, 12);

  const browseGroupRows = browseFeaturedGroups
    .map((group) => ({
      group,
      places: browseVisiblePlaces.filter((p) => placeMatchesCategoryGroup(p, group)).slice(0, 12),
    }))
    .filter((row) => row.places.length > 0);

  const activeExploreGroup = exploreGroups.find((g) => g.id === exploreGroupId) ?? null;
  const activeExploreSub = activeExploreGroup?.subfilters.find((s) => s.label === exploreSub) ?? null;
  const exploreResults = activeExploreGroup
    ? browseVisiblePlaces.filter(
        (p) =>
          (activeExploreSub
            ? placeMatchesExploreSubfilter(p, activeExploreGroup, activeExploreSub)
            : placeMatchesExploreGroup(p, activeExploreGroup)) &&
          (!showOnly21Plus || placeIs21Plus(p))
      )
    : [];

  const budgetOptions = [
    { label: 'All', value: 'All' },
    { label: '💵', value: 'Low' },
    { label: '💵💵', value: 'Moderate' },
    { label: '💵💵💵', value: 'High' },
  ];

  // Map markers
  const markers = useMemo<MapMarkerSpec[]>(() => {
    const specs: MapMarkerSpec[] = [];
    if (showMarkers) {
      visiblePlaces.forEach((place) => {
        specs.push({
          kind: 'place',
          id: String(place.id),
          lng: place.lng,
          lat: place.lat,
          image: place.image || undefined,
          gradient: place.image ? undefined : getGradientFromString(String(place.id)),
          active: activePlaceId === String(place.id),
          activePopup: isActiveLimitedTimePopup(place),
          popupDot: !!place.popup,
          emoji: CATEGORY_EMOJIS[place.category],
          clickable: true,
        });
      });
    }
    if (userLocation) {
      specs.push({ kind: 'user', id: '__you__', lng: userLocation[0], lat: userLocation[1] });
    }
    if (selectedUniversity) {
      const uni = DUBAI_UNIVERSITIES.find((u) => u.id === selectedUniversity);
      if (uni) specs.push({ kind: 'university', id: `uni-${uni.id}`, lng: uni.lng, lat: uni.lat });
    }
    return specs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMarkers, visiblePlaces.length, activePlaceId, userLocation, selectedUniversity, imageStatuses, filteredPlaces.length]);

  const popupSpec = useMemo<MapPopupSpec | null>(() => {
    if (!activePlace) return null;
    return {
      kindCard: 'placeCard',
      id: String(activePlace.id),
      lng: activePlace.lng,
      lat: activePlace.lat,
      signedIn: !!userData.email,
      place: {
        name: activePlace.name,
        category: activePlace.category,
        image: activePlace.image || undefined,
        gradient: activePlace.image ? undefined : getGradientFromString(String(activePlace.id)),
        hours: activePlace.hours,
        website: activePlace.website,
        popup: activePlace.popup,
        activePopup: isActiveLimitedTimePopup(activePlace),
        catEmoji: CATEGORY_EMOJIS[activePlace.category],
      },
    };
  }, [activePlace, userData.email]);

  const handlePopupAction = useCallback(
    (action: string, id: string) => {
      const place = filteredPlaces.find((p) => String(p.id) === id) ?? activePlace;
      if (action === 'directions' && place) {
        Linking.openURL(
          place.gmaps || `https://www.google.com/maps/search/${encodeURIComponent(`${place.name} Dubai`)}/`
        );
      } else if (action === 'expand' && place) {
        setExpandedPlace(place);
      } else if (action === 'website' && place?.website) {
        Linking.openURL(place.website);
      } else if (action === 'createAccount') {
        navigation.navigate('Welcome');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlace, filteredPlaces.length, navigation]
  );

  const selectedUni = selectedUniversity ? DUBAI_UNIVERSITIES.find((u) => u.id === selectedUniversity) : null;
  const uniSpots = selectedUniversity ? (UNIVERSITY_SPOTS[selectedUniversity] ?? []) : [];

  if (!mapsEntered) {
    return (
      <MapsEntryInterstitial
        onEnter={() => setMapsEntered(true)}
        onBack={() => navigation.navigate('Browse')}
      />
    );
  }

  const filterDrawerContent = (
    <ScrollView style={{ maxHeight: screenH * 0.8 }} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
      <DrawerTitle style={{ paddingVertical: 16 }}>Filter by Category</DrawerTitle>

      {/* Parent group pills */}
      <View style={styles.filterPillsWrap}>
        <Button
          onPress={() => {
            setSelectedGroup('All');
            setCategoryFilter('All');
          }}
          variant={selectedGroup === 'All' ? 'default' : 'secondary'}
        >
          All
        </Button>
        {CATEGORY_GROUPS.map((group) => (
          <Button
            key={group.id}
            onPress={() => {
              setSelectedGroup(group.id);
              setCategoryFilter('All');
            }}
            variant={selectedGroup === group.id ? 'default' : 'secondary'}
          >
            {`${group.emoji} ${group.label}`}
          </Button>
        ))}
      </View>

      {/* Sub-category pills */}
      {selectedGroup !== 'All' ? (
        <View style={{ paddingBottom: 16 }}>
          <Text style={styles.filterSectionLabel}>Narrow it down</Text>
          <View style={styles.filterPillsWrapTight}>
            <FilterPill
              active={categoryFilter === 'All'}
              onPress={() => setCategoryFilter('All')}
              label={`All ${CATEGORY_GROUPS.find((g) => g.id === selectedGroup)?.label ?? ''}`}
            />
            {getChildrenForGroup(selectedGroup).map((cat) => (
              <FilterPill
                key={cat}
                active={categoryFilter === cat}
                onPress={() => setCategoryFilter(cat)}
                label={cat}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Budget filter */}
      <View style={{ paddingBottom: 16 }}>
        <Text style={styles.filterSectionLabel}>Budget</Text>
        <View style={styles.filterPillsWrapTight}>
          {budgetOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={budgetLevel === opt.value ? 'default' : 'secondary'}
              onPress={() => setBudgetLevel(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </View>
      </View>

      {/* University filter — hidden for now (SHOW_UNIVERSITY_FILTER) */}
      {SHOW_UNIVERSITY_FILTER ? (
        <View style={{ paddingBottom: 16 }}>
          <Text style={styles.filterSectionLabel}>University</Text>
          <View style={styles.filterPillsWrapTight}>
            <Button
              size="sm"
              variant={selectedUniversity === null ? 'default' : 'secondary'}
              onPress={() => handleUniversitySelect(null)}
            >
              All
            </Button>
            {DUBAI_UNIVERSITIES.map((uni) => (
              <Button
                key={uni.id}
                size="sm"
                variant={selectedUniversity === uni.id ? 'default' : 'secondary'}
                onPress={() => {
                  handleUniversitySelect(uni.id);
                  setFilterDrawerOpen(false);
                }}
              >
                <GraduationCap size={14} color={selectedUniversity === uni.id ? colors.primaryForeground : colors.secondaryForeground} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.sansMedium,
                    color: selectedUniversity === uni.id ? colors.primaryForeground : colors.secondaryForeground,
                  }}
                >
                  {uni.name}
                </Text>
              </Button>
            ))}
          </View>
        </View>
      ) : null}

      {/* Popup toggle */}
      <View style={{ paddingBottom: 16 }}>
        <Button
          size="sm"
          variant={showOnlyPopups ? 'default' : 'outline'}
          onPress={() => setShowOnlyPopups(!showOnlyPopups)}
          style={[{ width: '100%' }, showOnlyPopups ? { backgroundColor: tw.pink600 } : null]}
          textStyle={showOnlyPopups ? { color: '#fff' } : undefined}
        >
          {showOnlyPopups ? 'Showing only popups' : 'Show only popups'}
        </Button>
      </View>

      {/* 21+ only toggle */}
      <View style={{ paddingBottom: 16 }}>
        <Button
          size="sm"
          variant={showOnly21Plus ? 'default' : 'outline'}
          onPress={() => setShowOnly21Plus(!showOnly21Plus)}
          style={[{ width: '100%' }, showOnly21Plus ? { backgroundColor: tw.amber600 } : null]}
          textStyle={showOnly21Plus ? { color: '#fff' } : undefined}
        >
          {showOnly21Plus ? 'Showing only 21+ venues' : 'Show only 21+ venues'}
        </Button>
      </View>
    </ScrollView>
  );

  const exploreBrowseContent = (
    <>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={styles.sheetSearchWrap}>
          <Search size={16} color={colors.mutedForeground} style={styles.sheetSearchIcon} />
          <TextInput
            value={browseSearch}
            onChangeText={setBrowseSearch}
            placeholder="Search places…"
            placeholderTextColor={colors.mutedForeground}
            style={styles.sheetSearchInput}
          />
          {browseSearch ? (
            <Pressable onPress={() => setBrowseSearch('')} style={styles.sheetSearchClear}>
              <X size={14} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Explore groups → drill into sub-filters */}
      {!browseSearch ? (
        activeExploreGroup ? (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              onPress={() => {
                setExploreGroupId(null);
                setExploreSub(null);
              }}
              style={styles.sheetBackRow}
            >
              <ChevronLeft size={14} color={colors.mutedForeground} />
              <Text style={styles.sheetBackText}>All categories</Text>
            </Pressable>
            <Text style={styles.sheetGroupLabel}>
              <Text>{activeExploreGroup.emoji}</Text> {activeExploreGroup.label}
            </Text>
            <View style={styles.filterPillsWrapTight}>
              <FilterPill active={!exploreSub} onPress={() => setExploreSub(null)} label="All" />
              {activeExploreGroup.subfilters.map((sf) => {
                const isActive = exploreSub === sf.label;
                return (
                  <FilterPill
                    key={sf.label}
                    active={isActive}
                    onPress={() => setExploreSub(isActive ? null : sf.label)}
                    label={`${sf.emoji} ${sf.label}`}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.sheetGroupGrid}>
            {exploreGroups.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => {
                  setExploreGroupId(g.id);
                  setExploreSub(null);
                }}
                style={styles.sheetGroupCard}
              >
                <Text style={{ fontSize: 20 }}>{g.emoji}</Text>
                <Text numberOfLines={2} style={styles.sheetGroupCardLabel}>
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )
      ) : null}

      {!browseSearch && !activeExploreGroup && browseHappeningNow.length > 0 ? (
        <SheetPlaceRow title="Happening now" emoji="🔥" places={browseHappeningNow} onSelect={handleBrowsePlaceSelect} />
      ) : null}

      {browseSearch ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}>
          <Text style={styles.sheetCountText}>
            {browseVisiblePlaces.length} result{browseVisiblePlaces.length !== 1 ? 's' : ''}
          </Text>
          {browseVisiblePlaces.map((place) => (
            <SheetListRow key={String(place.id)} place={place} onSelect={handleBrowsePlaceSelect} />
          ))}
        </View>
      ) : activeExploreGroup ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}>
          <Text style={styles.sheetCountText}>
            {exploreResults.length} spot{exploreResults.length !== 1 ? 's' : ''}
          </Text>
          {exploreResults.length === 0 ? (
            <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.sans }}>
              No spots here yet — try another sub-filter.
            </Text>
          ) : (
            exploreResults.map((place) => (
              <SheetListRow key={String(place.id)} place={place} onSelect={handleBrowsePlaceSelect} />
            ))
          )}
        </View>
      ) : (
        browseGroupRows.map(({ group, places: rowPlaces }) => (
          <SheetPlaceRow
            key={group.id}
            title={group.label}
            emoji={group.emoji}
            places={rowPlaces}
            onSelect={handleBrowsePlaceSelect}
          />
        ))
      )}

      <View style={{ height: 96 }} />
    </>
  );

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <View style={StyleSheet.absoluteFill}>
        <MapLibreMap
          ref={mapRef}
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          minZoom={7}
          maxBounds={UAE_MAX_BOUNDS}
          markers={markers}
          popup={popupSpec}
          onLoad={handleMapLoad}
          onMarkerClick={handleMarkerClick}
          onPopupAction={handlePopupAction}
          onPopupClose={clearMapSelection}
          style={{ flex: 1 }}
        />
      </View>

      {/* Map loading overlay — blurs everything until MapLibre fires its load event */}
      <Animated.View
        pointerEvents={mapReady ? 'none' : 'auto'}
        style={[StyleSheet.absoluteFill, { zIndex: 100, opacity: mapOverlayOpacity }]}
      >
        <BlurView intensity={80} tint="dark" style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color={tw.rose500} />
          <Text style={styles.loadingText}>Loading map…</Text>
        </BlurView>
      </Animated.View>

      {/* Top bar: logo + area search + controls */}
      <View style={[styles.topBar, { top: insets.top + 16 }]} pointerEvents="box-none">
        <View style={{ gap: 8, alignItems: 'flex-start', flex: 1 }} pointerEvents="box-none">
          <View style={styles.logoPill}>
            <Pressable onPress={() => navigation.navigate('Browse')}>
              <Text style={styles.logoPillText}>loki.</Text>
            </Pressable>
            <Text style={styles.logoPillCount}>{visiblePlaces.length} spots</Text>
          </View>
          <MapsAreaSearch onSelect={handleAreaSearchSelect} />
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => setShowMarkers((v) => !v)}
              style={[styles.roundControl, showMarkers ? styles.roundControlDark : styles.roundControlLight]}
              accessibilityLabel={showMarkers ? 'Hide place markers' : 'Show place markers'}
            >
              {showMarkers ? <Eye size={16} color="#fff" /> : <EyeOff size={16} color="#000" />}
            </Pressable>
            <Pressable
              onPress={handleShuffleHotspot}
              style={[styles.squareControl, styles.roundControlDark]}
              accessibilityLabel="Jump to a random area"
            >
              <Shuffle size={16} color="#fff" />
            </Pressable>
            <Pressable onPress={() => setFilterDrawerOpen(true)} style={[styles.filterControl, styles.roundControlDark]}>
              <Text style={styles.filterControlText}>
                Filter{selectedGroup !== 'All' ? ` · ${CATEGORY_GROUPS.find((g) => g.id === selectedGroup)?.emoji}` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Browse bottom sheet — peeks at the bottom, drag up to expand */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY: sheetTranslate }],
          },
        ]}
      >
        <SheetGradientBorder />

        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.sheetHandleZone}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHandleRow}>
            <Text style={styles.sheetTitle}>Explore</Text>
            <Text style={styles.sheetCount}>{browseVisiblePlaces.length} places</Text>
          </View>
        </View>

        {/* Scrollable browse content */}
        <ScrollView style={{ flex: 1 }} scrollEnabled={sheetExpanded} keyboardShouldPersistTaps="handled">
          {exploreBrowseContent}
        </ScrollView>
      </Animated.View>

      {/* Filter drawer */}
      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        {filterDrawerContent}
      </Drawer>

      {/* Uni spots drawer */}
      <Drawer
        open={showUniSpots && !!selectedUni && uniSpots.length > 0 && !extendedPlace}
        onOpenChange={(open) => {
          if (!open) setShowUniSpots(false);
        }}
      >
        {selectedUni ? (
          <View style={{ gap: 4, paddingBottom: insets.bottom + 8 }}>
            <View style={styles.uniHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.uniIconCircle}>
                  <GraduationCap size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.uniName}>{selectedUni.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} color={colors.mutedForeground} />
                    <Text style={styles.uniSubtitle}>Fun spots nearby</Text>
                  </View>
                </View>
              </View>
              <Button variant="ghost" size="icon-sm" onPress={() => setShowUniSpots(false)}>
                <X size={14} color={colors.foreground} />
              </Button>
            </View>
            <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 6 }}>
              {uniSpots.map((spot) => (
                <Pressable
                  key={spot.name}
                  onPress={() => spot.gmaps && Linking.openURL(spot.gmaps)}
                  style={styles.uniSpotRow}
                >
                  <Text style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{spot.emoji}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.uniSpotName}>{spot.name}</Text>
                    <Text numberOfLines={1} style={styles.uniSpotVibe}>
                      {spot.vibe}
                    </Text>
                  </View>
                  <ArrowUpRight size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View />
        )}
      </Drawer>

      {/* Full-screen details as drawer */}
      <Drawer
        open={!!extendedPlace}
        onOpenChange={(open) => {
          if (!open) setExpandedPlace(null);
        }}
        heightPct={0.85}
      >
        {extendedPlace ? (
          <PlaceDetailsContent
            place={extendedPlace}
            onClose={() => setExpandedPlace(null)}
            isDrawer
          />
        ) : (
          <View />
        )}
      </Drawer>
    </View>
  );
}

function SheetListRow({ place, onSelect }: { place: Place; onSelect: (p: Place) => void }) {
  return (
    <Pressable onPress={() => onSelect(place)} style={styles.sheetListRow}>
      <View style={styles.sheetListImage}>
        {place.image ? (
          <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.sheetListName}>
          {place.name}
        </Text>
        <Text numberOfLines={1} style={styles.sheetListMeta}>
          {place.category}
          {place.location ? ` · ${place.location}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

function SheetPlaceRow({
  title,
  emoji,
  places,
  onSelect,
}: {
  title: string;
  emoji?: string;
  places: Place[];
  onSelect: (p: Place) => void;
}) {
  return (
    <View style={{ paddingBottom: 20 }}>
      <View style={styles.rowHeader}>
        {emoji ? <Text style={{ fontSize: 14 }}>{emoji}</Text> : null}
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 4 }}
      >
        {places.map((place) => {
          const activeNow = isActiveLimitedTimePopup(place);
          return (
            <Pressable
              key={String(place.id)}
              onPress={() => onSelect(place)}
              style={[styles.rowCard, activeNow ? styles.rowCardActiveNow : null]}
            >
              <View style={styles.rowCardImageWrap}>
                {place.image ? (
                  <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : null}
                <LinearGradient
                  colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0)']}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                {place.popup ? (
                  <View style={styles.rowCardPopupBadge}>
                    <Text style={styles.rowCardPopupText}>Popup</Text>
                  </View>
                ) : null}
                <View style={styles.rowCardBottom}>
                  <Text numberOfLines={1} style={styles.rowCardCategory}>
                    {place.category}
                  </Text>
                  <Text numberOfLines={2} style={styles.rowCardName}>
                    {place.name}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(3,4,5,0.2)',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.35,
    color: 'rgba(232,232,232,0.7)',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  logoPill: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoPillText: {
    color: '#fff',
    fontFamily: fonts.sansBold,
    fontSize: 14,
  },
  logoPillCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: fonts.sans,
    fontVariant: ['tabular-nums'],
  },
  roundControl: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  squareControl: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterControl: {
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterControlText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
  roundControlDark: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  roundControlLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetBorderClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
    overflow: 'hidden',
  },
  sheetHandleZone: {
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  sheetHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.35,
    color: colors.foreground,
  },
  sheetCount: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  sheetSearchWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  sheetSearchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  sheetSearchClear: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  sheetSearchInput: {
    width: '100%',
    height: 40,
    paddingLeft: 36,
    paddingRight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  sheetBackRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetBackText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  sheetGroupLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  sheetGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetGroupCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sheetGroupCardLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  sheetCountText: {
    marginBottom: 4,
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.3)',
  },
  sheetListImage: {
    height: 48,
    width: 48,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  sheetListName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.foreground,
  },
  sheetListMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  rowCard: {
    width: 176, // w-44
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: whiteAlpha(0.066),
  },
  rowCardActiveNow: {
    borderColor: 'rgba(248,113,113,0.45)',
  },
  rowCardImageWrap: {
    height: 112, // h-28
    width: '100%',
    backgroundColor: colors.muted,
  },
  rowCardPopupBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    backgroundColor: tw.pink500,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rowCardPopupText: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#fff',
  },
  rowCardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  rowCardCategory: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.sans,
  },
  rowCardName: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.sansSemiBold,
    color: '#fff',
  },
  filterPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
    paddingTop: 0,
  },
  filterPillsWrapTight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  filterSectionLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: fonts.sans,
  },
  uniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  uniIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tw.violet600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uniName: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  uniSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  uniSpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.3)',
  },
  uniSpotName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 19,
    color: colors.foreground,
  },
  uniSpotVibe: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
