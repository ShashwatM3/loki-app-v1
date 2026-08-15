import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../lib/theme';

/**
 * Port of components/ui/sheet.tsx (side="right"): full-height panel sliding in
 * from the right over a bg-black/50 overlay. The app always uses it with
 * `w-full max-w-full`, i.e. a full-width takeover.
 */
export function Sheet({
  open,
  onOpenChange,
  children,
  contentStyle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { width: screenW } = useWindowDimensions();
  const [visible, setVisible] = useState(open);
  const translateX = useRef(new Animated.Value(screenW)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, translateX]);

  const animateOut = useCallback(
    (after?: () => void) => {
      Animated.parallel([
        Animated.timing(translateX, { toValue: screenW, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => after?.());
    },
    [overlayOpacity, screenW, translateX]
  );

  useEffect(() => {
    if (open) {
      setVisible(true);
      translateX.setValue(screenW);
      requestAnimationFrame(animateIn);
    } else if (visible) {
      animateOut(() => setVisible(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => onOpenChange(false)}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} />
        </Animated.View>
        <Animated.View style={[styles.content, { transform: [{ translateX }] }, contentStyle]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
});
