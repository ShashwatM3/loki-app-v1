import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

export type CarouselCard = {
  image: number;
  label: string;
};

/** Web parity: components/landing/hero-carousel.tsx */
const CYCLE_SECONDS = 30;
const MAX_ROTATION = 66;
const MAX_DEPTH = 70;
const MAX_SCALE_DROP = 0.06;
const SPEED_LERP = 0.12;
const PERSPECTIVE = 1150;

type Metrics = {
  cardWidth: number;
  cardHeight: number;
  spacing: number;
  slots: number;
};

function metricsFor(viewportWidth: number, cardCount: number): Metrics {
  const cardWidth = viewportWidth < 640 ? 138 : viewportWidth < 1024 ? 160 : 180;
  const cardHeight = Math.round(cardWidth * 1.45);
  const spacing = Math.round(cardWidth * 1.18);
  const slots = Math.max(Math.ceil(viewportWidth / spacing) + 4, cardCount);
  return { cardWidth, cardHeight, spacing, slots };
}

function Slot({
  index,
  card,
  metrics,
  viewportWidth,
  offset,
}: {
  index: number;
  card: CarouselCard;
  metrics: Metrics;
  viewportWidth: number;
  offset: SharedValue<number>;
}) {
  const { cardWidth, cardHeight, spacing, slots } = metrics;
  const loopWidth = spacing * slots;

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const half = viewportWidth / 2;
    const origin = half - spacing;
    const x = ((index * spacing + ((offset.value % loopWidth) + loopWidth) % loopWidth) % loopWidth) - spacing;
    const p = Math.max(-1.35, Math.min(1.35, (x - origin) / half));
    const eased = Math.sign(p) * Math.abs(p) ** 1.15;
    // RN has no translateZ; fold the web's translateZ(-|eased|*70) under
    // perspective 1150 into an equivalent apparent scale.
    const depthScale = PERSPECTIVE / (PERSPECTIVE + Math.abs(eased) * MAX_DEPTH);
    const scale = (1 - Math.min(Math.abs(p), 1) * MAX_SCALE_DROP) * depthScale;
    return {
      zIndex: 100 - Math.round(Math.abs(p) * 50),
      transform: [
        { perspective: PERSPECTIVE },
        { translateX: Math.round(x - cardWidth / 2) },
        { translateY: -cardHeight / 2 },
        { rotateY: `${-eased * MAX_ROTATION}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slot,
        { width: cardWidth, height: cardHeight },
        animatedStyle,
      ]}
    >
      <View style={styles.figure}>
        <Image source={card.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Text style={styles.caption} numberOfLines={2}>
          {card.label}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * The 3D curved conveyor from the web hero: cards flow right-to-left on a
 * 30-second loop, rotate around Y toward the edges, recede and shrink, and can
 * be dragged (dragging pauses the autoplay while the finger is down).
 */
export function HeroCarousel({ cards }: { cards: readonly CarouselCard[] }) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const offset = useSharedValue(0);
  const speedFactor = useSharedValue(1);
  const dragging = useSharedValue(false);

  const metrics = useMemo(
    () => metricsFor(viewportWidth || 390, cards.length),
    [viewportWidth, cards.length]
  );
  const loopWidth = metrics.spacing * metrics.slots;
  const speed = loopWidth / CYCLE_SECONDS;

  useFrameCallback((frame) => {
    'worklet';
    const dt = Math.min(frame.timeSincePreviousFrame ?? 16, 64) / 1000;
    const target = dragging.value ? 0 : 1;
    speedFactor.value += (target - speedFactor.value) * SPEED_LERP;
    offset.value -= speed * speedFactor.value * dt;
    offset.value = ((offset.value % loopWidth) + loopWidth) % loopWidth;
  });

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      dragging.value = true;
    })
    .onChange((e) => {
      offset.value += e.changeX;
    })
    .onFinalize(() => {
      dragging.value = false;
    });

  const onLayout = (e: LayoutChangeEvent) => {
    setViewportWidth(e.nativeEvent.layout.width);
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        style={[styles.viewport, { height: Math.round(metrics.cardHeight * 1.3) }]}
      >
        {viewportWidth > 0
          ? Array.from({ length: metrics.slots }, (_, index) => (
              <Slot
                key={index}
                index={index}
                card={cards[index % cards.length]!}
                metrics={metrics}
                viewportWidth={viewportWidth}
                offset={offset}
              />
            ))
          : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: '100%',
    overflow: 'hidden',
  },
  slot: {
    position: 'absolute',
    left: 0,
    top: '50%',
  },
  // rounded-[14px] bg-[#151515]
  figure: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#151515',
    overflow: 'hidden',
  },
  // bottom-3 left-3 right-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/90
  caption: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 10 * 0.16,
    color: 'rgba(255,255,255,0.9)',
  },
});
