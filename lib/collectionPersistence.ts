import { getDocument, updateDocument } from './firebaseActions';
import { SHARED_COLLECTIONS_COLLECTION } from './sharedCollections';
import type { CollectionType, ParticipantLocation, Place } from './types';
import { placeKey, type CollectionVotes } from './collectionVoting';
import type { AvailabilityEntry, CollectionAvailability } from './collectionAvailability';

/**
 * Where a collection's collaborative state (votes / shared locations) is
 * persisted. Shared collections write to the canonical `sharedCollections`
 * document so every member reads the same tally; personal collections write
 * back into the owner's embedded `collections` array.
 */
function sink(collection: CollectionType, currentEmail: string) {
  if (collection.sharedCollectionId) {
    return { kind: 'shared' as const, id: collection.sharedCollectionId };
  }
  return {
    kind: 'personal' as const,
    email: collection.ownerEmail || collection.createdBy || currentEmail,
    name: collection.name,
  };
}

async function updatePersonalCollection(
  email: string,
  name: string,
  patch: (col: CollectionType) => CollectionType
) {
  const userDoc = (await getDocument('users', email)) as
    | { collections?: CollectionType[] }
    | null;
  if (!userDoc?.collections) return;
  const collections = userDoc.collections.map((c) => (c.name === name ? patch(c) : c));
  await updateDocument('users', email, { collections });
}

export async function persistVote(
  collection: CollectionType,
  voterId: string,
  place: Place,
  vote: 'yes' | 'no',
  currentEmail: string
): Promise<void> {
  const target = sink(collection, currentEmail);
  const key = placeKey(place);

  if (target.kind === 'shared') {
    const docData = (await getDocument(SHARED_COLLECTIONS_COLLECTION, target.id)) as
      | { votes?: CollectionVotes }
      | null;
    const votes: CollectionVotes = { ...(docData?.votes || {}) };
    votes[voterId] = { ...(votes[voterId] || {}), [key]: vote };
    await updateDocument(SHARED_COLLECTIONS_COLLECTION, target.id, {
      votes,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  await updatePersonalCollection(target.email, target.name, (col) => {
    const votes: CollectionVotes = { ...(col.votes || {}) };
    votes[voterId] = { ...(votes[voterId] || {}), [key]: vote };
    return { ...col, votes };
  });
}

/** Undoes one swipe so the card comes back to the deck. */
export async function removeVote(
  collection: CollectionType,
  voterId: string,
  place: Place,
  currentEmail: string
): Promise<void> {
  const target = sink(collection, currentEmail);
  const key = placeKey(place);

  if (target.kind === 'shared') {
    const docData = (await getDocument(SHARED_COLLECTIONS_COLLECTION, target.id)) as
      | { votes?: CollectionVotes }
      | null;
    const votes: CollectionVotes = { ...(docData?.votes || {}) };
    const mine = { ...(votes[voterId] || {}) };
    delete mine[key];
    votes[voterId] = mine;
    await updateDocument(SHARED_COLLECTIONS_COLLECTION, target.id, {
      votes,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  await updatePersonalCollection(target.email, target.name, (col) => {
    const votes: CollectionVotes = { ...(col.votes || {}) };
    const mine = { ...(votes[voterId] || {}) };
    delete mine[key];
    votes[voterId] = mine;
    return { ...col, votes };
  });
}

/** Saves which days one participant is free on. */
export async function persistAvailability(
  collection: CollectionType,
  participantId: string,
  entry: AvailabilityEntry,
  currentEmail: string
): Promise<void> {
  const target = sink(collection, currentEmail);

  if (target.kind === 'shared') {
    const docData = (await getDocument(SHARED_COLLECTIONS_COLLECTION, target.id)) as
      | { availability?: CollectionAvailability }
      | null;
    await updateDocument(SHARED_COLLECTIONS_COLLECTION, target.id, {
      availability: { ...(docData?.availability || {}), [participantId]: entry },
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  await updatePersonalCollection(target.email, target.name, (col) => ({
    ...col,
    availability: { ...(col.availability || {}), [participantId]: entry },
  }));
}

/** Clears a single voter's votes so they can swipe again. */
export async function clearVoterVotes(
  collection: CollectionType,
  voterId: string,
  currentEmail: string
): Promise<void> {
  const target = sink(collection, currentEmail);
  if (target.kind === 'shared') {
    const docData = (await getDocument(SHARED_COLLECTIONS_COLLECTION, target.id)) as
      | { votes?: CollectionVotes }
      | null;
    const votes: CollectionVotes = { ...(docData?.votes || {}) };
    delete votes[voterId];
    await updateDocument(SHARED_COLLECTIONS_COLLECTION, target.id, {
      votes,
      updatedAt: new Date().toISOString(),
    });
    return;
  }
  await updatePersonalCollection(target.email, target.name, (col) => {
    const votes: CollectionVotes = { ...(col.votes || {}) };
    delete votes[voterId];
    return { ...col, votes };
  });
}

export async function persistParticipantLocation(
  collection: CollectionType,
  participantId: string,
  location: ParticipantLocation,
  currentEmail: string
): Promise<void> {
  const target = sink(collection, currentEmail);
  if (target.kind === 'shared') {
    const docData = (await getDocument(SHARED_COLLECTIONS_COLLECTION, target.id)) as
      | { participantLocations?: Record<string, ParticipantLocation> }
      | null;
    const participantLocations = { ...(docData?.participantLocations || {}) };
    participantLocations[participantId] = location;
    await updateDocument(SHARED_COLLECTIONS_COLLECTION, target.id, {
      participantLocations,
      updatedAt: new Date().toISOString(),
    });
    return;
  }
  await updatePersonalCollection(target.email, target.name, (col) => ({
    ...col,
    participantLocations: {
      ...(col.participantLocations || {}),
      [participantId]: location,
    },
  }));
}
