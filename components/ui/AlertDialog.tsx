import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { colors, fonts } from '../../lib/theme';

/**
 * Port of components/ui/alert-dialog.tsx — a Dialog without the corner close
 * button plus a Cancel / Action footer.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancel',
  actionLabel,
  onAction,
  actionStyle,
  actionTextStyle,
  cancelStyle,
  cancelTextStyle,
  contentStyle,
  titleStyle,
  descriptionStyle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  actionLabel: string;
  onAction: () => void;
  actionStyle?: StyleProp<ViewStyle>;
  actionTextStyle?: StyleProp<TextStyle>;
  cancelStyle?: StyleProp<ViewStyle>;
  cancelTextStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} showCloseButton={false} contentStyle={contentStyle}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {description ? <Text style={[styles.description, descriptionStyle]}>{description}</Text> : null}
      </View>
      <View style={styles.footer}>
        <Button variant="outline" onPress={() => onOpenChange(false)} style={cancelStyle} textStyle={cancelTextStyle}>
          {cancelLabel}
        </Button>
        <Button
          onPress={() => {
            onAction();
            onOpenChange(false);
          }}
          style={actionStyle}
          textStyle={actionTextStyle}
        >
          {actionLabel}
        </Button>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
});
