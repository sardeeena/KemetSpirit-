/// <reference types="vite/client" />

import heroRedSeaYacht from './images/hero_red_sea_yacht_1794588967358.jpg';
import heroDesertCanyon from './images/hero_desert_canyon_1794588966593.jpg';
import heroReefSnorkeling from './images/hero_reef_snorkeling_1794588967353.jpg';
import ctaSunsetCoast from './images/cta_sunset_coast_1794588968204.jpg';
import experienceNileLuxor from './images/experience_nile_luxor_1794588968287.jpg';

export const EDITORIAL_MEDIA = {
  heroYacht: heroRedSeaYacht,
  heroDesert: heroDesertCanyon,
  heroReef: heroReefSnorkeling,
  ctaSunset: ctaSunsetCoast,
  experienceLuxor: experienceNileLuxor,
} as const;

export const HERO_SHOWCASE_SCENES = [
  {
    id: 'sea',
    label: 'Red Sea Yachting',
    region: 'Giftun & Orange Bay',
    caption: 'Private lagoon moorings and island crossings aboard certified hulls.',
    image: heroRedSeaYacht,
  },
  {
    id: 'reef',
    label: 'Barrier Reefs',
    region: 'Abu Ramada & Dolphin House',
    caption: 'Calm sunlit waters with natural marine conservation guidelines.',
    image: heroReefSnorkeling,
  },
  {
    id: 'desert',
    label: 'Eastern Desert',
    region: 'Canyon & Wadi Trails',
    caption: 'Guided late-afternoon desert traverses with sunset ridge views.',
    image: heroDesertCanyon,
  },
  {
    id: 'heritage',
    label: 'Upper Egypt',
    region: 'Luxor & Karnak',
    caption: 'Day expeditions led by licensed Egyptologists with private transit.',
    image: experienceNileLuxor,
  },
] as const;
