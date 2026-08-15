import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Map,
  Search,
  Sparkles,
  Wand2,
  type LucideIcon,
} from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sheet } from '../../components/ui/Sheet';
import { useCounterStore } from '../../lib/store';
import { getBrowseVibeById, type BrowseVibeDefinition } from '../../lib/browseVibes';
import { isActiveLimitedTimePopup, isExpiredLimitedTimePopup } from '../../lib/isActiveLimitedTimePopup';
import { CuratedAlbums } from '../../components/browse/CuratedAlbums';
import { ExploreSection } from '../../components/browse/ExploreSection';
import { VibePlacesGrid } from '../../components/browse/VibePlacesGrid';
import { PlaceDetailsContent } from '../../components/PlaceDetailsContent';
import { LokiChatSheet } from '../../components/LokiChatSheet';
import { usePlaceImages } from '../../lib/usePlaceImages';
import { colors, fonts, radius, tw, whiteAlpha, shadows } from '../../lib/theme';
import type { Place } from '../../lib/types';

type BrowseRouteParams = { vibe?: string } | undefined;

/** 1:1 port of app/dashboard/landing-variation/page.tsx (== /dashboard/browse). */
export default function BrowseScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, BrowseRouteParams>, string>>();
  const insets = useSafeAreaInsets();
  const places = useCounterStore((state) => state.places);
  const userData = useCounterStore((state) => state.userData);
  const fetchPlaces = useCounterStore((state) => state.fetchPlaces);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeVibe, setActiveVibe] = useState<BrowseVibeDefinition | null>(null);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [isAlbumSearchOpen, setIsAlbumSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const albumSearchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Same gate as maps: only surface places whose images successfully load.
  const imageStatuses = usePlaceImages(places);
  const placesWithImages = places.filter(
    (p) => imageStatuses.get(String(p.id)) === 'ready' && !isExpiredLimitedTimePopup(p)
  );

  useEffect(() => {
    const queryVibe = getBrowseVibeById(route.params?.vibe ?? null);
    setActiveVibe(queryVibe);
  }, [route.params?.vibe]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timeout = setTimeout(() => searchInputRef.current?.focus(), 160);
    return () => clearTimeout(timeout);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isAlbumSearchOpen) return;
    const timeout = setTimeout(() => albumSearchInputRef.current?.focus(), 160);
    return () => clearTimeout(timeout);
  }, [isAlbumSearchOpen]);

  const firstName = useMemo(
    () => (userData?.name ? userData.name.trim().split(' ')[0] : null),
    [userData?.name]
  );

  const timeGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const filteredPlaces = useMemo(() => {
    const sq = searchQuery.toLowerCase().trim();
    return placesWithImages.filter((p) => {
      if (!p) return false;
      const matchesSearch =
        !sq ||
        p.name?.toLowerCase().includes(sq) ||
        p.category?.toLowerCase().includes(sq) ||
        p.location?.toLowerCase().includes(sq) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(sq))) ||
        (p.description && p.description.toLowerCase().includes(sq));
      const matchesVibe = !activeVibe || activeVibe.predicate(p);
      return matchesSearch && matchesVibe;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesWithImages.length, searchQuery, activeVibe, imageStatuses]);

  const topPicks = useMemo(() => filteredPlaces.slice(0, 10), [filteredPlaces]);

  const albumPlaces = useMemo(() => {
    if (!activeVibe) return [];
    const sq = albumSearchQuery.toLowerCase().trim();
    return placesWithImages.filter((p) => {
      if (!p || !activeVibe.predicate(p)) return false;
      if (!sq) return true;
      return (
        p.name?.toLowerCase().includes(sq) ||
        p.category?.toLowerCase().includes(sq) ||
        p.location?.toLowerCase().includes(sq) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(sq))) ||
        (p.description && p.description.toLowerCase().includes(sq))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesWithImages.length, activeVibe, albumSearchQuery, imageStatuses]);

  const handleSelectVibe = (vibe: BrowseVibeDefinition) => {
    setAlbumSearchQuery('');
    setIsAlbumSearchOpen(false);
    navigation.setParams({ vibe: vibe.id });
  };

  const handleBackToAlbums = () => {
    setActiveVibe(null);
    setAlbumSearchQuery('');
    setIsAlbumSearchOpen(false);
    navigation.setParams({ vibe: undefined });
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>loki.</Text>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Search"
            onPress={() => setIsSearchOpen((p) => !p)}
          >
            <Search size={16} color={colors.foreground} />
          </Button>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingSmall}>{timeGreeting}</Text>
          <Text style={styles.greetingName}>{firstName ?? 'Welcome'}</Text>
        </View>

        {/* Collapsible global search */}
        {isSearchOpen ? (
          <View style={styles.searchWrap}>
            <View style={styles.searchInputWrap}>
              <Search size={16} color={colors.mutedForeground} style={styles.searchIcon} />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search places…"
                style={styles.searchInput}
              />
            </View>
          </View>
        ) : null}

        {/* Main content */}
        <View style={{ marginTop: 32, gap: 40 }}>
          {searchQuery.trim().length > 0 ? (
            <View style={styles.px}>
              <SearchResultsList places={filteredPlaces} onSelect={handleSelectPlace} />
            </View>
          ) : (
            <>
              {/* a) AI chatbot — top of the home page so it's unmistakable */}
              <View style={styles.px}>
                <View style={styles.askHeader}>
                  <View style={styles.askIconCircle}>
                    <Sparkles size={16} color={colors.background} />
                  </View>
                  <View>
                    <Text style={styles.askTitle}>Ask Loki</Text>
                    <Text style={styles.askSubtitle}>Your AI concierge for tonight</Text>
                  </View>
                </View>
                <Pressable onPress={() => setIsChatOpen(true)} style={styles.askInputFake}>
                  <Text style={styles.askInputFakeText}>What are you looking for tonight?</Text>
                </Pressable>
                <View style={styles.askActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => navigation.navigate('Maps')}
                    style={{ borderRadius: 999 }}
                  >
                    <Map size={12} color={colors.foreground} />
                    <Text style={styles.mapViewBtnText}>Map view</Text>
                  </Button>
                </View>
              </View>

              {/* b) Explore — vibe/category groups with their sub-filters */}
              {!activeVibe ? (
                <View style={styles.px}>
                  <ExploreSection places={placesWithImages} onSelectPlace={handleSelectPlace} />
                </View>
              ) : null}

              {/* c) Curated albums — or a vibe drill-down when one is active */}
              {activeVibe ? (
                <View style={styles.px}>
                  <Pressable onPress={handleBackToAlbums} style={styles.backToAlbums}>
                    <ArrowLeft size={14} color={colors.mutedForeground} />
                    <Text style={styles.backToAlbumsText}>Back to albums</Text>
                  </Pressable>

                  <View style={styles.vibeHeaderRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.vibeTitle}>{activeVibe.label}</Text>
                      {activeVibe.blurb ? <Text style={styles.vibeBlurb}>{activeVibe.blurb}</Text> : null}
                    </View>
                    <Button
                      variant="outline"
                      size="icon"
                      accessibilityLabel={isAlbumSearchOpen ? 'Close search' : 'Search places in this album'}
                      onPress={() => setIsAlbumSearchOpen((prev) => !prev)}
                    >
                      <Search size={16} color={colors.foreground} />
                    </Button>
                  </View>

                  {isAlbumSearchOpen ? (
                    <View style={{ marginBottom: 16 }}>
                      <View style={styles.searchInputWrap}>
                        <Search size={16} color={colors.mutedForeground} style={styles.searchIcon} />
                        <Input
                          ref={albumSearchInputRef}
                          value={albumSearchQuery}
                          onChangeText={setAlbumSearchQuery}
                          placeholder={`Search in ${activeVibe.label}…`}
                          style={[styles.searchInput, { borderRadius: radius.md }]}
                        />
                      </View>
                    </View>
                  ) : null}

                  <VibePlacesGrid places={albumPlaces} onSelect={handleSelectPlace} />
                </View>
              ) : (
                <View style={styles.px}>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>Can't choose? Loki has some suggestions</Text>
                    <Text style={styles.sectionSubtitle}>Hand-picked spots for every mood</Text>
                  </View>
                  <CuratedAlbums
                    places={placesWithImages}
                    onSelectVibe={handleSelectVibe}
                    onSelectPlace={handleSelectPlace}
                  />
                </View>
              )}

              {/* Quick access */}
              <View style={styles.px}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Quick Access</Text>
                <View style={styles.quickGrid}>
                  <QuickAccessButton icon={Map} label="Map" onPress={() => navigation.navigate('Maps')} />
                  <QuickAccessButton
                    icon={BookMarked}
                    label="Collections"
                    onPress={() => navigation.navigate('Collections')}
                  />
                  <QuickAccessButton
                    icon={Wand2}
                    label="Quiz"
                    onPress={() => navigation.navigate('Onboarding')}
                  />
                </View>
              </View>

              {/* Today's picks — scrolling portrait cards at the bottom */}
              {topPicks.length > 0 ? (
                <View style={{ minWidth: 0 }}>
                  <View style={[styles.px, { marginBottom: 12 }]}>
                    <Text style={styles.sectionTitle}>Today's picks for you</Text>
                    <Text style={styles.sectionSubtitle}>Fresh spots, hand-picked daily</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingBottom: 8 }}
                  >
                    {topPicks.map((place) => (
                      <PickCard key={String(place.id)} place={place} onSelect={handleSelectPlace} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {/* Sign in CTA */}
              {!userData?.email ? (
                <View style={styles.signInCta}>
                  <Text style={styles.signInCtaTitle}>Sign in to save places</Text>
                  <Text style={styles.signInCtaSubtitle}>Create collections and keep your favorites.</Text>
                  <View style={styles.signInCtaActions}>
                    <Button onPress={() => navigation.navigate('Authentication')}>
                      <Text style={styles.signInBtnText}>Sign in</Text>
                      <ArrowRight size={16} color={colors.primaryForeground} />
                    </Button>
                    <Button variant="outline" onPress={() => navigation.navigate('Onboarding')}>
                      Go back to quiz
                    </Button>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      {/* Ask Loki chat sheet */}
      <LokiChatSheet open={isChatOpen} onOpenChange={setIsChatOpen} />

      {/* Place details sheet */}
      <Sheet open={!!selectedPlace} onOpenChange={(open) => !open && setSelectedPlace(null)}>
        {selectedPlace ? (
          <PlaceDetailsContent
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            isDrawer
          />
        ) : (
          <View />
        )}
      </Sheet>
    </View>
  );
}

function PickCard({ place, onSelect }: { place: Place; onSelect: (p: Place) => void }) {
  const reviewCount = Array.isArray(place.reviews)
    ? place.reviews.length
    : typeof place.reviews === 'number'
      ? place.reviews
      : 0;

  return (
    <Pressable onPress={() => onSelect(place)} style={styles.pickCard}>
      <View style={styles.pickCardImageWrap}>
        {place.image ? (
          <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : null}
        {reviewCount > 0 ? (
          <View style={styles.reviewsBadge}>
            <Text style={styles.reviewsBadgeText}>
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
        ) : null}
        {place.popup ? (
          <View style={styles.pickPopupBadge}>
            <Text style={styles.pickPopupBadgeText}>Popup</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.pickCardBody}>
        <Text numberOfLines={1} style={styles.pickCardMeta}>
          {place.category}
          {place.location ? ` · ${place.location}` : ''}
        </Text>
        <Text numberOfLines={2} style={styles.pickCardName}>
          {place.name}
        </Text>
        {place.description ? (
          <Text numberOfLines={2} style={styles.pickCardDescription}>
            "{place.description}"
          </Text>
        ) : null}
        <Text style={styles.pickCardCta}>View spot →</Text>
      </View>
    </Pressable>
  );
}

function QuickAccessButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickButton}>
      <Icon size={20} color={colors.foreground} />
      <Text style={styles.quickButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function SearchResultsList({
  places,
  onSelect,
}: {
  places: Place[];
  onSelect: (p: Place) => void;
}) {
  return (
    <View style={{ minWidth: 0 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.sectionTitle}>Search results</Text>
        <Text style={styles.searchResultsCount}>{places.length} matching places</Text>
      </View>

      <View style={{ gap: 10 }}>
        {places.map((place) => {
          const activeNow = isActiveLimitedTimePopup(place);
          return (
            <Pressable
              key={String(place.id)}
              onPress={() => onSelect(place)}
              style={[styles.searchResultRow, activeNow ? styles.searchResultActiveNow : null]}
            >
              <View style={styles.searchResultImage}>
                {place.image ? (
                  <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : null}
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.searchResultName}>
                  {place.name}
                </Text>
                <View style={styles.searchResultMetaRow}>
                  <View style={styles.searchResultCategoryBadge}>
                    <Text style={styles.searchResultCategoryText}>{place.category}</Text>
                  </View>
                  {place.location ? (
                    <Text numberOfLines={1} style={styles.searchResultLocation}>
                      {place.location}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.viewBadge}>
                <Text style={styles.viewBadgeText}>View</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  px: {
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: {
    fontSize: 18,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.45,
    color: colors.foreground,
  },
  greeting: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  greetingSmall: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  greetingName: {
    marginTop: 4,
    fontSize: 36,
    lineHeight: 38,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.9,
    color: colors.foreground,
  },
  searchWrap: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  searchInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 999,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingLeft: 36,
    paddingRight: 16,
    fontSize: 14,
  },
  askHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  askIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  askSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  askInputFake: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  askInputFakeText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  askActions: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapViewBtnText: {
    fontSize: 12,
    color: colors.foreground,
    fontFamily: fonts.sansMedium,
  },
  backToAlbums: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToAlbumsText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  vibeHeaderRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  vibeTitle: {
    fontSize: 20,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  vibeBlurb: {
    marginTop: 2,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.6)',
    paddingVertical: 20,
  },
  quickButtonLabel: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  pickCard: {
    width: 168, // ~42vw on a 400pt phone
  },
  pickCardImageWrap: {
    aspectRatio: 3 / 4,
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: whiteAlpha(0.044),
    backgroundColor: colors.muted,
  },
  reviewsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reviewsBadgeText: {
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    color: '#fff',
  },
  pickPopupBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,100,182,0.5)',
    backgroundColor: 'rgba(230,0,118,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pickPopupBadgeText: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#fff',
  },
  pickCardBody: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  pickCardMeta: {
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  },
  pickCardName: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  pickCardDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  pickCardCta: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: 'rgba(232,232,232,0.8)', // text-primary/80
  },
  signInCta: {
    marginHorizontal: 16,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
    ...shadows.sm,
  },
  signInCtaTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  signInCtaSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  signInCtaActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signInBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.primaryForeground,
  },
  searchResultsCount: {
    marginTop: 2,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: whiteAlpha(0.066),
    backgroundColor: 'rgba(9,10,12,0.4)',
    padding: 10,
    ...shadows.sm,
  },
  searchResultActiveNow: {
    borderColor: 'rgba(248,113,113,0.45)',
  },
  searchResultImage: {
    height: 48,
    width: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: whiteAlpha(0.055),
    overflow: 'hidden',
    backgroundColor: colors.muted,
  },
  searchResultName: {
    fontSize: 16,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  searchResultMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultCategoryBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  searchResultCategoryText: {
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  },
  searchResultLocation: {
    flexShrink: 1,
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  viewBadge: {
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewBadgeText: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    color: colors.primaryForeground,
  },
});
