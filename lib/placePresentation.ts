/**
 * Client-safe presentation helpers for Loki place cards (chat recommendations,
 * etc.). Pure functions — 1:1 port of loki-web-app/lib/placePresentation.ts.
 */

export type LokiRecommendationCard = {
  id: string;
  name: string;
  category: string;
  image?: string;
  rating?: number;
  reviews: number;
  budget?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  hours?: string;
  lat?: number;
  lng?: number;
  gmaps?: string;
  website?: string;
  description?: string;
  vibes: string[];
  tags: string[];
  popup: boolean;
  /** One short, Loki-voice reason this spot fits the ask. */
  blurb: string;
};

/** Best-effort extraction of coordinates from a Google Maps URL. */
export function coordsFromGmapsUrl(
  url?: string
): { lat: number; lng: number } | null {
  if (!url) return null;
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll|center|destination)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];
  for (const pattern of patterns) {
    const m = pattern.exec(url);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

/** Great-circle distance between two lat/lng points, in kilometres. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Human-friendly distance label, e.g. "450 m", "2.3 km". */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Map a Loki budget string to a $–$$$ price indicator. */
export function budgetToPrice(budget?: string): { symbol: string; label: string } | null {
  if (!budget) return null;
  const v = budget.trim().toLowerCase();
  if (['low', 'cheap', 'budget', '$'].some((t) => v.includes(t))) {
    return { symbol: '$', label: 'Low' };
  }
  if (['moderate', 'mid', 'medium', '$$'].some((t) => v.includes(t))) {
    return { symbol: '$$', label: 'Moderate' };
  }
  if (['high', 'expensive', 'luxury', 'premium', 'splurge', '$$$'].some((t) => v.includes(t))) {
    return { symbol: '$$$', label: 'High' };
  }
  return null;
}

/**
 * Label for an admin-entered AED price range, e.g. "AED 60–120", "AED 80+",
 * "Up to AED 100". Returns "" when no usable range was set.
 */
export function formatPriceRange(priceMin?: number, priceMax?: number): string {
  const min = Number.isFinite(priceMin) ? (priceMin as number) : null;
  const max = Number.isFinite(priceMax) ? (priceMax as number) : null;
  if (min === null && max === null) return '';
  if (min !== null && max !== null) {
    return min === max ? `AED ${min}` : `AED ${min}\u2013${max}`;
  }
  if (min !== null) return `AED ${min}+`;
  return `Up to AED ${max}`;
}

export type OpenStatus = {
  status: 'open' | 'closed' | 'unknown';
  label: string;
};

function parseTimeToMinutes(raw: string): number | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(raw.trim());
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3]?.toLowerCase();
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 24 || minute > 59) return null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/**
 * Best-effort open/closed status from a free-text `hours` string.
 */
export function getOpenStatus(hours?: string, now: Date = new Date()): OpenStatus {
  const text = (hours ?? '').trim();
  if (!text) return { status: 'unknown', label: '' };

  const lower = text.toLowerCase();

  if (/\b24\s*(\/\s*7|hours?|hrs?)\b/.test(lower) || lower === 'open 24 hours') {
    return { status: 'open', label: 'Open 24 hrs' };
  }
  if (/\bclosed\b/.test(lower) && !/\d/.test(lower)) {
    return { status: 'closed', label: 'Closed' };
  }

  const range = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.exec(
    text
  );
  if (!range) return { status: 'unknown', label: '' };

  const start = parseTimeToMinutes(range[1]);
  const end = parseTimeToMinutes(range[2]);
  if (start === null || end === null) return { status: 'unknown', label: '' };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const normalizedEnd = end === 0 ? 24 * 60 : end;

  let isOpen: boolean;
  if (normalizedEnd <= start) {
    // Overnight range, e.g. 6pm–2am.
    isOpen = nowMinutes >= start || nowMinutes < normalizedEnd;
  } else {
    isOpen = nowMinutes >= start && nowMinutes < normalizedEnd;
  }

  return isOpen
    ? { status: 'open', label: 'Open now' }
    : { status: 'closed', label: 'Closed now' };
}
