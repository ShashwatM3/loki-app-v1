import { create } from 'zustand';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, Place, CollectionType, CustomSubfilter } from './types';

const DEFAULT_CATEGORIES = [
  "Beach", "Art & Culture", "Entertainment", "Nature", "Food & Drink",
  "Adventure", "Leisure", "Tech & Future", "Hiking", "Chai", "Experience",
  "Ramadan", "Watch Sports", "World Cup", "Running Trails", "Coworking Spots"
];

interface CounterStore {
  places: Place[];
  setPlaces: (places: Place[]) => void;
  userData: UserData;
  setUserData: (user_data: UserData) => void;
  isLoading: boolean;
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
  refreshUserData: (email?: string) => Promise<void>;
  fetchPlaces: () => Promise<void>;
  categories: string[];
  fetchCategories: () => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  removeCategory: (category: string) => Promise<void>;
  customSubfilters: CustomSubfilter[];
  fetchCustomSubfilters: () => Promise<void>;
  addCustomSubfilter: (subfilter: CustomSubfilter) => Promise<void>;
  removeCustomSubfilter: (id: string) => Promise<void>;
}

export const useCounterStore = create<CounterStore>((set, get) => ({
  userData: { name: "", email: "", photo: "", collections: [] },
  setUserData: (user_data: UserData) => {
    set((state) => ({ userData: user_data }))
  },
  places: [],
  setPlaces: (places: Place[]) => {
    set((state) => ({ places: places }))
  },
  isLoading: false,
  isAuthLoading: true,
  setAuthLoading: (loading: boolean) => set({ isAuthLoading: loading }),
  
  refreshUserData: async (email?: string) => {
    const userEmail = email || get().userData.email;
    if (!userEmail) return;

    set((state) => ({
      userData: {
        ...state.userData,
        email: userEmail
      }
    }));

    set({ isLoading: true });
    try {
      const docRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ userData: docSnap.data() as UserData });
      }
    } catch (error) {
      console.error("Failed to refresh user data from Firestore:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchPlaces: async () => {
    try {
      const q = collection(db, "places");
      const querySnapshot = await getDocs(q);
      const fetchedPlaces: Place[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPlaces.push({
          id: doc.id,
          ...doc.data()
        } as Place);
      });
      
      // Filter out expired pop-ups
      const visiblePlaces = fetchedPlaces.filter((place) => {
        if (!place.popup) return true;
        if (!place.endDate) return true;
        return new Date(place.endDate) > new Date();
      });
      
      set({ places: visiblePlaces });
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
  },
  
  categories: DEFAULT_CATEGORIES,
  
  fetchCategories: async () => {
    try {
      const docRef = doc(db, "config", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list && Array.isArray(data.list)) {
          set({ categories: data.list });
        }
      } else {
        await setDoc(docRef, { list: DEFAULT_CATEGORIES });
        set({ categories: DEFAULT_CATEGORIES });
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },
  
  addCategory: async (category: string) => {
    const current = get().categories;
    if (current.includes(category)) return;
    const updated = [...current, category];
    set({ categories: updated });
    try {
      const docRef = doc(db, "config", "categories");
      await setDoc(docRef, { list: updated });
    } catch (error) {
      console.error("Failed to add category:", error);
      set({ categories: current });
      throw error;
    }
  },
  
  removeCategory: async (category: string) => {
    const current = get().categories;
    const updated = current.filter(c => c !== category);
    set({ categories: updated });
    try {
      const docRef = doc(db, "config", "categories");
      await setDoc(docRef, { list: updated });
    } catch (error) {
      console.error("Failed to remove category:", error);
      set({ categories: current });
      throw error;
    }
  },
  
  customSubfilters: [],
  
  fetchCustomSubfilters: async () => {
    try {
      const docRef = doc(db, "config", "exploreSubfilters");
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      if (Array.isArray(data.items)) {
        set({ customSubfilters: data.items as CustomSubfilter[] });
      }
    } catch (error) {
      console.error("Failed to fetch custom sub-filters:", error);
    }
  },
  
  addCustomSubfilter: async (subfilter: CustomSubfilter) => {
    const current = get().customSubfilters;
    if (current.find(s => s.id === subfilter.id)) return;
    const updated = [...current, subfilter];
    set({ customSubfilters: updated });
    try {
      const docRef = doc(db, "config", "exploreSubfilters");
      await setDoc(docRef, { items: updated });
    } catch (error) {
      console.error("Failed to add custom subfilter:", error);
      set({ customSubfilters: current });
      throw error;
    }
  },
  
  removeCustomSubfilter: async (id: string) => {
    const current = get().customSubfilters;
    const updated = current.filter(s => s.id !== id);
    set({ customSubfilters: updated });
    try {
      const docRef = doc(db, "config", "exploreSubfilters");
      await setDoc(docRef, { items: updated });
    } catch (error) {
      console.error("Failed to remove custom subfilter:", error);
      set({ customSubfilters: current });
      throw error;
    }
  },
}));