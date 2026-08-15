import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, fonts, whiteAlpha } from '../../lib/theme';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * 1:1 port of components/ui/button.tsx (mobile breakpoint values):
 * base = rounded-md text-xs font-medium gap-1.5; sizes h-8/h-7/h-9.
 */
export function Button({
  children,
  variant = 'default',
  size = 'default',
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; pressed: ViewStyle }> = {
    default: {
      container: { backgroundColor: colors.primary },
      text: { color: colors.primaryForeground },
      pressed: { backgroundColor: 'rgba(232,232,232,0.9)' },
    },
    destructive: {
      container: { backgroundColor: 'rgba(240,76,85,0.6)' }, // dark:bg-destructive/60
      text: { color: '#ffffff' },
      pressed: { backgroundColor: 'rgba(240,76,85,0.54)' },
    },
    outline: {
      container: {
        borderWidth: 1,
        borderColor: colors.input, // dark:border-input
        backgroundColor: whiteAlpha(0.048), // dark:bg-input/30
      },
      text: { color: colors.foreground },
      pressed: { backgroundColor: whiteAlpha(0.08) }, // dark:hover:bg-input/50
    },
    secondary: {
      container: { backgroundColor: colors.secondary },
      text: { color: colors.secondaryForeground },
      pressed: { backgroundColor: 'rgba(16,16,18,0.8)' },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.foreground },
      pressed: { backgroundColor: 'rgba(20,21,22,0.5)' }, // dark:hover:bg-accent/50
    },
    link: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.primary, textDecorationLine: 'underline' },
      pressed: {},
    },
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    default: { height: 32, paddingHorizontal: 12 },
    sm: { height: 28, borderRadius: radius.md, paddingHorizontal: 10 },
    lg: { height: 36, borderRadius: radius.md, paddingHorizontal: 16 },
    icon: { height: 32, width: 32, paddingHorizontal: 0 },
    'icon-sm': { height: 28, width: 28, paddingHorizontal: 0 },
    'icon-lg': { height: 36, width: 36, paddingHorizontal: 0 },
  };

  const v = variantStyles[variant];
  const fontSize = size === 'lg' ? 14 : 12;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        v.container,
        pressed && !disabled && v.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={StyleSheet.flatten([v.text, textStyle])?.color ?? colors.foreground} /> : null}
      {typeof children === 'string' ? (
        <Text numberOfLines={1} style={[styles.text, { fontSize }, v.text, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/** Text styled like button label — for composing custom button children rows. */
export function ButtonText({
  children,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  style?: StyleProp<TextStyle>;
}) {
  const color =
    variant === 'default'
      ? colors.primaryForeground
      : variant === 'destructive'
        ? '#ffffff'
        : colors.foreground;
  return (
    <Text numberOfLines={1} style={[styles.text, { color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
  },
  text: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
