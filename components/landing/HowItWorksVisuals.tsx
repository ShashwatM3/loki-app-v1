import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, Line, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { LANDING_IMAGES } from './landingImages';

/**
 * Web parity: components/landing/section-how-it-works.tsx and loki-ui.tsx.
 * These are the in-product mock visuals used by the four how-it-works steps.
 */

export type ShowcaseSpot = {
  name: string;
  emoji: string;
  price: number;
  area: string;
  x: number;
  y: number;
};

export function priceLabel(price: number) {
  return price === 0 ? 'Free' : `AED ${price}`;
}

/** Work-friendly picks for the chat answer — identical data to the web. */
const WORK_SPOTS: ShowcaseSpot[] = [
  { name: 'Roastery Café', emoji: '\u2615', price: 45, area: 'Al Quoz', x: 0.24, y: 0.36 },
  { name: 'Quoz Reading Room', emoji: '\u{1F4D6}', price: 30, area: 'Alserkal', x: 0.55, y: 0.62 },
  { name: 'Marina Work Club', emoji: '\u{1F4BB}', price: 60, area: 'Dubai Marina', x: 0.78, y: 0.28 },
];

const TRENDING = [
  { image: LANDING_IMAGES['rooftop-friends'], name: 'Rooftop plans', meta: 'Dubai Marina' },
  { image: LANDING_IMAGES['karting-night'], name: 'Chaos Karts', meta: 'Al Quoz · AED 145' },
  { image: LANDING_IMAGES['gallery-night'], name: 'Alserkal Avenue', meta: 'Al Quoz · free' },
] as const;

/** The dark Dubai map plate: coastline wash, road grid, arterials, blocks. */
export function MapCanvas({
  height,
  radius = 12,
  labels = true,
  children,
  style,
}: {
  height: number;
  radius?: number;
  labels?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: '#0b0b12' }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgRadialGradient id="water" cx="8%" cy="96%" rx="120%" ry="90%">
            <Stop offset="0%" stopColor="rgb(56,58,120)" stopOpacity="0.55" />
            <Stop offset="38%" stopColor="rgb(24,25,55)" stopOpacity="0.35" />
            <Stop offset="62%" stopColor="rgb(24,25,55)" stopOpacity="0" />
          </SvgRadialGradient>
          <SvgRadialGradient id="land" cx="70%" cy="20%" rx="90%" ry="70%">
            <Stop offset="0%" stopColor="rgb(139,92,246)" stopOpacity="0.16" />
            <Stop offset="60%" stopColor="rgb(139,92,246)" stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#water)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#land)" />
        {/* road grid: repeating 115deg / 25deg hairlines at 50% layer opacity */}
        {Array.from({ length: 9 }, (_, i) => (
          <Line
            key={`g1-${i}`}
            x1={-40 + i * 78}
            y1="120%"
            x2={40 + i * 78}
            y2="-20%"
            stroke="rgba(255,255,255,0.075)"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <Line
            key={`g2-${i}`}
            x1="-10%"
            y1={-30 + i * 96}
            x2="110%"
            y2={15 + i * 96}
            stroke="rgba(255,255,255,0.055)"
            strokeWidth={0.5}
            opacity={0.5}
          />
        ))}
      </Svg>
      {/* arterials */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[mapStyles.arterial, { top: '38%', height: 3, backgroundColor: 'rgba(255,255,255,0.11)' }]} />
        <View style={[mapStyles.arterial, { top: '62%', height: 2, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={mapStyles.arterialVertical} />
      </View>
      {/* blocks */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}>
        <View style={[mapStyles.block, { left: '12%', top: '12%', width: 64, height: 64 }]} />
        <View style={[mapStyles.block, { left: '62%', top: '16%', width: 96, height: 96 }]} />
        <View style={[mapStyles.block, { left: '30%', top: '56%', width: 112, height: 80 }]} />
        <View style={[mapStyles.block, { left: '74%', top: '64%', width: 80, height: 80 }]} />
      </View>
      {labels ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Text style={[mapStyles.label, { left: '8%', top: '20%' }]}>Al Quoz</Text>
          <Text style={[mapStyles.label, { left: '58%', top: '12%' }]}>Downtown</Text>
          <Text style={[mapStyles.label, { left: '16%', top: '78%' }]}>Jumeirah</Text>
          <Text style={[mapStyles.label, { left: '70%', top: '82%' }]}>Nad Al Sheba</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** A map pin: emoji + price chip with a dot underneath. */
export function Pin({ spot, active = false }: { spot: ShowcaseSpot; active?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={[
          pinStyles.chip,
          active
            ? { borderColor: 'rgba(196,181,253,0.7)', backgroundColor: 'rgba(139,92,246,0.25)' }
            : { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.7)' },
        ]}
      >
        <Text style={{ fontSize: 8 }}>{spot.emoji}</Text>
        <Text style={pinStyles.price}>{priceLabel(spot.price)}</Text>
      </View>
      <View
        style={[
          pinStyles.dot,
          active && { backgroundColor: '#c4b5fd' },
        ]}
      />
    </View>
  );
}

/** The Loki chat: one plain-language ask, answered with spots on a map. */
export function ChatMock() {
  return (
    <View style={chatStyles.card}>
      <View style={{ gap: 10 }}>
        <View style={chatStyles.userBubble}>
          <Text style={chatStyles.userText}>chill cafe to work from</Text>
        </View>
        <View style={chatStyles.lokiBubble}>
          <Text style={chatStyles.lokiLabel}>Loki</Text>
          <Text style={chatStyles.lokiText}>Three work-friendly spots, laptops welcome:</Text>
          <MapCanvas height={132} labels={false} style={{ marginTop: 10 }}>
            {WORK_SPOTS.map((spot, index) => (
              <View
                key={spot.name}
                style={{ position: 'absolute', left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
              >
                <Pin spot={spot} active={index === 0} />
              </View>
            ))}
          </MapCanvas>
          <View style={{ marginTop: 8, gap: 4 }}>
            {WORK_SPOTS.map((spot) => (
              <View key={spot.name} style={chatStyles.resultRow}>
                <Text style={{ fontSize: 13 }}>{spot.emoji}</Text>
                <Text style={chatStyles.resultName} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={chatStyles.resultMeta}>
                  {spot.area} · {priceLabel(spot.price)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/** The feed of trending spots, as it looks inside Loki. */
export function TrendingMock() {
  return (
    <View style={{ width: '100%', maxWidth: 280 }}>
      {TRENDING.map((item, index) => (
        <View
          key={item.name}
          style={[trendStyles.row, index === TRENDING.length - 1 && { borderBottomWidth: 0 }]}
        >
          <View style={trendStyles.thumb}>
            <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={trendStyles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={trendStyles.meta} numberOfLines={1}>
              {item.meta}
            </Text>
          </View>
          <View style={trendStyles.badge}>
            <Text style={trendStyles.badgeText}>Trending</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The confirmation card you land on once a plan is locked in. */
export function ConfirmMock() {
  return (
    <View style={confirmStyles.card}>
      <View style={confirmStyles.checkCircle}>
        <Check size={20} color="#ffffff" />
      </View>
      <Text style={confirmStyles.title}>You&apos;re in for Friday</Text>
      <Text style={confirmStyles.subtitle}>Padel for 4 · Padel Park · 9:00 PM</Text>
      <View style={confirmStyles.dashedBox}>
        <Text style={confirmStyles.dashedText}>Confirmation</Text>
        <Text style={confirmStyles.dashedText}>#LK-2291</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  arterial: {
    position: 'absolute',
    left: '-10%',
    width: '130%',
    transform: [{ rotate: '-14deg' }],
  },
  arterialVertical: {
    position: 'absolute',
    left: '46%',
    top: '-10%',
    height: '130%',
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{ rotate: '16deg' }],
  },
  block: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '16deg' }],
  },
  // font-mono text-[9px] uppercase tracking-[0.2em] text-white/25
  label: {
    position: 'absolute',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 9 * 0.2,
    color: 'rgba(255,255,255,0.25)',
    fontFamily: 'GeistMono_400Regular',
  },
});

const pinStyles = StyleSheet.create({
  // rounded-full border px-1.5 py-[3px] shadow backdrop-blur (sm size)
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  // text-[7px] font-medium text-white
  price: {
    fontSize: 7,
    fontWeight: '500',
    color: '#ffffff',
  },
  // mt-0.5 size-1 rounded-full bg-white/70
  dot: {
    marginTop: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

const chatStyles = StyleSheet.create({
  // w-full max-w-[324px] rounded-[20px] bg-white p-4 shadow-[0_20px_40px_rgba(18,16,22,0.08)]
  card: {
    width: '100%',
    maxWidth: 324,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: 'rgb(18,16,22)',
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 6,
  },
  // max-w-[85%] self-end rounded-[16px] rounded-br-[6px] bg-[#121016] px-3.5 py-2.5
  userBubble: {
    maxWidth: '85%',
    alignSelf: 'flex-end',
    borderRadius: 16,
    borderBottomRightRadius: 6,
    backgroundColor: '#121016',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  // text-[13.5px] leading-[1.35] text-white
  userText: {
    fontSize: 13.5,
    lineHeight: 13.5 * 1.35,
    color: '#ffffff',
  },
  // w-full self-start rounded-[16px] rounded-bl-[6px] bg-[#f0eefb] p-2.5
  lokiBubble: {
    width: '100%',
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 6,
    backgroundColor: '#f0eefb',
    padding: 10,
    overflow: 'hidden',
  },
  // px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5B21F2]
  lokiLabel: {
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 11 * 0.14,
    color: '#5B21F2',
  },
  // mt-1 px-1 text-[13.5px] leading-[1.4] text-[#2b2733]
  lokiText: {
    marginTop: 4,
    paddingHorizontal: 4,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.4,
    color: '#2b2733',
  },
  // flex items-center gap-2 rounded-[10px] bg-white px-2 py-1.5
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  // text-[12px] font-semibold text-[#121016]
  resultName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '600',
    color: '#121016',
  },
  // text-[10.5px] text-[#8b8792]
  resultMeta: {
    fontSize: 10.5,
    color: '#8b8792',
  },
});

const trendStyles = StyleSheet.create({
  // flex items-center gap-3 border-b border-[#e7e5e1] py-2.5
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e1',
    paddingVertical: 10,
  },
  // size-[52px] rounded-xl
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // text-sm font-semibold text-[#121016]
  name: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#121016',
  },
  // text-xs text-[#8b8792]
  meta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8b8792',
  },
  // rounded-full bg-[#5B21F2]/10 px-2 py-1
  badge: {
    borderRadius: 9999,
    backgroundColor: 'rgba(91,33,242,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B21F2]
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 10 * 0.12,
    color: '#5B21F2',
  },
});

const confirmStyles = StyleSheet.create({
  // w-full max-w-[260px] rounded-[20px] bg-white p-6 shadow-[0_20px_40px_rgba(18,16,22,0.08)]
  card: {
    width: '100%',
    maxWidth: 260,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 24,
    shadowColor: 'rgb(18,16,22)',
    shadowOpacity: 0.08,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 6,
  },
  // mb-4 size-11 rounded-full bg-[#5B21F2]
  checkCircle: {
    marginBottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5B21F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // text-lg font-extrabold tracking-tight text-[#121016]
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.45,
    color: '#121016',
  },
  // mt-1.5 text-[13.5px] text-[#8b8792]
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    color: '#8b8792',
  },
  // mt-4 rounded-xl border border-dashed border-[#e7e5e1] p-3.5
  dashedBox: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e7e5e1',
    padding: 14,
  },
  // text-[13px] font-semibold text-[#4a4650]
  dashedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a4650',
  },
});
