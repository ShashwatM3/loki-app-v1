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
</head><body><canvas id="canvas"></canvas><script>
// Inline 3D simplex noise (Stefan Gustavson's public-domain algorithm) — same
// output family as the simplex-noise package the website uses.
var noise=(function(){
  var grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  var p=[];for(var i=0;i<256;i++){p[i]=Math.floor(Math.random()*256);}
  var perm=[];for(var i=0;i<512;i++){perm[i]=p[i&255];}
  function dot(g,x,y,z){return g[0]*x+g[1]*y+g[2]*z;}
  return function(xin,yin,zin){
    var F3=1/3,G3=1/6;var n0,n1,n2,n3;
    var s=(xin+yin+zin)*F3;
    var i=Math.floor(xin+s),j=Math.floor(yin+s),k=Math.floor(zin+s);
    var t=(i+j+k)*G3;
    var x0=xin-(i-t),y0=yin-(j-t),z0=zin-(k-t);
    var i1,j1,k1,i2,j2,k2;
    if(x0>=y0){if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;}else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;}else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;}}
    else{if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;}else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;}else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;}}
    var x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3;
    var x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3;
    var x3=x0-1+3*G3,y3=y0-1+3*G3,z3=z0-1+3*G3;
    var ii=i&255,jj=j&255,kk=k&255;
    var gi0=perm[ii+perm[jj+perm[kk]]]%12;
    var gi1=perm[ii+i1+perm[jj+j1+perm[kk+k1]]]%12;
    var gi2=perm[ii+i2+perm[jj+j2+perm[kk+k2]]]%12;
    var gi3=perm[ii+1+perm[jj+1+perm[kk+1]]]%12;
    var t0=0.6-x0*x0-y0*y0-z0*z0;
    if(t0<0)n0=0;else{t0*=t0;n0=t0*t0*dot(grad3[gi0],x0,y0,z0);}
    var t1=0.6-x1*x1-y1*y1-z1*z1;
    if(t1<0)n1=0;else{t1*=t1;n1=t1*t1*dot(grad3[gi1],x1,y1,z1);}
    var t2=0.6-x2*x2-y2*y2-z2*z2;
    if(t2<0)n2=0;else{t2*=t2;n2=t2*t2*dot(grad3[gi2],x2,y2,z2);}
    var t3=0.6-x3*x3-y3*y3-z3*z3;
    if(t3<0)n3=0;else{t3*=t3;n3=t3*t3*dot(grad3[gi3],x3,y3,z3);}
    return 32*(n0+n1+n2+n3);
  };
})();
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
