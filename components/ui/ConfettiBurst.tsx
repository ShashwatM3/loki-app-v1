import React, { useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ffffff'];

interface Piece {
  id: number;
  x: number;
  rotate: number;
  delay: number;
  duration: number;
  color: string;
  drift: number;
}

function ConfettiPiece({ piece, height }: { piece: Piece; height: number }) {
  const progress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: piece.duration * 1000,
      delay: piece.delay * 1000,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [piece.delay, piece.duration, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.1 * height, 1.15 * height],
  });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${piece.rotate}deg`, `${piece.rotate + 360}deg`],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.6, 0.85, 1],
    outputRange: [0, 1, 1, 0.9, 0],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${piece.x}%`,
          backgroundColor: piece.color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    />
  );
}

/** 1:1 port of ui/confetti-burst.tsx — confetti rain for the winner reveal. */
export function ConfettiBurst({ count = 90 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        drift: (Math.random() - 0.5) * 120,
      }))
    );
  }, [count]);

  return (
    <View
      pointerEvents="none"
      style={styles.container}
      onLayout={(e) => setHeight(Math.max(1, e.nativeEvent.layout.height))}
    >
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} piece={p} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    height: 10,
    width: 6,
    borderRadius: 1,
  },
});
