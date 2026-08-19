import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  type LinkingOptions,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as ExpoLinking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MapPin, Library, User, type LucideIcon } from 'lucide-react-native';

// Screens
import LandingScreen from '../app/landing/LandingScreen';
import AuthenticationScreen from '../app/auth/AuthenticationScreen';
import BrowseScreen from '../app/main/BrowseScreen';
import MapsScreen from '../app/main/MapsScreen';
import CollectionsScreen from '../app/main/CollectionsScreen';
import ProfileScreen from '../app/main/ProfileScreen';
import OnboardingScreen from '../app/onboarding/OnboardingScreen';
import SharedCollectionScreen from '../app/collection/SharedCollectionScreen';
import PlansScreen from '../app/dashboard/PlansScreen';
import VibesScreen from '../app/dashboard/VibesScreen';
import AboutScreen from '../app/static/AboutScreen';
import HowItWorksScreen from '../app/static/HowItWorksScreen';
import AmbassadorsScreen from '../app/static/AmbassadorsScreen';
import CookiePolicyScreen from '../app/static/CookiePolicyScreen';
import PrivacyPolicyScreen from '../app/static/PrivacyPolicyScreen';
import TrialScreen from '../app/static/TrialScreen';
import MaintenanceScreen from '../app/static/MaintenanceScreen';
import WelcomeScreen from '../app/static/WelcomeScreen';

import { useCounterStore } from '../lib/store';
import { colors, radius, shadows } from '../lib/theme';

export type DashboardTabParamList = {
  Browse: { vibe?: string; budget?: string } | undefined;
  Maps: { place?: string } | undefined;
  Collections: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Landing: undefined;
  Authentication: { returnTo?: string; returnToParams?: object } | undefined;
  Dashboard: NavigatorScreenParams<DashboardTabParamList> | undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Vibes: undefined;
  Plans: undefined;
  About: undefined;
  HowItWorks: undefined;
  Ambassadors: undefined;
  CookiePolicy: undefined;
  PrivacyPolicy: undefined;
  Trial: undefined;
  Maintenance: undefined;
  SharedCollection: { token: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<DashboardTabParamList>();

const TAB_ICONS: Record<string, LucideIcon> = {
  Browse: Home,
  Maps: MapPin,
  Collections: Library,
  Profile: User,
};

/**
 * The floating pill navigation from the web dashboard layout (mobile variant):
 * fixed bottom-5, rounded-xl border bg-card/95 px-10 py-3 shadow-float, with
 * Home / MapPin / Library / User icons — Collections & Profile only when
 * signed in, exactly like the website.
 */
function FloatingPillTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const userData = useCounterStore((s) => s.userData);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabBarShell, { bottom: Math.max(20, insets.bottom) }]}
    >
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          if ((route.name === 'Collections' || route.name === 'Profile') && !userData.email) {
            return null;
          }
          const Icon = TAB_ICONS[route.name] ?? Home;
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabItem}
            >
              <Icon size={18} color={active ? colors.foreground : 'rgba(134,134,134,0.5)'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DashboardTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={(props) => <FloatingPillTabBar {...props} />}
    >
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Maps" component={MapsScreen} />
      <Tab.Screen name="Collections" component={CollectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const linking: LinkingOptions<RootStackParamList> = {
  // ExpoLinking.createURL('/') resolves to `loki://` in a standalone build and to
  // `exp://<host>/--/` inside Expo Go — without it deep links never match in Expo Go.
  prefixes: [ExpoLinking.createURL('/'), 'loki://', 'https://lokidxb.com'],
  config: {
    screens: {
      Landing: '',
      Authentication: 'Authentication',
      Onboarding: 'onboarding',
      Welcome: 'welcome',
      About: 'about',
      HowItWorks: 'how-it-works',
      Ambassadors: 'ambassadors',
      CookiePolicy: 'cookie-policy',
      PrivacyPolicy: 'privacy-policy',
      Trial: 'trial',
      Maintenance: 'maintenance',
      Plans: 'dashboard/plans',
      Vibes: 'dashboard/landing-variation/vibes',
      SharedCollection: 'collection/:token',
      Dashboard: {
        screens: {
          Browse: 'dashboard/browse',
          Maps: 'dashboard/maps',
          Collections: 'dashboard/collections',
          Profile: 'dashboard/profile',
        },
      },
    },
  },
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    text: colors.foreground,
    primary: colors.primary,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Authentication" component={AuthenticationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardTabs} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Vibes" component={VibesScreen} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
        <Stack.Screen name="Ambassadors" component={AmbassadorsScreen} />
        <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Trial" component={TrialScreen} />
        <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
        <Stack.Screen name="SharedCollection" component={SharedCollectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(9,10,12,0.95)', // bg-card/95
    paddingHorizontal: 40,
    paddingVertical: 12,
    ...shadows.float,
  },
  tabItem: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
