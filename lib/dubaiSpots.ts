export type Spot = {
  title: string;
  handle: string;
  image: string;
  rotate: string;
  /** Optional screen to navigate to when this card is tapped. */
  path?: string;
};

// 1:1 port of components/landing/dubai-spots.ts.
const IMG_PARAMS = 'q=60&w=540&auto=format&fit=crop';

export const DUBAI_SPOTS: Spot[] = [
  {
    title: 'Alserkal Avenue',
    handle: 'alserkalavenue',
    image: `https://images.unsplash.com/photo-1564760055775-d63b17a55c44?${IMG_PARAMS}`,
    rotate: '-7deg',
  },
  {
    title: 'Chaos Karts',
    handle: 'chaoskarts',
    image: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?${IMG_PARAMS}`,
    rotate: '8deg',
  },
  {
    title: 'Bounce Dubai',
    handle: 'bouncedubai',
    image: `https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?${IMG_PARAMS}`,
    rotate: '-5deg',
  },
  {
    title: 'Brass Monkey',
    handle: 'brassmonkey',
    image: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?${IMG_PARAMS}`,
    rotate: '6deg',
  },
  {
    title: 'Deep Dive Dubai',
    handle: 'deepdivedubai',
    image: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?${IMG_PARAMS}`,
    rotate: '-4deg',
  },
  {
    title: 'Wavehouse',
    handle: 'wavehouse',
    image: `https://images.unsplash.com/photo-1502680390469-be75c86b636f?${IMG_PARAMS}`,
    rotate: '7deg',
  },
];
