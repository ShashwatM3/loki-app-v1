import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Check, X, MapPin } from 'lucide-react-native';
import { getGradientFromString, parseCssGradient } from '../../lib/utils';
import { placeMetaLine, genZBlurb } from '../../lib/placeBlurb';
import { colors, fonts, radius, tw } from '../../lib/theme';
import type { Place } from '../../lib/types';

export type Vote = 'yes' | 'no';

const SWIPE_THRESHOLD = 110;

/** Stable identity for a place, used to target a fling at one specific card. */
function cardKey(place: Place): string {
  return String(place.id ?? place.name);
}

/**
 * A single Tinder-style card — 1:1 port of collection-swipe-deck.tsx. The top
 * card is draggable; a parent-supplied `flingRequest` lets the Yes/No buttons
 * trigger the same off-screen spring animation as a drag would.
 */
function SwipeCard({
  place,
  index,
  isTop,
  flingRequest,
  onVote,
}: {
  place: Place;
  index: number;
  isTop: boolean;
  flingRequest: Vote | null;
  onVote: (vote: Vote) => void;
}) {
  const { width: screenW } = useWindowDimensions();
  const x = useSharedValue(0);
  const leavingRef = React.useRef(false);
  const fallback = parseCssGradient(getGradientFromString(String(place.id ?? place.name)));

  const flingOff = React.useCallback(
    (vote: Vote) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      x.value = withSpring(vote === 'yes' ? 700 : -700, { stiffness: 220, damping: 28 });
      setTimeout(() => onVote(vote), 180);
    },
    [onVote, x]
  );

  React.useEffect(() => {
    if (isTop && flingRequest) flingOff(flingRequest);
  }, [isTop, flingRequest, flingOff]);

  const finish = React.useCallback(
    (vote: Vote) => {
      flingOff(vote);
    },
    [flingOff]
  );

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(isTop)
        .activeOffsetX([-10, 10])
        .onChange((e) => {
          x.value = e.translationX * 0.9; // dragElastic feel
        })
        .onEnd((e) => {
          if (Math.abs(e.translationX) > SWIPE_THRESHOLD || Math.abs(e.velocityX) > 500) {
            runOnJS(finish)(e.translationX > 0 ? 'yes' : 'no');
          } else {
            x.value = withSpring(0, { stiffness: 300, damping: 26 });
          }
        }),
    [isTop, finish, x]
  );

  const depth = Math.min(index, 2);
  const restingScale = 1 - depth * 0.05;
  const restingY = depth * 14;

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(x.value, [-220, 0, 220], [-14, 0, 14]);
    return {
      transform: [
        { translateX: isTop ? x.value : 0 },
        { translateY: withSpring(isTop ? 0 : restingY, { stiffness: 260, damping: 30 }) },
        { scale: withSpring(isTop ? 1 : restingScale, { stiffness: 260, damping: 30 }) },
        { rotate: `${isTop ? rotate : 0}deg` },
      ],
      zIndex: isTop ? 30 : 30 - index,
    };
  });

  const yesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, 130], [0, 1], 'clamp'),
  }));
  const noStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-130, -20], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[StyleSheet.absoluteFill, cardStyle]}>
        <View style={styles.card}>
          {place.image ? (
            <Image source={{ uri: place.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={fallback.colors}
              start={fallback.start}
              end={fallback.end}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.1)']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          {isTop ? (
            <>
              <Animated.View style={[styles.stampYes, yesStyle]}>
                <Text style={styles.stampYesText}>Yes</Text>
              </Animated.View>
              <Animated.View style={[styles.stampNo, noStyle]}>
                <Text style={styles.stampNoText}>Nope</Text>
              </Animated.View>
            </>
          ) : null}

          <View style={styles.cardBottom}>
            {place.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{place.category}</Text>
              </View>
            ) : null}
            <Text style={styles.cardTitle}>{place.name}</Text>
            <Text style={styles.cardMeta}>{placeMetaLine(place)}</Text>
            <Text numberOfLines={2} style={styles.cardBlurb}>
              {genZBlurb(place)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * The interactive deck: renders the remaining (un-voted) places as a stack and
 * offers Yes/No buttons alongside drag.
 */
export function CollectionSwipeDeck({
  places,
  onVote,
  votedCount,
  totalCount,
}: {
  places: Place[];
  onVote: (place: Place, vote: Vote) => void;
  votedCount: number;
  totalCount: number;
}) {
  const top = places[0];
  const [fling, setFling] = React.useState<{ key: string; vote: Vote } | null>(null);
  const decidedRef = React.useRef<Set<string>>(new Set());

  // Forget cards that left the deck so a re-added place can be voted on again.
  React.useEffect(() => {
    const live = new Set(places.map(cardKey));
    decidedRef.current.forEach((key) => {
      if (!live.has(key)) decidedRef.current.delete(key);
    });
  }, [places]);

  const handleVote = (place: Place, vote: Vote) => {
    const key = cardKey(place);
    if (decidedRef.current.has(key)) return;
    decidedRef.current.add(key);
    setFling(null);
    onVote(place, vote);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.deckHeader}>
        <MapPin size={16} color={tw.rose400} />
        <Text style={styles.deckHeaderText}>
          Swipe to decide · {votedCount}/{totalCount}
        </Text>
      </View>

      <View style={styles.deck}>
        {places
          .slice(0, 3)
          .map((place, i) => (
            <SwipeCard
              key={cardKey(place)}
              place={place}
              index={i}
              isTop={i === 0}
              flingRequest={i === 0 && fling?.key === cardKey(place) ? fling.vote : null}
              onVote={(vote) => handleVote(place, vote)}
            />
          ))
          .reverse()}
      </View>

      <View style={styles.deckActions}>
        <Pressable
          accessibilityLabel="Vote no"
          onPress={() => top && setFling({ key: cardKey(top), vote: 'no' })}
          style={({ pressed }) => [styles.voteBtn, styles.voteNo, pressed && { transform: [{ scale: 0.9 }] }]}
        >
          <X size={28} color={tw.rose500} strokeWidth={3} />
        </Pressable>
        <Pressable
          accessibilityLabel="Vote yes"
          onPress={() => top && setFling({ key: cardKey(top), vote: 'yes' })}
          style={({ pressed }) => [styles.voteBtn, styles.voteYes, pressed && { transform: [{ scale: 0.9 }] }]}
        >
          <Check size={28} color={tw.emerald400} strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deckHeaderText: {
    fontSize: 12,
    fontFamily: fonts.displayBold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tw.neutral400,
  },
  deck: {
    height: 440,
    width: '100%',
    maxWidth: 384,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: tw.neutral900,
  },
  stampYes: {
    position: 'absolute',
    top: 24,
    left: 24,
    transform: [{ rotate: '-12deg' }],
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: tw.emerald400,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stampYesText: {
    fontSize: 24,
    fontFamily: fonts.sansBlack,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tw.emerald400,
  },
  stampNo: {
    position: 'absolute',
    top: 24,
    right: 24,
    transform: [{ rotate: '12deg' }],
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: tw.rose500,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stampNoText: {
    fontSize: 24,
    fontFamily: fonts.sansBlack,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tw.rose500,
  },
  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: tw.rose500,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#fff',
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: fonts.sansBold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: 'rgba(255,255,255,0.9)',
  },
  cardBlurb: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.sans,
  },
  deckActions: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  voteBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tw.neutral900,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  voteNo: {
    borderColor: 'rgba(255,32,86,0.4)',
  },
  voteYes: {
    borderColor: 'rgba(0,212,146,0.4)',
  },
});
