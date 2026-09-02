import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { Avatar } from '../../components/ui/Avatar';
import { ProfileGlow } from '../../components/ui/glows';
import { BookingReminders } from '../../components/profile/BookingReminders';
import { useCounterStore } from '../../lib/store';
import authService from '../../services/authService';
import { toast } from '../../lib/toast';
import { colors, fonts, radius, tw } from '../../lib/theme';

function FadeUp({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 550,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function ListGroup({
  label,
  items,
  index,
}: {
  label: string;
  items: { label: string; subtitle?: string; onPress: () => void }[];
  index: number;
}) {
  return (
    <FadeUp index={index}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.group}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.groupRow,
              i !== 0 && styles.groupRowBorder,
              pressed && { backgroundColor: 'rgba(255,255,255,0.04)' },
            ]}
          >
            <View style={{ minWidth: 0, flex: 1 }}>
              <Text style={styles.groupRowLabel}>{item.label}</Text>
              {item.subtitle ? <Text style={styles.groupRowSubtitle}>{item.subtitle}</Text> : null}
            </View>
            <ChevronRight size={14} color="rgba(134,134,134,0.35)" />
          </Pressable>
        ))}
      </View>
    </FadeUp>
  );
}

/** 1:1 port of app/dashboard/profile/page.tsx: ProfileGlow hero, BookingReminders
 * Calendar pane, Account + Legal groups (legal rows are no-ops on the web too),
 * and the Sign out button. */
export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const userData = useCounterStore((state) => state.userData);
  const isAuthLoading = useCounterStore((state) => state.isAuthLoading);
  const setUserData = useCounterStore((state) => state.setUserData);
  const refreshUserData = useCounterStore((state) => state.refreshUserData);

  // Guest access is not allowed on profile (web redirects to /Authentication).
  useEffect(() => {
    if (isFocused && !isAuthLoading && !userData.email) {
      navigation.navigate('Authentication');
    }
  }, [isFocused, isAuthLoading, userData.email, navigation]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUserData({ name: '', email: '', photo: '', collections: [] });
      navigation.navigate('Authentication');
      toast.success('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const initials = useMemo(
    () =>
      userData.name
        ? userData.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?',
    [userData.name]
  );

  return (
    <View style={styles.root}>
      <ProfileGlow />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 56 }]}>
          <FadeUp index={0}>
            <View style={styles.avatarGlow}>
              <Avatar
                size={72}
                uri={userData.photo}
                fallback={initials}
                fallbackColor={tw.violet500}
                fallbackTextStyle={{ fontSize: 18, fontFamily: fonts.sansBold }}
                style={styles.avatarRing}
              />
            </View>
          </FadeUp>

          <FadeUp index={1}>
            <Text style={styles.name}>{userData.name || 'Explorer'}</Text>
          </FadeUp>

          <FadeUp index={2}>
            <Text style={styles.email}>{userData.email}</Text>
          </FadeUp>
        </View>

        {/* Menu groups */}
        <View style={styles.groups}>
          <FadeUp index={3}>
            <BookingReminders
              userEmail={userData.email}
              collections={userData.collections || []}
              bookings={userData.bookings || []}
              onChange={() => refreshUserData(userData.email)}
            />
          </FadeUp>

          <ListGroup
            label="Account"
            index={4}
            items={[
              { label: 'Help & Support', subtitle: "Questions? We're here.", onPress: () => {} },
              { label: 'Suggest a Venue', subtitle: 'Know a hidden gem?', onPress: () => {} },
            ]}
          />

          {/* The web's legal rows are no-ops (onClick: () => {}); the pages stay
              reachable from the landing footer, exactly like the website. */}
          <ListGroup
            label="Legal"
            index={5}
            items={[
              { label: 'Terms & Conditions', onPress: () => {} },
              { label: 'Privacy Policy', onPress: () => {} },
            ]}
          />

          {/* Sign out */}
          <FadeUp index={6}>
            <View style={styles.signOutWrap}>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.signOutBtn,
                  pressed && { backgroundColor: 'rgba(251,44,54,0.06)' },
                ]}
              >
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            </View>
          </FadeUp>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  avatarGlow: {
    marginBottom: 20,
    shadowColor: 'rgba(168,124,254,1)',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(166,132,255,0.3)',
  },
  name: {
    fontSize: 22,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.55,
    color: colors.foreground,
    textAlign: 'center',
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(134,134,134,0.7)',
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
  groups: {
    zIndex: 10,
    width: '100%',
    maxWidth: 384,
    alignSelf: 'center',
    gap: 28,
    paddingHorizontal: 20,
  },
  groupLabel: {
    marginBottom: 10,
    paddingHorizontal: 4,
    fontSize: 16,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: 'rgba(134,134,134,0.6)',
  },
  group: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  groupRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  groupRowLabel: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: 'rgba(232,232,232,0.9)',
  },
  groupRowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(134,134,134,0.6)',
    fontFamily: fonts.sans,
  },
  signOutWrap: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 4,
  },
  signOutBtn: {
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 14,
    color: 'rgba(255,100,103,0.6)', // red-400/60
    fontFamily: fonts.sans,
  },
});
