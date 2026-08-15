import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radius, fonts } from '../../lib/theme';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Port of components/ui/badge.tsx: inline-flex items-center rounded-md border
 * px-2 py-0.5 text-xs font-medium.
 */
export function Badge({
  children,
  variant = 'default',
  style,
  textStyle,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const variants: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: { backgroundColor: colors.primary, borderColor: 'transparent' },
      text: { color: colors.primaryForeground },
    },
    secondary: {
      container: { backgroundColor: colors.secondary, borderColor: 'transparent' },
      text: { color: colors.secondaryForeground },
    },
    destructive: {
      container: { backgroundColor: 'rgba(240,76,85,0.6)', borderColor: 'transparent' },
      text: { color: '#ffffff' },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderColor: colors.border },
      text: { color: colors.foreground },
    },
  };
  const v = variants[variant];
  return (
    <View style={[styles.base, v.container, style]}>
      {typeof children === 'string' ? (
        <Text numberOfLines={1} style={[styles.text, v.text, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
  },
});
