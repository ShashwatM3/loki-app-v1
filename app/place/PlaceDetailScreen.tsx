import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Button, Chip, Dialog, Portal, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCounterStore } from '../../lib/store';
import type { Place } from '../../lib/types';

export default function PlaceDetailScreen({ route }: any) {
  const place: Place = route.params.place;
  const userData = useCounterStore((state) => state.userData);
  const setUserData = useCounterStore((state) => state.setUserData);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const isInCollection = (collectionName: string) =>
    userData.collections
      .find((c) => c.name === collectionName)
      ?.places.some((p) => p.id === place.id || p.name === place.name) ?? false;

  const savedAnywhere = userData.collections.some((c) =>
    c.places.some((p) => p.id === place.id || p.name === place.name)
  );

  const toggleCollection = async (collectionName: string) => {
    if (!userData.email) return;
    setSaving(true);
    const previous = userData;
    try {
      const updatedCollections = userData.collections.map((c) => {
        if (c.name !== collectionName) return c;
        const already = c.places.some((p) => p.id === place.id || p.name === place.name);
        return {
          ...c,
          places: already
            ? c.places.filter((p) => !(p.id === place.id || p.name === place.name))
            : [...c.places, place],
        };
      });
      const updatedUserData = { ...userData, collections: updatedCollections };
      setUserData(updatedUserData);
      await updateDoc(doc(db, 'users', userData.email), { collections: updatedCollections });
    } catch (error) {
      setUserData(previous);
      Alert.alert('Error', 'Failed to update collection. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
  };

  const reviewCount =
    typeof place.reviews === 'number'
      ? place.reviews
      : Array.isArray(place.reviews)
        ? place.reviews.length
        : place.reviews;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!!place.image && <Image source={{ uri: place.image }} style={styles.image} />}

      <View style={styles.body}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.category}>{place.category}</Text>

        <View style={styles.metaRow}>
          {place.rating > 0 && (
            <View style={styles.metaItem}>
              <Icon name="star" size={18} color="#f59e0b" />
              <Text style={styles.metaText}>
                {place.rating}
                {reviewCount ? ` (${reviewCount})` : ''}
              </Text>
            </View>
          )}
          {!!place.budget && (
            <View style={styles.metaItem}>
              <Icon name="cash" size={18} color="#10b981" />
              <Text style={styles.metaText}>{place.budget}</Text>
            </View>
          )}
          {!!place.location && (
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={18} color="#6366f1" />
              <Text style={styles.metaText}>{place.location}</Text>
            </View>
          )}
        </View>

        {!!place.hours && (
          <View style={styles.hoursRow}>
            <Icon name="clock-outline" size={16} color="#6b7280" />
            <Text style={styles.hours}>{place.hours}</Text>
          </View>
        )}

        {!!place.description && <Text style={styles.description}>{place.description}</Text>}

        {place.tags.length > 0 && (
          <View style={styles.tags}>
            {place.tags.map((tag, i) => (
              <Chip key={i} compact mode="outlined" style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}

        <Button
          mode="contained"
          onPress={() => setShowSaveDialog(true)}
          buttonColor={savedAnywhere ? '#10b981' : '#6366f1'}
          style={styles.saveButton}
          icon={savedAnywhere ? 'bookmark-check' : 'bookmark-outline'}
        >
          {savedAnywhere ? 'Saved — manage collections' : 'Save to collection'}
        </Button>

        <View style={styles.linkRow}>
          {!!place.gmaps && (
            <Button
              mode="outlined"
              onPress={() => openLink(place.gmaps)}
              icon="google-maps"
              style={styles.linkButton}
              textColor="#6366f1"
            >
              Maps
            </Button>
          )}
          {!!place.website && (
            <Button
              mode="outlined"
              onPress={() => openLink(place.website)}
              icon="web"
              style={styles.linkButton}
              textColor="#6366f1"
            >
              Website
            </Button>
          )}
        </View>
      </View>

      <Portal>
        <Dialog visible={showSaveDialog} onDismiss={() => setShowSaveDialog(false)}>
          <Dialog.Title>Save to collection</Dialog.Title>
          <Dialog.Content>
            {userData.collections.length === 0 ? (
              <Text>Create a collection first from the Collections tab.</Text>
            ) : (
              userData.collections.map((c, i) => (
                <View key={c.name}>
                  {i > 0 && <Divider />}
                  <List.Item
                    title={c.name}
                    description={`${c.places.length} place${c.places.length !== 1 ? 's' : ''}`}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={isInCollection(c.name) ? 'check-circle' : 'circle-outline'}
                        color={isInCollection(c.name) ? '#10b981' : '#9ca3af'}
                      />
                    )}
                    onPress={() => toggleCollection(c.name)}
                    disabled={saving}
                  />
                </View>
              ))
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSaveDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#e5e7eb',
  },
  body: {
    padding: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hours: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6b7280',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  saveButton: {
    borderRadius: 10,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
  },
  linkButton: {
    marginRight: 12,
    borderColor: '#6366f1',
  },
});
