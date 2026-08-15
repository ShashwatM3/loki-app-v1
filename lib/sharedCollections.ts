import type {
  CollectionType,
  ParticipantLocation,
  Place,
  SharedCollectionMember,
} from './types';

export const SHARED_COLLECTIONS_COLLECTION = 'sharedCollections';

export interface SharedCollectionDoc {
  id: string;
  name: string;
  ownerEmail: string;
  places: Place[];
  members: SharedCollectionMember[];
  collaborators?: string[];
  linkCollaborators?: CollectionType['linkCollaborators'];
  gradient?: string;
  sourceCollectionName?: string;
  votes?: Record<string, Record<string, 'yes' | 'no'>>;
  participantLocations?: Record<string, ParticipantLocation>;
  createdAt: string;
  updatedAt: string;
}

export function buildSharedCollectionId(ownerEmail: string, collectionName: string) {
  const input = `${ownerEmail.trim().toLowerCase()}::${collectionName.trim().toLowerCase()}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return `sc_${Math.abs(hash).toString(36)}`;
}

export function collectionHasPlace(places: Place[], place: Place) {
  return places.some((p) => String(p.id ?? p.name) === String(place.id ?? place.name));
}

export function normalizeCollection(collection: CollectionType, fallbackOwnerEmail?: string): CollectionType {
  const type = collection.type ?? (collection.sharedCollectionId ? 'shared' : 'personal');
  return {
    ...collection,
    type,
    places: Array.isArray(collection.places) ? collection.places : [],
    createdBy: collection.createdBy ?? collection.ownerEmail ?? fallbackOwnerEmail,
    ownerEmail: collection.ownerEmail ?? collection.createdBy ?? fallbackOwnerEmail,
    access: collection.access ?? (type === 'shared' ? 'view' : 'edit'),
  };
}

export function makePersonalDuplicateName(baseName: string, existing: CollectionType[]) {
  const root = `${baseName} copy`;
  const names = new Set(existing.map((collection) => collection.name.trim().toLowerCase()));
  if (!names.has(root.toLowerCase())) return root;

  let suffix = 2;
  while (names.has(`${root} ${suffix}`.toLowerCase())) suffix += 1;
  return `${root} ${suffix}`;
}

export function canEditCollection(collection: CollectionType, userEmail?: string) {
  if (collection.type !== 'shared') return true;
  if (collection.ownerEmail && userEmail && collection.ownerEmail === userEmail) return true;
  return collection.access === 'edit';
}
