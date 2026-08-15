import React from 'react';
import { TextInput, StyleSheet, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { colors, radius, fonts, whiteAlpha } from '../../lib/theme';

/**
 * 1:1 port of components/ui/input.tsx (mobile breakpoint):
 * h-8 rounded-md border border-input dark:bg-input/30 px-3 text-sm.
 */
export const Input = React.forwardRef<TextInput, TextInputProps & { style?: StyleProp<TextStyle> }>(
  function Input({ style, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.foreground}
        {...props}
        style={[styles.input, style]}
      />
    );
  }
);

const styles = StyleSheet.create({
  input: {
    height: 32,
    width: '100%',
    minWidth: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: whiteAlpha(0.048), // dark:bg-input/30
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
});
