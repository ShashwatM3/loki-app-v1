import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MessagesSquare, Map, Bookmark, Share2, type LucideIcon } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius } from '../../lib/theme';

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MessagesSquare,
    title: 'Tell Loki the vibe',
    body: 'Ask in plain language — "chill cafe to work from", "date-night dinner under 200 AED", "late-night spot in JBR". Loki understands the occasion, budget, and mood.',
  },
  {
    icon: Map,
    title: 'Get curated spots on a map',
    body: "Loki returns a short, ranked list of real Dubai venues — cover photo, rating, price, distance, and whether they're open — laid out on an interactive map so you can plan around your area.",
  },
  {
    icon: Bookmark,
    title: 'Save spots into collections',
    body: 'Bookmark the places you love into themed collections — "brunch spots", "bring the parents", "weekend list" — so your go-to list is always one tap away.',
  },
  {
    icon: Share2,
    title: 'Share plans with friends',
    body: 'Send a collection to the group chat and decide together. Everyone sees the same curated spots, so making plans in Dubai actually gets easier.',
  },
];

const faqs = [
  {
    q: 'Which city does Loki cover?',
    a: 'Loki is focused on Dubai — cafes, restaurants, bars, activities, and hidden gems across the city, with new places added constantly.',
  },
  {
    q: 'How does Loki pick its recommendations?',
    a: 'Loki only recommends real, vetted venues from its Dubai database, ranked by how well they match your specific ask — vibe, budget, occasion, and location — rather than generic popularity.',
  },
  {
    q: 'Is Loki free to use?',
    a: "Yes — you can start discovering spots and building collections for free. Just open the app and tell Loki what you're in the mood for.",
  },
];

/** 1:1 port of app/how-it-works/page.tsx. */
export default function HowItWorksScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.section, { paddingTop: insets.top + 80, paddingBottom: 48 }]}>
        <Text style={styles.eyebrow}>HOW IT WORKS</Text>
        <Text style={styles.heroTitle}>From "where should we go?" to booked in under a minute.</Text>
        <Text style={styles.heroBody}>
          Loki turns the endless scroll of finding somewhere to go in Dubai into a quick chat with a
          friend who already knows the city. Here's how it works.
        </Text>
      </View>

      {/* Steps */}
      <View style={[styles.section, { paddingBottom: 56 }]}>
        <View style={{ gap: 24 }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIcon}>
                    <Icon size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.stepNumber}>STEP {i + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.mutedBand}>
        <View style={[styles.section, { paddingVertical: 56 }]}>
          <Text style={styles.sectionTitle}>Frequently asked questions</Text>
          <View style={{ marginTop: 32, gap: 24 }}>
            {faqs.map((f) => (
              <View key={f.q}>
                <Text style={styles.faqQuestion}>{f.q}</Text>
                <Text style={styles.faqAnswer}>{f.a}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={[styles.section, { paddingVertical: 56, gap: 16 }]}>
        <View>
          <Text style={styles.sectionTitle}>Find your next spot now.</Text>
          <Text style={styles.ctaBody}>
            Learn more{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('About')}>
              about Loki
            </Text>{' '}
            or jump straight in.
          </Text>
        </View>
        <Button size="lg" style={{ alignSelf: 'flex-start' }} onPress={() => navigation.navigate('Landing')}>
          Open Loki
        </Button>
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
  stepCard: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232,232,232,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 0.6,
    color: colors.mutedForeground,
  },
  stepTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  stepBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  mutedBand: {
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.2)',
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  faqAnswer: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  ctaBody: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
