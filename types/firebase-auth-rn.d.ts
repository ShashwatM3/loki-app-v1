// The Firebase JS SDK ships a React Native build of firebase/auth (selected by Metro via the
// "react-native" exports condition) that includes getReactNativePersistence. The package's
// top-level "types" condition points at the web typings, which omit it — so we augment here.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
