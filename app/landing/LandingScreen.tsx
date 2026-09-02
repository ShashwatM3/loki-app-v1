import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { ArrowRight } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LokiPeeker } from '../../components/LokiPeeker';
import { PhoneSwipeMock, type SwipeMockCard } from '../../components/landing/PhoneSwipeMock';
import { HeroCarousel, type CarouselCard } from '../../components/landing/HeroCarousel';
import { ChatMock, TrendingMock, ConfirmMock } from '../../components/landing/HowItWorksVisuals';
import { StickerFooter } from '../../components/landing/StickerFooter';
import { LANDING_IMAGES } from '../../components/landing/landingImages';
import { useCounterStore } from '../../lib/store';
import type { RootStackParamList } from '../../navigation/AppNavigator';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Web parity: components/landing/section-hero.tsx CARDS (all 21). */
const CAROUSEL_CARDS: readonly CarouselCard[] = [
  { image: LANDING_IMAGES['padel-sunset'], label: 'Padel after work' },
  { image: LANDING_IMAGES['rooftop-friends'], label: 'Rooftop plans' },
  { image: LANDING_IMAGES['gallery-night'], label: 'Art after dark' },
  { image: LANDING_IMAGES['beach-friends'], label: 'Golden hour' },
  { image: LANDING_IMAGES['cafe-morning'], label: 'Coworking mornings' },
  { image: LANDING_IMAGES['karting-night'], label: 'Full send' },
  { image: LANDING_IMAGES['trivia-night'], label: 'Trivia · Quiz Room' },
  { image: LANDING_IMAGES['indoor-coaster'], label: 'Indoor coasters · IMG' },
  { image: LANDING_IMAGES['trampoline-park'], label: 'Trampolining · Bounce' },
  { image: LANDING_IMAGES['obstacle-course'], label: 'Obstacle course · Air Maniax' },
  { image: LANDING_IMAGES['floating-water-park'], label: 'Floating sea park · AquaFun' },
  { image: LANDING_IMAGES['escape-room'], label: 'Escape room · TEPfactor' },
  { image: LANDING_IMAGES['neon-arcade'], label: 'Gaming · Loco Bear' },
  { image: LANDING_IMAGES['arcade-bar'], label: 'Arcades · Brass Monkey' },
  { image: LANDING_IMAGES['bowling-neon'], label: 'Bowling · Switch' },
  { image: LANDING_IMAGES['karaoke-room'], label: 'Karaoke · Bla Bla' },
  { image: LANDING_IMAGES['duckpin-bowling'], label: 'Duckpin · Hushh' },
  { image: LANDING_IMAGES['sports-bar'], label: 'Sports bar · The 44' },
  { image: LANDING_IMAGES['arcade-hall'], label: 'Arcades · DBC' },
  { image: LANDING_IMAGES['singing-stage'], label: 'Singing · Zoloto' },
  { image: LANDING_IMAGES['mall-bowling'], label: 'Bowling · Mercato' },
];

/** Web parity: section-hero.tsx DECK — real Loki spots only. */
const HERO_DECK: readonly SwipeMockCard[] = [
  { image: LANDING_IMAGES['karting-night'], venue: 'Chaos Karts', meta: 'Karting · Al Quoz · from AED 145' },
  { image: LANDING_IMAGES['padel-sunset'], venue: 'Padel Park', meta: 'Padel · JVC · from AED 60' },
  { image: LANDING_IMAGES['gallery-night'], venue: 'Alserkal Avenue', meta: 'Galleries · Al Quoz · free entry' },
  { image: LANDING_IMAGES['beach-friends'], venue: 'Kite Beach', meta: 'Beach · Umm Suqeim · free entry' },
];

/** Web parity: section-how-it-works.tsx VISUALS[2] deck. */
const STEP_DECK: readonly SwipeMockCard[] = [
  { image: LANDING_IMAGES['beach-friends'], venue: 'Kite Beach', meta: 'Beach · Umm Suqeim · free entry' },
  { image: LANDING_IMAGES['padel-sunset'], venue: 'Padel Park', meta: 'Padel · JVC · from AED 60' },
  { image: LANDING_IMAGES['cafe-morning'], venue: 'Roastery Café', meta: 'Coworking · Al Quoz · from AED 45' },
];

/** Web parity: section-how-it-works.tsx STEPS. */
const STEPS = [
  {
    title: 'Tell Loki the vibe',
    body:
      'Ask in plain language — \u201cchill cafe to work from\u201d, \u201cdate-night dinner under 200 AED\u201d, \u201clate-night spot in JBR\u201d. Loki understands the occasion, budget, and mood.',
  },
  {
    title: 'Trending places, pulled from TikTok and Instagram',
    body:
      "We track what's actually blowing up around Dubai right now, so you're not relying on a screenshot folder from three months ago.",
  },
  {
    title: 'Swipe to build your list, with friends',
    body:
      'Send a list to the group chat, everyone swipes, Loki finds where you all actually agree — instead of the usual 40-message debate.',
  },
  {
    title: 'Book and go, through Loki',
    body:
      'Reservation, tickets, or just directions — whatever getting there needs, it happens without leaving the app.',
  },
] as const;

/** Web parity: loki-data.ts METRICS + section-numbers.tsx accents. */
const METRICS = [
  { value: 400, suffix: 'k+', label: 'views on social media', color: '#FF5468' },
  { value: 200, suffix: '+', label: 'places to explore', color: '#a68bff' },
  { value: 500, suffix: '+', label: 'users and growing', color: '#FF5468' },
] as const;

/** Count-up number: 1100ms quartic ease-out once in view (web Counter). */
function Counter({ value, suffix, color, active }: { value: number; suffix: string; color: string; active: boolean }) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / 1100);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, value]);

  return (
    <Text style={[styles.metricNumber, { color }]}>
      {count}
      {suffix}
    </Text>
  );
}

/** whileInView fade: opacity 0 / y offset until `visible`, then 800ms bezier(0.16,1,0.3,1). */
function FadeInWhenVisible({
  visible,
  offset = 36,
  children,
  style,
}: {
  visible: boolean;
  offset?: number;
  children: React.ReactNode;
  style?: object;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (visible) progress.value = withTiming(1, { duration: 800, easing: EASE });
  }, [visible, progress]);
  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * offset }],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LandingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Landing'>>();
  const insets = useSafeAreaInsets();
  const userData = useCounterStore((s) => s.userData);

  const scrollRef = useRef<ScrollView>(null);
  const [howY, setHowY] = useState(0);
  const sectionYs = useRef<Record<string, number>>({});
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const viewportH = useRef(0);

  // Web parity: /#how (About's "See how it works") lands scrolled to the section.
  useEffect(() => {
    if (route.params?.scrollTo === 'how' && howY > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: howY - 24, animated: true });
        navigation.setParams({ scrollTo: undefined });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [route.params?.scrollTo, howY, navigation]);

  const goTo = useCallback(
    (screen: 'Browse') => {
      if (userData.email) {
        navigation.navigate('Dashboard', { screen });
      } else {
        navigation.navigate('Authentication', {
          returnTo: 'Dashboard',
          returnToParams: { screen },
        });
      }
    },
    [navigation, userData.email]
  );

  const markSection = (key: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionYs.current[key] = e.nativeEvent.layout.y;
    if (key === 'how') setHowY(e.nativeEvent.layout.y);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const vh = e.nativeEvent.layoutMeasurement.height || viewportH.current;
    viewportH.current = vh;
    setVisibleSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [key, sy] of Object.entries(sectionYs.current)) {
        if (!next[key] && y + vh > sy + 120) {
          next[key] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const scrollToHow = () => {
    scrollRef.current?.scrollTo({ y: howY - 24, animated: true });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={64}
        contentContainerStyle={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {/* nav: px-5 py-6, logo h-7 + 'loki.' xl extrabold; How it works + Sign in */}
        <View style={styles.nav}>
          <View style={styles.navBrand}>
            <Image
              source={require('../../assets/web/logo2.png')}
              style={styles.navLogo}
              contentFit="contain"
            />
            <Text style={styles.navWordmark}>loki.</Text>
          </View>
          <View style={styles.navActions}>
            <Pressable onPress={scrollToHow} hitSlop={6} style={styles.navHowLink}>
              <Text style={styles.navHowText}>How it works</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Authentication')}
              style={({ pressed }) => [styles.signInPill, pressed && { backgroundColor: '#5B21F2' }]}
            >
              <Text style={styles.signInText}>Sign in</Text>
            </Pressable>
          </View>
        </View>

        {/* hero: pb-20 pt-10; single column at mobile */}
        <View style={styles.hero}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Stop scrolling.</Text>
            <View style={styles.heroTitleRow}>
              <View style={styles.underlineWrap}>
                <Text style={styles.heroTitle}>Start going</Text>
                <Svg
                  viewBox="0 0 220 24"
                  style={styles.underlineSvg}
                  preserveAspectRatio="none"
                  pointerEvents="none"
                >
                  <Path
                    d="M2 18C40 6 90 4 122 10C154 16 190 14 218 6"
                    stroke="#5B21F2"
                    strokeWidth={6}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </View>
              <Text style={styles.heroTitle}>.</Text>
            </View>

            <Text style={styles.heroSub}>
              You&apos;ve saved 47 places from TikTok this month. You&apos;ve been to 0.
            </Text>

            <View style={styles.ctaRow}>
              <Pressable
                onPress={() => goTo('Browse')}
                style={({ pressed }) => [
                  styles.openLoki,
                  pressed && { backgroundColor: '#5B21F2', transform: [{ translateY: -2 }] },
                ]}
              >
                <Text style={styles.openLokiText}>Open Loki</Text>
                <ArrowRight size={16} color="#ffffff" style={{ marginLeft: 4 }} />
              </Pressable>
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveChipText}>Live in Dubai</Text>
              </View>
            </View>
          </View>

          <View style={styles.phoneWrap}>
            <PhoneSwipeMock cards={HERO_DECK} interactive width={268} height={520} rotate={3} />
          </View>

          <View style={{ marginTop: 16 }}>
            <HeroCarousel cards={CAROUSEL_CARDS} />
          </View>
        </View>

        {/* numbers: bg #120C24 py-24, count-up metrics */}
        <View style={styles.numbers} onLayout={markSection('numbers')}>
          {METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricItem}>
              <Counter
                value={metric.value}
                suffix={metric.suffix}
                color={metric.color}
                active={Boolean(visibleSections.numbers)}
              />
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        {/* how it works: white, heading + 4 bordered steps */}
        <View style={styles.how} onLayout={markSection('how')}>
          <FadeInWhenVisible visible={Boolean(visibleSections.how)} offset={28}>
            <Text style={styles.howTitle}>Four steps between here and out the door.</Text>
            <Text style={styles.howSub}>
              No spreadsheets, no fifteen open tabs, no &ldquo;we&apos;ll figure it out when we get
              there.&rdquo;
            </Text>
          </FadeInWhenVisible>

          <View style={{ marginTop: 48 }}>
            {STEPS.map((step, index) => (
              <View
                key={step.title}
                onLayout={markSection(`step${index}`)}
                style={[styles.stepItem, index === STEPS.length - 1 && styles.stepItemLast]}
              >
                <FadeInWhenVisible visible={Boolean(visibleSections[`step${index}`])}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                  <View style={styles.stepVisual}>
                    {index === 0 ? <ChatMock /> : null}
                    {index === 1 ? <TrendingMock /> : null}
                    {index === 2 ? (
                      <PhoneSwipeMock cards={STEP_DECK} width={212} height={420} rotate={-3} />
                    ) : null}
                    {index === 3 ? <ConfirmMock /> : null}
                  </View>
                </FadeInWhenVisible>
              </View>
            ))}
          </View>
        </View>

        <StickerFooter
          onOpenApp={() => goTo('Browse')}
          onAbout={() => navigation.navigate('About')}
          onHow={scrollToHow}
          onPrivacy={() => navigation.navigate('PrivacyPolicy')}
          onCookies={() => navigation.navigate('CookiePolicy')}
        />
      </ScrollView>
      <LokiPeeker />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // nav: max-w container px-5 py-6 justify-between
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // h-7 w-auto (logo2.png is square-ish; keep height 28)
  navLogo: {
    height: 28,
    width: 28,
  },
  // text-xl font-extrabold tracking-tight
  navWordmark: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#121016',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // rounded-full px-3 py-2 text-[15px] font-medium text-[#4a4650]
  navHowLink: {
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navHowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4a4650',
  },
  // Button sm: h-8, rounded-full bg-[#121016] px-5 text-[15px] font-semibold text-white
  signInPill: {
    height: 32,
    borderRadius: 9999,
    backgroundColor: '#121016',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // section: pb-20 pt-10; container px-5 gap-12
  hero: {
    paddingTop: 40,
    paddingBottom: 80,
    overflow: 'hidden',
  },
  heroTextBlock: {
    paddingHorizontal: 20,
  },
  // clamp(2.75rem,5vw,4.25rem) -> 44px at mobile; extrabold; leading-[1]; tracking -0.03em
  heroTitle: {
    fontSize: 44,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: 44 * -0.03,
    color: '#121016',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  underlineWrap: {
    position: 'relative',
  },
  // absolute left-[-4%] top-[94%] w-[108%]; svg keeps its 220:24 aspect
  underlineSvg: {
    position: 'absolute',
    left: '-4%',
    top: '94%',
    width: '108%',
    height: 26,
  },
  // mt-6 max-w-[34ch] text-[17px] leading-[1.55] text-[#4a4650]
  heroSub: {
    marginTop: 24,
    maxWidth: 300,
    fontSize: 17,
    lineHeight: 17 * 1.55,
    color: '#4a4650',
  },
  // mt-8 flex-row flex-wrap items-center gap-4
  ctaRow: {
    marginTop: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  // h-12 rounded-full bg-[#121016] px-7 text-sm font-semibold
  openLoki: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#121016',
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openLokiText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // rounded-full border-[#e7e5e1] bg-[#f5f4f2] px-3.5 py-2 text-[13px] font-semibold text-[#4a4650]
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e7e5e1',
    backgroundColor: '#f5f4f2',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  // size-[7px] rounded-full bg-[#2ecc71]
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2ecc71',
  },
  liveChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a4650',
  },
  // relative flex justify-center (single column: phone below text, gap-12)
  phoneWrap: {
    marginTop: 48,
    alignItems: 'center',
  },
  // bg-[#120C24] py-24; column at mobile, gap-14, centered text
  numbers: {
    backgroundColor: '#120C24',
    paddingVertical: 96,
    paddingHorizontal: 20,
    gap: 56,
  },
  metricItem: {
    alignItems: 'center',
  },
  // clamp(3.5rem,7vw,6rem) -> 56px; extrabold; leading-[0.85]; tracking -0.06em; tabular-nums
  metricNumber: {
    fontSize: 56,
    lineHeight: 56 * 0.85 + 8,
    fontWeight: '800',
    letterSpacing: 56 * -0.06,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  // mt-4 max-w-[14ch] text-[17px] font-medium leading-snug text-white
  metricLabel: {
    marginTop: 16,
    maxWidth: 160,
    fontSize: 17,
    lineHeight: 17 * 1.375,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  // bg-white px-5 py-24
  how: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 96,
  },
  // clamp(2rem,3.4vw,2.75rem) -> 32px; extrabold; leading-[1.08]; tracking -0.02em; max-w 520
  howTitle: {
    maxWidth: 520,
    fontSize: 32,
    lineHeight: 32 * 1.08,
    fontWeight: '800',
    letterSpacing: 32 * -0.02,
    color: '#121016',
  },
  // mt-4 text-[17px] leading-[1.55] text-[#4a4650]
  howSub: {
    marginTop: 16,
    maxWidth: 520,
    fontSize: 17,
    lineHeight: 17 * 1.55,
    color: '#4a4650',
  },
  // li: border-t border-[#e7e5e1] py-14; last:border-b; single column gap-10
  stepItem: {
    borderTopWidth: 1,
    borderTopColor: '#e7e5e1',
    paddingVertical: 56,
  },
  stepItemLast: {
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e1',
  },
  // size-[38px] rounded-full border border-[#121016] text-sm font-bold
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#121016',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121016',
  },
  // mt-6 max-w-[18ch] clamp(1.4rem,2vw,1.6rem) -> 22.4px; extrabold; leading-[1.18]; tracking -0.02em
  stepTitle: {
    marginTop: 24,
    maxWidth: 280,
    fontSize: 22.4,
    lineHeight: 22.4 * 1.18,
    fontWeight: '800',
    letterSpacing: 22.4 * -0.02,
    color: '#121016',
  },
  // mt-3.5 max-w-[38ch] text-[17px] leading-[1.6] text-[#4a4650]
  stepBody: {
    marginTop: 14,
    maxWidth: 340,
    fontSize: 17,
    lineHeight: 17 * 1.6,
    color: '#4a4650',
  },
  // min-h-[360px] rounded-[24px] bg-[#f5f4f2] p-8, centered; gap-10 above
  stepVisual: {
    marginTop: 40,
    minHeight: 360,
    borderRadius: 24,
    backgroundColor: '#f5f4f2',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
