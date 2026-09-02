import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trophy, Check, Users, RotateCcw, Sparkles, Clock } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ConfettiBurst } from '../ui/ConfettiBurst';
import { getGradientFromString, parseCssGradient } from '../../lib/utils';
import { placeMetaLine } from '../../lib/placeBlurb';
import { CollectionSwipeDeck, type Vote } from './CollectionSwipeDeck';
import {
  collectionParticipants,
  tallyVotes,
  placeKey,
  type CollectionVotes,
  type LeaderboardEntry,
  type Participant,
} from '../../lib/collectionVoting';
import { persistVote, removeVote, clearVoterVotes } from '../../lib/collectionPersistence';
import { colors, fonts, radius, tw } from '../../lib/theme';
import type { CollectionType, Place } from '../../lib/types';

const AVATAR_COLORS = ['#ff2056', '#2b7fff', '#00bc7d', '#fe9a00', '#ad46ff', '#00a6f4'];

const getAvatarColor = (text: string) => {
  let hash = 0;
  const str = text || 'guest';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

function ParticipantChip({ p, done }: { p: Participant; done: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View>
        <Avatar
          size={44}
          uri={p.photo}
          fallback={getInitials(p.name === 'You' ? p.id : p.name)}
          fallbackColor={getAvatarColor(p.id)}
          style={[
            styles.participantAvatar,
            done ? { borderColor: tw.emerald400 } : { borderColor: 'rgba(255,255,255,0.1)', opacity: 0.6 },
          ]}
        />
        {done ? (
          <View style={styles.doneBadge}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.participantName}>
        {p.name}
      </Text>
    </View>
  );
}

function WinnerCard({
  place,
  yesCount,
  total,
  label,
}: {
  place: Place;
  yesCount: number;
  total: number;
  label: string;
}) {
  const fallback = parseCssGradient(getGradientFromString(String(place.id ?? place.name)));
  return (
    <View style={styles.winnerCard}>
      <View style={styles.winnerImageWrap}>
        {place.image ? (
          <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <LinearGradient colors={fallback.colors} start={fallback.start} end={fallback.end} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.winnerBadge}>
          <Trophy size={14} color="#000" />
          <Text style={styles.winnerBadgeText}>{label}</Text>
        </View>
        <View style={styles.winnerBottom}>
          <Text style={styles.winnerName}>{place.name}</Text>
          <Text style={styles.winnerMeta}>{placeMetaLine(place)}</Text>
        </View>
      </View>
      <View style={styles.winnerFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Users size={16} color={tw.emerald400} />
          <Text style={styles.winnerYesCount}>{yesCount}</Text>
          <Text style={styles.winnerYesTotal}>/ {total} said yes</Text>
        </View>
        <Sparkles size={16} color={tw.amber300} />
      </View>
    </View>
  );
}

function Leaderboard({ entries, total }: { entries: LeaderboardEntry[]; total: number }) {
  return (
    <View>
      <Text style={styles.leaderboardLabel}>Leaderboard</Text>
      <View style={{ gap: 8 }}>
        {entries.map((entry) => {
          const fallback = parseCssGradient(getGradientFromString(placeKey(entry.place)));
          return (
            <View key={placeKey(entry.place)} style={styles.leaderRow}>
              <View style={[styles.rankCircle, entry.rank === 1 ? styles.rankFirst : styles.rankOther]}>
                <Text style={[styles.rankText, entry.rank === 1 ? { color: '#000' } : { color: tw.neutral400 }]}>
                  {entry.rank}
                </Text>
              </View>
              <View style={styles.leaderImage}>
                {entry.place.image ? (
                  <Image source={{ uri: entry.place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                  <LinearGradient colors={fallback.colors} start={fallback.start} end={fallback.end} style={StyleSheet.absoluteFill} />
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.leaderName}>
                  {entry.place.name}
                </Text>
                <View style={styles.leaderBarTrack}>
                  <LinearGradient
                    colors={[tw.emerald400, tw.emerald500]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.leaderBarFill, { width: `${total ? (entry.yesCount / total) * 100 : 0}%` }]}
                  />
                </View>
              </View>
              <Text style={styles.leaderCount}>
                {entry.yesCount}/{total}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface CollectionDecideSectionProps {
  activeCollection: CollectionType;
  userData: { email: string; name?: string; photo?: string };
  canEdit: boolean;
  setSwipe: (swipe: boolean) => void;
  onBrowse: () => void;
}

/** 1:1 port of app/dashboard/collections/collection-decide.tsx. */
export function CollectionDecideSection({
  activeCollection,
  userData,
  canEdit,
  setSwipe,
  onBrowse,
}: CollectionDecideSectionProps) {
  // De-duplicate: a place added twice would otherwise skew the tally.
  const places = React.useMemo(() => {
    const seen = new Set<string>();
    return (activeCollection.places || []).filter((p) => {
      const key = placeKey(p);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [activeCollection.places]);
  const myId = userData.email;

  const [votes, setVotes] = React.useState<CollectionVotes>(activeCollection.votes || {});
  const [lastVoted, setLastVoted] = React.useState<Place | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Re-seed when a different collection is opened or remote votes change.
  React.useEffect(() => {
    setVotes(activeCollection.votes || {});
  }, [activeCollection.sharedCollectionId, activeCollection.name, activeCollection.votes]);

  const participants = React.useMemo(
    () => collectionParticipants(activeCollection, userData),
    [activeCollection, userData]
  );

  const remaining = React.useMemo(
    () => places.filter((p) => !(votes[myId] || {})[placeKey(p)]),
    [places, votes, myId]
  );
  const iFinished = places.length > 0 && remaining.length === 0;

  const tally = React.useMemo(
    () => tallyVotes({ ...activeCollection, places }, participants, votes),
    [activeCollection, places, participants, votes]
  );

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: tally.totalParticipants ? tally.finishedVoterIds.length / tally.totalParticipants : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, tally.finishedVoterIds.length, tally.totalParticipants]);

  const handleVote = React.useCallback(
    (place: Place, vote: Vote) => {
      setVotes((prev) => ({
        ...prev,
        [myId]: { ...(prev[myId] || {}), [placeKey(place)]: vote },
      }));
      setLastVoted(place);
      persistVote(activeCollection, myId, place, vote, userData.email).catch((e) =>
        console.error('Failed to persist vote:', e)
      );
    },
    [activeCollection, myId, userData.email]
  );

  const handleUndo = React.useCallback(() => {
    const place = lastVoted;
    if (!place) return;
    setLastVoted(null);
    setVotes((prev) => {
      const mine = { ...(prev[myId] || {}) };
      delete mine[placeKey(place)];
      return { ...prev, [myId]: mine };
    });
    removeVote(activeCollection, myId, place, userData.email).catch((e) =>
      console.error('Failed to undo vote:', e)
    );
  }, [activeCollection, lastVoted, myId, userData.email]);

  const handleRevote = React.useCallback(() => {
    setLastVoted(null);
    setVotes((prev) => {
      const next = { ...prev };
      delete next[myId];
      return next;
    });
    clearVoterVotes(activeCollection, myId, userData.email).catch((e) =>
      console.error('Failed to reset votes:', e)
    );
  }, [activeCollection, myId, userData.email]);

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Swipe to decide</Text>
        <Text style={styles.headerSubtitle}>Everyone swipes · most yeses wins</Text>
      </View>
      {canEdit ? (
        <Button
          onPress={() => setAddOpen(true)}
          style={styles.addBtn}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </Button>
      ) : null}
    </View>
  );

  let body: React.ReactNode;

  if (places.length === 0) {
    body = (
      <View style={styles.emptyState}>
        <View style={styles.emptyCircle}>
          <Sparkles size={28} color={tw.neutral500} />
        </View>
        <Text style={styles.emptyTitle}>No places to vote on yet</Text>
        <Text style={styles.emptySubtitle}>
          {canEdit ? 'Add a few spots and start swiping' : 'This collection has no places yet'}
        </Text>
      </View>
    );
  } else if (!iFinished) {
    body = (
      <CollectionSwipeDeck
        places={remaining}
        onVote={handleVote}
        onUndo={handleUndo}
        canUndo={Boolean(lastVoted)}
        votedCount={places.length - remaining.length}
        totalCount={places.length}
      />
    );
  } else {
    body = (
      <View style={{ gap: 24 }}>
        {tally.everyoneVoted && tally.winners.length > 0 ? (
          <View>
            <ConfettiBurst />
            <View>
              <View style={{ marginBottom: 16, alignItems: 'center' }}>
                {tally.allEqual ? (
                  <>
                    <Text style={styles.resultTitle}>Dead heat! 🤝</Text>
                    <Text style={styles.resultSubtitle}>
                      Every spot scored the same — start with these {tally.winners.length}
                    </Text>
                  </>
                ) : tally.isTie ? (
                  <>
                    <Text style={styles.resultTitle}>It's a tie! 🤝</Text>
                    <Text style={styles.resultSubtitle}>
                      {tally.winners.length} spots tied with {tally.topYesCount} yes votes
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.resultTitle}>We have a winner! 🎉</Text>
                    <Text style={styles.resultSubtitle}>Everyone voted — here's the pick</Text>
                  </>
                )}
              </View>
              <View style={{ gap: 12 }}>
                {tally.winners.map((w) => (
                  <WinnerCard
                    key={placeKey(w)}
                    place={w}
                    yesCount={tally.yesByPlace[placeKey(w)] || 0}
                    total={tally.totalParticipants}
                    label={tally.allEqual ? 'Pick' : 'Winner'}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.waitingBox}>
            <View style={styles.waitingCheck}>
              <Check size={24} color={tw.emerald400} />
            </View>
            <Text style={styles.waitingTitle}>You're in! 🗳️</Text>
            <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Clock size={16} color={tw.neutral400} />
              <Text style={styles.waitingSubtitle}>
                Waiting on {tally.totalParticipants - tally.finishedVoterIds.length} more to vote
              </Text>
            </View>
          </View>
        )}

        {/* Full ranking of every spot in the deck */}
        <Leaderboard entries={tally.leaderboard} total={tally.totalParticipants} />

        {/* Voting progress */}
        <View>
          <View style={styles.votesInHeader}>
            <Text style={styles.votesInLabel}>Votes in</Text>
            <Text style={styles.votesInCount}>
              {tally.finishedVoterIds.length}/{tally.totalParticipants}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={[tw.emerald400, tw.emerald500]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1, borderRadius: 999 }}
              />
            </Animated.View>
          </View>
          <View style={styles.participantsRow}>
            {participants.map((p) => (
              <ParticipantChip key={p.id} p={p} done={tally.finishedVoterIds.includes(p.id)} />
            ))}
          </View>
        </View>

        <Button variant="ghost" onPress={handleRevote} style={styles.revoteBtn}>
          <RotateCcw size={16} color={tw.neutral300} />
          <Text style={styles.revoteText}>Re-vote</Text>
        </Button>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
      {header}
      {body}

      {/* Add places dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
        contentStyle={{ backgroundColor: tw.neutral900, borderColor: tw.neutral800 }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#fff' }}>Add places</DialogTitle>
          <DialogDescription style={{ marginBottom: 8, color: tw.neutral400 }}>
            Choose how to add places to this collection
          </DialogDescription>
          <Pressable
            style={styles.addOption}
            onPress={() => {
              setAddOpen(false);
              setSwipe(true);
            }}
          >
            <AnimatedGradientText style={{ fontFamily: fonts.sansBold, fontSize: 14 }}>
              Swipe style
            </AnimatedGradientText>
          </Pressable>
          <Pressable
            style={[styles.addOption, { marginTop: 16, height: 88 }]}
            onPress={() => {
              setAddOpen(false);
              onBrowse();
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: fonts.sans }}>
              Go to <Text style={{ color: tw.pink300 }}>Browse</Text>
            </Text>
          </Pressable>
        </DialogHeader>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.displayBold,
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.display,
    color: tw.neutral500,
  },
  addBtn: {
    height: 32,
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: tw.rose500,
    paddingHorizontal: 16,
    shadowColor: tw.rose500,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCircle: {
    marginBottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: tw.neutral900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: fonts.display,
    color: tw.neutral400,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fonts.display,
    color: tw.neutral500,
  },
  winnerCard: {
    overflow: 'hidden',
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,210,48,0.3)',
    backgroundColor: tw.neutral900,
  },
  winnerImageWrap: {
    height: 208, // h-52
    width: '100%',
  },
  winnerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: tw.amber400,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  winnerBadgeText: {
    fontSize: 11,
    fontFamily: fonts.sansBlack,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#000',
  },
  winnerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  winnerName: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: fonts.sansBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  winnerMeta: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: 'rgba(255,255,255,0.9)',
  },
  winnerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  winnerYesCount: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  winnerYesTotal: {
    fontSize: 14,
    color: tw.neutral500,
    fontFamily: fonts.sans,
  },
  leaderboardLabel: {
    marginBottom: 12,
    fontSize: 12,
    fontFamily: fonts.displayBold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tw.neutral500,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23,23,23,0.6)',
    padding: 10,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankFirst: {
    backgroundColor: tw.amber400,
  },
  rankOther: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rankText: {
    fontSize: 12,
    fontFamily: fonts.sansBlack,
  },
  leaderImage: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  leaderName: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: '#fff',
  },
  leaderBarTrack: {
    marginTop: 4,
    height: 6,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  leaderBarFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  leaderCount: {
    fontSize: 12,
    fontFamily: fonts.displayBold,
    color: tw.neutral300,
  },
  waitingBox: {
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23,23,23,0.5)',
    padding: 20,
    alignItems: 'center',
  },
  waitingCheck: {
    marginBottom: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,212,146,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,146,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: {
    fontSize: 16,
    fontFamily: fonts.displayBold,
    color: '#fff',
  },
  waitingSubtitle: {
    fontSize: 14,
    fontFamily: fonts.display,
    color: tw.neutral400,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: fonts.displayBold,
    color: '#fff',
  },
  resultSubtitle: {
    fontSize: 14,
    fontFamily: fonts.display,
    color: tw.neutral400,
  },
  votesInHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  votesInLabel: {
    fontSize: 12,
    fontFamily: fonts.displayBold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tw.neutral500,
  },
  votesInCount: {
    fontSize: 12,
    fontFamily: fonts.displayBold,
    color: tw.neutral300,
  },
  progressTrack: {
    marginBottom: 16,
    height: 6,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
  },
  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantAvatar: {
    borderWidth: 2,
  },
  doneBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tw.emerald500,
    borderWidth: 2,
    borderColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    maxWidth: 64,
    fontSize: 10,
    fontFamily: fonts.sansMedium,
    color: tw.neutral400,
  },
  revoteBtn: {
    height: 36,
    width: '100%',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  revoteText: {
    fontSize: 14,
    color: tw.neutral300,
    fontFamily: fonts.sansMedium,
  },
  addOption: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: tw.neutral700,
    backgroundColor: 'rgba(38,38,38,0.5)',
  },
});
