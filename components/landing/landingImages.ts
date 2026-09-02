/**
 * Byte-identical copies of the website's /public/landing/*.webp assets
 * (loki-web-app commit d6f9b03), bundled for the landing page rebuild.
 */
export const LANDING_IMAGES = {
  'padel-sunset': require('../../assets/web/landing/padel-sunset.webp'),
  'rooftop-friends': require('../../assets/web/landing/rooftop-friends.webp'),
  'gallery-night': require('../../assets/web/landing/gallery-night.webp'),
  'beach-friends': require('../../assets/web/landing/beach-friends.webp'),
  'cafe-morning': require('../../assets/web/landing/cafe-morning.webp'),
  'karting-night': require('../../assets/web/landing/karting-night.webp'),
  'trivia-night': require('../../assets/web/landing/trivia-night.webp'),
  'indoor-coaster': require('../../assets/web/landing/indoor-coaster.webp'),
  'trampoline-park': require('../../assets/web/landing/trampoline-park.webp'),
  'obstacle-course': require('../../assets/web/landing/obstacle-course.webp'),
  'floating-water-park': require('../../assets/web/landing/floating-water-park.webp'),
  'escape-room': require('../../assets/web/landing/escape-room.webp'),
  'neon-arcade': require('../../assets/web/landing/neon-arcade.webp'),
  'arcade-bar': require('../../assets/web/landing/arcade-bar.webp'),
  'bowling-neon': require('../../assets/web/landing/bowling-neon.webp'),
  'karaoke-room': require('../../assets/web/landing/karaoke-room.webp'),
  'duckpin-bowling': require('../../assets/web/landing/duckpin-bowling.webp'),
  'sports-bar': require('../../assets/web/landing/sports-bar.webp'),
  'arcade-hall': require('../../assets/web/landing/arcade-hall.webp'),
  'singing-stage': require('../../assets/web/landing/singing-stage.webp'),
  'mall-bowling': require('../../assets/web/landing/mall-bowling.webp'),
} as const;

export type LandingImageKey = keyof typeof LANDING_IMAGES;
