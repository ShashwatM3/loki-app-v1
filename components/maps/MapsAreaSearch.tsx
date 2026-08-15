import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';
import { WEB_BASE_URL } from '../../services/apiClient';
import { fonts, tw } from '../../lib/theme';

export type AreaResult = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
};

type MapsAreaSearchProps = {
  onSelect: (result: AreaResult) => void;
};

/** 1:1 port of components/maps/maps-area-search.tsx ("go to any area"). */
export function MapsAreaSearch({ onSelect }: MapsAreaSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AreaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${WEB_BASE_URL}/api/geocode?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results?: AreaResult[] };
        if (!controller.signal.aborted) {
          setResults(data.results ?? []);
          setOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const handlePick = useCallback(
    (result: AreaResult) => {
      onSelect(result);
      setQuery(result.name);
      setOpen(false);
      setResults([]);
    },
    [onSelect]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.inputWrap}>
        <Search size={14} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setOpen(true);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="go to any area"
          placeholderTextColor="rgba(255,255,255,0.45)"
          style={styles.input}
          autoComplete="off"
          autoCorrect={false}
        />
        {loading ? (
          <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={styles.rightIcon} />
        ) : query ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setResults([]);
              setOpen(false);
            }}
            style={styles.rightIcon}
            accessibilityLabel="Clear area search"
          >
            <X size={14} color="rgba(255,255,255,0.5)" />
          </Pressable>
        ) : null}
      </View>

      {open && results.length > 0 ? (
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
          {results.map((r) => (
            <Pressable key={r.id} onPress={() => handlePick(r)} style={styles.resultRow}>
              <MapPin size={14} color={tw.rose400} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.resultName}>
                  {r.name}
                </Text>
                <Text numberOfLines={1} style={styles.resultSubtitle}>
                  {r.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 256, // max-w-[16rem]
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    height: 36,
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingLeft: 36,
    paddingRight: 32,
    fontSize: 12,
    color: '#fff',
    fontFamily: fonts.sans,
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
  },
  results: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 42,
    zIndex: 50,
    maxHeight: 224, // max-h-56
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingVertical: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultName: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    color: '#fff',
  },
  resultSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.sans,
  },
});
