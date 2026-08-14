export type CategoryGroup = {
  id: string;
  label: string;
  emoji: string;
  children: string[];
};

export function placeMatchesCategoryGroup(
  place: { category: string; tags: string[] },
  group: CategoryGroup
): boolean {
  return (
    group.children.includes(place.category) ||
    place.tags.some((t) => group.children.includes(t))
  );
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    children: ["Padel", "Badminton", "Watch Sports", "Football", "Basketball", "Tennis", "Bowling", "Adventure Sports"],
  },
  {
    id: "outdoor",
    label: "Outdoor",
    emoji: "🌿",
    children: ["Hiking", "Beach", "Parks", "Nature", "Camping", "Water Sports", "Cycling", "Adventure"],
  },
  {
    id: "arts-culture",
    label: "Arts & Culture",
    emoji: "🎨",
    children: ["Museums", "Galleries", "Art & Culture", "Heritage", "Exhibitions", "Theatre", "Workshops", "Immersive Art"],
  },
  {
    id: "nightlife-entertainment",
    label: "Entertainment",
    emoji: "🎭",
    children: ["Nightlife", "Bars", "Clubs", "Live Music", "Karaoke", "Listening Bars", "Comedy", "Entertainment"],
  },
  {
    id: "work-chill",
    label: "Work & Chill",
    emoji: "💻",
    children: ["Coworking", "Coworking Spots", "Cafés", "Libraries", "Study Spots", "Lounges", "Quiet Spots", "Rooftops"],
  },
  {
    id: "experiences",
    label: "Experiences",
    emoji: "✨",
    children: ["Experience", "Tech & Future", "Bowling", "Board Games", "Escape Rooms", "Arcades", "Leisure", "Unique"],
  },
];

export function getParentGroup(category: string): CategoryGroup | null {
  return CATEGORY_GROUPS.find(g => g.children.includes(category)) ?? null;
}

export function getChildrenForGroup(groupId: string): string[] {
  return CATEGORY_GROUPS.find(g => g.id === groupId)?.children ?? [];
}

export type ExploreSubfilter = {
  label: string;
  emoji: string;
  keywords: string[];
};

export type ExploreGroup = {
  id: string;
  label: string;
  emoji: string;
  subfilters: ExploreSubfilter[];
};

export const EXPLORE_GROUPS: ExploreGroup[] = [
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    subfilters: [
      { label: "Watch sports", emoji: "📺", keywords: ["watch sport", "watch sports", "world cup", "live sport", "screening", "game day", "sports bar"] },
      { label: "Padel", emoji: "🎾", keywords: ["padel"] },
      { label: "Tennis", emoji: "🎾", keywords: ["tennis"] },
      { label: "Badminton", emoji: "🏸", keywords: ["badminton"] },
      { label: "Football", emoji: "⚽", keywords: ["football", "futsal", "soccer", "five-a-side"] },
      { label: "Basketball", emoji: "🏀", keywords: ["basketball"] },
      { label: "Workouts", emoji: "💪", keywords: ["workout", "gym", "fitness", "yoga", "pilates", "crossfit", "climbing", "bouldering", "spin"] },
    ],
  },
  {
    id: "lowkey",
    label: "Something lowkey",
    emoji: "☕",
    subfilters: [
      { label: "Cafés", emoji: "☕", keywords: ["café", "cafe", "coffee"] },
      { label: "Pottery", emoji: "🏺", keywords: ["pottery", "ceramic", "clay"] },
      { label: "Art & craft", emoji: "🎨", keywords: ["art jam", "paint and sip", "painting class", "craft workshop", "candle making", "resin", "tufting"] },
      { label: "Board games", emoji: "🎲", keywords: ["board game", "board games", "games café", "games cafe"] },
      { label: "Coworking", emoji: "💻", keywords: ["coworking", "co-working", "study spot", "library", "reading"] },
    ],
  },
  {
    id: "late-night",
    label: "Late night",
    emoji: "🌙",
    subfilters: [
      { label: "Arcades", emoji: "🕹️", keywords: ["arcade", "gaming", "vr", "game zone"] },
      { label: "Karaoke", emoji: "🎤", keywords: ["karaoke"] },
      { label: "Bowling", emoji: "🎳", keywords: ["bowling"] },
      { label: "Bars", emoji: "🍸", keywords: ["bar", "lounge", "speakeasy", "listening bar"] },
      { label: "Clubs", emoji: "💃", keywords: ["club", "nightlife", "nightclub"] },
      { label: "Live music", emoji: "🎵", keywords: ["live music", "gig", "concert", "band"] },
    ],
  },
  {
    id: "adventure",
    label: "Adventure",
    emoji: "🎯",
    subfilters: [
      { label: "Karting", emoji: "🏎️", keywords: ["karting", "go-kart", "go kart", "autodrome", "racing"] },
      { label: "Paintball", emoji: "🔫", keywords: ["paintball", "airsoft", "laser tag", "lasertag"] },
      { label: "Trampoline", emoji: "🤸", keywords: ["trampoline", "bounce", "parkour", "flipout", "freestyle"] },
      { label: "Climbing", emoji: "🧗", keywords: ["climbing", "bouldering", "ropes course", "via ferrata"] },
      { label: "Skydiving", emoji: "🪂", keywords: ["skydiving", "indoor skydiving", "ifly", "zipline", "zip line", "xline", "bungee"] },
      { label: "Water adventure", emoji: "🏄", keywords: ["wakeboard", "flyboard", "jet ski", "kayak", "waterpark", "aquaventure", "surf"] },
    ],
  },
  {
    id: "outdoors",
    label: "Outdoors",
    emoji: "🌿",
    subfilters: [
      { label: "Beach", emoji: "🏖️", keywords: ["beach"] },
      { label: "Parks", emoji: "🌳", keywords: ["park", "garden"] },
      { label: "Hiking", emoji: "🥾", keywords: ["hike", "hiking", "trail"] },
      { label: "Water sports", emoji: "🌊", keywords: ["kayak", "paddle", "water sport", "diving", "surf", "wakeboard"] },
    ],
  },
  {
    id: "arts",
    label: "Arts & culture",
    emoji: "🎨",
    subfilters: [
      { label: "Museums", emoji: "🏛️", keywords: ["museum"] },
      { label: "Galleries", emoji: "🖼️", keywords: ["gallery", "galleries", "exhibition"] },
      { label: "Immersive art", emoji: "✨", keywords: ["immersive", "digital art", "light", "teamlab", "vinci", "projection"] },
      { label: "Heritage", emoji: "🕌", keywords: ["heritage", "historic", "culture", "old town"] },
    ],
  },
];

export type ExploreMatchablePlace = {
  category?: string;
  description?: string;
  location?: string;
  tags?: string[];
  vibes?: string[];
  name?: string;
  mainFilter?: string;
  subFilter?: string;
  age21Plus?: boolean;
};

function norm(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function placeMatchesKeywords(
  place: ExploreMatchablePlace,
  keywords: string[]
): boolean {
  if (keywords.length === 0) return true;
  const blob = [
    place.name ?? "",
    place.category ?? "",
    place.description ?? "",
    place.location ?? "",
    ...(place.tags ?? []),
    ...(place.vibes ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return keywords.some((kw) => blob.includes(kw.toLowerCase()));
}

function placeHasExplicitGroup(place: ExploreMatchablePlace, group: ExploreGroup): boolean {
  const assigned = norm(place.mainFilter);
  return assigned !== "" && (assigned === norm(group.id) || assigned === norm(group.label));
}

export function placeMatchesExploreGroup(
  place: ExploreMatchablePlace,
  group: ExploreGroup
): boolean {
  if (norm(place.mainFilter)) return placeHasExplicitGroup(place, group);
  return group.subfilters.some((sf) => placeMatchesKeywords(place, sf.keywords));
}

export function placeMatchesExploreSubfilter(
  place: ExploreMatchablePlace,
  group: ExploreGroup,
  subfilter: ExploreSubfilter
): boolean {
  const assignedSub = norm(place.subFilter);
  if (assignedSub) return assignedSub === norm(subfilter.label);
  if (norm(place.mainFilter) && !placeHasExplicitGroup(place, group)) return false;
  return placeMatchesKeywords(place, subfilter.keywords);
}

export function placeIs21Plus(place: ExploreMatchablePlace): boolean {
  if (place.age21Plus === true) return true;
  return [...(place.tags ?? []), ...(place.vibes ?? [])].some((t) => {
    const v = norm(t);
    return v === "21+" || v === "21 plus" || v === "adults only";
  });
}