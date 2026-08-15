import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../lib/theme';

/**
 * Port of components/ui/animated-gradient-text.tsx — text filled with a
 * flowing #ffaa40 → #9c40ff gradient (the `animate-gradient` keyframes).
 */
export function AnimatedGradientText({
  children,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  style,
}: {
  children: React.ReactNode;
  colorFrom?: string;
  colorTo?: string;
  style?: StyleProp<TextStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -120, 0],
  });

  return (
    <MaskedView
      maskElement={
        <View style={styles.center}>
          <Text style={[styles.text, style]}>{children}</Text>
        </View>
      }
    >
      {/* Invisible copy defines the masked area's layout size */}
      <Text style={[styles.text, style, styles.hidden]}>{children}</Text>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }, styles.gradientWrap]}>
        <LinearGradient
          colors={[colorFrom, colorTo, colorFrom, colorTo, colorFrom]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#000',
  },
  hidden: {
    opacity: 0,
  },
  gradientWrap: {
    left: -240,
    right: -240,
  },
  gradient: {
    flex: 1,
  },
});
