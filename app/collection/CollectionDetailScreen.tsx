import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Share,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useCounterStore } from '../../lib/store';
import { createCollectionShareLink } from '../../lib/crypto';
import type { Place } from '../../lib/types';

export default function CollectionDetailScreen({ route, navigation }: any) {
  const collectionName: string = route.params.collection.name;
  const userData = useCounterStore((state) => state.userData);
  const [sharing, setSharing] = useState(false);

  // Read the live collection from the store so saves/removals reflect immediately
  const collection =
    userData.collections.find((c) => c.name === collectionName) ?? route.params.collection;

  const handleShare = async () => {
    setSharing(true);
    try {
      const { link } = await createCollectionShareLink({
        email: userData.email,
        collection: collection.name,
        access: 'view',
      });
      await Share.share({ message: `Check out my "${collection.name}" collection on Loki! ${link}` });
    } catch (error) {
      Alert.alert('Error', 'Failed to create share link. Check your internet connection.');
      console.error(error);
    } finally {
      setSharing(false);
    }
  };

  const renderPlace = ({ item }: { item: Place }) => (
    <Card
      style={styles.placeCard}
      onPress={() => navigation.navigate('PlaceDetail', { place: item })}
    >
      {!!item.image && <Card.Cover source={{ uri: item.image }} style={styles.placeImage} />}
      <Card.Content style={styles.placeContent}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.placeCategory} numberOfLines={1}>
          {item.category}
        </Text>
        <View style={styles.placeMeta}>
          {item.rating > 0 && (
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color="#f59e0b" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          )}
          {!!item.budget && (
            <Chip mode="flat" compact style={styles.budgetChip} textStyle={styles.budgetText}>
              {item.budget}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{collection.name}</Text>
          <Text style={styles.subtitle}>
            {collection.places.length} place{collection.places.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleShare}
          loading={sharing}
          disabled={sharing || !userData.email}
          buttonColor="#6366f1"
          icon="share-variant"
          compact
        >
          Share
        </Button>
      </View>

      {collection.places.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="bookmark-off-outline" size={56} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No places saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse places and tap "Save to collection" to add them here
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.emptyLink}>Go back to browse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collection.places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => item.id || `${item.name}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  placeCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  placeImage: {
    height: 110,
  },
  placeContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  placeCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  rating: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 3,
  },
  budgetChip: {
    height: 24,
  },
  budgetText: {
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyLink: {
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 16,
  },
});
