import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Check, ChevronLeft } from 'lucide-react-native';
import { OnboardingGlow } from '../../components/ui/glows';
import FullPageLoader from '../../components/FullPageLoader';
import { useCounterStore } from '../../lib/store';
import { colors, fonts, radius, tw } from '../../lib/theme';

const SPOT_THEME_CHIPS: { id: string; emoji: string; label: string }[] = [
  { id: 'music', emoji: '🎵', label: 'Music & DJs' },
  { id: 'nightlife', emoji: '🌃', label: 'Nightlife' },
  { id: 'active', emoji: '🏋️', label: 'Active & sports' },
  { id: 'creative', emoji: '🎨', label: 'Creative & art' },
  { id: 'beaches', emoji: '🏖️', label: 'Beaches & pools' },
  { id: 'games', emoji: '🎲', label: 'Games & arcades' },
  { id: 'culture', emoji: '🌍', label: 'Culture & heritage' },
  { id: 'wellness', emoji: '🧘', label: 'Wellness & spa' },
  { id: 'rooftops', emoji: '🌇', label: 'Rooftops & views' },
  { id: 'markets', emoji: '🛍️', label: 'Markets & pop-ups' },
  { id: 'desert', emoji: '🏜️', label: 'Desert & nature' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family-friendly' },
  { id: 'shows', emoji: '🎭', label: 'Shows & comedy' },
  { id: 'cowork', emoji: '💻', label: 'Work-friendly' },
];

/**
 * Flow order:
 * 1 Dubai → 2 Friends → 3 Interests → 4 Distance & budget → 5 Spots → 6 Building → 7 Ready
 */
const STEP_INTRO_DUBAI = 0;
const STEP_INTRO_FRIENDS = 1;
const STEP_INTRO_INTERESTS = 2;
const STEP_QUIZ_DISTANCE_BUDGET = 3;
const STEP_QUIZ_SPOTS = 4;
const STEP_BUILDING = 5;
const STEP_READY = 6;

const QUIZ_FIRST = STEP_QUIZ_DISTANCE_BUDGET;
const QUIZ_LAST = STEP_QUIZ_SPOTS;

const STORAGE_KEY = 'loki_onboarding_profile_v1';

function budgetToMapLevel(
  budget: 'free' | 'under100' | 'under300' | 'infinite' | null
): 'All' | 'Low' | 'Moderate' | 'High' {
  if (!budget) return 'All';
  if (budget === 'free') return 'Low';
  if (budget === 'under100') return 'Low';
  if (budget === 'under300') return 'Moderate';
  return 'All';
}

/** Brand logomark "loki." — lowercase by brand, with a subtle violet accent dot. */
function Logo() {
  return (
    <Text style={styles.logo}>
      loki<Text style={{ color: tw.violet400 }}>.</Text>
    </Text>
  );
}

/** Full-width primary CTA. */
function PrimaryButton({
  children,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && !disabled && { backgroundColor: 'rgba(232,232,232,0.9)' },
        disabled && { opacity: 0.3 },
      ]}
    >
      <Text style={styles.primaryBtnText}>{children}</Text>
    </Pressable>
  );
}

/** Single-select / multi-select list row, Uber-style. */
function OptionRow({
  emoji,
  label,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionRow, selected ? styles.optionRowSelected : null]}
    >
      <View style={styles.optionEmoji}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={[styles.optionCheck, selected ? styles.optionCheckSelected : null]}>
        {selected ? <Check size={12} color={colors.background} strokeWidth={3.5} /> : null}
      </View>
    </Pressable>
  );
}

const INTEREST_CARDS: {
  label: string;
  image: string;
  position: { top: string; left?: string; right?: string; rotate: string };
}[] = [
  {
    label: 'Padel',
    image:
      'https://isddubai.com/wp-content/uploads/2017/03/A-young-man-playing-padel-in-one-of-ISD-Padels-indoor-padel-courts-in-dubai-sports-city-2.jpg',
    position: { top: '5%', left: '4%', rotate: '-6deg' },
  },
  {
    label: 'Techno',
    image: 'https://www.timeoutdubai.com/cloud/timeoutdubai/2021/09/13/9MX78Mll-Drais-Dubai.jpg',
    position: { top: '2%', left: '52%', rotate: '7deg' },
  },
  {
    label: 'Chai',
    image: 'https://www.timeoutdubai.com/cloud/timeoutdubai/2022/05/23/Kava-Chai-1024x768.jpg',
    position: { top: '36%', left: '0%', rotate: '4deg' },
  },
  {
    label: 'Art',
    image:
      'https://images.unsplash.com/photo-1723136190080-39440f8aa230?q=80&w=928&auto=format&fit=crop',
    position: { top: '33%', right: '2%', rotate: '-5deg' },
  },
  {
    label: 'Brunch',
    image:
      'https://images.unsplash.com/photo-1580769285245-c5e80eb5048f?q=80&w=1035&auto=format&fit=crop',
    position: { top: '63%', left: '8%', rotate: '-4deg' },
  },
  {
    label: 'Live music',
    image: 'https://themystickeys.com/wp-content/uploads/2024/01/Screenshot-2024-01-18-163018.png',
    position: { top: '60%', right: '6%', rotate: '8deg' },
  },
];

/** Draggable polaroid-style interest card (port of ui/draggable-card.tsx usage). */
function DraggableInterestCard({
  label,
  image,
  position,
}: (typeof INTEREST_CARDS)[number]) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          tx.value += e.changeX;
          ty.value += e.changeY;
        }),
    [tx, ty]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.interestCard,
          {
            top: position.top as `${number}%`,
            ...(position.left ? { left: position.left as `${number}%` } : null),
            ...(position.right ? { right: position.right as `${number}%` } : null),
            transform: [{ rotate: position.rotate }],
          },
          animStyle,
        ]}
      >
        <Image source={{ uri: image }} style={styles.interestCardImage} contentFit="cover" />
        <Text style={styles.interestCardLabel}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

/** 1:1 port of app/dashboard/onboarding/flow/onboarding-flow.tsx (+ auth gate from app/onboarding/page.tsx). */
export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const userData = useCounterStore((state) => state.userData);
  const isAuthLoading = useCounterStore((state) => state.isAuthLoading);

  const [step, setStep] = useState(STEP_INTRO_DUBAI);

  const [spots, setSpots] = useState<string[]>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [budget, setBudget] = useState<'free' | 'under100' | 'under300' | 'infinite' | null>(null);

  const [buildProgress, setBuildProgress] = useState(0);
  const stepAnim = React.useRef(new RNAnimated.Value(1)).current;

  // Auth gate — /onboarding redirects signed-out users to /Authentication.
  useEffect(() => {
    if (isFocused && !isAuthLoading && !userData.email) {
      navigation.replace('Authentication', { returnTo: 'Onboarding' });
    }
  }, [isFocused, isAuthLoading, userData.email, navigation]);

  const quizProgress = useMemo(() => {
    if (step < QUIZ_FIRST || step > QUIZ_LAST) return 0;
    return ((step - QUIZ_FIRST + 1) / (QUIZ_LAST - QUIZ_FIRST + 1)) * 100;
  }, [step]);

  // Step-change slide/fade (framer-motion x/opacity port).
  useEffect(() => {
    stepAnim.setValue(0);
    RNAnimated.timing(stepAnim, {
      toValue: 1,
      duration: step === STEP_BUILDING ? 150 : 260,
      useNativeDriver: true,
    }).start();
  }, [step, stepAnim]);

  const goBrowse = useCallback(() => {
    const budgetLevel = budgetToMapLevel(budget);
    const profile = { spots, distance, budget, completedAt: Date.now() };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
    navigation.navigate('Dashboard', {
      screen: 'Browse',
      params: budgetLevel !== 'All' ? { budget: budgetLevel } : undefined,
    });
  }, [spots, distance, budget, navigation]);

  const resetQuizOnly = useCallback(() => {
    setSpots([]);
    setDistance(null);
    setBudget(null);
    setStep(QUIZ_FIRST);
  }, []);

  const skip = useCallback(() => {
    if (step <= STEP_INTRO_INTERESTS) {
      setStep(QUIZ_FIRST);
      return;
    }
    if (step >= QUIZ_FIRST && step <= QUIZ_LAST) {
      setStep(STEP_READY);
    }
  }, [step]);

  useEffect(() => {
    if (step !== STEP_BUILDING) return;
    setBuildProgress(0);
    const started = Date.now();
    const duration = 2400;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - started) / duration);
      setBuildProgress(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setStep((s) => (s === STEP_BUILDING ? STEP_READY : s));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const canNextDistanceBudget = Boolean(distance && budget);
  const canNextSpots = spots.length >= 1 && spots.length <= 5;

  const goBack = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const canGoBack = step > 0 && step !== STEP_BUILDING;

  const advance = useCallback(() => setStep((s) => s + 1), []);

  const toggleSpot = (id: string) => {
    setSpots((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  if (isAuthLoading || !userData.email) {
    return <FullPageLoader />;
  }

  const header = (opts: { showSkip?: boolean; showProgress?: boolean }) => (
    <View style={{ marginBottom: 28 }}>
      <View style={styles.headerRow}>
        {canGoBack ? (
          <Pressable onPress={goBack} style={styles.headerBack} accessibilityLabel="Go back">
            <ChevronLeft size={20} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
        <Logo />
        <View style={{ marginLeft: 'auto' }}>
          {opts.showSkip ? (
            <Pressable onPress={skip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {opts.showProgress ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${quizProgress}%` }]} />
        </View>
      ) : null}
    </View>
  );

  const stepStyle = {
    opacity: stepAnim,
    transform: [
      {
        translateX: stepAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [step === STEP_BUILDING ? 0 : 22, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.root}>
      <OnboardingGlow />
      <ScrollView
        style={{ flex: 1, zIndex: 10 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          maxWidth: 448,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <RNAnimated.View style={[{ flex: 1 }, stepStyle]}>
          {/* 1) Find things to do in Dubai */}
          {step === STEP_INTRO_DUBAI ? (
            <View style={{ flex: 1 }}>
              {header({})}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.heroTitle}>Find things to do in Dubai</Text>
                <Text style={styles.heroSubtitle}>
                  From hidden chai spots to the craziest desert raves — we map it all.
                </Text>
              </View>
              <View style={{ marginTop: 'auto', paddingTop: 32 }}>
                <PrimaryButton onPress={advance}>Continue</PrimaryButton>
              </View>
            </View>
          ) : null}

          {/* 2) Plan with friends */}
          {step === STEP_INTRO_FRIENDS ? (
            <View style={{ flex: 1 }}>
              {header({})}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.heroTitle}>Plan with friends, see what's popping</Text>
                <Text style={styles.heroSubtitle}>
                  No more dead group chats. See where friends are going and the spots blowing up on
                  TikTok.
                </Text>
              </View>
              <View style={{ marginTop: 'auto', paddingTop: 32 }}>
                <PrimaryButton onPress={advance}>Continue</PrimaryButton>
              </View>
            </View>
          ) : null}

          {/* 3) Filter by your interests */}
          {step === STEP_INTRO_INTERESTS ? (
            <View style={{ flex: 1 }}>
              {header({})}
              <View>
                <Text style={styles.interestsTitle}>Filter by your interests</Text>
                <Text style={styles.interestsSubtitle}>
                  Tell us what you love and we'll show you exactly where to find it.
                </Text>
              </View>
              <View style={styles.interestsStage}>
                {INTEREST_CARDS.map((card) => (
                  <DraggableInterestCard key={card.label} {...card} />
                ))}
              </View>
              <View style={{ zIndex: 10, marginTop: 'auto', paddingTop: 24 }}>
                <PrimaryButton onPress={() => setStep(STEP_QUIZ_DISTANCE_BUDGET)}>
                  Personalize
                </PrimaryButton>
              </View>
            </View>
          ) : null}

          {/* 4) Distance & budget */}
          {step === STEP_QUIZ_DISTANCE_BUDGET ? (
            <View style={{ flex: 1 }}>
              {header({ showSkip: true, showProgress: true })}
              <Text style={styles.quizTitle}>Distance & budget</Text>
              <Text style={styles.quizSubtitle}>A couple of quick preferences.</Text>

              <Text style={styles.quizSectionLabel}>How far will you go?</Text>
              <View style={{ marginTop: 12, gap: 10 }}>
                {[
                  { id: 'walk', emoji: '🚶', label: 'Walking distance' },
                  { id: 'short', emoji: '🚗', label: 'Short drive' },
                  { id: 'anywhere', emoji: '🛣️', label: 'Anywhere (30m+)' },
                  { id: 'depends', emoji: '🤷', label: 'Depends' },
                ].map((o) => (
                  <OptionRow
                    key={o.id}
                    emoji={o.emoji}
                    label={o.label}
                    selected={distance === o.id}
                    onPress={() => setDistance(o.id)}
                  />
                ))}
              </View>

              <Text style={styles.quizSectionLabel}>What's your budget?</Text>
              <View style={{ marginTop: 12, gap: 10 }}>
                {(
                  [
                    { id: 'free' as const, emoji: '🌚', label: 'Free / cheap' },
                    { id: 'under100' as const, emoji: '💸', label: 'Under 100 AED' },
                    { id: 'under300' as const, emoji: '💳', label: 'Up to 300 AED' },
                    { id: 'infinite' as const, emoji: '🤑', label: "Money's no object" },
                  ]
                ).map((o) => (
                  <OptionRow
                    key={o.id}
                    emoji={o.emoji}
                    label={o.label}
                    selected={budget === o.id}
                    onPress={() => setBudget(o.id)}
                  />
                ))}
              </View>

              <View style={{ marginTop: 36 }}>
                <PrimaryButton onPress={advance} disabled={!canNextDistanceBudget}>
                  Continue
                </PrimaryButton>
              </View>
            </View>
          ) : null}

          {/* 5) Spots */}
          {step === STEP_QUIZ_SPOTS ? (
            <View style={{ flex: 1 }}>
              {header({ showSkip: true, showProgress: true })}
              <Text style={styles.quizTitle}>What kind of spots do you like?</Text>
              <Text style={styles.quizSubtitle}>Pick up to 5 · {spots.length} selected</Text>
              <View style={styles.chipsWrap}>
                {SPOT_THEME_CHIPS.map((chip) => {
                  const selected = spots.includes(chip.id);
                  return (
                    <Pressable
                      key={chip.id}
                      onPress={() => toggleSpot(chip.id)}
                      style={[styles.chip, selected ? styles.chipSelected : null]}
                    >
                      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                        <Text>{chip.emoji}</Text>
                        {'  '}
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ marginTop: 36 }}>
                <PrimaryButton onPress={advance} disabled={!canNextSpots}>
                  Continue
                </PrimaryButton>
              </View>
            </View>
          ) : null}

          {/* 6) Building */}
          {step === STEP_BUILDING ? (
            <View style={styles.buildingWrap}>
              <Logo />
              <Spinner />
              <Text style={styles.buildingTitle}>Building your map</Text>
              <Text style={styles.buildingSubtitle}>Finding the best spots for you…</Text>
              <View style={styles.buildProgressTrack}>
                <View style={[styles.buildProgressFill, { width: `${buildProgress}%` }]} />
              </View>
            </View>
          ) : null}

          {/* 7) Ready */}
          {step === STEP_READY ? (
            <View style={{ flex: 1 }}>
              {header({})}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.heroTitle}>You're all set</Text>
                <Text style={styles.heroSubtitle}>
                  Your personalized map of Dubai is ready. Save spots and plan with friends.
                </Text>
              </View>
              <View style={{ marginTop: 'auto', gap: 12, paddingTop: 32 }}>
                <PrimaryButton onPress={goBrowse}>Start exploring</PrimaryButton>
                <Pressable onPress={resetQuizOnly}>
                  <Text style={styles.resetText}>Go back to the quiz</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </RNAnimated.View>
      </ScrollView>
    </View>
  );
}

function Spinner() {
  const spin = React.useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <RNAnimated.View style={[styles.spinner, { transform: [{ rotate }] }]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 20,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBack: {
    marginLeft: -6,
    padding: 6,
    borderRadius: radius.lg,
  },
  skipText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tw.violet400,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 26,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  heroSubtitle: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 29,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  interestsTitle: {
    fontSize: 44,
    lineHeight: 45,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -1.1,
    color: colors.foreground,
  },
  interestsSubtitle: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  interestsStage: {
    position: 'relative',
    marginTop: 20,
    flex: 1,
    minHeight: 260,
  },
  interestCard: {
    position: 'absolute',
    width: 128,
    borderRadius: radius.md,
    backgroundColor: tw.neutral900,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 12,
  },
  interestCardImage: {
    height: 128,
    width: '100%',
  },
  interestCardLabel: {
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: tw.neutral300,
  },
  quizTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.7,
    color: colors.foreground,
  },
  quizSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  quizSectionLabel: {
    marginTop: 32,
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.077)', // border-border/70
    backgroundColor: 'rgba(9,10,12,0.4)', // bg-card/40
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionRowSelected: {
    borderColor: 'rgba(166,132,255,0.4)',
    backgroundColor: 'rgba(142,81,255,0.08)',
  },
  optionEmoji: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(16,16,18,0.7)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCheckSelected: {
    borderColor: tw.violet400,
    backgroundColor: tw.violet400,
  },
  chipsWrap: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    borderColor: 'rgba(166,132,255,0.5)',
    backgroundColor: 'rgba(142,81,255,0.15)',
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  chipTextSelected: {
    color: colors.foreground,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.primaryForeground,
  },
  buildingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  spinner: {
    marginTop: 64,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(166,132,255,0.25)',
    borderTopColor: tw.violet400,
  },
  buildingTitle: {
    marginTop: 40,
    fontSize: 24,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  buildingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  buildProgressTrack: {
    marginTop: 40,
    height: 6,
    width: '100%',
    maxWidth: 256,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  buildProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tw.violet400,
  },
  resetText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
});
