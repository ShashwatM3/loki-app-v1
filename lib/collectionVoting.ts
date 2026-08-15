import type { CollectionType, Place } from './types';

/** voterId -> (placeKey -> "yes" | "no") */
export type CollectionVotes = Record<string, Record<string, 'yes' | 'no'>>;

export interface Participant {
  id: string;
  name: string;
  photo?: string;
  isYou: boolean;
}

export function placeKey(place: Place): string {
  return String(place.id ?? place.name);
}

function label(idOrEmail: string): string {
  return idOrEmail.includes('@') ? idOrEmail.split('@')[0] : idOrEmail;
}

/**
 * Everyone expected to vote in a collection: the owner, registered
 * collaborators, resolved shared-collection members, guest link collaborators,
 * and the current user. De-duplicated by id (email or guest name).
 */
export function collectionParticipants(
  collection: CollectionType,
  currentUser: { email: string; name?: string; photo?: string }
): Participant[] {
  const map = new Map<string, Participant>();

  const add = (id: string | undefined, name?: string, photo?: string) => {
    const key = (id || '').trim();
    if (!key) return;
    const isYou = key === currentUser.email;
    const existing = map.get(key);
    if (existing) {
      if (!existing.isYou && name && existing.name === label(key)) existing.name = name;
      if (!existing.photo && photo) existing.photo = photo;
      return;
    }
    map.set(key, {
      id: key,
      name: isYou ? 'You' : name || label(key),
      photo: isYou ? currentUser.photo : photo,
      isYou,
    });
  };

  add(collection.ownerEmail || collection.createdBy);
  (collection.collaborators || []).forEach((email) => add(email));
  (collection.members || []).forEach((m) => add(m.email, m.name, m.photo));
  (collection.linkCollaborators || []).forEach((c) => add(c.name, c.name));
  add(currentUser.email, currentUser.name, currentUser.photo);

  return Array.from(map.values());
}

export interface LeaderboardEntry {
  place: Place;
  yesCount: number;
  /** 1-based rank; tied places share a rank. */
  rank: number;
}

/** Number of spots recommended when every place ends up with the same score. */
export const FALLBACK_PICK_COUNT = 3;

export interface VoteTally {
  yesByPlace: Record<string, number>;
  leaderboard: LeaderboardEntry[];
  allEqual: boolean;
  finishedVoterIds: string[];
  totalParticipants: number;
  everyoneVoted: boolean;
  winners: Place[];
  isTie: boolean;
  topYesCount: number;
}

/** True once a voter has recorded a decision for every place in the deck. */
export function hasFinished(
  votes: CollectionVotes,
  voterId: string,
  places: Place[]
): boolean {
  const mine = votes[voterId];
  if (!mine || places.length === 0) return false;
  return places.every((p) => mine[placeKey(p)] === 'yes' || mine[placeKey(p)] === 'no');
}

export function tallyVotes(
  collection: CollectionType,
  participants: Participant[],
  votes: CollectionVotes
): VoteTally {
  const places = collection.places || [];
  const yesByPlace: Record<string, number> = {};
  places.forEach((p) => {
    yesByPlace[placeKey(p)] = 0;
  });

  Object.values(votes).forEach((voterVotes) => {
    places.forEach((p) => {
      if (voterVotes[placeKey(p)] === 'yes') {
        yesByPlace[placeKey(p)] += 1;
      }
    });
  });

  const finishedVoterIds = participants
    .filter((p) => hasFinished(votes, p.id, places))
    .map((p) => p.id);

  const everyoneVoted =
    participants.length > 0 &&
    places.length > 0 &&
    finishedVoterIds.length === participants.length;

  let topYesCount = 0;
  places.forEach((p) => {
    topYesCount = Math.max(topYesCount, yesByPlace[placeKey(p)]);
  });

  // Stable ranking: yes votes descending, original deck order as the tiebreak.
  const ranked = places
    .map((place, index) => ({ place, index, yesCount: yesByPlace[placeKey(place)] }))
    .sort((a, b) => b.yesCount - a.yesCount || a.index - b.index);

  const leaderboard: LeaderboardEntry[] = [];
  ranked.forEach((entry, i) => {
    const previous = leaderboard[i - 1];
    leaderboard.push({
      place: entry.place,
      yesCount: entry.yesCount,
      rank: previous && previous.yesCount === entry.yesCount ? previous.rank : i + 1,
    });
  });

  const allEqual =
    places.length > 0 && places.every((p) => yesByPlace[placeKey(p)] === topYesCount);

  const winners = allEqual
    ? places.slice(0, FALLBACK_PICK_COUNT)
    : places.filter((p) => yesByPlace[placeKey(p)] === topYesCount);

  return {
    yesByPlace,
    leaderboard,
    allEqual,
    finishedVoterIds,
    totalParticipants: participants.length,
    everyoneVoted,
    winners,
    isTie: !allEqual && winners.length > 1,
    topYesCount,
  };
}
