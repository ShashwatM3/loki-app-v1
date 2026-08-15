import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';

export type GlowStop = { offset: number; color: string; opacity: number };

/**
 * A CSS `radial-gradient(...)`-alike built on SVG — the building block for the
 * animated glows (onboarding, profile, landing, collection banner).
 * Renders an ellipse filled with a radial gradient centered at (cx%, cy%).
 */
export function RadialGlow({
  stops,
  cx = 50,
  cy = 100,
  rx = 110,
  ry = 90,
  style,
}: {
  stops: GlowStop[];
  /** Gradient center as % of the box. */
  cx?: number;
  cy?: number;
  /** Gradient radii as % of the box. */
  rx?: number;
  ry?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <SvgRadialGradient id={id} cx={`${cx}%`} cy={`${cy}%`} rx={`${rx}%`} ry={`${ry}%`} gradientUnits="userSpaceOnUse">
            {stops.map((s, i) => (
              <Stop key={i} offset={`${s.offset}%`} stopColor={s.color} stopOpacity={s.opacity} />
            ))}
          </SvgRadialGradient>
        </Defs>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
