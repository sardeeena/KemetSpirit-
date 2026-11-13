import React from 'react';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Award,
} from 'lucide-react';
import { Destination, Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { HERO_SHOWCASE_SCENES } from '../../assets/editorialMedia';

interface HeroProps {
  onSearch?: (filters: { destination: string; category: string; date: string; guests: number }) => void;
  resultCount?: number;
  destinations?: Destination[];
  categories?: Category[];
}

const HERO_SCENE = HERO_SHOWCASE_SCENES[0];

export const Hero: React.FC<HeroProps> = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full overflow-hidden bg-[#07111C] text-white border-b border-[#DCE2EA] dark:border-[#1E344E]">
      {/* Full-Bleed Background Photograph */}
      <img
        src={HERO_SCENE.image}
        alt={`${HERO_SCENE.label} — ${HERO_SCENE.region}`}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        fetchPriority="high"
        decoding="async"
      />

      {/* Contrast Scrim Over Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#07111C]/75 via-[#07111C]/60 to-[#07111C]/90 pointer-events-none"
        aria-hidden="true"
      />

      {/* Foreground Information */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
        <div className="max-w-3xl space-y-5 mb-10 sm:mb-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="text-[#E3B34C]">
              {t('hero.badge')}
            </span>
            <span className="text-white/30" aria-hidden="true">
              ·
            </span>
            <span className="text-sky-300">
              {t('hero.guestsHosted')}
            </span>
            <span className="text-white/30" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-200">
              {HERO_SCENE.region}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-white leading-[1.08]">
            Curated Journeys Across the{' '}
            <span className="italic font-medium text-[#E3B34C]">
              Red Sea &amp; Ancient Egypt
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            Direct licensed island crossings, certified reef diving, desert mountain safaris, and private Luxor expeditions with seamless resort pickup from Hurghada, El Gouna, and Marsa Alam.
          </p>
        </div>

        {/* Clean 4-Column Operational Guarantee Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-white/15 pt-6 border-t border-white/15 text-xs">
          <div className="flex items-center gap-3 lg:pr-6">
            <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="font-medium text-slate-100">
              {t('hero.guarantee1')}
            </span>
          </div>

          <div className="flex items-center gap-3 lg:px-6">
            <Clock className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="font-medium text-slate-100">
              {t('hero.guarantee2')}
            </span>
          </div>

          <div className="flex items-center gap-3 lg:px-6">
            <MapPin className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="font-medium text-slate-100">
              {t('hero.guarantee3')}
            </span>
          </div>

          <div className="flex items-center gap-3 lg:pl-6">
            <Award className="w-4 h-4 text-[#E3B34C] shrink-0" />
            <span className="font-medium text-slate-100">
              {t('hero.guarantee4')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
