import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

type Edge = 'top' | 'bottom' | 'left' | 'right';

type Peek = {
  id: number;
  edge: Edge;
  /** 0–100 position along the active edge */
  position: number;
  wiggle: number;
};

const EDGES: Edge[] = ['bottom', 'right', 'left', 'top'];

const SPRING_ENTER = { stiffness: 220, damping: 28, mass: 0.95 };
const SPRING_EXIT = { stiffness: 145, damping: 34, mass: 1.12 };

/** Side peeks sit this many px further in from the screen edge at rest. */
const SIDE_INSET_PX = 5;

const PEEK_INTERVAL_MS = 5200;
const PEEK_VISIBLE_MS = 3400;

function pickEdge(previous: Edge | null): Edge {
  const choices = previous ? EDGES.filter((edge) => edge !== previous) : EDGES;
  return choices[Math.floor(Math.random() * choices.length)]!;
}

function randomPosition(): number {
  return 20 + Math.random() * 60;
}

function LokiPeekSprite({ peek, leaving, onGone }: { peek: Peek; leaving: boolean; onGone: () => void }) {
  const { width: screenW } = useWindowDimensions();
  // w-[9.6rem] = 153.6px on mobile
  const size = 153.6;
  const isHorizontal = peek.edge === 'bottom' || peek.edge === 'top';

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(1, SPRING_ENTER);
  }, [progress]);

  useEffect(() => {
    if (leaving) {
      progress.value = withSpring(0, SPRING_EXIT, (finished) => {
        if (finished) runOnJS(onGone)();
      });
    }
  }, [leaving, onGone, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const scale = 0.6 + t * 0.4;
    let translateX = 0;
    let translateY = 0;
    let rotate = 0;
    switch (peek.edge) {
      case 'bottom':
        translateY = (1 - t) * size * 1.2 + t * (-0.58 * size + size); // rest: -58% of own height, hidden: +120%
        rotate = (1 - t) * (-10 + peek.wiggle) + t * peek.wiggle * 0.3;
        break;
      case 'top':
        translateY = (1 - t) * (-size * 1.2) + t * (0.58 * size - size);
        rotate = (1 - t) * (10 + peek.wiggle) + t * peek.wiggle * 0.3;
        break;
      case 'left':
        translateX = (1 - t) * (-size * 1.2) + t * (-0.28 * size + SIDE_INSET_PX);
        rotate = (1 - t) * (-12 + peek.wiggle) + t * peek.wiggle * 0.3;
        break;
      case 'right':
        translateX = (1 - t) * (size * 1.2) + t * (0.28 * size - SIDE_INSET_PX);
        rotate = (1 - t) * (12 + peek.wiggle) + t * peek.wiggle * 0.3;
        break;
    }
    return {
      opacity: Math.min(1, t * 1.6),
      transform: [{ translateX }, { translateY }, { scale }, { rotate: `${rotate}deg` }],
    };
  });

  const positionStyle =
    peek.edge === 'bottom'
      ? { bottom: 0, left: (peek.position / 100) * screenW - size / 2 }
      : peek.edge === 'top'
        ? { top: 0, left: (peek.position / 100) * screenW - size / 2 }
        : peek.edge === 'left'
          ? { left: 0, top: `${peek.position}%` as const }
          : { right: 0, top: `${peek.position}%` as const };

  return (
    <Animated.View style={[styles.sprite, { width: size, height: size }, positionStyle, animatedStyle]}>
      <LottieView
        source={require('../assets/web/lokianimation.json')}
        autoPlay
        loop
        style={{ width: '100%', height: '100%' }}
      />
    </Animated.View>
  );
}

/** Port of components/landing/loki-peeker.tsx — Loki peeks from a random screen edge. */
export function LokiPeeker() {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [leaving, setLeaving] = useState(false);
  const lastEdgeRef = useRef<Edge | null>(null);

  const spawnPeek = useCallback(() => {
    const edge = pickEdge(lastEdgeRef.current);
    lastEdgeRef.current = edge;
    setLeaving(false);
    setPeek({
      id: Date.now(),
      edge,
      position: randomPosition(),
      wiggle: (Math.random() - 0.5) * 14,
    });
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      spawnPeek();

      hideTimer = setTimeout(() => {
        if (cancelled) return;
        setLeaving(true);
      }, PEEK_VISIBLE_MS);

      cycleTimer = setTimeout(runCycle, PEEK_INTERVAL_MS);
    };

    const startTimer = setTimeout(runCycle, 600);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(hideTimer);
      clearTimeout(cycleTimer);
    };
  }, [spawnPeek]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {peek ? (
        <LokiPeekSprite
          key={peek.id}
          peek={peek}
          leaving={leaving}
          onGone={() => setPeek(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
    overflow: 'hidden',
  },
  sprite: {
    position: 'absolute',
  },
});
