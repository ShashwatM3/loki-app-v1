import type { Place } from './types';

/**
 * Turns the loosely-typed `budget` field ("Low" | "Moderate" | "High" | "")
 * into a compact price symbol. Falls back to "$$" so we never render an empty
 * price slot.
 */
export function priceSymbol(budget?: string): string {
  const b = (budget || '').trim().toLowerCase();
  if (b === 'low' || b === '$' || b === 'cheap') return '$';
  if (b === 'high' || b === '$$$' || b === 'expensive' || b === 'luxury') return '$$$';
  return '$$'; // "moderate" and anything unknown
}

/**
 * Best-effort extraction of a human closing time out of the free-form `hours`
 * string.
 */
export function closingLabel(hours?: string): string | null {
  const h = (hours || '').trim();
  if (!h) return null;

  if (/24\s*hours|24\/7/i.test(h)) return 'Open 24 hrs';

  const closes = h.match(/clos(?:es|ing)\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)/i);
  if (closes) return `Open until ${normalizeTime(closes[1])}`;

  const range = h.match(/[-–—to]\s*(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)\s*$/i);
  if (range) return `Open until ${normalizeTime(range[1])}`;

  if (/^clos(ed|ing)/i.test(h)) return 'Closed now';

  return null;
}

function normalizeTime(t: string): string {
  return t
    .replace(/\s+/g, ' ')
    .replace(/\.?m\.?/i, 'M')
    .replace(/([ap])m/i, (_m, p) => `${p.toUpperCase()}M`)
    .replace(/(\d)\s*([AP]M)/i, '$1 $2')
    .trim()
    .toUpperCase();
}

/** Neighbourhood / area, cleaned of a trailing ", Dubai"/country suffix. */
export function neighbourhood(place: Place): string | null {
  const loc = (place.location || '').trim();
  if (!loc) return null;
  const first = loc.split(',')[0].trim();
  return first || null;
}

export interface PlaceMetaPart {
  icon: string;
  text: string;
}

/**
 * Structured, emoji-led meta line used across the app, e.g.
 *   📍 DIFC • Open until 11 PM • $$ • ⭐ 4.6
 */
export function placeMetaParts(place: Place): PlaceMetaPart[] {
  const parts: PlaceMetaPart[] = [];

  const area = neighbourhood(place);
  if (area) parts.push({ icon: '📍', text: area });

  const vibe = (place.vibes ?? []).find((v) => v && v.trim())?.trim();
  if (vibe) parts.push({ icon: '✨', text: vibe });

  const closing = closingLabel(place.hours);
  if (closing) parts.push({ icon: '', text: closing });

  parts.push({ icon: '', text: priceSymbol(place.budget) });

  const rating = typeof place.rating === 'number' ? place.rating : Number(place.rating);
  if (rating && !Number.isNaN(rating) && rating > 0) {
    parts.push({ icon: '⭐', text: rating.toFixed(1) });
  }

  return parts;
}

export function placeMetaLine(place: Place): string {
  return placeMetaParts(place)
    .map((p) => (p.icon ? `${p.icon} ${p.text}` : p.text))
    .join(' • ');
}

/**
 * Stacked, all-lowercase "vibe" lines for the place detail sheet.
 */
export function placeVibeLines(place: Place): string[] {
  const lines: string[] = [];

  const vibe = (place.vibes ?? []).find((v) => v && v.trim())?.trim();
  if (vibe) lines.push(vibe.toLowerCase());

  const closing = closingLabel(place.hours);
  if (closing) lines.push(closing.toLowerCase().replace(/\s([ap]m)/g, '$1'));

  const price = priceSymbol(place.budget);
  const rating = typeof place.rating === 'number' ? place.rating : Number(place.rating);
  if (rating && !Number.isNaN(rating) && rating > 0) {
    lines.push(`${price} - ${rating.toFixed(1)} stars`);
  } else {
    lines.push(price);
  }

  return lines;
}

const BANNED = [
  'dynamic',
  'immersive',
  'offering',
  'experience',
  'unforgettable',
  'vibrant',
  'nestled',
  'boasts',
  'state-of-the-art',
  'cutting-edge',
  'world-class',
  'elevate',
  'curated',
  'seamless',
  'destination',
  'enrichment',
  'whether you',
];

function looksAiGenerated(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED.some((w) => lower.includes(w));
}

/**
 * A single Gen-Z friendly line that sounds like a friend's recommendation.
 */
export function genZBlurb(place: Place): string {
  const desc = (place.description || '').trim();
  if (desc && desc.length <= 140 && !looksAiGenerated(desc)) {
    return desc;
  }

  const category = (place.category || place.label || '').toLowerCase();
  const area = neighbourhood(place);
  const here = area ? ` in ${area}` : '';

  const byCategory: Record<string, string> = {
    'food & drink': `Go hungry — this${here} is where the group chat actually agrees to meet.`,
    food: `Go hungry — this${here} is where the group chat actually agrees to meet.`,
    chai: `Late-night chai runs${here} hit different. Bring the whole crew.`,
    beach: `Sunset dips and zero plans${here} — exactly the reset you needed.`,
    nature: `Touch grass${here}, take the photo, feel weirdly better about life.`,
    'art & culture': `Cute, a little artsy${here}, and very much a soft-launch-your-date spot.`,
    entertainment: `Perfect for after-work hangs, date nights or beating your friends here.`,
    adventure: `For when the group needs a story${here} that isn't "we stayed in again".`,
    leisure: `Low effort, high vibes${here} — show up and let the day happen.`,
    'tech & future': `Nerd out${here} and pretend you're living in 2050 for the afternoon.`,
    hiking: `Earn the view${here}, then earn the post-hike food. Worth it.`,
    experience: `Book it${here}, overshare about it later. One of those days.`,
  };

  return (
    byCategory[category] ||
    `An easy yes${here} — grab the crew and just go, the vibes sort themselves out.`
  );
}
