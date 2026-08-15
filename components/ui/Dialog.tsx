import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, fonts, shadows } from '../../lib/theme';

/**
 * Port of components/ui/dialog.tsx:
 * overlay bg-black/50; content bg-background w-[calc(100%-1.5rem)] rounded-md
 * border p-4 gap-3 shadow-lg, centered.
 */
export function Dialog({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
  contentStyle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlayWrap}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} />
        <View style={[styles.content, contentStyle]}>
          {children}
          {showCloseButton ? (
            <Pressable
              accessibilityLabel="Close"
              onPress={() => onOpenChange(false)}
              style={styles.close}
              hitSlop={8}
            >
              <X size={16} color={colors.foreground} opacity={0.7} />
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DialogHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function DialogTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function DialogDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  overlayWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  content: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
    ...shadows.lg,
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  header: {
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
