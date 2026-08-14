import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Searchbar, Card, Chip, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCounterStore } from '../../lib/store';
import { BROWSE_VIBES, getBrowseVibeById, placeMatchesBrowseVibe } from '../../lib/browseVibes';
import { EXPLORE_GROUPS } from '../../lib/categories';
import type { Place } from '../../lib/types';

const { width } = Dimensions.get('window');

export default function BrowseScreen({ navigation }: any) {
  const places = useCounterStore((state) => state.places);
  const userData = useCounterStore((state) => state.userData);
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = places.filter((place) => {
        return (
          place.name.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query) ||
          place.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (place.description && place.description.toLowerCase().includes(query)) ||
          (place.location && place.location.toLowerCase().includes(query))
        );
      });
      setFilteredPlaces(filtered);
    } else if (selectedVibe) {
      const vibe = getBrowseVibeById(selectedVibe);
      if (vibe) {
        const filtered = places.filter((place) => placeMatchesBrowseVibe(place, vibe));
        setFilteredPlaces(filtered);
      }
    } else {
      setFilteredPlaces(places);
    }
  }, [searchQuery, selectedVibe, places]);

  const handleVibePress = (vibeId: string) => {
    setSelectedVibe(vibeId === selectedVibe ? null : vibeId);
  };

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetail', { place });
  };

  const handleAskLoki = () => {
    navigation.navigate('AIChatbot');
  };

  const renderVibeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vibeCard}
      onPress={() => handleVibePress(item.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.bannerImage }} style={styles.vibeBanner} />
      <View style={styles.vibeOverlay}>
        <Text style={styles.vibeEmoji}>{item.emoji}</Text>
        <Text style={styles.vibeLabel}>{item.label}</Text>
        {item.blurb && <Text style={styles.vibeBlurb}>{item.blurb}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderPlaceCard = ({ item }: { item: Place }) => (
    <Card style={styles.placeCard} onPress={() => handlePlacePress(item)}>
      <Card.Cover source={{ uri: item.image }} style={styles.placeImage} />
      <Card.Content style={styles.placeContent}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.placeCategory} numberOfLines={1}>
          {item.category}
        </Text>
        <View style={styles.placeMeta}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFA500" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          {item.budget && (
            <Chip mode="flat" compact style={styles.budgetChip}>
              {item.budget}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderExploreGroup = ({ item }: { item: any }) => (
    <View style={styles.exploreGroup}>
      <Text style={styles.exploreGroupLabel}>
        {item.emoji} {item.label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.subfilterContainer}>
          {item.subfilters.map((subfilter: any, index: number) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.subfilterChip}
              onPress={() => {
                setSearchQuery(subfilter.keywords[0]);
                setSearchExpanded(true);
              }}
            >
              {subfilter.emoji} {subfilter.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, {userData.name?.split(' ')[0] || 'there'}!</Text>
          <Text style={styles.subtitle}>What are you in the mood for?</Text>
        </View>

        {/* Ask Loki AI Chatbot */}
        <TouchableOpacity style={styles.askLokiButton} onPress={handleAskLoki}>
          <View style={styles.askLokiContent}>
            <Icon name="robot" size={24} color="#6366f1" />
            <View style={styles.askLokiText}>
              <Text style={styles.askLokiTitle}>Ask Loki</Text>
              <Text style={styles.askLokiSubtitle}>Get personalized recommendations</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {searchExpanded ? (
            <Searchbar
              placeholder="Search places, categories, vibes..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              autoFocus
              onIconPress={() => {
                setSearchExpanded(false);
                setSearchQuery('');
              }}
            />
          ) : (
            <TouchableOpacity
              style={styles.searchCollapsed}
              onPress={() => setSearchExpanded(true)}
            >
              <Icon name="magnify" size={24} color="#9ca3af" />
              <Text style={styles.searchPlaceholder}>Search places...</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Curated Vibes */}
        {!searchQuery && !selectedVibe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Curated for you</Text>
            <FlatList
              data={BROWSE_VIBES}
              renderItem={renderVibeCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vibeList}
            />
          </View>
        )}

        {/* Explore Section */}
        {!searchQuery && !selectedVibe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <FlatList
              data={EXPLORE_GROUPS}
              renderItem={renderExploreGroup}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Selected Vibe Header */}
        {selectedVibe && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setSelectedVibe(null)}>
              <Text style={styles.backButton}>
                <Icon name="arrow-left" size={16} /> Back to all vibes
              </Text>
            </TouchableOpacity>
            <VibeHeader vibeId={selectedVibe} />
          </View>
        )}

        {/* Places Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedVibe ? 'Places' : searchQuery ? 'Search Results' : 'All Places'}
            {' '}
            ({filteredPlaces.length})
          </Text>
          {filteredPlaces.length > 0 ? (
            <FlatList
              data={filteredPlaces}
              renderItem={renderPlaceCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.placeRow}
              contentContainerStyle={styles.placesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="map-marker-off" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No places found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>

        {/* Quick Access */}
        {!searchQuery && !selectedVibe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('Maps')}
              >
                <Icon name="map" size={24} color="#6366f1" />
                <Text style={styles.quickAccessLabel}>Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => navigation.navigate('Collections')}
              >
                <Icon name="book" size={24} color="#6366f1" />
                <Text style={styles.quickAccessLabel}>Collections</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function VibeHeader({ vibeId }: { vibeId: string }) {
  const vibe = getBrowseVibeById(vibeId);
  if (!vibe) return null;

  return (
    <View style={styles.vibeHeader}>
      <Text style={styles.vibeHeaderEmoji}>{vibe.emoji}</Text>
      <View>
        <Text style={styles.vibeHeaderLabel}>{vibe.label}</Text>
        {vibe.blurb && <Text style={styles.vibeHeaderBlurb}>{vibe.blurb}</Text>}
      </View>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  askLokiButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  askLokiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  askLokiText: {
    flex: 1,
    marginLeft: 12,
  },
  askLokiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  askLokiSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f3f4f6',
  },
  searchCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 12,
    color: '#9ca3af',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  vibeList: {
    paddingHorizontal: 20,
  },
  vibeCard: {
    width: 200,
    height: 280,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  vibeBanner: {
    width: '100%',
    height: '100%',
  },
  vibeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  vibeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  vibeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  vibeBlurb: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  exploreGroup: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  exploreGroupLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subfilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subfilterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  backButton: {
    color: '#6366f1',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  vibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  vibeHeaderEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  vibeHeaderLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  vibeHeaderBlurb: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  placesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  placeRow: {
    justifyContent: 'space-between',
  },
  placeCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    elevation: 2,
  },
  placeImage: {
    height: 120,
  },
  placeContent: {
    padding: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeCategory: {
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
  rating: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  budgetChip: {
    height: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  quickAccessButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: (width - 60) / 2,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
});