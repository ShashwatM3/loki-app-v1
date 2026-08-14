import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import LoginScreen from '../app/auth/LoginScreen';
import BrowseScreen from '../app/main/BrowseScreen';
import MapsScreen from '../app/main/MapsScreen';
import CollectionsScreen from '../app/main/CollectionsScreen';
import ProfileScreen from '../app/main/ProfileScreen';
import AIChatbotScreen from '../app/main/AIChatbotScreen';

// Types
import { useCounterStore } from '../lib/store';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for navigation
const PlaceDetailScreen = ({ route }: any) => {
  const { place } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Place Detail: {place.name}</Text>
    </View>
  );
};

const CollectionDetailScreen = ({ route }: any) => {
  const { collection } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Collection Detail: {collection.name}</Text>
    </View>
  );
};

function MainTabs() {
  const userData = useCounterStore((state) => state.userData);

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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Maps"
        component={MapsScreen}
        options={{
          tabBarLabel: 'Maps',
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" size={size} color={color} />
          ),
        }}
      />
      {userData.email && (
        <>
          <Tab.Screen
            name="Collections"
            component={CollectionsScreen}
            options={{
              tabBarLabel: 'Collections',
              tabBarIcon: ({ color, size }) => (
                <Icon name="book-open" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Icon name="account" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const userData = useCounterStore((state) => state.userData);
  const isAuthLoading = useCounterStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    // You could return a loading screen here
    return null;
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
              options={{ headerShown: true, title: 'Ask Loki', headerLeft: () => null }}
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