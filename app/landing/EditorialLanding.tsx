import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowUpRight,
  Bookmark,
  MapPinned,
  MessageCircleMore,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  type SharedValue,
} from 'react-native-reanimated';
import { DUBAI_SPOTS } from '../../lib/dubaiSpots';
import { fonts } from '../../lib/theme';

const GREEN = '#baff8f';

const metrics = [
  { value: '150k+', noun: 'views', detail: 'on social media' },
  { value: '200+', noun: 'places', detail: 'worth leaving home for' },
  { value: '300+', noun: 'users', detail: 'active and growing' },
];

type Feature = {
  title: string;
  eyebrow: string;
  bullets: string[];
  image: ReturnType<typeof require>;
  color: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: 'Discover',
    eyebrow: 'Browse without the noise',
    bullets: [
      'Explore hand-picked spots by mood and moment',
      'See the places Dubai is actually talking about',
    ],
    image: require('../../assets/screenshots/browse-1080.png'),
    color: '#70dcf3',
    icon: Search,
  },
  {
    title: 'Map',
    eyebrow: 'See the whole city at once',
    bullets: [
      'Find what is nearby without opening ten tabs',
      'Move from neighbourhood to neighbourhood in a tap',
    ],
    image: require('../../assets/screenshots/maps-1080.png'),
    color: '#d4f1aa',
    icon: MapPinned,
  },
  {
    title: 'Collections',
    eyebrow: 'Turn saves into a plan',
    bullets: [
      'Build lists for dates, weekends, and visiting friends',
      'Share the shortlist and let everyone weigh in',
    ],
    image: require('../../assets/screenshots/collections.png'),
    color: '#f7dcdc',
    icon: Bookmark,
  },
  {
    title: 'Ask Loki',
    eyebrow: 'Your local friend, on demand',
    bullets: [
      'Describe the vibe instead of fighting with filters',
      'Get a short list that fits the moment',
    ],
    image: require('../../assets/screenshots/vibes-1080.png'),
    color: '#5d67eb',
    icon: Sparkles,
  },
];

const carouselItems = [
  { title: 'Hidden gems', kicker: 'Worth the detour', image: DUBAI_SPOTS[0].image, color: '#f4cc35' },
  { title: 'After dark', kicker: 'Plans past midnight', image: DUBAI_SPOTS[3].image, color: '#443b93' },
  { title: 'New energy', kicker: 'For the group chat', image: DUBAI_SPOTS[1].image, color: '#57d7e0' },
  { title: 'Deep dives', kicker: 'Do something different', image: DUBAI_SPOTS[4].image, color: '#ef4a2f' },
  { title: 'Easy Sundays', kicker: 'Low effort, high reward', image: DUBAI_SPOTS[5].image, color: '#d7efaf' },
  { title: 'Local favourites', kicker: 'Dubai, properly', image: DUBAI_SPOTS[2].image, color: '#5864eb' },
  { title: 'Best of Dubai', kicker: 'Curated by Loki', image: DUBAI_SPOTS[0].image, color: '#f7dede' },
  { title: 'Make a plan', kicker: 'Save it for later', image: DUBAI_SPOTS[3].image, color: '#7bd7f0' },
  { title: 'Go somewhere', kicker: 'Your map is ready', image: DUBAI_SPOTS[4].image, color: '#ffd92f' },
];

function CarouselCard({
  item,
  index,
  count,
  progress,
  stageWidth,
}: {
  item: (typeof carouselItems)[number];
  index: number;
  count: number;
  progress: SharedValue<number>;
  stageWidth: number;
}) {
  const cardWidth = Math.min(252, Math.max(114, stageWidth * 0.165));
  const gap = cardWidth + Math.min(20, Math.max(9, stageWidth * 0.01));
  const loopWidth = count * gap;

  const animStyle = useAnimatedStyle(() => {
    'worklet';
    const raw = index * gap - progress.value;
    const range = loopWidth;
    const min = -loopWidth / 2;
    const position = ((((raw - min) % range) + range) % range) + min;
    const ratio = position / Math.max(stageWidth * 0.48, 1);
    const edge = Math.min(Math.abs(ratio), 1.35);

    return {
      opacity: edge > 1.25 ? 0 : 1,
      zIndex: Math.round(100 - edge * 50),
      transform: [
        { perspective: 1200 },
        { translateX: position },
        { translateY: -Math.pow(edge, 1.72) * Math.min(72, stageWidth * 0.049) },
        { rotateY: `${ratio * -58}deg` },
        { rotateZ: `${ratio * 1.8}deg` },
        { scale: 1 - Math.min(edge, 1) * 0.08 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.carouselCard,
        {
          width: cardWidth,
          height: cardWidth / 0.6,
          left: stageWidth / 2 - cardWidth / 2,
          backgroundColor: item.color,
        },
        animStyle,
      ]}
    >
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.05)']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.carouselCardBottom}>
        <Text style={styles.carouselKicker}>{item.kicker.toUpperCase()}</Text>
        <Text style={styles.carouselTitle}>{item.title}</Text>
      </View>
    </Animated.View>
  );
}

/** 1:1 port of components/landing/editorial-carousel.tsx (3D conveyor of cards). */
function EditorialCarousel({ height }: { height: number }) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useFrameCallback((frame) => {
    const delta = frame.timeSincePreviousFrame ?? 16;
    progress.value = progress.value + Math.min(delta, 64) * 0.052;
  });

  return (
    <View style={[styles.carouselStage, { height }]}>
      {carouselItems.map((item, index) => (
        <CarouselCard
          key={`${item.title}-${index}`}
          item={item}
          index={index}
          count={carouselItems.length}
          progress={progress}
          stageWidth={width}
        />
      ))}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', '#000']}
        style={styles.carouselFade}
        pointerEvents="none"
      />
    </View>
  );
}

function FeatureCard({ feature, onGetStarted }: { feature: Feature; onGetStarted: () => void }) {
  const Icon = feature.icon;

  return (
    <View style={[styles.featureCard, { backgroundColor: feature.color }]}>
      <View style={styles.featureTop}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon size={22} color="#000" strokeWidth={1.7} />
            <Text style={styles.featureTitle}>{feature.title}</Text>
          </View>
          <Text style={styles.featureEyebrow}>{feature.eyebrow}</Text>
          <View style={{ marginTop: 6, gap: 2, maxWidth: 448 }}>
            {feature.bullets.map((bullet) => (
              <View key={bullet} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureBullet}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.featureShotWrap}>
        <View style={styles.featureShotFrame}>
          <Image source={feature.image} style={styles.featureShot} contentFit="cover" contentPosition="top" />
        </View>
      </View>
    </View>
  );
}

/** 1:1 port of components/landing/editorial-landing.tsx. */
export function EditorialLanding({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Hero section */}
      <View style={{ minHeight: height, backgroundColor: '#000' }}>
        <View style={[styles.nav, { marginTop: insets.top }]}>
          <Text style={styles.navLogo}>loki.</Text>
          <Pressable onPress={onSignIn} style={styles.navSignIn}>
            <Text style={styles.navSignInText}>Sign in</Text>
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <Text style={styles.heroTitle}>
            We <Text style={styles.heroTitleAccent}>find and share</Text>
            {'\n'}Dubai's best spots
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <EditorialCarousel height={Math.max(288, height * 0.54)} />
      </View>

      {/* Metrics */}
      <View style={styles.metricsSection}>
        {metrics.map((metric) => (
          <View key={metric.detail} style={{ alignItems: 'center' }}>
            <Text numberOfLines={1} style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricNoun}> {metric.noun}</Text>
            </Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>
          Loki is Dubai's local cheat code.{'\n'}We cut through the noise, surface the spots{' '}
          <Text style={styles.summaryAccent}>actually worth your time</Text>, and turn "what are we
          doing?" into a plan.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresHeader}>
          <Text style={styles.featuresLogo}>loki.</Text>
          <Pressable onPress={onGetStarted} style={styles.tryBtn}>
            <Text style={styles.tryBtnText}>Try Loki</Text>
          </Pressable>
        </View>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={{ gap: 16 }}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} onGetStarted={onGetStarted} />
          ))}
        </View>
      </View>

      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.featuresLogo}>loki.</Text>
          <Pressable onPress={onGetStarted} style={styles.getStartedBtn}>
            <Text style={styles.tryBtnText}>Get started</Text>
          </Pressable>
        </View>

        <Text style={styles.reviewsTitle}>Group chat approved</Text>

        <View style={styles.reviewsGrid}>
          <View style={styles.quoteBlock}>
            <MessageCircleMore size={28} color="#000" strokeWidth={1.5} />
            <Text style={styles.quoteText}>
              "Finally, a saved list that turns into an actual plan."
            </Text>
            <Text style={styles.quoteCaption}>The organised friend</Text>
          </View>

          <View style={styles.starCard}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.starCardTitle}>Dubai,{'\n'}decoded.</Text>
            <Text style={styles.starCardCaption}>THE LOKI COMMUNITY</Text>
          </View>

          <View style={styles.quoteBlock}>
            <Sparkles size={28} color="#000" strokeWidth={1.5} />
            <Text style={styles.quoteText}>
              "It feels like the local friend who always knows where to go."
            </Text>
            <Text style={styles.quoteCaption}>The spontaneous friend</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { minHeight: height * 0.47, paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.footerLogo} numberOfLines={1} adjustsFontSizeToFit>
          loki.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  nav: {
    zIndex: 30,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
  },
  navLogo: {
    fontSize: 18,
    fontFamily: fonts.sansMedium,
    letterSpacing: -1.17,
    color: '#f7f7f4',
  },
  navSignIn: {
    borderRadius: 999,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navSignInText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: '#000',
  },
  heroWrap: {
    zIndex: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  heroTitle: {
    maxWidth: 768,
    textAlign: 'center',
    fontSize: 40,
    lineHeight: 38,
    color: '#f7f7f4',
    letterSpacing: -2.9,
    fontFamily: fonts.sans,
  },
  heroTitleAccent: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: GREEN,
  },
  carouselStage: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  carouselCard: {
    position: 'absolute',
    top: '12%',
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 16,
  },
  carouselCardBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
  carouselKicker: {
    fontSize: 8,
    fontFamily: fonts.sansMedium,
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.65)',
  },
  carouselTitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 14,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.6,
    color: '#fff',
  },
  carouselFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
  },
  metricsSection: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 80,
    gap: 60,
  },
  metricValueRow: {
    fontSize: 46,
    lineHeight: 42,
  },
  metricValue: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: GREEN,
    letterSpacing: -3.4,
  },
  metricNoun: {
    color: '#f7f7f4',
    letterSpacing: -3.4,
    fontFamily: fonts.sans,
  },
  metricDetail: {
    marginTop: 16,
    fontSize: 14,
    letterSpacing: -0.28,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.sans,
  },
  summarySection: {
    minHeight: 552,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 80,
  },
  summaryText: {
    maxWidth: 1024,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -1.5,
    color: '#f7f7f4',
    fontFamily: fonts.sans,
  },
  summaryAccent: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: GREEN,
  },
  featuresSection: {
    backgroundColor: '#f6f6f3',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  featuresLogo: {
    fontSize: 16,
    fontFamily: fonts.sansMedium,
    letterSpacing: -0.96,
    color: '#000',
  },
  tryBtn: {
    borderRadius: 999,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tryBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: '#fff',
  },
  featuresTitle: {
    paddingBottom: 40,
    paddingTop: 48,
    textAlign: 'center',
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: -2.9,
    color: '#000',
    fontFamily: fonts.sans,
  },
  featureCard: {
    position: 'relative',
    minHeight: 456,
    overflow: 'hidden',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  featureTop: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureTitle: {
    fontSize: 24,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -1.4,
    color: '#000',
  },
  featureEyebrow: {
    marginTop: 14,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
    color: '#000',
  },
  featureBullet: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(0,0,0,0.55)',
    fontFamily: fonts.sans,
  },
  featureShotWrap: {
    marginTop: 'auto',
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingTop: 28,
  },
  featureShotFrame: {
    width: '74%',
    height: '100%',
    transform: [{ translateY: 27 }],
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 5,
    borderBottomWidth: 0,
    borderColor: '#000',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },
  featureShot: {
    width: '100%',
    height: '100%',
  },
  reviewsSection: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
  },
  getStartedBtn: {
    borderRadius: 999,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reviewsTitle: {
    paddingTop: 48,
    textAlign: 'center',
    fontSize: 41,
    lineHeight: 41,
    letterSpacing: -2.9,
    color: '#000',
    fontFamily: fonts.sans,
  },
  reviewsGrid: {
    alignItems: 'center',
    gap: 24,
    paddingVertical: 48,
  },
  quoteBlock: {
    maxWidth: 288,
    alignItems: 'center',
  },
  quoteText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.8,
    color: '#000',
    fontFamily: fonts.sans,
  },
  quoteCaption: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(0,0,0,0.55)',
    fontFamily: fonts.sans,
  },
  starCard: {
    width: '100%',
    maxWidth: 276,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    shadowColor: 'rgb(62,92,36)',
    shadowOffset: { width: 0, height: 26 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 12,
  },
  stars: {
    fontSize: 30,
    letterSpacing: 2.4,
    color: '#000',
  },
  starCardTitle: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 30,
    fontFamily: fonts.sansMedium,
    letterSpacing: -1.95,
    color: '#000',
  },
  starCardCaption: {
    marginTop: 20,
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    letterSpacing: 2.1,
    color: 'rgba(0,0,0,0.45)',
  },
  footer: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  footerLogo: {
    fontSize: 130,
    lineHeight: 130,
    letterSpacing: -13,
    color: '#fff',
    fontFamily: fonts.sans,
  },
});
