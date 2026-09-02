import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Compass, Heart, MapPin, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius, whiteAlpha } from '../../lib/theme';

const values: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MapPin,
    title: 'Real spots, really vetted',
    body: 'Every place on Loki is a real Dubai venue. We surface hidden gems, local favourites, and new openings — never generic, touristy filler.',
  },
  {
    icon: Heart,
    title: 'Built for how you actually decide',
    body: "You don't want a list of 200 restaurants. You want the one that fits the vibe, the budget, and the moment. Loki recommends like a friend, not a directory.",
  },
  {
    icon: Sparkles,
    title: 'A city that keeps up with you',
    body: 'Dubai moves fast. Loki is always growing — new cafes, pop-ups, and late-night spots get added so your go-to list never goes stale.',
  },
];

/** 1:1 port of app/about/page.tsx. */
export default function AboutScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.section, { paddingTop: insets.top + 80, paddingBottom: 56 }]}>
        <Text style={styles.eyebrow}>ABOUT LOKI</Text>
        <Text style={styles.heroTitle}>The local friend who always knows where to go in Dubai.</Text>
        <Text style={styles.heroBody}>
          Loki is a discovery app for Dubai. Instead of endless searching and second-guessing, you
          get the best places to eat, drink, and hang out — the way you would if your most clued-in
          friend just told you where to go. From hidden-gem cafes to the spot for a birthday dinner,
          Loki (lowkey) knows.
        </Text>
        <View style={styles.heroActions}>
          <Button size="lg" onPress={() => navigation.navigate('Landing')}>
            Explore Dubai spots
          </Button>
          <Button size="lg" variant="outline" onPress={() => navigation.navigate('Landing', { scrollTo: 'how' })}>
            See how it works
          </Button>
        </View>
      </View>

      {/* Mission */}
      <View style={styles.mutedBand}>
        <View style={[styles.section, { paddingVertical: 56 }]}>
          <Text style={styles.sectionTitle}>Our mission</Text>
          <Text style={styles.sectionBody}>
            Dubai has thousands of incredible places — but finding the right one for the moment is
            harder than it should be. Reviews are gamed, feeds are cluttered, and the best spots
            often stay word-of-mouth. Loki exists to fix that: to make discovering the city feel
            effortless, personal, and genuinely good. We are building the most trusted way for a new
            generation to explore Dubai.
          </Text>
        </View>
      </View>

      {/* Values */}
      <View style={[styles.section, { paddingVertical: 56 }]}>
        <Text style={styles.sectionTitle}>What makes Loki different</Text>
        <View style={{ marginTop: 32, gap: 24 }}>
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <View key={value.title} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Icon size={20} color={colors.primary} />
                </View>
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueBody}>{value.body}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <View style={[styles.mutedBand, { borderBottomWidth: 0 }]}>
        <View style={[styles.section, { paddingVertical: 56, gap: 16 }]}>
          <View>
            <View style={styles.ctaTitleRow}>
              <Compass size={24} color={colors.primary} />
              <Text style={styles.ctaTitle}>Ready to find your next spot?</Text>
            </View>
            <Text style={styles.ctaBody}>Start discovering the best of Dubai with Loki today.</Text>
          </View>
          <Button size="lg" style={{ alignSelf: 'flex-start' }} onPress={() => navigation.navigate('Landing')}>
            Open Loki
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  heroTitle: {
    marginTop: 16,
    maxWidth: 768,
    fontSize: 36,
    lineHeight: 43,
    fontFamily: fonts.displayBold,
    letterSpacing: -0.9,
    color: colors.foreground,
  },
  heroBody: {
    marginTop: 24,
    maxWidth: 672,
    fontSize: 18,
    lineHeight: 29,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  heroActions: {
    marginTop: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mutedBand: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.2)', // bg-muted/20
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  sectionBody: {
    marginTop: 16,
    maxWidth: 768,
    fontSize: 18,
    lineHeight: 29,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  valueCard: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 24,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232,232,232,0.15)', // bg-primary/15
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  valueBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  ctaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaTitle: {
    flexShrink: 1,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  ctaBody: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
