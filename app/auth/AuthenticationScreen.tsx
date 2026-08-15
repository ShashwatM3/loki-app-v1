import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthGradientFlow } from '../../components/ui/glows';
import FullPageLoader from '../../components/FullPageLoader';
import { useCounterStore } from '../../lib/store';
import authService from '../../services/authService';
import { toast } from '../../lib/toast';
import { colors, fonts, radius, tw } from '../../lib/theme';

type AuthRouteParams = { returnTo?: string; returnToParams?: object } | undefined;

/**
 * 1:1 port of app/Authentication/page.tsx (gradient flow header, centered
 * glass card). Sign-in itself is email/password — `signInWithPopup` does not
 * exist on React Native, so Google-only auth is replaced by the email flow the
 * Firebase project also supports.
 */
export default function AuthenticationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, AuthRouteParams>, string>>();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const userData = useCounterStore((state) => state.userData);
  const setUserData = useCounterStore((state) => state.setUserData);
  const isAuthLoading = useCounterStore((state) => state.isAuthLoading);
  const isRedirecting = useRef(false);

  const goReturnTo = (isNewUser: boolean) => {
    const returnTo = route.params?.returnTo;
    if (isNewUser) {
      navigation.replace('Onboarding');
      return;
    }
    if (returnTo) {
      navigation.replace(returnTo, route.params?.returnToParams);
    } else {
      navigation.replace('Dashboard', { screen: 'Browse' });
    }
  };

  // Only skip the auth form when the user already had a session before opening
  // this page (not right after sign-in — isRedirecting handles that path).
  useEffect(() => {
    if (isAuthLoading || isRedirecting.current) return;
    if (userData.email) {
      goReturnTo(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.email, isAuthLoading]);

  async function submit() {
    if (!email.trim() || !password) {
      toast.error('Enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      toast.error('Enter your name.');
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === 'signin'
          ? await authService.signInWithEmail(email, password)
          : await authService.signUpWithEmail(name, email, password);
      setUserData(result.userData);
      isRedirecting.current = true;
      goReturnTo(result.isNewUser);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (loading || isAuthLoading) {
    return <FullPageLoader />;
  }

  return (
    <View style={styles.root}>
      {/* Animated multi-color gradient flow along the top (collection-share style) */}
      <AuthGradientFlow />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <Pressable style={styles.logoInner} onPress={() => navigation.navigate('Landing')}>
              <Image
                source={require('../../assets/web/logo2.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
              <Text style={styles.logoText}>loki.</Text>
            </Pressable>
          </View>

          {/* Centered auth card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</Text>
              <Text style={styles.cardSubtitle}>
                {mode === 'signin'
                  ? 'Sign in to keep your spots and collections'
                  : 'Join Loki to save spots and plan with friends'}
              </Text>
            </View>

            <View style={{ gap: 16 }}>
              {mode === 'signup' ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
              ) : null}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="m@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder=""
                  secureTextEntry
                  autoCapitalize="none"
                  onSubmitEditing={submit}
                  returnKeyType="go"
                  style={styles.input}
                />
              </View>

              <Button onPress={submit} style={{ width: '100%' }}>
                {mode === 'signin' ? 'Login' : 'Create account'}
              </Button>

              {/* Separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>Or</Text>
                <View style={styles.separatorLine} />
              </View>

              <Text style={styles.footerText}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Text
                  style={styles.footerLink}
                  onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </Text>
              </Text>
              <Text style={styles.hintText}>
                One account for the app and lokidxb.com — your spots stay in sync
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoRow: {
    marginBottom: 32,
    marginTop: 24,
    alignItems: 'center',
  },
  logoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    height: 28,
    width: 28,
  },
  logoText: {
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.foreground,
    fontFamily: fonts.sansMedium,
  },
  card: {
    width: '100%',
    maxWidth: 384,
    alignSelf: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.066)', // border-border/60
    backgroundColor: 'rgba(9,10,12,0.8)', // bg-card/80
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
    gap: 24,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  input: {
    height: 36,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: colors.foreground,
    fontFamily: fonts.sansMedium,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
