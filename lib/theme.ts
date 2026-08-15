import { Platform } from 'react-native';

/**
 * Loki design tokens — 1:1 port of loki-web-app/app/globals.css (.dark palette).
 * Every oklch() value was converted to sRGB with the CSS Color 4 math, so these
 * hexes are exactly what Chrome renders on the website.
 */
export const colors = {
  background: '#030405', // oklch(0.105 0.004 265)
  surface: '#060608', // oklch(0.125 0.004 265)
  surfaceMuted: '#0c0c0d', // oklch(0.155 0.003 265)
  foreground: '#e8e8e8', // oklch(0.93 0 0)
  card: '#090a0c', // oklch(0.145 0.004 265)
  cardForeground: '#e8e8e8',
  popover: '#090a0c',
  popoverForeground: '#e8e8e8',
  primary: '#e8e8e8',
  primaryForeground: '#050607', // oklch(0.12 0.004 265)
  secondary: '#101012', // oklch(0.175 0.003 265)
  secondaryForeground: '#e8e8e8',
  muted: '#101012',
  mutedForeground: '#868686', // oklch(0.62 0 0)
  accent: '#141516', // oklch(0.195 0.003 265)
  accentForeground: '#e8e8e8',
  destructive: '#f04c55', // oklch(0.65 0.2 22)
  border: 'rgba(255,255,255,0.11)', // oklch(1 0 0 / 11%)
  input: 'rgba(255,255,255,0.16)', // oklch(1 0 0 / 16%)
  ring: '#5d5d5d', // oklch(0.48 0 0)
  chart1: '#1447e6',
  chart2: '#00bc7d',
  chart3: '#fe9a00',
  chart4: '#ad46ff',
  chart5: '#ff2056',
  sidebar: '#030304', // oklch(0.098 0.004 265)
  sidebarForeground: '#e8e8e8',
  sidebarBorder: 'rgba(255,255,255,0.10)',
  white: '#ffffff',
  black: '#000000',
} as const;

/** Tailwind v4 default palette — only the shades the web app actually uses. */
export const tw = {
  violet300: '#c4b4ff',
  violet400: '#a684ff',
  violet500: '#8e51ff',
  violet600: '#7f22fe',
  fuchsia500: '#e12afb',
  purple500: '#ad46ff',
  purple700: '#8200db',
  rose300: '#ffa1ad',
  rose400: '#ff637e',
  rose500: '#ff2056',
  rose600: '#ec003f',
  pink300: '#fda5d5',
  pink400: '#fb64b6',
  pink500: '#f6339a',
  pink600: '#e60076',
  pink700: '#c6005c',
  red400: '#ff6467',
  red500: '#fb2c36',
  red600: '#e7000b',
  red700: '#c10007',
  red900: '#82181a',
  red950: '#460809',
  orange400: '#ff8904',
  amber300: '#ffd230',
  amber400: '#ffb900',
  amber500: '#fe9a00',
  amber600: '#e17100',
  amber700: '#bb4d00',
  yellow400: '#fdc700',
  green400: '#05df72',
  green500: '#00c951',
  emerald400: '#00d492',
  emerald500: '#00bc7d',
  emerald600: '#009966',
  teal400: '#00d5be',
  sky300: '#74d4ff',
  sky400: '#00bcff',
  sky500: '#00a6f4',
  blue500: '#2b7fff',
  indigo500: '#615fff',
  indigo600: '#4f39f6',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral400: '#a1a1a1',
  neutral500: '#737373',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
  neutral950: '#0a0a0a',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  slate900: '#0f172b',
} as const;

/** --radius: 0.625rem = 10px; Tailwind radii used across the app. */
export const radius = {
  sm: 6, // calc(var(--radius) - 4px)
  md: 8, // rounded-md (Tailwind .375rem=6? NOTE: web maps rounded-md -> var(--radius)-2px = 8)
  lg: 10, // var(--radius)
  xl: 14, // +4
  '2xl': 18, // +8
  '3xl': 22, // +12
  '4xl': 26, // +16
  full: 9999,
} as const;

/**
 * Font families. Geist == web --font-geist-sans, Outfit == --font-display.
 * font-serif (italic hero titles) falls back to the platform serif exactly like
 * Tailwind's default `font-serif` stack does in the browser.
 */
export const fonts = {
  sans: 'Geist_400Regular',
  sansMedium: 'Geist_500Medium',
  sansSemiBold: 'Geist_600SemiBold',
  sansBold: 'Geist_700Bold',
  sansBlack: 'Geist_900Black',
  mono: 'GeistMono_400Regular',
  display: 'Outfit_400Regular',
  displayMedium: 'Outfit_500Medium',
  displaySemiBold: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
} as const;

/** Pick the Geist face for a given Tailwind font-weight class. */
export function sansWeight(weight: 400 | 500 | 600 | 700 | 800 | 900 = 400): string {
  if (weight >= 900) return fonts.sansBlack;
  if (weight >= 700) return fonts.sansBold;
  if (weight >= 600) return fonts.sansSemiBold;
  if (weight >= 500) return fonts.sansMedium;
  return fonts.sans;
}

export function displayWeight(weight: 400 | 500 | 600 | 700 = 400): string {
  if (weight >= 700) return fonts.displayBold;
  if (weight >= 600) return fonts.displaySemiBold;
  if (weight >= 500) return fonts.displayMedium;
  return fonts.display;
}

/** Tailwind text-size scale: [fontSize, lineHeight]. */
export const text = {
  '2xs': { fontSize: 10, lineHeight: 14 },
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  '2xl': { fontSize: 24, lineHeight: 32 },
  '3xl': { fontSize: 30, lineHeight: 36 },
  '4xl': { fontSize: 36, lineHeight: 40 },
  '5xl': { fontSize: 48, lineHeight: 48 },
  '6xl': { fontSize: 60, lineHeight: 60 },
  '7xl': { fontSize: 72, lineHeight: 72 },
} as const;

/** letter-spacing helpers (Tailwind tracking-* are em-based; RN wants px). */
export const tracking = {
  tighter: (fontSize: number) => -0.05 * fontSize,
  tight: (fontSize: number) => -0.025 * fontSize,
  normal: () => 0,
  wide: (fontSize: number) => 0.025 * fontSize,
  wider: (fontSize: number) => 0.05 * fontSize,
  widest: (fontSize: number) => 0.1 * fontSize,
} as const;

/** Product shadows from globals.css, expressed for RN (iOS shadow + android elevation). */
export const shadows = {
  drawerUp: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 14,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 18,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 20,
  },
} as const;

/** rgba(255,255,255,x) helper — the dark UI leans on white alphas everywhere. */
export const whiteAlpha = (opacity: number) => `rgba(255,255,255,${opacity})`;
export const blackAlpha = (opacity: number) => `rgba(0,0,0,${opacity})`;
