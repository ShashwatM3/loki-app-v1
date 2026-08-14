import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Screens
import LoginScreen from '../app/auth/LoginScreen';
import BrowseScreen from '../app/main/BrowseScreen';
import MapsScreen from '../app/main/MapsScreen';
import CollectionsScreen from '../app/main/CollectionsScreen';
import ProfileScreen from '../app/main/ProfileScreen';
import AIChatbotScreen from '../app/main/AIChatbotScreen';
import PlaceDetailScreen from '../app/place/PlaceDetailScreen';
import CollectionDetailScreen from '../app/collection/CollectionDetailScreen';

import { useCounterStore } from '../lib/store';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color, size }) => <Icon name="compass" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Maps"
        component={MapsScreen}
        options={{
          tabBarLabel: 'Maps',
          tabBarIcon: ({ color, size }) => <Icon name="map" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="account" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const userData = useCounterStore((state) => state.userData);
  const isAuthLoading = useCounterStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userData.email ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="AIChatbot"
              component={AIChatbotScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PlaceDetail"
              component={PlaceDetailScreen}
              options={{ headerShown: true, title: 'Place Details' }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{ headerShown: true, title: 'Collection' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
