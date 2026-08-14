import type { Place } from './types';
import { CATEGORY_GROUPS, placeMatchesCategoryGroup } from './categories';
import { placeUnderPrice } from './priceRange';

export type BrowseVibeId =
  | "something-lowkey"
  | "go-outside"
  | "late-night"
  | "budget-smart"
  | "date-night"
  | "feelin-vinci"
  | "sweat-it-out"
  | "world-cup";

export type BrowseVibeDefinition = {
  id: BrowseVibeId;
  label: string;
  blurb?: string;
  emoji: string;
  gradient: string;
  bannerImage: string;
  predicate: (place: Place) => boolean;
};

const groupById = (id: string) => CATEGORY_GROUPS.find((g) => g.id === id);

function matchGroup(place: Place, groupId: string): boolean {
  const g = groupById(groupId);
  return g ? placeMatchesCategoryGroup(place, g) : false;
}

const DATE_NIGHT_LABELS = new Set([
  "Fine Dining",
  "Listening Bars",
  "Galleries",
  "Museums",
  "Art & Culture",
  "Heritage",
]);

function matchesDateNight(place: Place): boolean {
  if (DATE_NIGHT_LABELS.has(place.category)) return true;
  if (place.tags.some((t) => DATE_NIGHT_LABELS.has(t))) return true;
  const arts = groupById("arts-culture");
  return arts ? placeMatchesCategoryGroup(place, arts) : false;
}

const IMMERSIVE_ART_RE =
  /\b(immersive|digital art|interactive art|projection|light installation|infinity des lumieres|lumieres|lumières|aya universe|house of hype|teamlab|van gogh|vinci)\b/i;

function matchesImmersiveArt(place: Place): boolean {
  const blob = [place.category, place.description ?? "", ...place.tags, ...(place.vibes ?? [])].join(
    " "
  );
  if (IMMERSIVE_ART_RE.test(blob)) return true;
  if (place.category === "Experience" && /\b(art|museum|gallery|digital)\b/i.test(blob)) {
    return true;
  }
  return place.tags.some((t) => /immersive/i.test(t)) || (place.vibes ?? []).some((v) => /immersive/i.test(v));
}

const WORLD_CUP_LABELS = new Set(["world cup", "watch sport", "watch sports"]);

function matchesWorldCup(place: Place): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  if (WORLD_CUP_LABELS.has(norm(place.category))) return true;
  if (place.label && WORLD_CUP_LABELS.has(norm(place.label))) return true;
  return place.tags.some((t) => WORLD_CUP_LABELS.has(norm(t)));
}

export const BROWSE_VIBES: BrowseVibeDefinition[] = [
  {
    id: "world-cup",
    label: "Sports Stream",
    blurb: "Big screens, watch parties, game-day energy",
    emoji: "⚽",
    gradient: "linear-gradient(135deg, #0B1F14 0%, #14532D 60%, #052E16 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1080&auto=format&fit=crop",
    predicate: (place) => matchesWorldCup(place),
  },
  {
    id: "something-lowkey",
    label: "Something lowkey",
    blurb: "Cafés, coworking, easy hangs",
    emoji: "🥐",
    gradient: "linear-gradient(135deg, #1C1917 0%, #3F3A34 60%, #12100E 100%)",
    bannerImage:
      "https://plus.unsplash.com/premium_photo-1664970900025-1e3099ca757a?q=80&w=987&auto=format&fit=crop",
    predicate: (place) => {
      if (matchGroup(place, "work-chill")) return true;
      const blob = [
        place.category,
        ...place.tags,
        ...(place.vibes ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return /\b(lowkey|chill|quiet|cozy|relaxed|wfh|coffee)\b/.test(blob);
    },
  },
  {
    id: "go-outside",
    label: "Explore Outdoors",
    blurb: "Nature, beach, parks, outdoor",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #0A1F17 0%, #14432F 60%, #06120D 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1622499361162-97540e860b58?q=80&w=1035&auto=format&fit=crop",
    predicate: (place) => matchGroup(place, "outdoor"),
  },
  {
    id: "late-night",
    label: "Late night",
    blurb: "Bars, clubs, live music",
    emoji: "⭐",
    gradient: "linear-gradient(135deg, #0A0518 0%, #2E1065 55%, #12042E 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1625318498217-2c1f59b47a44?q=80&w=987&auto=format&fit=crop",
    predicate: (place) => matchGroup(place, "nightlife-entertainment"),
  },
  {
    id: "budget-smart",
    label: "Under 100 AED",
    blurb: "Easy on the wallet",
    emoji: "🪙",
    gradient: "linear-gradient(135deg, #1A1206 0%, #422006 60%, #0E0A03 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1614260938313-a7fc1a7ad0d2?q=80&w=2069&auto=format&fit=crop",
    predicate: (place) => placeUnderPrice(place, 100),
  },
  {
    id: "date-night",
    label: "First date energy",
    blurb: "Dinner, culture, listening bars",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #1A0A14 0%, #4C0D2E 55%, #12060D 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1513279922550-250c2129b13a?q=80&w=2070&auto=format&fit=crop",
    predicate: (place) => matchesDateNight(place),
  },
  {
    id: "feelin-vinci",
    label: "Art & Design",
    blurb: "Immersive art, digital museums, light rooms",
    emoji: "🎨",
    gradient: "linear-gradient(135deg, #0D0A2E 0%, #2E1065 55%, #08061A 100%)",
    bannerImage:
      "https://images.unsplash.com/photo-1689016466319-f77129f1a7b6?q=80&w=1605&auto=format&fit=crop",
    predicate: (place) => matchesImmersiveArt(place),
  },
  {
    id: "sweat-it-out",
    label: "Workouts",
    blurb: "Move first, regret nothing",
    emoji: "💪",
    gradient: "linear-gradient(135deg, #1A0808 0%, #4C1109 55%, #0E0503 100%)",
    bannerImage:
      "https://plus.unsplash.com/premium_photo-1664303119944-4cf5302bb701?q=80&w=1440&auto=format&fit=crop",
    predicate: (place) => matchGroup(place, "sports"),
  },
];

const byId: Record<string, BrowseVibeDefinition | undefined> = Object.fromEntries(
  BROWSE_VIBES.map((v) => [v.id, v])
);

export function getBrowseVibeById(id: string | null | undefined): BrowseVibeDefinition | null {
  if (!id) return null;
  return byId[id] ?? null;
}

export function placeMatchesBrowseVibe(place: Place, vibe: BrowseVibeDefinition): boolean {
  return vibe.predicate(place);
}