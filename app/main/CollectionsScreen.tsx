import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  FAB,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCounterStore } from '../../lib/store';
import { encrypt } from '../../lib/crypto';
import type { CollectionType, Place } from '../../lib/types';
import { apiClient } from '../../services/apiClient';

const { width } = Dimensions.get('window');

export default function CollectionsScreen({ navigation }: any) {
  const userData = useCounterStore((state) => state.userData);
  const setUserData = useCounterStore((state) => state.setUserData);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(null);
  const [loading, setLoading] = useState(false);

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    setLoading(true);
    try {
      const gradient = gradients[Math.floor(Math.random() * gradients.length)];
      const newCollection: CollectionType = {
        name: newCollectionName.trim(),
        type: 'personal',
        gradient,
        places: [],
        ownerEmail: userData.email,
        createdBy: userData.email,
        access: 'edit',
      };

      const updatedCollections = [...userData.collections, newCollection];
      const updatedUserData = { ...userData, collections: updatedCollections };
      
      // Update local state
      setUserData(updatedUserData);
      
      // Update Firestore
      const { db } = require('../../lib/firebase');
      const { doc, updateDoc } = require('firebase/firestore');
      const userDocRef = doc(db, 'users', userData.email);
      await updateDoc(userDocRef, { collections: updatedCollections });

      setShowCreateDialog(false);
      setNewCollectionName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCollections = userData.collections.filter(
                (c) => c.id !== collectionId
              );
              const updatedUserData = { ...userData, collections: updatedCollections };
              
              setUserData(updatedUserData);
              
              // Update Firestore
              const { db } = require('../../lib/firebase');
              const { doc, updateDoc } = require('firebase/firestore');
              const userDocRef = doc(db, 'users', userData.email);
              await updateDoc(userDocRef, { collections: updatedCollections });
            } catch (error) {
              Alert.alert('Error', 'Failed to delete collection');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleShareCollection = async (collection: CollectionType) => {
    try {
      const token = await encrypt(userData.email, collection.name);
      const shareLink = `https://loki-bc0bb.web.app/collection/${token}`;
      
      await Share.share({
        message: `Check out my collection "${collection.name}" on Loki! ${shareLink}`,
        url: shareLink,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share collection');
      console.error(error);
    }
  };

  const handleCollectionPress = (collection: CollectionType) => {
    setSelectedCollection(collection);
    navigation.navigate('CollectionDetail', { collection });
  };

  const renderCollectionCard = ({ item }: { item: CollectionType }) => (
    <TouchableOpacity onPress={() => handleCollectionPress(item)}>
      <Card style={styles.collectionCard}>
        <Card.Content style={styles.collectionContent}>
          <View style={[styles.collectionGradient, { backgroundColor: item.gradient }]}>
            <Text style={styles.collectionEmoji}>📚</Text>
            <Text style={styles.collectionCount}>{item.places.length}</Text>
          </View>
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.collectionType}>
              {item.type === 'personal' ? 'Personal' : 'Shared'}
            </Text>
          </View>
          <View style={styles.collectionActions}>
            <TouchableOpacity
              onPress={() => handleShareCollection(item)}
              style={styles.actionButton}
            >
              <Icon name="share-variant" size={20} color="#6366f1" />
            </TouchableOpacity>
            {item.type === 'personal' && (
              <TouchableOpacity
                onPress={() => handleDeleteCollection(item.id!)}
                style={styles.actionButton}
              >
                <Icon name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Collections</Text>
          <Text style={styles.subtitle}>
            {userData.collections.length} collection{userData.collections.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {userData.collections.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="book-open-variant" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No collections yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first collection to start saving places
            </Text>
          </View>
        ) : (
          <FlatList
            data={userData.collections}
            renderItem={renderCollectionCard}
            keyExtractor={(item) => item.id || item.name}
            scrollEnabled={false}
            contentContainerStyle={styles.collectionsList}
          />
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowCreateDialog(true)}
      />

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create Collection</Dialog.Title>
          <Dialog.Content>
            <TextInput
              placeholder="Collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              style={styles.input}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onPress={handleCreateCollection} loading={loading}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  collectionsList: {
    padding: 20,
  },
  collectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  collectionGradient: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectionEmoji: {
    fontSize: 24,
  },
  collectionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collectionType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  collectionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6366f1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
});