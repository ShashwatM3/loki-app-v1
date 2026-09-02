import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle, Line, Path, Rect } from 'react-native-svg';
import { ArrowUpRight } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Web parity: components/landing/section-footer.tsx — the sticker-collage Dubai
 * footer. Every sticker is a drag handle so the collage can be shuffled around,
 * exactly like the web (drag, no momentum, scale 1.08 while dragging).
 */

function TikTokIcon({ size = 16, color = '#4a4650' }: { size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <Path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.83-2.48v-3.2a5.79 5.79 0 1 0 4.92 5.72V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z" />
    </Svg>
  );
}

/**
 * Instagram glyph (lucide geometry; the RN icon package dropped brand icons).
 * Rounded square + lens circle + flash dot, stroke-based like every lucide icon.
 */
function InstagramIcon({ size = 16, color = '#4a4650' }: { size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <Rect x={2} y={2} width={20} height={20} rx={5} ry={5} stroke={color} strokeWidth={2} />
      <SvgCircle cx={12} cy={12} r={4} stroke={color} strokeWidth={2} />
      <Line x1={17.5} y1={6.5} x2={17.51} y2={6.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Sticker shell: white die-cut edge, soft drop shadow, tilt; draggable. */
function Drag({ children, rotate, y }: { children: React.ReactNode; rotate: number; y: number }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const active = useSharedValue(false);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          active.value = true;
        })
        .onChange((e) => {
          tx.value += e.changeX;
          ty.value += e.changeY;
        })
        .onFinalize(() => {
          active.value = false;
        }),
    [active, tx, ty]
  );

  const style = useAnimatedStyle(() => ({
    zIndex: active.value ? 40 : 0,
    transform: [
      { translateX: tx.value },
      { translateY: y + ty.value },
      { rotate: `${rotate}deg` },
      { scale: withTiming(active.value ? 1.08 : 1, { duration: 150 }) },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.sticker, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}

function Label({ children, bg, text = '#121016' }: { children: React.ReactNode; bg: string; text?: string }) {
  return (
    <View style={[styles.label, { backgroundColor: bg }]}>
      <Text style={[styles.labelText, { color: text }]}>{children}</Text>
    </View>
  );
}

function Bubble({ line1, line2, bg }: { line1: string; line2: string; bg: string }) {
  return (
    <View>
      <View style={[styles.bubble, { backgroundColor: bg }]}>
        <Text style={styles.labelText}>{line1}</Text>
        <Text style={styles.bubbleSub}>{line2}</Text>
      </View>
      <View style={[styles.bubbleTail, { backgroundColor: bg }]} />
    </View>
  );
}

function Circle({ top, bottom, emoji }: { top: string; bottom: string; emoji: string }) {
  return (
    <View style={styles.circle}>
      <Text style={styles.circleText}>{top}</Text>
      <Text style={{ fontSize: 22, lineHeight: 24 }}>{emoji}</Text>
      <Text style={styles.circleText}>{bottom}</Text>
    </View>
  );
}

function Emoji({ emoji }: { emoji: string }) {
  return (
    <View style={styles.emoji}>
      <Text style={{ fontSize: 30, lineHeight: 34 }}>{emoji}</Text>
    </View>
  );
}

function Ticket({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.ticket}>
      <Text style={styles.ticketText}>{children}</Text>
    </View>
  );
}

function StreetSign({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.streetSign}>
      <View style={styles.streetSignInner}>
        <Text style={styles.streetSignText}>{children}</Text>
      </View>
    </View>
  );
}

/** The Loki boarding pass — centrepiece of the collage. */
function BoardingPass() {
  return (
    <View style={styles.pass}>
      <View style={styles.passHeader}>
        <Text style={styles.passHeaderText}>✈ Loki Airways</Text>
      </View>
      <View style={styles.passBody}>
        <View>
          <Text style={styles.passDxb}>DXB</Text>
          <Text style={styles.passCity}>Dubai</Text>
        </View>
        <View style={styles.passColumn}>
          <Text style={styles.passSmall}>
            Gate <Text style={styles.passSmallStrong}>Loki</Text>
          </Text>
          <Text style={styles.passSmall}>
            Seat <Text style={styles.passSmallStrong}>7A</Text>
          </Text>
        </View>
        <View style={styles.passBarcode}>
          <Svg width={32} height={32}>
            {Array.from({ length: 11 }, (_, i) => (
              <Line key={i} x1={i * 3 + 0.5} y1={0} x2={i * 3 + 0.5} y2={32} stroke="#121016" strokeWidth={1} />
            ))}
          </Svg>
        </View>
      </View>
    </View>
  );
}

function FooterPill({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.footerPill, pressed && { transform: [{ translateY: -2 }], borderColor: '#121016' }]}>
      {icon}
      <Text style={styles.footerPillText}>{label}</Text>
    </Pressable>
  );
}

export function StickerFooter({
  onOpenApp,
  onAbout,
  onHow,
  onPrivacy,
  onCookies,
}: {
  onOpenApp: () => void;
  onAbout: () => void;
  onHow: () => void;
  onPrivacy: () => void;
  onCookies: () => void;
}) {
  return (
    <View style={styles.footer}>
      <View style={styles.collageWrap}>
        <View style={styles.collage}>
          <Drag rotate={-8} y={10}><Emoji emoji="🐪" /></Drag>
          <Drag rotate={-6} y={-14}><Label bg="#8fe3c4">Dubai{'\n'}dreaming</Label></Drag>
          <Drag rotate={5} y={16}><Label bg="#ffffff">Padel o&apos;clock 🎾</Label></Drag>
          <Drag rotate={-4} y={-6}><Circle top="Good vibes" bottom="only" emoji="🙂" /></Drag>
          <Drag rotate={4} y={18}><Ticket>Karak overrated? Never ☕</Ticket></Drag>
          <Drag rotate={9} y={-16}><Emoji emoji="✌️" /></Drag>
          <Drag rotate={-3} y={6}><BoardingPass /></Drag>
          <Drag rotate={5} y={-18}><Label bg="#121016" text="#ffffff">Collect moments not things ❤️</Label></Drag>
          <Drag rotate={-7} y={14}><Label bg="#ffffff">Karting nights 🏎️</Label></Drag>
          <Drag rotate={7} y={-8}><Emoji emoji="🎳" /></Drag>
          <Drag rotate={-5} y={12}><Bubble bg="#f7b8cf" line1="Too many plans" line2="(love it)" /></Drag>
          <Drag rotate={6} y={-12}><Label bg="#f2cd4a">Gold souk energy 💎</Label></Drag>
          <Drag rotate={-4} y={18}><Label bg="#ffffff">Desert dunes 🏜️</Label></Drag>
          <Drag rotate={8} y={-14}><Emoji emoji="🪂" /></Drag>
          <Drag rotate={4} y={8}><Bubble bg="#c9bcff" line1="Escape room" line2="60 minutes" /></Drag>
          <Drag rotate={-6} y={-16}><Label bg="#ffffff">Trampoline park 🤸</Label></Drag>
          <Drag rotate={5} y={14}><StreetSign>Happiness St.</StreetSign></Drag>
          <Drag rotate={-8} y={-6}><Label bg="#8fe3c4">Explore Dubai ✨</Label></Drag>
          <Drag rotate={6} y={16}><Emoji emoji="🌆" /></Drag>
        </View>

        <View style={styles.pillRow}>
          <FooterPill
            label="Explore Loki"
            icon={<ArrowUpRight size={16} color="#4a4650" />}
            onPress={onOpenApp}
          />
          <FooterPill
            label="Instagram"
            icon={<InstagramIcon size={16} color="#4a4650" />}
            onPress={() => Linking.openURL('https://www.instagram.com/loki.dubai/')}
          />
          <FooterPill
            label="TikTok"
            icon={<TikTokIcon />}
            onPress={() => Linking.openURL('https://www.tiktok.com/@loki.dubai')}
          />
        </View>
      </View>

      <View style={styles.legalRow}>
        <Text style={styles.legalText}>© {new Date().getFullYear()} Loki · Dubai, UAE</Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={onAbout} hitSlop={6}>
            <Text style={styles.legalText}>About</Text>
          </Pressable>
          <Pressable onPress={onHow} hitSlop={6}>
            <Text style={styles.legalText}>How it works</Text>
          </Pressable>
          <Pressable onPress={onPrivacy} hitSlop={6}>
            <Text style={styles.legalText}>Privacy</Text>
          </Pressable>
          <Pressable onPress={onCookies} hitSlop={6}>
            <Text style={styles.legalText}>Cookies</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // border-t border-[#e7e5e1] bg-[#f7f5f2]
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e7e5e1',
    backgroundColor: '#f7f5f2',
  },
  // px-5 pb-6 pt-14
  collageWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 56,
  },
  // flex flex-wrap items-center justify-center gap-x-3 gap-y-4
  collage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
    rowGap: 16,
  },
  // shadow-[0_6px_14px_rgba(18,16,22,0.16)]
  sticker: {
    shadowColor: 'rgb(18,16,22)',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  // rounded-[10px] border-[3px] border-white px-3 py-2
  label: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  // text-[13px] font-extrabold uppercase leading-[1.1] tracking-[-0.01em]
  labelText: {
    fontSize: 13,
    lineHeight: 13 * 1.1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.13,
    textAlign: 'center',
    color: '#121016',
  },
  // rounded-[14px] border-[3px] border-white px-3.5 py-2 (12.5px)
  bubble: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  // text-[10px] font-bold normal-case
  bubbleSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#121016',
    textAlign: 'center',
  },
  // -bottom-[9px] left-5 size-3.5 rotate-45 rounded-[3px] border-b/r-[3px] border-white
  bubbleTail: {
    position: 'absolute',
    bottom: -9,
    left: 20,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
  },
  // size-[86px] rounded-full border-[3px] border-white bg-[#f3ece1]
  circle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#f3ece1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#3b3630]
  circleText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 9 * 0.08,
    color: '#3b3630',
    textAlign: 'center',
  },
  // size-[64px] rounded-full border-[3px] border-white bg-white
  emoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // rounded-[6px] border-[3px] border-white bg-[#efe6d2] px-3.5 py-2
  ticket: {
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#efe6d2',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  // text-[13px] font-extrabold uppercase leading-[1.1] tracking-[0.02em] text-[#5b5140]
  ticketText: {
    fontSize: 13,
    lineHeight: 13 * 1.1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 13 * 0.02,
    color: '#5b5140',
  },
  // rounded-[8px] border-[3px] border-white bg-[#0f6b45] p-[3px]
  streetSign: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#0f6b45',
    padding: 3,
  },
  // rounded-[5px] border border-white/80 px-3 py-1.5
  streetSignInner: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // text-[13px] font-extrabold uppercase tracking-[0.02em] text-white
  streetSignText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 13 * 0.02,
    color: '#ffffff',
  },
  // w-[228px] rounded-[10px] border-[3px] border-white bg-white
  pass: {
    width: 228,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  // bg-[#5B21F2] px-2.5 py-1
  passHeader: {
    backgroundColor: '#5B21F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  // text-[9.5px] font-bold uppercase tracking-[0.14em] text-white
  passHeaderText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 9.5 * 0.14,
    color: '#ffffff',
  },
  // flex items-end gap-2.5 px-2.5 py-2
  passBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  // text-[30px] font-extrabold tracking-[-0.02em] text-[#121016]
  passDxb: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#121016',
  },
  // mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a4650]
  passCity: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#4a4650',
  },
  // border-l border-dashed border-[#c9c5cf] pl-2.5 gap-1
  passColumn: {
    gap: 4,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderLeftColor: '#c9c5cf',
    paddingLeft: 10,
  },
  // text-[8px] font-bold uppercase tracking-[0.12em] text-[#8b8792]
  passSmall: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 8 * 0.12,
    color: '#8b8792',
  },
  // b text-[11px] text-[#121016]
  passSmallStrong: {
    fontSize: 11,
    color: '#121016',
  },
  // ml-auto h-8 w-8 self-center barcode
  passBarcode: {
    marginLeft: 'auto',
    alignSelf: 'center',
    width: 32,
    height: 32,
    overflow: 'hidden',
  },
  // mt-10 flex flex-wrap items-center justify-center gap-2.5
  pillRow: {
    marginTop: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  // rounded-full border border-[#dcd9d4] bg-white px-4 py-2 shadow-[0_2px_6px_rgba(18,16,22,0.06)]
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#dcd9d4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: 'rgb(18,16,22)',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // text-[13px] font-bold text-[#4a4650]
  footerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a4650',
  },
  // border-t border-[#e7e5e1] px-5 py-5, text-[12.5px] text-[#8b8792], gaps
  legalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e7e5e1',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 20,
    rowGap: 8,
  },
  legalText: {
    fontSize: 12.5,
    color: '#8b8792',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 8,
  },
});
