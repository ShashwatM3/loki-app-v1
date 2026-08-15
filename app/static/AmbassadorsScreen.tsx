import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, fonts, radius, shadows } from '../../lib/theme';

type Ambassador = {
  name: string;
  university: string;
  question: string;
  answer: string;
  instagramHandle: string;
};

const ambassadors: Ambassador[] = [
  {
    name: 'Nyla',
    university: 'Canadian University Dubai',
    question: 'Go-to karak place in Dubai?',
    answer: 'Al Ijazah Karak',
    instagramHandle: 'nyl4a',
  },
  {
    name: 'Jade',
    university: 'University of Wollongong, Dubai',
    question: 'Best non-food recommendation in Dubai?',
    answer: 'Hub Zero',
    instagramHandle: 'jadesabug',
  },
  {
    name: 'Manav',
    university: 'University of Birmingham Dubai',
    question: 'Role in GC when planning a hangout?',
    answer: 'The Procrastinator',
    instagramHandle: 'manavgupta2007',
  },
];

/** 1:1 port of app/ambassadors/page.tsx. */
export default function AmbassadorsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 64,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ gap: 32, paddingBottom: 16 }}>
        <View>
          <Text style={styles.eyebrow}>GROWTH TEAM</Text>
          <Text style={styles.title}>Loki Community Ambassadors</Text>
          <Text style={styles.body}>
            Our ambassadors are trusted student leaders who represent their universities and advance
            the Loki mission in real life. Across campus circles and city-wide communities, they
            help people discover where to go, who to go with, and how to build memorable social
            experiences through Loki.
          </Text>
        </View>

        <View style={styles.categoryBox}>
          <Text style={styles.categoryLabel}>CATEGORY</Text>
          <Text style={styles.categoryValue}>Growth</Text>
        </View>
      </View>

      {/* Cards */}
      <View style={{ gap: 24, paddingVertical: 48 }}>
        {ambassadors.map((ambassador) => (
          <View key={ambassador.name} style={styles.card}>
            <View style={styles.cardImageWrap}>
              <Image
                source={require('../../assets/web/ambassador.png')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardEyebrow}>GROWTH AMBASSADOR</Text>
              <Text style={styles.cardName}>{ambassador.name}</Text>
              <Text style={styles.cardUniversity}>{ambassador.university}</Text>
              <View style={styles.cardQa}>
                <Text style={styles.cardQuestion}>Q: {ambassador.question.toUpperCase()}</Text>
                <Text style={styles.cardAnswer}>A: {ambassador.answer}</Text>
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      `https://instagram.com/${ambassador.instagramHandle.replace(/^@/, '')}`
                    )
                  }
                >
                  <Text style={styles.cardHandle}>
                    @{ambassador.instagramHandle.replace(/^@/, '')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.16,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    lineHeight: 31,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  body: {
    marginTop: 24,
    maxWidth: 768,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  categoryBox: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryLabel: {
    fontSize: 12,
    letterSpacing: 1.68,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  categoryValue: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: fonts.sansMedium,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
  },
  cardBody: {
    padding: 20,
    gap: 12,
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 1.54,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  cardName: {
    fontSize: 20,
    lineHeight: 20,
    fontFamily: fonts.sansMedium,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  cardUniversity: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  cardQa: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  cardQuestion: {
    fontSize: 12,
    letterSpacing: 1.44,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  cardAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(232,232,232,0.9)',
    fontFamily: fonts.sans,
  },
  cardHandle: {
    paddingTop: 4,
    fontSize: 14,
    color: '#00bc7d', // text-chart-2
    fontFamily: fonts.sans,
  },
});
