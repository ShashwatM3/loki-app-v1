import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { Button, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCounterStore } from '../../lib/store';
import type { Place } from '../../lib/types';

export default function MapsScreen() {
  const places = useCounterStore((state) => state.places);
  const fetchPlaces = useCounterStore((state) => state.fetchPlaces);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchPlaces();
    getCurrentLocation();
  }, [fetchPlaces]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Map</Text>
        <Text style={styles.subtitle}>Discover places around you</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search places on map..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Map Placeholder - In real implementation, use react-native-maps */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          <Icon name="map-marker-radius" size={64} color="#6366f1" />
          <Text style={styles.mapText}>Explore Dubai</Text>
          <Text style={styles.mapSubtext}>
            {filteredPlaces.length} places to explore
          </Text>
          <Text style={styles.mapNote}>
            Tap a pin to preview a place
          </Text>
        </View>
        
        {/* Place markers overlay */}
        <View style={styles.markersOverlay}>
          {filteredPlaces.slice(0, 5).map((place, index) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.marker,
                {
                  left: `${20 + index * 15}%`,
                  top: `${30 + (index % 3) * 20}%`,
                }
              ]}
              onPress={() => setSelectedPlace(place)}
            >
              <Icon name="map-marker" size={32} color="#ef4444" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Place Modal */}
      <Modal
        visible={!!selectedPlace}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPlace(null)}
      >
        {selectedPlace && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPlace.image || 'https://via.placeholder.com/400' }}
                style={styles.modalImage}
              />
              <View style={styles.modalInfo}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedPlace(null)}>
                    <Icon name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalCategory}>{selectedPlace.category}</Text>
                
                {selectedPlace.description && (
                  <Text style={styles.modalDescription}>{selectedPlace.description}</Text>
                )}
                
                <View style={styles.modalMeta}>
                  {selectedPlace.rating > 0 && (
                    <View style={styles.modalRating}>
                      <Icon name="star" size={16} color="#fbbf24" />
                      <Text style={styles.modalRatingText}>{selectedPlace.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {selectedPlace.hours && (
                    <View style={styles.modalHours}>
                      <Icon name="clock" size={16} color="#6b7280" />
                      <Text style={styles.modalHoursText}>{selectedPlace.hours}</Text>
                    </View>
                  )}
                </View>

                {selectedPlace.website && (
                  <Button
                    mode="contained"
                    onPress={() => Linking.openURL(selectedPlace.website!)}
                    style={styles.websiteButton}
                    icon={() => <Icon name="web" size={18} color="#ffffff" />}
                  >
                    Visit Website
                  </Button>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Location Button */}
      {userLocation && (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Icon name="crosshairs-gps" size={24} color="#6366f1" />
        </TouchableOpacity>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  mapPlaceholder: {
    flex: 1,
    margin: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  mapNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  markersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    transform: [{ translateX: -16 }, { translateY: -32 }],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInfo: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  modalCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  modalRatingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  modalHours: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHoursText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  websiteButton: {
    backgroundColor: '#6366f1',
  },
  locationButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});