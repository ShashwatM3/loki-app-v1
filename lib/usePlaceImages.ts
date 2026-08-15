import { useEffect, useReducer, useRef } from 'react';
import { Image } from 'expo-image';

export type PlaceImageStatus = 'loading' | 'ready' | 'failed';

type Loadable = { id: number | string; image?: string };

/**
 * Max times we re-attempt a failed image before giving up — mirrors the web
 * `usePlaceImages` hook (transient Firebase throttling recovers on retry).
 */
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 450;

// Module-level caches so a given URL is only ever fetched once across the
// whole app (markers, lists, popups all share the result) and survives remounts.
const urlStatus = new Map<string, PlaceImageStatus>();
const inflight = new Map<string, Promise<PlaceImageStatus>>();

function attemptLoad(url: string, attempt: number): Promise<PlaceImageStatus> {
  return new Promise((resolve) => {
    Image.prefetch(url)
      .then((ok) => {
        if (ok) {
          resolve('ready');
        } else if (attempt < MAX_RETRIES) {
          setTimeout(() => {
            attemptLoad(url, attempt + 1).then(resolve);
          }, RETRY_BASE_MS * (attempt + 1));
        } else {
          resolve('failed');
        }
      })
      .catch(() => {
        if (attempt < MAX_RETRIES) {
          setTimeout(() => {
            attemptLoad(url, attempt + 1).then(resolve);
          }, RETRY_BASE_MS * (attempt + 1));
        } else {
          resolve('failed');
        }
      });
  });
}

function ensureLoaded(url: string): Promise<PlaceImageStatus> {
  const cached = urlStatus.get(url);
  if (cached === 'ready' || cached === 'failed') {
    return Promise.resolve(cached);
  }
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = attemptLoad(url, 0).then((status) => {
    urlStatus.set(url, status);
    inflight.delete(url);
    return status;
  });
  inflight.set(url, promise);
  return promise;
}

/**
 * Preloads each place's image and reports per-place readiness. A place is only
 * `ready` once its photo has fully downloaded, which lets lists/maps reveal
 * places as their images load (and never show a broken image) — identical
 * behavior to the website.
 */
export function usePlaceImages(places: Loadable[]): Map<string, PlaceImageStatus> {
  const [, force] = useReducer((n: number) => n + 1, 0);
  const statuses = useRef<Map<string, PlaceImageStatus>>(new Map());

  // Re-run only when the actual set of places/URLs changes, not on every render.
  const signature = places.map((p) => `${p.id}\u0000${p.image ?? ''}`).join('\u0001');

  useEffect(() => {
    let cancelled = false;
    let changed = false;

    const setStatus = (id: string, status: PlaceImageStatus) => {
      if (statuses.current.get(id) !== status) {
        statuses.current.set(id, status);
        changed = true;
      }
    };

    for (const place of places) {
      const id = String(place.id);
      if (!place.image) {
        setStatus(id, 'failed');
        continue;
      }
      const cached = urlStatus.get(place.image);
      if (cached) {
        setStatus(id, cached);
        continue;
      }
      setStatus(id, 'loading');
      ensureLoaded(place.image).then((status) => {
        if (cancelled) return;
        if (statuses.current.get(id) !== status) {
          statuses.current.set(id, status);
          force();
        }
      });
    }

    if (changed) force();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return statuses.current;
}
