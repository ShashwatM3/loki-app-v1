import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { RadialGlow, type GlowStop } from './RadialGlow';

/**
 * Animated glow layers — ports of the motion/react radial-gradient sweeps used
 * by OnboardingGlow / ProfileGlow / LandingGlow / CollectionBannerGlow on the
 * web. Each layer loops through its keyframes with easeInOut, exactly like
 * framer-motion's `animate={{ x: [...], ... }}` arrays.
 */

type Keyframes = {
  /** translateX keyframes as a fraction of the layer's own width. */
  x?: number[];
  opacity?: number[];
  scaleX?: number[];
  scaleY?: number[];
  scale?: number[];
  /** `left` sweep keyframes as fraction of container width (hot-spot layers). */
  left?: number[];
};

function useLoop(duration: number, delay = 0) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay * 1000,
      withRepeat(withTiming(1, { duration: duration * 1000, easing: Easing.linear }), -1, false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, delay]);
  return progress;
}

function keyframeRange(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}

function GlowLayer({
  frames,
  duration,
  delay = 0,
  layerWidth,
  containerWidth,
  style,
  children,
}: {
  frames: Keyframes;
  duration: number;
  delay?: number;
  layerWidth: number;
  containerWidth: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const progress = useLoop(duration, delay);

  const animatedStyle = useAnimatedStyle(() => {
    const transform: ({ translateX: number } | { scaleX: number } | { scaleY: number } | { scale: number })[] = [];
    let opacity = 1;
    if (frames.x) {
      const inp = keyframeRange(frames.x.length);
      // easeInOut applied per-segment feel: framer eases each segment; linear progress
      // through eased interpolate is close enough visually for a soft glow.
      transform.push({
        translateX: interpolate(progress.value, inp, frames.x.map((f) => f * layerWidth)),
      });
    }
    if (frames.left) {
      const inp = keyframeRange(frames.left.length);
      transform.push({
        translateX: interpolate(progress.value, inp, frames.left.map((f) => f * containerWidth)),
      });
    }
    if (frames.scaleX) {
      transform.push({
        scaleX: interpolate(progress.value, keyframeRange(frames.scaleX.length), frames.scaleX),
      });
    }
    if (frames.scaleY) {
      transform.push({
        scaleY: interpolate(progress.value, keyframeRange(frames.scaleY.length), frames.scaleY),
      });
    }
    if (frames.scale) {
      transform.push({
        scale: interpolate(progress.value, keyframeRange(frames.scale.length), frames.scale),
      });
    }
    if (frames.opacity) {
      opacity = interpolate(progress.value, keyframeRange(frames.opacity.length), frames.opacity);
    }
    return { transform, opacity };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

function violet(alpha: number) {
  return `rgba(168,124,254,${alpha})`;
}

type AnchoredGlowProps = {
  /** 'bottom' anchors the glow pool at the bottom (landing/onboarding), 'top' at the top (profile/collection). */
  anchor: 'top' | 'bottom';
  height: number;
  stopsMain: GlowStop[];
  stopsCounter: GlowStop[];
  stopsHot: GlowStop[];
  stopsCool?: GlowStop[];
  style?: StyleProp<ViewStyle>;
  rays?: React.ReactNode;
};

function AnchoredGlow({ anchor, height, stopsMain, stopsCounter, stopsHot, stopsCool, style, rays }: AnchoredGlowProps) {
  const { width } = useWindowDimensions();
  const [w, setW] = useState(width);
  const layerW = w * 1.6; // inset-x-[-30%]
  const cy = anchor === 'bottom' ? 100 : 0;

  const mask =
    anchor === 'bottom' ? (
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', '#000', '#000']}
        locations={[0.12, 0.5, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />
    ) : (
      <LinearGradient
        colors={['#000', '#000', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
        locations={[0, 0.2, 0.55, 0.88]}
        style={StyleSheet.absoluteFill}
      />
    );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.anchored,
        anchor === 'bottom' ? { bottom: 0 } : { top: 0 },
        { height },
        style,
      ]}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
    >
      <MaskedView style={StyleSheet.absoluteFill} maskElement={mask}>
        {/* Main mass — swings hard left-right and surges */}
        <GlowLayer
          frames={{
            x: [-0.22, 0.22, -0.08, 0.18, -0.22],
            scaleX: [1, 1.35, 0.85, 1.25, 1],
            scaleY: [1, 0.88, 1.18, 0.92, 1],
          }}
          duration={7}
          layerWidth={layerW}
          containerWidth={w}
          style={[styles.layer, { left: -0.3 * w, width: layerW, height: height * 1.3, [anchor]: -0.1 * height } as ViewStyle]}
        >
          <RadialGlow stops={stopsMain} cx={50} cy={cy} rx={110} ry={90} />
        </GlowLayer>
        {/* Counter-swing swell */}
        <GlowLayer
          frames={{
            x: [0.28, -0.24, 0.16, -0.28, 0.28],
            opacity: [0.5, 1, 0.6, 1, 0.5],
            scaleX: [1.1, 0.78, 1.3, 0.88, 1.1],
          }}
          duration={9}
          delay={0.6}
          layerWidth={layerW}
          containerWidth={w}
          style={[styles.layer, { left: -0.3 * w, width: layerW, height: height * 1.3, [anchor]: -0.1 * height } as ViewStyle]}
        >
          <RadialGlow stops={stopsCounter} cx={30} cy={cy} rx={85} ry={75} />
        </GlowLayer>
        {/* Fast hot-spot pulse */}
        <GlowLayer
          frames={{
            left: [-0.1, 0.55, 0.2, 0.65, -0.1],
            opacity: [0.25, 0.85, 0.3, 0.9, 0.25],
            scale: [0.9, 1.3, 0.75, 1.2, 0.9],
          }}
          duration={5.5}
          delay={0.2}
          layerWidth={0.6 * w}
          containerWidth={w}
          style={[styles.layer, { left: 0, width: 0.6 * w, height, [anchor]: 0 } as ViewStyle]}
        >
          <RadialGlow stops={stopsHot} cx={50} cy={cy} rx={70} ry={80} />
        </GlowLayer>
        {/* Cool undercurrent */}
        {stopsCool ? (
          <GlowLayer
            frames={{
              x: [0.2, -0.4, 0.3, -0.2, 0.2],
              opacity: [0.3, 0.75, 0.2, 0.8, 0.3],
            }}
            duration={8}
            delay={1.4}
            layerWidth={w * 1.4}
            containerWidth={w}
            style={[styles.layer, { left: -0.2 * w, width: w * 1.4, height: height * 1.1, [anchor]: -0.05 * height } as ViewStyle]}
          >
            <RadialGlow stops={stopsCool} cx={80} cy={cy} rx={60} ry={55} />
          </GlowLayer>
        ) : null}
        {rays}
      </MaskedView>
    </View>
  );
}

/**
 * Port of ui/light-rays.tsx — randomized soft beams fanning from one edge.
 */
export function LightRays({
  count = 7,
  color = 'rgba(0, 136, 255, 0.2)',
  speed = 14,
  length,
  flipped = false,
}: {
  count?: number;
  color?: string;
  speed?: number;
  /** Ray length in px (web uses vh strings; pass the computed px). */
  length: number;
  /** rotate-180 variant (rays striking upward from the bottom). */
  flipped?: boolean;
}) {
  const rays = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: 8 + Math.random() * 84,
        rotate: -28 + Math.random() * 56,
        width: 160 + Math.random() * 160,
        swing: 0.8 + Math.random() * 1.8,
        delay: Math.random() * Math.max(speed, 0.1),
        duration: Math.max(speed, 0.1) * (0.75 + Math.random() * 0.5),
        intensity: 0.6 + Math.random() * 0.5,
      })),
    [count, speed]
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, flipped && { transform: [{ rotate: '180deg' }] }]}>
      {rays.map((ray) => (
        <Ray key={ray.id} {...ray} color={color} length={length} />
      ))}
    </View>
  );
}

function Ray({
  left,
  rotate,
  width,
  swing,
  delay,
  duration,
  intensity,
  color,
  length,
}: {
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
  color: string;
  length: number;
}) {
  const progress = useLoop(duration * 1.1, delay);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45, 0.9, 1], [0, intensity, 0, 0]),
    transform: [
      { rotate: `${interpolate(progress.value, [0, 0.45, 0.9, 1], [rotate - swing, rotate + swing, rotate - swing, rotate - swing])}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -0.12 * length,
          left: `${left}%`,
          marginLeft: -width / 2,
          width,
          height: length,
          borderRadius: 999,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <LinearGradient colors={[color, 'transparent']} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

/** Softer, shorter landing-page variant (components/landing/landing-glow.tsx). */
export function LandingGlow() {
  const { height } = useWindowDimensions();
  const h = height * 0.22;
  return (
    <AnchoredGlow
      anchor="bottom"
      height={h}
      style={styles.fixedBottom}
      stopsMain={[
        { offset: 0, color: 'rgb(168,124,254)', opacity: 0.22 },
        { offset: 30, color: 'rgb(139,92,246)', opacity: 0.12 },
        { offset: 55, color: 'rgb(96,77,170)', opacity: 0.04 },
        { offset: 70, color: 'rgb(96,77,170)', opacity: 0 },
      ]}
      stopsCounter={[
        { offset: 0, color: 'rgb(167,90,255)', opacity: 0.18 },
        { offset: 38, color: 'rgb(124,58,237)', opacity: 0.09 },
        { offset: 62, color: 'rgb(124,58,237)', opacity: 0 },
      ]}
      stopsHot={[
        { offset: 0, color: 'rgb(196,148,255)', opacity: 0.28 },
        { offset: 55, color: 'rgb(196,148,255)', opacity: 0 },
      ]}
      rays={<LightRays flipped color="rgba(192,156,255,0.2)" count={7} speed={6} length={height * 0.2} />}
    />
  );
}

/** Port of the onboarding flow's OnboardingGlow (also used by the share-link screen). */
export function OnboardingGlow() {
  const { height } = useWindowDimensions();
  const h = height * 0.38;
  return (
    <AnchoredGlow
      anchor="bottom"
      height={h}
      style={styles.fixedBottom}
      stopsMain={[
        { offset: 0, color: 'rgb(168,124,254)', opacity: 0.45 },
        { offset: 30, color: 'rgb(139,92,246)', opacity: 0.22 },
        { offset: 55, color: 'rgb(96,77,170)', opacity: 0.07 },
        { offset: 70, color: 'rgb(96,77,170)', opacity: 0 },
      ]}
      stopsCounter={[
        { offset: 0, color: 'rgb(167,90,255)', opacity: 0.38 },
        { offset: 38, color: 'rgb(124,58,237)', opacity: 0.18 },
        { offset: 62, color: 'rgb(124,58,237)', opacity: 0 },
      ]}
      stopsHot={[
        { offset: 0, color: 'rgb(196,148,255)', opacity: 0.55 },
        { offset: 55, color: 'rgb(196,148,255)', opacity: 0 },
      ]}
      stopsCool={[
        { offset: 0, color: 'rgb(96,165,250)', opacity: 0.22 },
        { offset: 52, color: 'rgb(96,165,250)', opacity: 0 },
      ]}
      rays={<LightRays flipped color="rgba(192,156,255,0.42)" count={9} speed={8} length={height * 0.34} />}
    />
  );
}

/** Port of the profile page's ProfileGlow (top-anchored). */
export function ProfileGlow() {
  const { height } = useWindowDimensions();
  const h = height * 0.2;
  return (
    <AnchoredGlow
      anchor="top"
      height={h}
      style={styles.absoluteTop}
      stopsMain={[
        { offset: 0, color: 'rgb(168,124,254)', opacity: 0.45 },
        { offset: 30, color: 'rgb(139,92,246)', opacity: 0.22 },
        { offset: 55, color: 'rgb(96,77,170)', opacity: 0.07 },
        { offset: 70, color: 'rgb(96,77,170)', opacity: 0 },
      ]}
      stopsCounter={[
        { offset: 0, color: 'rgb(167,90,255)', opacity: 0.38 },
        { offset: 38, color: 'rgb(124,58,237)', opacity: 0.18 },
        { offset: 62, color: 'rgb(124,58,237)', opacity: 0 },
      ]}
      stopsHot={[
        { offset: 0, color: 'rgb(196,148,255)', opacity: 0.55 },
        { offset: 55, color: 'rgb(196,148,255)', opacity: 0 },
      ]}
      stopsCool={[
        { offset: 0, color: 'rgb(96,165,250)', opacity: 0.22 },
        { offset: 52, color: 'rgb(96,165,250)', opacity: 0 },
      ]}
      rays={<LightRays color="rgba(192,156,255,0.42)" count={9} speed={8} length={height * 0.34} />}
    />
  );
}

/**
 * Port of CollectionBannerGlow — hue-driven aura bleeding down from under the
 * collection banner (top-anchored, absolute at a given offset).
 */
export function CollectionBannerGlow({ hue, top = 230, height = 160 }: { hue: number; top?: number; height?: number }) {
  const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
  const main = hsl(hue, 90, 66);
  const mainMid = hsl(hue, 85, 58);
  const counter = hsl((hue + 28) % 360, 88, 62);
  const hot = hsl((hue + 12) % 360, 95, 72);
  const cool = hsl((hue + 200) % 360, 80, 60);

  return (
    <AnchoredGlow
      anchor="top"
      height={height}
      style={{ position: 'absolute', top, left: 0, right: 0, zIndex: 0 }}
      stopsMain={[
        { offset: 0, color: main, opacity: 0.32 },
        { offset: 32, color: mainMid, opacity: 0.15 },
        { offset: 68, color: mainMid, opacity: 0 },
      ]}
      stopsCounter={[
        { offset: 0, color: counter, opacity: 0.26 },
        { offset: 60, color: counter, opacity: 0 },
      ]}
      stopsHot={[
        { offset: 0, color: hot, opacity: 0.36 },
        { offset: 56, color: hot, opacity: 0 },
      ]}
      stopsCool={[
        { offset: 0, color: cool, opacity: 0.14 },
        { offset: 54, color: cool, opacity: 0 },
      ]}
    />
  );
}

/** Auth page's animated multi-color gradient flow along the top. */
export function AuthGradientFlow() {
  const { width, height } = useWindowDimensions();
  const progress = useLoop(10);
  const h = 192; // h-48
  const gradientW = width * 3;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 0.5, 1], [0, -(gradientW - width * 1.5), 0]),
      },
    ],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h + 96, overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', top: -96, left: -width * 0.25, width: gradientW, height: 288 }, animatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(168, 85, 247, 0.55)',
            'rgba(34, 197, 94, 0.4)',
            'rgba(234, 179, 8, 0.45)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(168, 85, 247, 0.55)',
            'rgba(34, 197, 94, 0.4)',
          ]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 1, y: 0.7 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* bottom fade into the page background */}
      <LinearGradient
        colors={['rgba(3,4,5,0)', '#030405']}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 96 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchored: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  absoluteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  layer: {
    position: 'absolute',
  },
});
