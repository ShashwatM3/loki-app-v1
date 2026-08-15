import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  MoreHorizontal,
  Share2,
  ChevronLeft,
  Trash,
  Map as MapIcon,
  X,
} from 'lucide-react-native';
import { Button } from '../ui/Button';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { AlertDialog } from '../ui/AlertDialog';
import { CollectionBannerGlow } from '../ui/glows';
import { getGradientFromString, parseCssGradient } from '../../lib/utils';
import CollaboratorManager from './CollaboratorManager';
import { CollectionMembers } from './CollectionMembers';
import { PlaceDetailsContent } from '../PlaceDetailsContent';
import { CollectionDecideSection } from './CollectionDecideSection';
import { CollectionMap } from '../maps/CollectionMap';
import { canEditCollection } from '../../lib/sharedCollections';
import { colors, fonts, radius, tw } from '../../lib/theme';
import type { MapPopupSpec } from '../maps/MapLibreMap';
import type { CollectionType, Place } from '../../lib/types';

/**
 * Deterministically derive a hue (0–359) from a string so the same collection
 * always resolves to the same accent color.
 */
const hashHue = (input: string): number => {
  let hash = 0;
  const str = input || 'loki';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const inferCollectionHue = (collection: { name?: string; gradient?: string }): number => {
  const g = collection?.gradient;
  if (g) {
    const hslMatch = g.match(/hsl\(\s*(\d+(?:\.\d+)?)/i);
    if (hslMatch) return Math.round(parseFloat(hslMatch[1])) % 360;
    const hexMatch = g.match(/#([0-9a-f]{6})/i);
    if (hexMatch) return hashHue(hexMatch[1]);
  }
  return hashHue(collection?.name || '');
};

/**
 * Fullscreen map overlay for a collection — port of CollectionMapOverlay.
 */
function CollectionMapOverlay({
  collection,
  currentUser,
  onClose,
}: {
  collection: CollectionType;
  currentUser: { email: string; name?: string; photo?: string };
  onClose: () => void;
}) {
  const places = React.useMemo(() => collection.places || [], [collection.places]);
  const [activePlaceId, setActivePlaceId] = React.useState<string | null>(null);
  const [expandedPlace, setExpandedPlace] = React.useState<Place | null>(null);

  const activePlace = React.useMemo(
    () => places.find((p) => String(p.id) === activePlaceId) ?? null,
    [places, activePlaceId]
  );

  const popup = React.useMemo<MapPopupSpec | null>(() => {
    if (!activePlace) return null;
    return {
      kindCard: 'collectionCard',
      id: String(activePlace.id),
      lng: activePlace.lng,
      lat: activePlace.lat,
      place: {
        name: activePlace.name,
        category: activePlace.category,
        image: activePlace.image || undefined,
        gradient: activePlace.image
          ? undefined
          : getGradientFromString(String(activePlace.id ?? activePlace.name)),
      },
    };
  }, [activePlace]);

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={overlayStyles.root}>
        <CollectionMap
          places={places}
          collection={collection}
          currentUser={currentUser}
          interactive
          shareLocation
          activePlaceId={activePlaceId}
          onPlaceClick={(place) => setActivePlaceId(String(place.id))}
          popup={popup}
          onPopupAction={(action, id) => {
            if (action === 'expand') {
              const place = places.find((p) => String(p.id) === id);
              if (place) {
                setExpandedPlace(place);
                setActivePlaceId(null);
              }
            }
          }}
          onPopupClose={() => setActivePlaceId(null)}
          style={StyleSheet.absoluteFill}
        />

        {/* Top bar: place count badge + close */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0)']}
          style={overlayStyles.topBar}
          pointerEvents="box-none"
        >
          <View style={{ flex: 1 }} />
          <View style={overlayStyles.countBadge}>
            <Text style={overlayStyles.countBadgeText}>
              {places.length} PLACES · {collection.name.toLowerCase()}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Pressable onPress={onClose} style={overlayStyles.closeBtn} accessibilityLabel="Close map">
              <X size={20} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Full place details, slides in from the side */}
        <Modal
          visible={!!expandedPlace}
          transparent
          animationType="slide"
          onRequestClose={() => setExpandedPlace(null)}
        >
          <View style={overlayStyles.detailsWrap}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpandedPlace(null)} />
            <View style={overlayStyles.detailsPanel}>
              {expandedPlace ? (
                <PlaceDetailsContent place={expandedPlace} onClose={() => setExpandedPlace(null)} />
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

interface CollectionDetailViewProps {
  activeCollection: CollectionType;
  userData: { email: string; name?: string; photo?: string };
  refreshUserData: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSwipe: (swipe: boolean) => void;
  handleDeleteCollection: (name: string) => void;
  deletingCollection: string | null;
  generateShareableLink: (collection: CollectionType) => void;
  onBrowse: () => void;
}

/** 1:1 port of app/dashboard/collections/collection-detail-view.tsx. */
export function CollectionDetailView({
  activeCollection,
  userData,
  refreshUserData,
  setDrawerOpen,
  setSwipe,
  handleDeleteCollection,
  deletingCollection,
  generateShareableLink,
  onBrowse,
}: CollectionDetailViewProps) {
  const { width } = useWindowDimensions();
  const [mapOverlayOpen, setMapOverlayOpen] = React.useState(false);
  const [detailPlace, setDetailPlace] = React.useState<Place | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const accentHue = React.useMemo(
    () => inferCollectionHue(activeCollection || {}),
    [activeCollection]
  );

  if (!activeCollection) return null as unknown as React.JSX.Element;
  const canEdit = canEditCollection(activeCollection, userData.email);
  const canManage = Boolean(activeCollection.isOwner);

  const bannerFallbacks = [
    ['#4f39f6', '#8200db'], // indigo-600 → purple-700
    ['#ad46ff', '#f6339a'], // purple-500 → pink-500
    ['#f6339a', '#ff2056'], // pink-500 → rose-500
  ];

  const bannerCell = (index: number, style: object) => {
    const place = activeCollection.places[index];
    return (
      <View style={[bannerStyles.cell, style]}>
        {place?.image ? (
          <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={bannerFallbacks[index] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Immersive header: nav controls over the banner */}
        <View style={{ position: 'relative' }}>
          <View style={styles.navRow}>
            <Pressable
              onPress={() => setDrawerOpen(false)}
              style={styles.navBtn}
              accessibilityLabel="Back"
            >
              <ChevronLeft size={24} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {canManage ? (
                <Pressable
                  onPress={() => generateShareableLink(activeCollection)}
                  style={styles.navBtn}
                  accessibilityLabel="Share"
                >
                  <Share2 size={20} color="#fff" />
                </Pressable>
              ) : null}
              <Pressable style={styles.navBtn} accessibilityLabel="More">
                <MoreHorizontal size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Banner zone: image collage grid */}
          <View style={{ position: 'relative', marginTop: -72 }}>
            <View style={bannerStyles.grid}>
              {bannerCell(0, { flex: 7 })}
              <View style={{ flex: 5, gap: 4 }}>
                {bannerCell(1, { flex: 1 })}
                {bannerCell(2, { flex: 1 })}
              </View>
            </View>
            {/* Inferred-color icy glow bleeding out from under the banner */}
            <CollectionBannerGlow hue={accentHue} top={230} height={160} />
          </View>
        </View>

        {/* Collection Info */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
          <Text style={styles.title}>{activeCollection.name.toLowerCase()}</Text>
          <Text style={styles.subtitle}>
            {activeCollection.places.length} places ·{' '}
            {canManage ? 'created by you' : `shared by ${activeCollection.ownerEmail?.split('@')[0] || 'someone'}`}
          </Text>

          {/* Everyone who joined */}
          <View style={styles.membersRow}>
            <CollectionMembers
              collection={activeCollection}
              currentUser={userData}
              style={{ flex: 1, minWidth: 0 }}
            />

            {canManage ? (
              <Button variant="ghost" size="sm" style={styles.inviteBtn} onPress={() => setInviteOpen(true)}>
                <Plus size={16} color="#fff" />
                <Text style={styles.inviteBtnText}>Invite</Text>
              </Button>
            ) : null}
          </View>
        </View>

        {/* Map Preview Card */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Pressable onPress={() => setMapOverlayOpen(true)} style={styles.mapPreview}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <CollectionMap
                places={activeCollection.places}
                collection={activeCollection}
                currentUser={userData}
                interactive={false}
                style={{ flex: 1 }}
              />
            </View>

            {/* Map Badge */}
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>
                {activeCollection.places.length} PLACES ·{' '}
                {Object.keys(activeCollection.participantLocations || {}).length} SHARING LOCATION
              </Text>
            </View>

            {/* Open Map Button */}
            <View style={styles.openMapBtnWrap}>
              <View style={styles.openMapBtn}>
                <MapIcon size={16} color="#000" />
                <Text style={styles.openMapBtnText}>Open map</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Swipe-to-decide voting */}
        <CollectionDecideSection
          activeCollection={activeCollection}
          userData={userData}
          canEdit={canEdit}
          setSwipe={setSwipe}
          onBrowse={onBrowse}
        />

        {/* Vertical list of places */}
        {activeCollection.places.length > 0 ? (
          <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
            <Text style={styles.lineupLabel}>The lineup</Text>
            <View style={{ gap: 10 }}>
              {activeCollection.places.map((place) => {
                const fallback = parseCssGradient(
                  getGradientFromString(String(place.id ?? place.name))
                );
                return (
                  <Pressable
                    key={String(place.id ?? place.name)}
                    onPress={() => setDetailPlace(place)}
                    style={styles.lineupRow}
                  >
                    <View style={styles.lineupImage}>
                      {place.image ? (
                        <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
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
                      {place.category ? (
                        <Text style={styles.lineupCategory}>{place.category}</Text>
                      ) : null}
                      <Text numberOfLines={1} style={styles.lineupName}>
                        {place.name}
                      </Text>
                      {place.location ? (
                        <Text numberOfLines={1} style={styles.lineupLocation}>
                          {place.location}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Delete Collection */}
        {canManage && activeCollection.name !== 'Favorites' ? (
          <View style={{ paddingHorizontal: 20, marginTop: 48, paddingBottom: 40 }}>
            <Button
              variant="ghost"
              style={styles.deleteBtn}
              disabled={deletingCollection === activeCollection.name}
              onPress={() => setDeleteOpen(true)}
            >
              <Trash size={20} color={tw.red400} />
              <Text style={styles.deleteBtnText}>Delete collection</Text>
            </Button>
          </View>
        ) : null}
      </ScrollView>

      {/* Place details modal */}
      <Modal
        visible={!!detailPlace}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailPlace(null)}
      >
        <View style={styles.detailModalWrap}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailPlace(null)} />
          <View style={[styles.detailModalPanel, { maxWidth: Math.min(width, 448) }]}>
            {detailPlace ? (
              <PlaceDetailsContent place={detailPlace} onClose={() => setDetailPlace(null)} />
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Invite collaborators dialog */}
      <Dialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        contentStyle={{ backgroundColor: tw.neutral900, borderColor: tw.neutral800 }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#fff', fontFamily: fonts.displaySemiBold }}>
            Invite Collaborators
          </DialogTitle>
        </DialogHeader>
        <CollaboratorManager
          collection={activeCollection}
          userEmail={userData.email}
          onUpdate={() => refreshUserData()}
        />
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete collection?"
        description={`This will permanently remove "${activeCollection.name}" and all its places.`}
        actionLabel="Delete"
        onAction={() => {
          handleDeleteCollection(activeCollection.name);
          setDrawerOpen(false);
        }}
        contentStyle={{ backgroundColor: tw.neutral900, borderColor: tw.neutral800 }}
        titleStyle={{ color: '#fff' }}
        descriptionStyle={{ color: tw.neutral400 }}
        cancelStyle={{ backgroundColor: tw.neutral800, borderColor: tw.neutral700 }}
        cancelTextStyle={{ color: '#fff' }}
        actionStyle={{ backgroundColor: tw.red600 }}
        actionTextStyle={{ color: '#fff', fontFamily: fonts.sansBold }}
      />

      {/* Fullscreen map overlay */}
      {mapOverlayOpen ? (
        <CollectionMapOverlay
          collection={activeCollection}
          currentUser={userData}
          onClose={() => setMapOverlayOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  navRow: {
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -1.2,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.display,
    color: tw.neutral400,
  },
  membersRow: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  inviteBtn: {
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    gap: 6,
  },
  inviteBtnText: {
    fontSize: 12,
    fontFamily: fonts.display,
    color: '#fff',
  },
  mapPreview: {
    height: 200,
    width: '100%',
    borderRadius: radius['3xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: tw.neutral900,
  },
  mapBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapBadgeText: {
    fontSize: 10,
    fontFamily: fonts.displayBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#fff',
  },
  openMapBtnWrap: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  openMapBtn: {
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  openMapBtnText: {
    fontSize: 12,
    fontFamily: fonts.displayBold,
    color: '#000',
  },
  lineupLabel: {
    marginBottom: 12,
    fontSize: 10,
    fontFamily: fonts.displayBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: tw.neutral400,
  },
  lineupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23,23,23,0.6)',
    padding: 10,
  },
  lineupImage: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  lineupCategory: {
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: tw.neutral500,
  },
  lineupName: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  lineupLocation: {
    fontSize: 12,
    color: tw.neutral400,
    fontFamily: fonts.sans,
  },
  deleteBtn: {
    width: '100%',
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(130,24,26,0.3)',
    backgroundColor: 'rgba(70,8,9,0.2)',
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    color: tw.red400,
    fontFamily: fonts.sansMedium,
  },
  detailModalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  detailModalPanel: {
    height: '85%',
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    backgroundColor: colors.background,
  },
});

const bannerStyles = StyleSheet.create({
  grid: {
    zIndex: 10,
    height: 280,
    width: '100%',
    backgroundColor: tw.neutral900,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  cell: {
    position: 'relative',
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
});

const overlayStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: fonts.displayBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailsPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
});
