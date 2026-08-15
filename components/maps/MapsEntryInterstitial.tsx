import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { colors, fonts, radius, tw } from '../../lib/theme';

type MapsEntryInterstitialProps = {
  onEnter: () => void;
  onBack?: () => void;
};

/** 1:1 port of components/maps/maps-entry-interstitial.tsx. */
export function MapsEntryInterstitial({ onEnter, onBack }: MapsEntryInterstitialProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconTile}>
        <MapPin size={28} color={tw.rose500} />
      </View>
      <Text style={styles.title}>You are now entering maps</Text>
      <Text style={styles.subtitle}>
        Explore Dubai spots around you, filter by vibe or budget, and jump to any area when you know
        where you want to go.
      </Text>
      <View style={styles.actions}>
        <Button size="lg" style={{ width: '100%' }} onPress={onEnter}>
          Let's go
        </Button>
        {onBack ? (
          <Button size="lg" variant="ghost" style={{ width: '100%' }} onPress={onBack}>
            Not now
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  iconTile: {
    marginBottom: 24,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
  },
  title: {
    maxWidth: 384,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 384,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  actions: {
    marginTop: 32,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
});
