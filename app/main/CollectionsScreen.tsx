import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Button,
  FAB,
  Portal,
  Dialog,
  TextInput as PaperInput,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCounterStore } from '../../lib/store';
import { getRandomGradient } from '../../lib/utils';
import type { CollectionType } from '../../lib/types';

export default function CollectionsScreen() {
  const userData = useCounterStore((state) => state.userData);
  const refreshUserData = useCounterStore((state) => state.refreshUserData);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !userData.email) return;

    setLoading(true);
    try {
      const newCollection: CollectionType = {
        name: newCollectionName.trim(),
        type: "personal",
        places: [],
        gradient: getRandomGradient(),
        collaborators: [],
        createdBy: userData.email,
        ownerEmail: userData.email,
        access: "edit"
      };

      const userRef = doc(db, "users", userData.email);
      await updateDoc(userRef, {
        collections: arrayUnion(newCollection)
      });

      await refreshUserData();
      setModalVisible(false);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionPress = (collection: CollectionType) => {
    setSelectedCollection(collection);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Collections</Text>
          <Text style={styles.subtitle}>
            {userData.collections.length} {userData.collections.length === 1 ? 'collection' : 'collections'}
          </Text>
        </View>

        {/* Collections Grid */}
        {userData.collections.length > 0 ? (
          <View style={styles.collectionsGrid}>
            {userData.collections.map((collection, index) => (
              <TouchableOpacity
                key={collection.id || index}
                style={styles.collectionCard}
                onPress={() => handleCollectionPress(collection)}
              >
                <View style={[styles.collectionGradient, { backgroundColor: collection.gradient }]}>
                  <View style={styles.collectionOverlay}>
                    <Icon name="book-open-variant" size={32} color="#ffffff" />
                    <Text style={styles.collectionCount}>{collection.places.length}</Text>
                  </View>
                </View>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Text style={styles.collectionMeta}>
                    {collection.places.length} {collection.places.length === 1 ? 'place' : 'places'}
                  </Text>
                  {collection.type === 'shared' && (
                    <View style={styles.sharedBadge}>
                      <Icon name="account-group" size={12} color="#6366f1" />
                      <Text style={styles.sharedText}>Shared</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="book-open-page-variant" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No collections yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first collection to start saving places
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
        label="New Collection"
      />

      {/* Create Collection Modal */}
      <Portal>
        <Dialog
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Create New Collection</Dialog.Title>
          <Dialog.Content>
            <PaperInput
              label="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button
              onPress={handleCreateCollection}
              loading={loading}
              disabled={!newCollectionName.trim() || loading}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Collection Detail Modal */}
      <Modal
        visible={!!selectedCollection}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCollection(null)}
      >
        {selectedCollection && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalGradient, { backgroundColor: selectedCollection.gradient }]}>
                  <Icon name="book-open-variant" size={40} color="#ffffff" />
                </View>
                <TouchableOpacity onPress={() => setSelectedCollection(null)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedCollection.name}</Text>
                <Text style={styles.modalMeta}>
                  {selectedCollection.places.length} {selectedCollection.places.length === 1 ? 'place' : 'places'}
                </Text>

                {selectedCollection.places.length > 0 ? (
                  <ScrollView style={styles.placesList}>
                    {selectedCollection.places.map((place, index) => (
                      <View key={index} style={styles.placeItem}>
                        <Image
                          source={{ uri: place.image || 'https://via.placeholder.com/100' }}
                          style={styles.placeImage}
                        />
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{place.name}</Text>
                          <Text style={styles.placeCategory}>{place.category}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyCollection}>
                    <Icon name="map-marker-off" size={48} color="#9ca3af" />
                    <Text style={styles.emptyCollectionText}>No places in this collection</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionGradient: {
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionOverlay: {
    alignItems: 'center',
  },
  collectionCount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  collectionInfo: {
    padding: 12,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  collectionMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sharedText: {
    fontSize: 10,
    color: '#6366f1',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#6366f1',
  },
  dialog: {
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  placesList: {
    maxHeight: 300,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  placeCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCollection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCollectionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
});