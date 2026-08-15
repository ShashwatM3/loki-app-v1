// Generate random gradient for collections — exact port of the website helper.
export function getRandomGradient() {
  function randomColor() {
    const r = Math.floor(Math.random() * 200) + 30;
    const g = Math.floor(Math.random() * 200) + 30;
    const b = Math.floor(Math.random() * 200) + 30;
    return `rgb(${r},${g},${b})`;
  }
  const angle = Math.floor(Math.random() * 360);
  const colors = [randomColor(), randomColor()];
  if (Math.random() > 0.5) colors.push(randomColor());
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

// Deterministic gradient from a string — exact port of lib/utils.ts on the web.
export function getGradientFromString(str: string) {
  let hash = 0;
  const target = str || 'default';
  for (let i = 0; i < target.length; i++) {
    hash = (hash << 5) - hash + target.charCodeAt(i);
    hash = hash & hash;
  }
  const r = 30 + Math.abs(hash % 200);
  const g = 30 + Math.abs((hash >> 8) % 200);
  const b = 30 + Math.abs((hash >> 16) % 200);
  const r2 = 30 + Math.abs((hash >> 24) % 200);
  const g2 = 30 + Math.abs((hash >> 4) % 200);
  const b2 = 30 + Math.abs((hash >> 12) % 200);
  return `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${r2},${g2},${b2}))`;
}

export interface ParsedGradient {
  colors: [string, string, ...string[]];
  locations?: [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

const FALLBACK_GRADIENT: ParsedGradient = {
  colors: ['#312e81', '#0a0a0a'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/**
 * Parse the CSS `linear-gradient(...)` strings the website stores in Firestore
 * (collection gradients, vibe tints) into props for expo-linear-gradient.
 * Supports `Ndeg` angles, hex / rgb() / rgba() / hsl() colors and % stops.
 */
export function parseCssGradient(css?: string): ParsedGradient {
  if (!css) return FALLBACK_GRADIENT;
  const m = /linear-gradient\((.*)\)$/s.exec(css.trim());
  if (!m) return FALLBACK_GRADIENT;

  // Split on top-level commas (rgb(...) contains commas we must not split on).
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of m[1]) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  let angle = 180; // CSS default: "to bottom"
  let stops = parts;
  const angleMatch = /^(-?\d+(?:\.\d+)?)deg$/.exec(parts[0] ?? '');
  if (angleMatch) {
    angle = parseFloat(angleMatch[1]);
    stops = parts.slice(1);
  } else if (parts[0]?.startsWith('to ')) {
    const dir = parts[0].slice(3).trim();
    const dirs: Record<string, number> = {
      top: 0, right: 90, bottom: 180, left: 270,
      'top right': 45, 'right top': 45,
      'bottom right': 135, 'right bottom': 135,
      'bottom left': 225, 'left bottom': 225,
      'top left': 315, 'left top': 315,
    };
    angle = dirs[dir] ?? 180;
    stops = parts.slice(1);
  }

  const colors: string[] = [];
  const locations: number[] = [];
  let hasLocations = false;
  for (const stop of stops) {
    const stopMatch = /^(.*?)\s+(-?\d+(?:\.\d+)?)%$/.exec(stop);
    if (stopMatch) {
      colors.push(stopMatch[1].trim());
      locations.push(parseFloat(stopMatch[2]) / 100);
      hasLocations = true;
    } else {
      colors.push(stop);
      locations.push(-1);
    }
  }
  if (colors.length < 2) return FALLBACK_GRADIENT;

  // Fill in missing locations evenly when at least one explicit stop exists.
  if (hasLocations) {
    for (let i = 0; i < locations.length; i++) {
      if (locations[i] === -1) {
        locations[i] = colors.length === 1 ? 0 : i / (colors.length - 1);
      }
    }
  }

  // CSS angle: 0deg points up, clockwise. Convert to unit start/end points.
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad) / 2;
  const dy = -Math.cos(rad) / 2;
  return {
    colors: colors as ParsedGradient['colors'],
    locations: hasLocations ? (locations as ParsedGradient['locations']) : undefined,
    start: { x: 0.5 - dx, y: 0.5 - dy },
    end: { x: 0.5 + dx, y: 0.5 + dy },
  };
}

// Format time greeting
export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Check if place is expired popup — re-exported from the exact web port.
export { isExpiredLimitedTimePopup, isActiveLimitedTimePopup } from './isActiveLimitedTimePopup';

// Extract first name from full name
export function getFirstName(fullName?: string): string | null {
  if (!fullName) return null;
  return fullName.trim().split(' ')[0];
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}