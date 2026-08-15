import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { ArrowRight, Bookmark, Heart, MoreHorizontal, Send } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { LandingGlow } from '../../components/ui/glows';
import { LokiPeeker } from '../../components/LokiPeeker';
import { EditorialLanding } from './EditorialLanding';
import { useCounterStore } from '../../lib/store';
import { DUBAI_SPOTS } from '../../lib/dubaiSpots';
import { colors, fonts, radius, tw } from '../../lib/theme';

type LandingVariant = 'original' | 'editorial';

function LandingVariantToggle({
  value,
  onChange,
  top,
}: {
  value: LandingVariant;
  onChange: (value: LandingVariant) => void;
  top: number;
}) {
  return (
    <View style={[styles.variantToggle, { top }]}>
      {(['original', 'editorial'] as const).map((variant) => (
        <Pressable
          key={variant}
          onPress={() => onChange(variant)}
          style={[styles.variantBtn, value === variant ? styles.variantBtnActive : null]}
        >
          <Text
            style={[
              styles.variantBtnText,
              value === variant ? styles.variantBtnTextActive : null,
            ]}
          >
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Draggable Instagram-style spot card (port of ui/draggable-card.tsx + SpotCardContent). */
function SpotCard({
  title,
  handle,
  image,
  rotate,
  width,
}: {
  title: string;
  handle: string;
  image: string;
  rotate: string;
  width: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          tx.value += e.changeX;
          ty.value += e.changeY;
        })
        .onEnd((e) => {
          tx.value = withSpring(tx.value + e.velocityX * 0.1, { stiffness: 50, damping: 15, mass: 0.8 });
          ty.value = withSpring(ty.value + e.velocityY * 0.1, { stiffness: 50, damping: 15, mass: 0.8 });
        }),
    [tx, ty]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.spotCard, { width }, animStyle]}>
        {/* header */}
        <View style={styles.spotCardHeader}>
          <View style={styles.spotAvatarRing}>
            <View style={styles.spotAvatarInner}>
              <Text style={styles.spotAvatarLetter}>{handle.slice(0, 1).toUpperCase()}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.spotHandle}>
            {handle}
          </Text>
          <MoreHorizontal size={12} color={colors.mutedForeground} style={{ marginLeft: 'auto' }} />
        </View>

        <Image source={{ uri: image }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />

        <View style={styles.spotActions}>
          <Heart size={14} color={colors.foreground} />
          <Send size={12} color={colors.foreground} />
          <Bookmark size={14} color={colors.foreground} style={{ marginLeft: 'auto' }} />
        </View>

        <Text numberOfLines={2} style={styles.spotCaption}>
          <Text style={{ fontFamily: fonts.sansSemiBold }}>{title}</Text>
          <Text style={{ color: colors.mutedForeground }}> · Dubai</Text>
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

/** 1:1 port of app/page.tsx — the landing page with its original/editorial variant toggle. */
export default function LandingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const userData = useCounterStore((state) => state.userData);
  const [variant, setVariant] = useState<LandingVariant>('original');

  function goTo(screen: string, params?: object) {
    if (userData.email) {
      navigation.navigate(screen, params);
    } else {
      navigation.navigate('Authentication', { returnTo: screen, returnToParams: params });
    }
  }

  function goToApp() {
    goTo('Dashboard', { screen: 'Browse' });
  }

  // 3-col grid of spot cards: max-w-[21rem]=336 with gap-3 (12).
  const gridWidth = Math.min(width - 32, 336);
  const cardWidth = (gridWidth - 24) / 3;

  return (
    <View style={styles.root}>
      {variant === 'editorial' ? (
        <EditorialLanding
          onGetStarted={goToApp}
          onSignIn={() => navigation.navigate('Authentication')}
        />
      ) : (
        <View style={[styles.original, { paddingTop: insets.top }]}>
          <LandingGlow />
          <LokiPeeker />

          {/* Nav */}
          <View style={styles.nav}>
            <View style={styles.navLeft}>
              <Image
                source={require('../../assets/web/logo2.png')}
                style={{ height: 28, width: 28 }}
                contentFit="contain"
              />
              <Text style={styles.navLogoText}>loki.</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Authentication')} style={styles.signInBtn}>
              <Text style={styles.signInBtnText}>Sign in</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.main}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.heroTitle}>Loki</Text>
              <Text style={styles.heroSubtitle}>Where to go in Dubai</Text>
              <View style={{ marginTop: 16 }}>
                <Button size="lg" onPress={goToApp}>
                  <Text style={styles.getStartedText}>Get started</Text>
                  <ArrowRight size={16} color={colors.primaryForeground} />
                </Button>
              </View>
            </View>

            {/* Draggable spot cards grid */}
            <View style={[styles.spotGrid, { width: gridWidth }]}>
              {DUBAI_SPOTS.map((spot) => (
                <SpotCard
                  key={spot.title}
                  title={spot.title}
                  handle={spot.handle}
                  image={spot.image}
                  rotate={spot.rotate}
                  width={cardWidth}
                />
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
            {['Cafés', 'Experiences', 'Bars', 'Sports', 'Markets', 'Desert'].map((label) => (
              <Text key={label} style={styles.footerChip}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      )}

      <LandingVariantToggle value={variant} onChange={setVariant} top={insets.top + 10} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  original: {
    flex: 1,
    backgroundColor: colors.background,
  },
  variantToggle: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 70,
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  variantBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  variantBtnActive: {
    backgroundColor: '#fff',
  },
  variantBtnText: {
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    color: 'rgba(255,255,255,0.55)',
  },
  variantBtnTextActive: {
    color: '#000',
  },
  nav: {
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingLeft: 12,
    paddingRight: 20,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogoText: {
    fontSize: 20,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  signInBtn: {
    height: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(166,132,255,0.35)',
    backgroundColor: 'rgba(142,81,255,0.13)',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgb(139,92,246)',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  signInBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  main: {
    zIndex: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  heroTitle: {
    fontSize: 60,
    lineHeight: 62,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    letterSpacing: -3,
    color: colors.foreground,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 8,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  getStartedText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.primaryForeground,
  },
  spotGrid: {
    marginTop: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignSelf: 'center',
  },
  spotCard: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: tw.neutral950,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  spotCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  spotAvatarRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    padding: 1,
    backgroundColor: tw.fuchsia500,
  },
  spotAvatarInner: {
    flex: 1,
    borderRadius: 9,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotAvatarLetter: {
    fontSize: 8,
    fontFamily: fonts.sansBold,
    color: colors.foreground,
  },
  spotHandle: {
    flexShrink: 1,
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  spotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  spotCaption: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    fontSize: 10,
    lineHeight: 13,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  footer: {
    zIndex: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 20,
    rowGap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footerChip: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
