import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Crown, Users } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { collectionParticipants } from '../../lib/collectionVoting';
import { fonts, tw } from '../../lib/theme';
import type { CollectionType } from '../../lib/types';

const AVATAR_COLORS = ['#ff2056', '#2b7fff', '#00bc7d', '#fe9a00', '#ad46ff', '#00a6f4'];

function avatarColor(text: string): string {
  let hash = 0;
  const str = text || 'guest';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/**
 * Everyone who joined a collection — 1:1 port of collection-members.tsx.
 */
export function CollectionMembers({
  collection,
  currentUser,
  style,
}: {
  collection: CollectionType;
  currentUser: { email: string; name?: string; photo?: string };
  style?: StyleProp<ViewStyle>;
}) {
  const participants = React.useMemo(
    () => collectionParticipants(collection, currentUser),
    [collection, currentUser]
  );

  if (participants.length === 0) return null;

  const ownerEmail = collection.ownerEmail || collection.createdBy;

  return (
    <View style={style}>
      <View style={styles.header}>
        <Users size={14} color={tw.neutral500} />
        <Text style={styles.headerText}>In this plan · {participants.length}</Text>
      </View>
      <View style={styles.chips}>
        {participants.map((p) => {
          const isHost = Boolean(ownerEmail) && p.id === ownerEmail;
          return (
            <View key={p.id} style={[styles.chip, p.isYou ? styles.chipYou : styles.chipOther]}>
              <Avatar
                size={28}
                uri={p.photo}
                fallback={initials(p.isYou ? currentUser.name || p.id : p.name)}
                fallbackColor={avatarColor(p.id)}
                style={styles.chipAvatar}
              />
              <Text numberOfLines={1} style={styles.chipName}>
                {p.name}
              </Text>
              {isHost ? <Crown size={12} color={tw.amber300} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 10,
    fontFamily: fonts.displayBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: tw.neutral500,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
  },
  chipYou: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipOther: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipAvatar: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipName: {
    maxWidth: 140,
    fontSize: 12,
    fontFamily: fonts.displayMedium,
    color: tw.neutral200,
  },
});
