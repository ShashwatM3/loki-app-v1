import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCounterStore } from '../../lib/store';
import { getFirstName, getTimeGreeting } from '../../lib/utils';
import type { Place } from '../../lib/types';

export default function BrowseScreen() {
  const places = useCounterStore((state) => state.places);
  const userData = useCounterStore((state) => state.userData);
  const fetchPlaces = useCounterStore((state) => state.fetchPlaces);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    let filtered = places;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query) ||
        place.location?.toLowerCase().includes(query) ||
        place.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    setFilteredPlaces(filtered);
  }, [places, searchQuery, selectedCategory]);

  const categories = Array.from(new Set(places.map(p => p.category)));

  const renderPlaceCard = ({ item }: { item: Place }) => (
    <TouchableOpacity style={styles.placeCard}>
      <Image source={{ uri: item.image || 'https://via.placeholder.com/300' }} style={styles.placeImage} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeCategory}>{item.category}</Text>
        <Text style={styles.placeName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.placeDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.placeMeta}>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          {item.popup && (
            <Chip mode="flat" compact style={styles.popupChip}>Popup</Chip>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getTimeGreeting()}, {getFirstName(userData.name) || 'Welcome'}
          </Text>
          <Text style={styles.subtitle}>What are you looking for today?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search places..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Places Grid */}
        <View style={styles.placesContainer}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Explore Places'} ({filteredPlaces.length})
          </Text>
          {filteredPlaces.length > 0 ? (
            <FlatList
              data={filteredPlaces}
              renderItem={renderPlaceCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.placesRow}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="map-search" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No places found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  greeting: {
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
  categoriesContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  placesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  placesRow: {
    justifyContent: 'space-between',
  },
  placeCard: {
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
  placeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  placeInfo: {
    padding: 12,
  },
  placeCategory: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  popupChip: {
    height: 20,
    backgroundColor: '#ec4899',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});