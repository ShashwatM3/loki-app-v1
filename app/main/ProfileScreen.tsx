import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCounterStore } from '../../lib/store';
import authService from '../../services/authService';

export default function ProfileScreen({ navigation }: any) {
  const userData = useCounterStore((state) => state.userData);
  const setUserData = useCounterStore((state) => state.setUserData);

  const totalSavedPlaces = userData.collections.reduce(
    (sum, collection) => sum + collection.places.length,
    0
  );

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUserData({ name: '', email: '', photo: '', collections: [] });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {userData.photo ? (
            <Image source={{ uri: userData.photo }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={80}
              label={getInitials(userData.name || 'User')}
              style={styles.avatar}
            />
          )}
        </View>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Icon name="map-marker" size={32} color="#6366f1" />
            <Text style={styles.statNumber}>{totalSavedPlaces}</Text>
            <Text style={styles.statLabel}>Places Saved</Text>
          </View>
          <Divider style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="book" size={32} color="#6366f1" />
            <Text style={styles.statNumber}>{userData.collections.length}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <List.Item
            title="Help & Support"
            description="Get help with the app"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() => console.log('Help pressed')}
          />
          <Divider />
          <List.Item
            title="Suggest a Venue"
            description="Add a new place to Loki"
            left={(props) => <List.Icon {...props} icon="plus-circle" />}
            onPress={() => console.log('Suggest venue pressed')}
          />
        </Card>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <Card>
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => console.log('Terms pressed')}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => console.log('Privacy pressed')}
          />
        </Card>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>

      {/* Version Info */}
      <View style={styles.footer}>
        <Text style={styles.version}>Loki App v1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Loki</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsCard: {
    margin: 20,
    marginTop: 20,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});