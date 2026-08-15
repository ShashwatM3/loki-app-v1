import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCounterStore } from '../../lib/store';
import { colors, fonts, radius, shadows } from '../../lib/theme';

/** 1:1 port of app/dashboard/plans/page.tsx. */
export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const userData = useCounterStore((state) => state.userData);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 48,
      }}
    >
      <View style={{ gap: 40, maxWidth: 768, alignSelf: 'center', width: '100%' }}>
        <View style={{ gap: 8, alignItems: 'center' }}>
          <Text style={styles.pageTitle}>Your Plans</Text>
          <Text style={styles.pageSubtitle}>
            All your upcoming group plans, ideas, and must-do bucket list items in one place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Plans</Text>
          <View style={{ gap: 24 }}>
            {[1, 2].map((plan, idx) => (
              <View key={idx} style={styles.planRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>Plan Title {plan}</Text>
                  <Text style={styles.planWith}>With: Friends Group {plan}</Text>
                  <Text style={styles.planDate}>Date: 2024-0{plan}-20</Text>
                </View>
                <Pressable style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved Ideas</Text>
          <View style={{ gap: 16 }}>
            <View style={styles.ideaCard}>
              <Text style={styles.ideaName}>Skydiving Adventure</Text>
              <Text style={styles.ideaMeta}>Added on 2024-04-20 · For: Bucket List</Text>
            </View>
            <View style={styles.ideaCard}>
              <Text style={styles.ideaName}>Desert Safari</Text>
              <Text style={styles.ideaMeta}>Added on 2024-03-18 · For: Group Trip</Text>
            </View>
          </View>
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Pressable style={styles.addIdeaBtn}>
              <Text style={styles.addIdeaBtnText}>Add a New Idea</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.signedInAs}>Signed in as {userData.email || 'Guest'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    color: colors.foreground,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 24,
    gap: 16,
    ...shadows.sm,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  planWith: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  planDate: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  viewBtnText: {
    fontSize: 14,
    color: colors.primaryForeground,
    fontFamily: fonts.sans,
  },
  ideaCard: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    padding: 16,
  },
  ideaName: {
    fontSize: 16,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  ideaMeta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  addIdeaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  addIdeaBtnText: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  signedInAs: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
});
