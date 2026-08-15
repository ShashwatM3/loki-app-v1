import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '../lib/theme';

/** Port of components/full-page-loader.tsx — the Loki lottie centered full-screen. */
export default function FullPageLoader() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/web/lokianimation.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  lottie: {
    width: 280, // w-70
    height: 280,
  },
});
