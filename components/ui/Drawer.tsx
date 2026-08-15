import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, radius, fonts } from '../../lib/theme';

/**
 * Port of components/ui/drawer.tsx (vaul bottom drawer):
 * overlay bg-black/50; content bg-background rounded-t-lg border-t max-h-[80vh]
 * with the muted 100x8 handle. `showHandle={false}` switches to the full-screen
 * variant used by the collections detail drawer (inset-0, no radius).
 */
export function Drawer({
  open,
  onOpenChange,
  children,
  showHandle = true,
  dismissible = true,
  heightPct,
  contentStyle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showHandle?: boolean;
  dismissible?: boolean;
  /** Fixed content height as a fraction of the screen (e.g. 0.85 for h-[85vh]). */
  heightPct?: number;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { height: screenH } = useWindowDimensions();
  const [visible, setVisible] = useState(open);
  const translateY = useRef(new Animated.Value(screenH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const fullScreen = !showHandle && heightPct == null;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, translateY]);

  const animateOut = useCallback(
    (after?: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: screenH, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => after?.());
    },
    [overlayOpacity, screenH, translateY]
  );

  useEffect(() => {
    if (open) {
      setVisible(true);
      translateY.setValue(screenH);
      requestAnimationFrame(animateIn);
    } else if (visible) {
      animateOut(() => setVisible(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => {
    if (!dismissible) return;
    onOpenChange(false);
  }, [dismissible, onOpenChange]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 110 || g.vy > 1.1) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 300,
            damping: 30,
            mass: 1,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
        <Animated.View
          style={[
            styles.content,
            fullScreen
              ? styles.fullScreen
              : {
                  maxHeight: screenH * 0.8,
                  ...(heightPct != null ? { height: screenH * heightPct, maxHeight: screenH * Math.max(heightPct, 0.8) } : null),
                },
            { transform: [{ translateY }] },
            contentStyle,
          ]}
        >
          {showHandle ? (
            <View {...panResponder.panHandlers} style={styles.handleZone}>
              <View style={styles.handle} />
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function DrawerHeader({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function DrawerTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function DrawerDescription({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fullScreen: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    maxHeight: '100%',
  },
  handleZone: {
    paddingBottom: 4,
  },
  handle: {
    backgroundColor: colors.muted,
    alignSelf: 'center',
    marginTop: 16,
    height: 8,
    width: 100,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'column',
    gap: 6,
    padding: 16,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.sans,
  },
});
