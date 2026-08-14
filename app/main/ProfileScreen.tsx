import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCounterStore } from '../../lib/store';
import authService from '../../services/authService';

export default function ProfileScreen() {
  const userData = useCounterStore((state) => state.userData);
  const setUserData = useCounterStore((state) => state.setUserData);
  const setAuthLoading = useCounterStore((state) => state.setAuthLoading);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              setUserData({
                name: '',
                email: '',
                photo: '',
                collections: []
              });
              setAuthLoading(false);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const totalPlaces = userData.collections.reduce(
    (sum, collection) => sum + collection.places.length,
    0
  );

  const sharedCollections = userData.collections.filter(c => c.type === 'shared');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          
          {userData.admin && (
            <View style={styles.adminBadge}>
              <Icon name="shield-account" size={14} color="#6366f1" />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.collections.length}</Text>
                <Text style={styles.statLabel}>Collections</Text>
              </View>
              <Divider style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalPlaces}</Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>
              <Divider style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sharedCollections.length}</Text>
                <Text style={styles.statLabel}>Shared</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <List.Item
            title="Edit Profile"
            description="Update your profile information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Edit profile')}
          />
          
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Notifications')}
          />
          
          <List.Item
            title="Privacy"
            description="Privacy and security settings"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Privacy')}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <List.Item
            title="Help Center"
            description="Get help and support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Help center')}
          />
          
          <List.Item
            title="About Loki"
            description="App information and version"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('About')}
          />
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            icon="logout"
            style={styles.signOutButton}
            contentStyle={styles.signOutButtonContent}
          >
            Sign Out
          </Button>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Loki App v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with React Native & Expo</Text>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#6366f1',
  },
  avatarLabel: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  adminText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  signOutContainer: {
    padding: 16,
  },
  signOutButton: {
    borderColor: '#ef4444',
  },
  signOutButtonContent: {
    paddingVertical: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  versionSubtext: {
    fontSize: 10,
    color: '#d1d5db',
    marginTop: 4,
  },
});