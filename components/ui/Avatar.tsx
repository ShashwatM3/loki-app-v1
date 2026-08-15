import React, { useState } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts } from '../../lib/theme';

/**
 * Port of components/ui/avatar.tsx — circular image with a fallback that shows
 * initials (or any node) when there is no photo / the photo fails to load.
 */
export function Avatar({
  size = 32,
  uri,
  fallback,
  fallbackColor = colors.muted,
  fallbackTextStyle,
  style,
}: {
  size?: number;
  uri?: string | null;
  fallback?: React.ReactNode;
  fallbackColor?: string;
  fallbackTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        !showImage && { backgroundColor: fallbackColor },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : typeof fallback === 'string' ? (
        <Text style={[styles.fallbackText, { fontSize: Math.max(10, size * 0.32) }, fallbackTextStyle]}>
          {fallback}
        </Text>
      ) : (
        fallback ?? null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontFamily: fonts.sansBold,
  },
});
