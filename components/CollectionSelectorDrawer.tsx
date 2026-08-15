import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Check, Plus } from 'lucide-react-native';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Drawer } from './ui/Drawer';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { AnimatedGradientText } from './ui/AnimatedGradientText';
import { useCounterStore } from '../lib/store';
import { db } from '../lib/firebase';
import { updateDocument } from '../lib/firebaseActions';
import { toast } from '../lib/toast';
import { getRandomGradient, parseCssGradient } from '../lib/utils';
import { colors, fonts, radius, tw } from '../lib/theme';
import {
  collectionHasPlace,
  SHARED_COLLECTIONS_COLLECTION,
  type SharedCollectionDoc,
} from '../lib/sharedCollections';
import type { CollectionType, Place } from '../lib/types';

interface CollectionSelectorDrawerProps {
  place: Place;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 1:1 port of components/collection-selector-drawer.tsx (vaul bottom drawer). */
export function CollectionSelectorDrawer({ place, open, onOpenChange }: CollectionSelectorDrawerProps) {
  const userData = useCounterStore((s) => s.userData);
  const refreshUserData = useCounterStore((s) => s.refreshUserData);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const editableCollections = useMemo(
    () => userData.collections.filter((collection) => collection.type !== 'shared' || collection.access === 'edit'),
    [userData.collections]
  );

  // Initialize selected collections based on where the place already exists
  useEffect(() => {
    if (open) {
      const existing = editableCollections
        .filter((c) => c.places.some((p) => p.id === place.id))
        .map((c) => c.name);
      setSelectedCollections(existing);
    }
  }, [open, editableCollections, place.id]);

  const toggleCollection = (name: string) => {
    setSelectedCollections((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleDone = async () => {
    setIsSubmitting(true);
    try {
      const updatedCollections = await Promise.all(
        userData.collections.map(async (col) => {
          const isSelected = selectedCollections.includes(col.name);
          const hasPlace = col.places.some((p) => p.id === place.id);

          const canWriteSharedDoc =
            Boolean(col.sharedCollectionId) && (col.type !== 'shared' || col.access === 'edit');

          if (canWriteSharedDoc && col.sharedCollectionId) {
            const sharedRef = doc(db, SHARED_COLLECTIONS_COLLECTION, col.sharedCollectionId);
            const snap = await getDoc(sharedRef);
            if (snap.exists()) {
              const shared = snap.data() as SharedCollectionDoc;
              const sharedPlaces = Array.isArray(shared.places) ? shared.places : [];
              const sharedHasPlace = collectionHasPlace(sharedPlaces, place);
              const nextPlaces =
                isSelected && !sharedHasPlace
                  ? [...sharedPlaces, { ...place, addedBy: userData.email, addedAt: new Date().toISOString() }]
                  : !isSelected && sharedHasPlace
                    ? sharedPlaces.filter((p) => String(p.id ?? p.name) !== String(place.id ?? place.name))
                    : sharedPlaces;

              if (nextPlaces !== sharedPlaces) {
                await updateDoc(sharedRef, { places: nextPlaces, updatedAt: new Date().toISOString() });
                if (shared.ownerEmail) {
                  const ownerRef = doc(db, 'users', shared.ownerEmail);
                  const ownerSnap = await getDoc(ownerRef);
                  if (ownerSnap.exists()) {
                    const ownerData = ownerSnap.data();
                    const ownerCollections = Array.isArray(ownerData.collections)
                      ? (ownerData.collections as CollectionType[])
                      : [];
                    const updatedOwnerCollections = ownerCollections.map((ownerCollection) => {
                      const matchesSharedId = ownerCollection.sharedCollectionId === col.sharedCollectionId;
                      const matchesSourceName = ownerCollection.name === (shared.sourceCollectionName || shared.name);
                      if (!matchesSharedId && !matchesSourceName) return ownerCollection;
                      return { ...ownerCollection, sharedCollectionId: col.sharedCollectionId, places: nextPlaces };
                    });
                    await updateDoc(ownerRef, { collections: updatedOwnerCollections });
                  }
                }
              }

              return { ...col, places: nextPlaces };
            }
          }

          if (isSelected && !hasPlace) {
            return { ...col, places: [...col.places, place] };
          } else if (!isSelected && hasPlace) {
            return { ...col, places: col.places.filter((p) => p.id !== place.id) };
          }
          return col;
        })
      );

      await updateDocument('users', userData.email, {
        collections: updatedCollections,
      });

      await refreshUserData();
      toast.success('Added to collection');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating collections:', error);
      toast.error('Failed to update collections');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createNewCollection = async () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;
    if (userData.collections.some((c) => c.name === trimmed)) {
      toast.error('A collection with this name already exists');
      return;
    }
    setIsCreating(true);
    try {
      const newCollection = {
        name: trimmed,
        type: 'personal',
        places: [],
        gradient: getRandomGradient(),
        collaborators: [],
        createdBy: userData.email,
        ownerEmail: userData.email,
        access: 'edit',
      };
      const userRef = doc(db, 'users', userData.email);
      await updateDoc(userRef, {
        collections: [...userData.collections, newCollection],
      });
      await refreshUserData();
      setSelectedCollections((prev) => [...prev, trimmed]);
      setNewCollectionName('');
      setIsCreateDialogOpen(false);
      toast.success('Collection created!');
    } catch (err) {
      toast.error("Couldn't create collection");
      console.error('Error creating collection:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        showHandle={false}
        heightPct={0.7}
        contentStyle={styles.drawerContent}
      >
        {/* vaul-style handle: w-12 h-1.5 bg-zinc-300 mt-4 mb-8 */}
        <View style={styles.handle} />

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.title}>Add to Collection</Text>
            <View style={styles.descriptionRow}>
              <Text style={styles.description} numberOfLines={3}>
                Select which collections you want to save "{place.name}" to.
              </Text>
              <Button
                variant="outline"
                style={styles.newButton}
                onPress={() => setIsCreateDialogOpen(true)}
              >
                <Plus size={16} color={colors.foreground} />
                <Text style={styles.newButtonText}>New</Text>
              </Button>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {editableCollections.map((collection) => {
              const isSelected = selectedCollections.includes(collection.name);
              const grad = parseCssGradient(collection.gradient);
              return (
                <Pressable
                  key={collection.name}
                  onPress={() => toggleCollection(collection.name)}
                  style={styles.collectionRow}
                >
                  <LinearGradient
                    colors={grad.colors}
                    locations={grad.locations}
                    start={grad.start}
                    end={grad.end}
                    style={styles.collectionSwatch}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    <Text style={styles.collectionCount}>{collection.places.length} places</Text>
                  </View>
                  <View style={[styles.checkCircle, isSelected ? styles.checkCircleSelected : null]}>
                    {isSelected ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}

            {userData.collections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No collections yet</Text>
                <Button variant="outline" onPress={() => setIsCreateDialogOpen(true)}>
                  <Plus size={16} color={colors.foreground} />
                  <Text style={styles.newButtonText}>Create First Collection</Text>
                </Button>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={handleDone} disabled={isSubmitting} loading={isSubmitting}>
            <AnimatedGradientText style={styles.addText}>Add</AnimatedGradientText>
          </Button>
        </View>
      </Drawer>

      {/* Make new collection dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogHeader>
          <DialogTitle>Make new collection ✨</DialogTitle>
          <DialogDescription style={{ marginBottom: 8 }}>
            Organize your favorites into albums
          </DialogDescription>
          <Text style={styles.dialogLabel}>Give it a name</Text>
          <Input
            value={newCollectionName}
            onChangeText={setNewCollectionName}
            style={{ marginBottom: 8 }}
            placeholder="Weekend Getaways :)"
            onSubmitEditing={createNewCollection}
            returnKeyType="done"
          />
          <View style={styles.dialogFooter}>
            <Button
              onPress={createNewCollection}
              disabled={isCreating || !newCollectionName.trim()}
              loading={isCreating}
            >
              Add
            </Button>
          </View>
        </DialogHeader>
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: 999,
    backgroundColor: tw.zinc300,
    marginTop: 16,
    marginBottom: 32,
  },
  scroll: {
    paddingHorizontal: 24,
    flex: 1,
  },
  title: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  description: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  newButton: {
    borderRadius: radius.sm,
    borderColor: colors.border,
  },
  newButtonText: {
    color: colors.foreground,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  collectionSwatch: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
  },
  collectionName: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.foreground,
    textAlign: 'left',
  },
  collectionCount: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tw.zinc200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 16,
    fontFamily: fonts.sans,
  },
  footer: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  dialogLabel: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    marginBottom: 4,
    color: colors.foreground,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
