import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Loader2, Plus, X, Star, Copy, Check, Share2, Link2 } from 'lucide-react-native';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Drawer } from '../../components/ui/Drawer';
import { OnboardingGlow } from '../../components/ui/glows';
import { CollectionDetailView } from '../../components/collections/CollectionDetailView';
import { useCounterStore } from '../../lib/store';
import { db } from '../../lib/firebase';
import { toast } from '../../lib/toast';
import { parseCssGradient } from '../../lib/utils';
import { WEB_BASE_URL } from '../../services/apiClient';
import {
  normalizeCollection,
  SHARED_COLLECTIONS_COLLECTION,
  type SharedCollectionDoc,
} from '../../lib/sharedCollections';
import { colors, fonts, radius, tw } from '../../lib/theme';
import type { CollectionType } from '../../lib/types';

/** 1:1 port of app/dashboard/collections/page.tsx. */
export default function CollectionsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const userData = useCounterStore((s) => s.userData);
  const isAuthLoading = useCounterStore((s) => s.isAuthLoading);
  const refreshUserData = useCounterStore((s) => s.refreshUserData);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<CollectionType | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<string | null>(null);
  const [, setSwipe] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [displayCollections, setDisplayCollections] = useState<CollectionType[]>([]);

  // Guest access is not allowed on collections (web redirects to /Authentication).
  useEffect(() => {
    if (isFocused && !isAuthLoading && !userData.email) {
      navigation.navigate('Authentication');
    }
  }, [isFocused, isAuthLoading, userData.email, navigation]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !userData) return;
    setIsCreating(true);
    try {
      const userRef = doc(db, 'users', userData.email);
      const newCollection: CollectionType = {
        name: newCollectionName.trim(),
        type: 'personal',
        places: [],
        collaborators: [],
        linkCollaborators: [],
        shareToken:
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdBy: userData.email,
        ownerEmail: userData.email,
        access: 'edit',
      };
      await updateDoc(userRef, {
        collections: arrayUnion(newCollection),
      });
      await refreshUserData();
      setNewCollectionName('');
      setCreateOpen(false);
      toast.success('Collection created!');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionName: string) => {
    if (!userData) return;
    setDeletingCollection(collectionName);
    try {
      const userRef = doc(db, 'users', userData.email);
      const collectionToDelete = userData.collections.find((c) => c.name === collectionName);
      if (collectionToDelete) {
        await updateDoc(userRef, {
          collections: arrayRemove(collectionToDelete),
        });
        await refreshUserData();
        toast.success('Collection deleted');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    } finally {
      setDeletingCollection(null);
    }
  };

  const generateShareableLink = async (collection: CollectionType) => {
    setActiveCollection(collection);
    setLoadingModal(true);
    setShareToken(null);
    setCopied(false);
    void requestShareToken(collection);
  };

  async function requestShareToken(collection: CollectionType) {
    setShareToken(null);
    setCopied(false);

    try {
      const res = await fetch(`${WEB_BASE_URL}/api/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: collection.createdBy || collection.ownerEmail || userData.email,
          collection: collection.name,
          access: 'edit',
          sharedCollectionId: collection.sharedCollectionId,
        }),
      });

      const data = await res.json();
      if (data.token) {
        setShareToken(data.token);
        const link = `${WEB_BASE_URL}/collection/${data.token}`;
        try {
          await Clipboard.setStringAsync(link);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Auto-copy failed:', err);
        }
      } else {
        toast.error('Failed to generate link');
      }
    } catch (err) {
      console.error('Error sending POST request:', err);
      toast.error('Failed to generate link');
    }
  }

  const handleShare = async () => {
    if (!shareToken) return;
    const link = `${WEB_BASE_URL}/collection/${shareToken}`;
    try {
      await Share.share({
        title: `Loki Collection: ${activeCollection?.name}`,
        message: `Check out my collection: ${activeCollection?.name}\n${link}`,
        url: link,
      });
    } catch (err) {
      console.log('Share cancelled or failed', err);
    }
  };

  const copyToClipboard = async () => {
    if (shareToken) {
      const link = `${WEB_BASE_URL}/collection/${shareToken}`;
      await Clipboard.setStringAsync(link);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function resolveCollections() {
      const personalAndRefs = Array.isArray(userData.collections) ? userData.collections : [];
      const resolved = await Promise.all(
        personalAndRefs.map(async (collection) => {
          const normalized = normalizeCollection(collection, userData.email);
          if (normalized.type !== 'shared' || !normalized.sharedCollectionId) {
            return { ...normalized, isOwner: true };
          }

          try {
            const sharedRef = doc(db, SHARED_COLLECTIONS_COLLECTION, normalized.sharedCollectionId);
            const snap = await getDoc(sharedRef);
            if (!snap.exists()) return { ...normalized, isOwner: false };

            const shared = snap.data() as SharedCollectionDoc;
            return {
              ...normalized,
              name: shared.name,
              places: Array.isArray(shared.places) ? shared.places : [],
              ownerEmail: shared.ownerEmail,
              createdBy: shared.ownerEmail,
              gradient: shared.gradient || normalized.gradient,
              members: shared.members,
              collaborators: shared.collaborators,
              linkCollaborators: shared.linkCollaborators,
              votes: shared.votes,
              participantLocations: shared.participantLocations,
              isOwner: shared.ownerEmail === userData.email,
            };
          } catch (error) {
            console.error('Failed to resolve shared collection:', error);
            return { ...normalized, isOwner: false };
          }
        })
      );

      const sharedIds = new Set(
        resolved.map((collection) => collection.sharedCollectionId).filter(Boolean)
      );
      const legacyShared = (userData.sharedCollections || [])
        .filter((collection) => !collection.shareToken || !sharedIds.has(collection.shareToken))
        .map((collection) => ({
          ...normalizeCollection(
            { ...collection, type: 'shared', access: collection.access || 'edit' },
            collection.createdBy
          ),
          isOwner: false,
        }));

      if (!cancelled) setDisplayCollections([...resolved, ...legacyShared]);
    }

    resolveCollections();

    return () => {
      cancelled = true;
    };
  }, [userData.collections, userData.email, userData.sharedCollections]);

  if (!userData) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const shareLink = shareToken ? `${WEB_BASE_URL}/collection/${shareToken}` : null;

  const CollectionCard = ({ collection }: { collection: CollectionType }) => {
    const grad = parseCssGradient(collection.gradient || 'linear-gradient(135deg, #312e81, #0a0a0a)');
    return (
      <Pressable
        style={styles.collectionCard}
        onPress={() => {
          setActiveCollection(collection);
          setDrawerOpen(true);
        }}
      >
        {/* Background gradient + first place image */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={grad.colors}
            locations={grad.locations}
            start={grad.start}
            end={grad.end}
            style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
          />
          {collection.places[0]?.image ? (
            <Image
              source={{ uri: collection.places[0].image }}
              style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
              contentFit="cover"
            />
          ) : null}
          <LinearGradient
            colors={['#000', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.collectionCardInner}>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {collection.type === 'shared' && !collection.isOwner ? 'Shared · ' : ''}
                {collection.places.length} {collection.places.length === 1 ? 'place' : 'places'}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.collectionCardName}>{collection.name}</Text>

            <View style={styles.thumbRow}>
              {collection.places.slice(0, 4).map((place, i) => (
                <View key={i} style={styles.thumb}>
                  {place.image ? (
                    <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <LinearGradient
                      colors={['rgba(76,29,149,0.6)', '#171717']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                </View>
              ))}
              {collection.places.length > 4 ? (
                <View style={[styles.thumb, styles.thumbMore]}>
                  <Text style={styles.thumbMoreText}>+{collection.places.length - 4}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 40,
          paddingBottom: 128,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>Collections</Text>
            <Text style={styles.subtitle}>Your saved spots, grouped however you like.</Text>
          </View>
          <Pressable onPress={() => setCreateOpen(true)} style={styles.addButton}>
            <Plus size={24} color="#000" />
          </Pressable>
        </View>

        {displayCollections.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyCircle}>
              <Star size={40} color={tw.neutral700} />
            </View>
            <Text style={styles.emptyTitle}>no collections yet</Text>
            <Text style={styles.emptySubtitle}>
              start creating collections to organize your favorite places and share them with friends.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {displayCollections.map((collection, i) => (
              <CollectionCard
                key={collection.sharedCollectionId || `${collection.name}-${i}`}
                collection={collection}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create collection dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        contentStyle={{ backgroundColor: tw.neutral900, borderColor: tw.neutral800 }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#fff' }}>create a new collection</DialogTitle>
          <DialogDescription style={{ color: tw.neutral400 }}>
            give your collection a name to start adding places.
          </DialogDescription>
        </DialogHeader>
        <View style={{ gap: 16, marginTop: 16 }}>
          <Input
            placeholder="e.g. weekend vibes"
            value={newCollectionName}
            onChangeText={setNewCollectionName}
            style={{ backgroundColor: tw.neutral800, borderColor: tw.neutral700, color: '#fff' }}
          />
          <Button
            onPress={handleCreateCollection}
            disabled={isCreating || !newCollectionName.trim()}
            style={{ width: '100%', backgroundColor: '#fff', height: 36 }}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={{ color: '#000', fontFamily: fonts.sansBold, fontSize: 12 }}>
                create collection
              </Text>
            )}
          </Button>
        </View>
      </Dialog>

      {/* Share link full-screen modal */}
      <Modal
        visible={loadingModal}
        animationType="fade"
        onRequestClose={() => {
          setLoadingModal(false);
          setShareToken(null);
        }}
      >
        <View style={styles.shareRoot}>
          <OnboardingGlow />
          <Pressable
            accessibilityLabel="Close"
            style={[styles.shareClose, { top: insets.top + 12 }]}
            onPress={() => {
              setLoadingModal(false);
              setShareToken(null);
            }}
          >
            <X size={20} color={colors.mutedForeground} />
          </Pressable>

          <View style={[styles.shareContent, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 32 }]}>
            {!shareToken ? (
              <View style={styles.shareLoading}>
                <ActivityIndicator size="large" color={tw.violet300} />
                <Text style={styles.shareLoadingText}>
                  Creating your share link
                  {activeCollection ? (
                    <>
                      {' '}
                      for <Text style={{ color: colors.foreground, fontFamily: fonts.sansMedium }}>{activeCollection.name}</Text>
                    </>
                  ) : null}
                  …
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={styles.shareCheckTile}>
                  <Check size={28} color={tw.violet300} strokeWidth={2.5} />
                </View>

                <View style={{ marginTop: 32, flex: 1 }}>
                  <Text style={styles.shareTitle}>Link ready</Text>
                  <Text style={styles.shareSubtitle}>
                    Anyone with this link can add places to{' '}
                    <Text style={{ color: colors.foreground, fontFamily: fonts.sansMedium }}>
                      {activeCollection?.name ?? 'your collection'}
                    </Text>
                    .
                  </Text>

                  <Pressable onPress={copyToClipboard} style={styles.linkBox}>
                    <View style={styles.linkIconTile}>
                      <Link2 size={16} color={colors.mutedForeground} />
                    </View>
                    <Text numberOfLines={1} style={styles.linkText}>
                      {shareLink}
                    </Text>
                    {copied ? (
                      <Check size={16} color={tw.emerald400} />
                    ) : (
                      <Copy size={16} color={colors.mutedForeground} />
                    )}
                  </Pressable>
                  <Text style={styles.linkHint}>Tap the link to copy</Text>
                </View>

                <View style={{ gap: 12, paddingTop: 32 }}>
                  <Pressable onPress={handleShare} style={styles.sharePrimaryBtn}>
                    <Share2 size={16} color={colors.primaryForeground} />
                    <Text style={styles.sharePrimaryBtnText}>Share link</Text>
                  </Pressable>
                  <Pressable onPress={copyToClipboard} style={styles.shareSecondaryBtn}>
                    <Text style={styles.shareSecondaryBtnText}>
                      {copied ? 'Copied' : 'Copy to clipboard'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Collection detail drawer (full screen) */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        showHandle={false}
        contentStyle={{ backgroundColor: '#0A0A0A' }}
      >
        {activeCollection ? (
          <View style={{ flex: 1, paddingTop: insets.top }}>
            <CollectionDetailView
              activeCollection={activeCollection}
              userData={userData}
              refreshUserData={refreshUserData}
              setDrawerOpen={setDrawerOpen}
              setSwipe={setSwipe}
              handleDeleteCollection={handleDeleteCollection}
              deletingCollection={deletingCollection}
              generateShareableLink={generateShareableLink}
              onBrowse={() => {
                setDrawerOpen(false);
                navigation.navigate('Browse');
              }}
            />
          </View>
        ) : (
          <View />
        )}
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -1.5,
    color: '#fff',
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 512,
    fontSize: 14,
    lineHeight: 22,
    color: tw.neutral400,
    fontFamily: fonts.sans,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  collectionCard: {
    position: 'relative',
    backgroundColor: tw.neutral900,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius['3xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
  collectionCardInner: {
    height: 280,
    padding: 24,
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    color: '#fff',
  },
  collectionCardName: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.45,
    color: '#fff',
    marginBottom: 12,
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: tw.neutral800,
  },
  thumbMore: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbMoreText: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tw.neutral900,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.sansBold,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    maxWidth: 384,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: tw.neutral500,
    fontFamily: fonts.sans,
  },
  shareRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shareClose: {
    position: 'absolute',
    right: 12,
    zIndex: 50,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.077)',
    backgroundColor: 'rgba(9,10,12,0.4)',
  },
  shareContent: {
    flex: 1,
    zIndex: 10,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  shareLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  shareLoadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
  shareCheckTile: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(166,132,255,0.3)',
    backgroundColor: 'rgba(142,81,255,0.1)',
  },
  shareTitle: {
    fontSize: 24,
    lineHeight: 26,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  shareSubtitle: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  linkBox: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.077)',
    backgroundColor: 'rgba(9,10,12,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkIconTile: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(16,16,18,0.7)',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.mutedForeground,
  },
  linkHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(134,134,134,0.7)',
    fontFamily: fonts.sans,
  },
  sharePrimaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingVertical: 10,
  },
  sharePrimaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.primaryForeground,
  },
  shareSecondaryBtn: {
    width: '100%',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.5)',
    paddingVertical: 10,
  },
  shareSecondaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
});
