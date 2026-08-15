import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { BROWSE_VIBES, type BrowseVibeId } from '../../lib/browseVibes';
import { colors, fonts, radius } from '../../lib/theme';

/** 1:1 port of app/dashboard/landing-variation/vibes/page.tsx. */
export default function VibesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<BrowseVibeId | null>(null);

  const applyVibe = () => {
    if (!selectedId) return;
    navigation.navigate('Dashboard', {
      screen: 'Browse',
      params: { vibe: selectedId },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 20,
          paddingBottom: 96,
        }}
      >
        <Pressable onPress={() => navigation.navigate('Dashboard', { screen: 'Browse' })} style={styles.backRow}>
          <ArrowLeft size={14} color={colors.mutedForeground} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Loki</Text>
          <Text style={styles.title}>What's the vibe tonight?</Text>
          <Text style={styles.subtitle}>Pick one, we will find the spots.</Text>
        </View>

        <View style={{ gap: 10 }}>
          {BROWSE_VIBES.map((vibe) => {
            const isSelected = selectedId === vibe.id;
            return (
              <Pressable
                key={vibe.id}
                onPress={() => setSelectedId(vibe.id)}
                style={[styles.vibeCard, isSelected ? styles.vibeCardSelected : null]}
              >
                <View style={styles.checkWrap}>
                  {isSelected ? (
                    <View style={styles.checkSelected}>
                      <Check size={12} color={colors.primaryForeground} strokeWidth={2.5} />
                    </View>
                  ) : (
                    <View style={styles.checkEmpty} />
                  )}
                </View>
                <View style={{ minWidth: 0, paddingRight: 2 }}>
                  <Text style={styles.vibeLabel}>{vibe.label}</Text>
                  {vibe.blurb ? (
                    <Text numberOfLines={2} style={styles.vibeBlurb}>
                      {vibe.blurb}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            disabled={!selectedId}
            onPress={applyVibe}
            style={styles.applyBtn}
            textStyle={styles.applyBtnText}
          >
            Apply
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  eyebrow: {
    marginBottom: 2,
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: colors.mutedForeground,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.45,
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 4,
    maxWidth: 672,
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  vibeCard: {
    position: 'relative',
    minHeight: 76,
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 36,
  },
  vibeCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkWrap: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  checkSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'rgba(3,4,5,0.8)',
    opacity: 0.65,
  },
  vibeLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.35,
    color: colors.foreground,
  },
  vibeBlurb: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  applyBtn: {
    height: 40,
    width: '100%',
    borderRadius: radius.md,
  },
  applyBtnText: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
  },
});
