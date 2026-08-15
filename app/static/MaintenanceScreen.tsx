import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { ChevronDown } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { WEB_BASE_URL } from '../../services/apiClient';
import { colors, fonts, radius, tw } from '../../lib/theme';

/**
 * The exact same simplex-noise canvas waves as components/ui/wavy-background.tsx,
 * running in a WebView so the visuals match the site pixel-for-pixel.
 */
const WAVY_HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#030405}canvas{position:absolute;inset:0}</style>
<script src="https://unpkg.com/simplex-noise@4.0.3/dist/cjs/simplex-noise.min.js"></script>
</head><body><canvas id="canvas"></canvas><script>
var noise=(window.SimplexNoise&&window.SimplexNoise.createNoise3D)?window.SimplexNoise.createNoise3D():simplexNoise.createNoise3D();
var canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
var w,h,nt=0,blur=12,waveOpacity=0.35,backgroundFill='#030405';
var waveColors=["#22c55e","#a855f7","#0ea5e9","#f97316"];
function resize(){w=ctx.canvas.width=window.innerWidth;h=ctx.canvas.height=window.innerHeight;ctx.filter='blur('+blur+'px)';}
window.onresize=resize;resize();
function drawWave(n){nt+=0.001;for(var i=0;i<n;i++){ctx.beginPath();ctx.lineWidth=50;ctx.strokeStyle=waveColors[i%waveColors.length];for(var x=0;x<w;x+=5){var y=noise(x/800,0.3*i,nt)*100;ctx.lineTo(x,y+h*0.5);}ctx.stroke();ctx.closePath();}}
function render(){ctx.fillStyle=backgroundFill;ctx.globalAlpha=waveOpacity;ctx.fillRect(0,0,w,h);drawWave(5);requestAnimationFrame(render);}
render();
</script></body></html>`;

/** 1:1 port of app/maintenance/page.tsx. */
export default function MaintenanceScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`${WEB_BASE_URL}/api/maintenance-bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      if (data.ok) {
        navigation.navigate('Landing');
      }
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Wavy canvas background — identical code to the website's WavyBackground */}
      <WebView
        source={{ html: WAVY_HTML }}
        originWhitelist={['*']}
        style={StyleSheet.absoluteFill}
        containerStyle={StyleSheet.absoluteFill}
        scrollEnabled={false}
        pointerEvents="none"
        javaScriptEnabled
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 48,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 512, alignItems: 'center', gap: 32 }}>
          <View style={styles.logoTile}>
            <Image
              source={require('../../assets/web/logo2.png')}
              style={{ height: 32, width: 64 }}
              contentFit="contain"
            />
          </View>

          {/* glass-card */}
          <View style={styles.glassCard}>
            <Text style={styles.eyebrow}>LOWKEY HEADS-UP</Text>
            <Text style={styles.title}>We're still building this.</Text>
            <Text style={styles.body}>
              The app is under development right now — we're tightening the vibes, maps, and plans
              so your nights out feel effortless. Thanks for your patience; we'll be here before you
              know it.
            </Text>
            <Text style={styles.tagline}>
              <Text style={{ color: '#00bc7d' }}>Stay curious.</Text>{' '}
              <Text style={{ color: '#ad46ff' }}>Stay lowkey.</Text>
            </Text>

            {/* Collapsible team access */}
            <View style={styles.collapsible}>
              <Pressable onPress={() => setOpen((v) => !v)} style={styles.collapsibleTrigger}>
                <Text style={styles.collapsibleTriggerText}>Team access — unlock the full site</Text>
                <ChevronDown
                  size={16}
                  color={colors.mutedForeground}
                  style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </Pressable>
              {open ? (
                <View style={{ marginTop: 16, gap: 16 }}>
                  <Text style={styles.formHint}>
                    Enter the maintenance key and password from your env. This sets a secure cookie
                    in your browser so you can browse as usual.
                  </Text>
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Key</Text>
                    <Input
                      value={key}
                      onChangeText={setKey}
                      placeholder="Your bypass key"
                      editable={!pending}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={{ gap: 8 }}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Your bypass password"
                      secureTextEntry
                      editable={!pending}
                      autoCapitalize="none"
                    />
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  <Button onPress={onSubmit} disabled={pending} style={{ alignSelf: 'flex-start' }}>
                    {pending ? 'Checking…' : 'Enter the app'}
                  </Button>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  glassCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.11)',
    paddingHorizontal: 20,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: fonts.displayMedium,
    letterSpacing: 2.4,
    color: colors.mutedForeground,
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: fonts.displaySemiBold,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  body: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  tagline: {
    marginTop: 24,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  collapsible: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 24,
  },
  collapsibleTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  collapsibleTriggerText: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.mutedForeground,
  },
  formHint: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.sansMedium,
    color: colors.foreground,
  },
  errorText: {
    fontSize: 14,
    color: colors.destructive,
    fontFamily: fonts.sans,
  },
});
