// Place interface matching the web application
export interface Place {
  id: string; // Document ID (typed as string in mobile)
  name: string;
  label: string;
  category: string;
  rating: number;
  reviews: number | string | any[];
  hours: string;
  image: string;
  gmaps?: string;
  lng: number;
  lat: number;
  tags: string[];
  description?: string;
  budget?: string;
  priceMin?: number;
  priceMax?: number;
  vibes?: string[];
  location?: string;
  mainFilter?: string;
  subFilter?: string;
  age21Plus?: boolean;
  popup?: boolean;
  website?: string;
  startDate?: string;
  endDate?: string;
  addedBy?: string;
  addedAt?: string;
}

// Link Collaborator interface
export interface LinkCollaborator {
  name: string;
  lastActiveAt?: string;
  avatar?: string;
}

// Collection access and kind types
export type CollectionAccess = "view" | "edit";
export type CollectionKind = "personal" | "shared";

// Shared Collection Member interface
export interface SharedCollectionMember {
  email: string;
  access: CollectionAccess;
  savedAt?: string;
  name?: string;
  photo?: string;
}

// Collection Type interface
export interface CollectionType {
  id?: string;
  name: string;
  places: Place[];
  type?: CollectionKind;
  access?: CollectionAccess;
  sharedCollectionId?: string;
  ownerEmail?: string;
  collaborators?: string[];
  linkCollaborators?: LinkCollaborator[];
  members?: SharedCollectionMember[];
  shareToken?: string;
  createdBy?: string;
  gradient?: string;
  isOwner?: boolean;
  votes?: Record<string, Record<string, "yes" | "no">>;
  participantLocations?: Record<string, ParticipantLocation>;
}

// Participant Location interface
export interface ParticipantLocation {
  lat: number;
  lng: number;
  name: string;
  photo?: string;
  updatedAt: string;
}

// User Data interface
export interface UserData {
  name: string;
  email: string;
  photo: string;
  collections: CollectionType[];
  sharedCollections?: CollectionType[];
  admin?: boolean;
}

// Browse Vibe interface
export interface BrowseVibeDefinition {
  id: string;
  label: string;
  blurb?: string;
  predicate: (place: Place) => boolean;
}

// Custom Subfilter — same shape as the website (config/exploreSubfilters doc).
export type { CustomSubfilter } from './exploreSubfilters';