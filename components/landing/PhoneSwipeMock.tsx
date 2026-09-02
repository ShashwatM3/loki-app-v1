import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated';

export type SwipeMockCard = {
  image: number;
  venue: string;
  meta: string;
};

/** Web parity: components/landing/phone-swipe-mock.tsx */
const SWIPE_INTERVAL_MS = 3200;
const SWIPE_THRESHOLD = 88;
const SWIPE_VELOCITY = 420;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The Loki swipe deck rendered as a phone mock — 1:1 port of the web's
 * PhoneSwipeMock. The deck advances on its own every 3.2s; when `interactive`
 * the top card can be dragged (or the buttons tapped) and autoplay hands over.
 */
export function PhoneSwipeMock({
  cards,
  width,
  height,
  rotate = 0,
  interactive = false,
  style,
}: {
  cards: readonly SwipeMockCard[];
  width: number;
  height: number;
  rotate?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [index, setIndex] = useState(0);
  const [tookOver, setTookOver] = useState(false);
  // Bumped on every swap so the enter animation replays for the new top card.
  const [generation, setGeneration] = useState(0);
  const animatingRef = useRef(false);

  const x = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const enterProgress = useSharedValue(1);

  const card = cards[index % cards.length]!;
  const next = cards[(index + 1) % cards.length]!;
  const draggable = interactive && cards.length > 1;

  const swap = useCallback(() => {
    animatingRef.current = false;
    setIndex((current) => (current + 1) % cards.length);
    setGeneration((g) => g + 1);
  }, [cards.length]);

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      // Web exit variant: x -> ±68% of the card, rotate ±14deg, fade out, 500ms.
      exitOpacity.value = withTiming(0, { duration: 500, easing: EASE });
      x.value = withTiming(dir * width * 0.68, { duration: 500, easing: EASE }, (finished) => {
        if (finished) runOnJS(swap)();
      });
    },
    [exitOpacity, swap, width, x]
  );

  // Reset + play the enter variant (opacity 0, scale 0.94 -> 1) for each new card.
  useEffect(() => {
    x.value = 0;
    exitOpacity.value = 1;
    enterProgress.value = 0;
    enterProgress.value = withTiming(1, { duration: 500, easing: EASE });
  }, [generation, enterProgress, exitOpacity, x]);

  useEffect(() => {
    if (tookOver || cards.length < 2) return;
    const timer = setInterval(() => advance(1), SWIPE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [advance, cards.length, tookOver]);

  const handleSwipe = useCallback(
    (dir: 1 | -1) => {
      setTookOver(true);
      advance(dir);
    },
    [advance]
  );

  const pan = Gesture.Pan()
    .enabled(draggable)
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onChange((e) => {
      if (animatingRef.current) return;
      x.value += e.changeX;
    })
    .onEnd((e) => {
      const past = Math.abs(x.value) > SWIPE_THRESHOLD || Math.abs(e.velocityX) > SWIPE_VELOCITY;
      if (past) {
        runOnJS(handleSwipe)(x.value > 0 ? 1 : -1);
      } else {
        x.value = withTiming(0, { duration: 300, easing: EASE });
      }
    });

  const topCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(enterProgress.value, [0, 1], [0.94, 1]);
    const enterRotate = 0;
    return {
      opacity: exitOpacity.value * enterProgress.value,
      transform: [
        { translateX: x.value },
        { rotate: `${interpolate(x.value, [-220, 220], [-14, 14]) + enterRotate}deg` },
        { scale },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [24, 104], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-104, -24], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View
      style={[
        styles.shell,
        { width, height, transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    >
      <View style={styles.screen}>
        <View style={styles.notch} />
        <View style={styles.screenHeader}>
          <Text style={styles.wordmark}>loki.</Text>
          <LinearGradient
            colors={['#5B21F2', '#FF5468']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarDot}
          />
        </View>

        <View style={styles.cardArea}>
          <View style={styles.cardPlate} />
          <View style={styles.nextCardClip}>
            <Image source={next.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
            <View style={styles.nextCardDim} />
          </View>

          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.topCard, topCardStyle]}>
              <Image source={card.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
              <LinearGradient
                colors={['rgba(10,6,20,0)', 'rgba(10,6,20,0.05)', 'rgba(10,6,20,0.8)']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              {draggable ? (
                <>
                  <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
                    <Heart size={24} color="#ffffff" fill="#ffffff" />
                  </Animated.View>
                  <Animated.View style={[styles.badge, styles.nopeBadge, nopeStyle]}>
                    <X size={24} color="#ffffff" strokeWidth={3} />
                  </Animated.View>
                </>
              ) : null}
              <View style={styles.cardCaption}>
                <Text style={styles.cardVenue}>{card.venue}</Text>
                <Text style={styles.cardMeta}>{card.meta}</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        <View style={styles.buttonRow}>
          {interactive ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Skip ${card.venue}`}
                onPress={() => handleSwipe(-1)}
                style={styles.skipButton}
              >
                <X size={16} color="#8b8792" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Save ${card.venue}`}
                onPress={() => handleSwipe(1)}
                style={styles.saveButton}
              >
                <Heart size={16} color="#5B21F2" fill="#5B21F2" />
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.skipButton}>
                <X size={16} color="#8b8792" />
              </View>
              <View style={styles.saveButton}>
                <Heart size={16} color="#5B21F2" fill="#5B21F2" />
              </View>
            </>
          )}
        </View>
        {draggable ? <Text style={styles.swipeHint}>swipe the card</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // rounded-[2.85rem] bg-[#0b0a10] p-3 shadow-[0_40px_80px_-20px_rgba(18,16,22,0.35),0_10px_24px_rgba(18,16,22,0.12)]
  shell: {
    borderRadius: 45.6,
    backgroundColor: '#0b0a10',
    padding: 12,
    shadowColor: 'rgba(18,16,22,1)',
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
    elevation: 24,
  },
  // rounded-[2.25rem] bg-white
  screen: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  // absolute left-1/2 top-2.5 h-5 w-20 rounded-full bg-[#0b0a10]
  notch: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -40,
    height: 20,
    width: 80,
    borderRadius: 9999,
    backgroundColor: '#0b0a10',
    zIndex: 20,
  },
  // px-4 pb-3 pt-7
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 28,
  },
  // text-[15px] font-extrabold tracking-tight text-[#121016]
  wordmark: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.375,
    color: '#121016',
  },
  // size-6 rounded-full gradient from-[#5B21F2] to-[#FF5468] — solid midpoint fallback + ring
  avatarDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#AD3AAD',
    overflow: 'hidden',
  },
  // relative mx-4 mb-0 mt-1 flex-1
  cardArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 4,
  },
  // absolute inset-x-3 top-2 bottom-3 rounded-[1.35rem] bg-[#e7e5e1]
  cardPlate: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 8,
    bottom: 12,
    borderRadius: 21.6,
    backgroundColor: '#e7e5e1',
  },
  // absolute inset-0 overflow-hidden rounded-[1.4rem]; image opacity-70
  nextCardClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22.4,
    overflow: 'hidden',
  },
  nextCardDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  topCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22.4,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'rgba(10,6,20,1)',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  likeBadge: { left: 16, backgroundColor: '#5B21F2' },
  nopeBadge: { right: 16, backgroundColor: '#FF5468' },
  // absolute inset-x-4 bottom-4
  cardCaption: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  // text-[19px] font-extrabold leading-tight tracking-tight
  cardVenue: {
    color: '#ffffff',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.475,
  },
  // mt-0.5 text-[13px] font-medium text-white/85
  cardMeta: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  // flex items-center justify-center gap-4 py-4
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  // size-11 rounded-full border border-[#e7e5e1] text-[#8b8792]
  skipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e7e5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // size-11 rounded-full border border-[#5B21F2] text-[#5B21F2]
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#5B21F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // pb-3 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#b3aeba]
  swipeHint: {
    paddingBottom: 12,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 10.5 * 0.16,
    color: '#b3aeba',
  },
});
