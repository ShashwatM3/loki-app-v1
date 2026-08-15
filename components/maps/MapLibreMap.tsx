import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { MAPLIBRE_HTML } from './maplibreHtml';

/** Marker specs mirroring every marker style the website renders. */
export type MapMarkerSpec =
  | {
      kind: 'place';
      id: string;
      lng: number;
      lat: number;
      image?: string;
      gradient?: string;
      active?: boolean;
      activePopup?: boolean;
      popupDot?: boolean;
      emoji?: string;
      clickable?: boolean;
    }
  | { kind: 'user'; id: string; lng: number; lat: number; clickable?: boolean }
  | {
      kind: 'thumb';
      id: string;
      lng: number;
      lat: number;
      name?: string;
      image?: string;
      gradient?: string;
      active?: boolean;
      clickable?: boolean;
    }
  | {
      kind: 'participant';
      id: string;
      lng: number;
      lat: number;
      color: string;
      photo?: string;
      initials?: string;
      isYou?: boolean;
      clickable?: boolean;
    }
  | { kind: 'numbered'; id: string; lng: number; lat: number; index: number; active?: boolean; clickable?: boolean }
  | { kind: 'dot'; id: string; lng: number; lat: number; clickable?: boolean }
  | { kind: 'university'; id: string; lng: number; lat: number; clickable?: boolean };

export type MapPopupSpec = {
  kindCard: 'placeCard' | 'collectionCard';
  id: string;
  lng: number;
  lat: number;
  signedIn?: boolean;
  place: {
    name: string;
    category?: string;
    image?: string;
    gradient?: string;
    hours?: string;
    website?: string;
    popup?: boolean;
    activePopup?: boolean;
    catEmoji?: string;
  };
};

export interface MapLibreMapRef {
  flyTo: (opts: { center: [number, number]; zoom?: number; minTargetZoom?: number; duration?: number }) => void;
  easeTo: (opts: { center: [number, number]; zoom?: number; duration?: number }) => void;
  fitBounds: (points: [number, number][], opts?: { padding?: number; maxZoom?: number; duration?: number; singleZoom?: number }) => void;
  resize: () => void;
}

interface MapLibreMapProps {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxBounds?: [[number, number], [number, number]];
  interactive?: boolean;
  markers?: MapMarkerSpec[];
  popup?: MapPopupSpec | null;
  onLoad?: () => void;
  onMarkerClick?: (id: string) => void;
  onPopupAction?: (action: string, id: string) => void;
  onPopupClose?: () => void;
  /** Fit these points once the map loads (collection maps / recs mini-map). */
  fitOnLoad?: { points: [number, number][]; padding?: number; maxZoom?: number; duration?: number; singleZoom?: number };
  style?: StyleProp<ViewStyle>;
}

/**
 * The website's MapLibre GL map (Carto dark-matter style), running inside a
 * WebView so the basemap, markers and popups are pixel-identical to the web.
 */
export const MapLibreMap = forwardRef<MapLibreMapRef, MapLibreMapProps>(function MapLibreMap(
  {
    center,
    zoom,
    minZoom,
    maxBounds,
    interactive = true,
    markers,
    popup,
    onLoad,
    onMarkerClick,
    onPopupAction,
    onPopupClose,
    fitOnLoad,
    style,
  },
  ref
) {
  const webviewRef = useRef<WebView>(null);
  const [webReady, setWebReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const queueRef = useRef<object[]>([]);

  const post = useCallback((cmd: object) => {
    const wv = webviewRef.current;
    if (!wv) {
      queueRef.current.push(cmd);
      return;
    }
    wv.injectJavaScript(`window.__cmd && window.__cmd(${JSON.stringify(cmd)}); true;`);
  }, []);

  // Boot the map once the webview JS is ready.
  useEffect(() => {
    if (!webReady) return;
    post({
      type: 'init',
      center,
      zoom,
      minZoom,
      maxBounds,
      interactive,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webReady]);

  // Keep markers in sync.
  useEffect(() => {
    if (!webReady) return;
    post({ type: 'setMarkers', markers: markers ?? [] });
  }, [markers, post, webReady]);

  // Keep popup in sync.
  useEffect(() => {
    if (!webReady) return;
    post({ type: 'setPopup', popup: popup ?? null });
  }, [popup, post, webReady]);

  // Fit-on-load behavior.
  useEffect(() => {
    if (!mapLoaded || !fitOnLoad || fitOnLoad.points.length === 0) return;
    post({
      type: 'fitBounds',
      points: fitOnLoad.points,
      padding: fitOnLoad.padding,
      maxZoom: fitOnLoad.maxZoom,
      duration: fitOnLoad.duration,
      singleZoom: fitOnLoad.singleZoom,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (opts) => post({ type: 'flyTo', ...opts }),
      easeTo: (opts) => post({ type: 'easeTo', ...opts }),
      fitBounds: (points, opts) => post({ type: 'fitBounds', points, ...(opts ?? {}) }),
      resize: () => post({ type: 'resize' }),
    }),
    [post]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let msg: { type?: string; id?: string; action?: string; message?: string };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case 'ready':
          setWebReady(true);
          break;
        case 'loaded':
          setMapLoaded(true);
          onLoad?.();
          break;
        case 'markerClick':
          if (msg.id != null) onMarkerClick?.(msg.id);
          break;
        case 'popupAction':
          if (msg.action) onPopupAction?.(msg.action, msg.id ?? '');
          break;
        case 'popupClose':
          onPopupClose?.();
          break;
        default:
          break;
      }
    },
    [onLoad, onMarkerClick, onPopupAction, onPopupClose]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: MAPLIBRE_HTML, baseUrl: 'https://lokidxb.com' }}
        onMessage={handleMessage}
        style={styles.webview}
        containerStyle={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setBuiltInZoomControls={false}
        allowsBackForwardNavigationGestures={false}
        androidLayerType="hardware"
        pointerEvents={interactive ? 'auto' : 'none'}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#030405',
  },
  webview: {
    flex: 1,
    backgroundColor: '#030405',
  },
});
