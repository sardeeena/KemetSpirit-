import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Award,
  Bus,
  Clock,
  Headphones,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TRUST_PILLARS } from '../../data/toursData';

function getPillarIcon(iconName?: string) {
  switch (iconName) {
    case 'ShieldCheck':
      return ShieldCheck;
    case 'Award':
      return Award;
    case 'Bus':
      return Bus;
    case 'Clock':
      return Clock;
    case 'Headphones':
      return Headphones;
    default:
      return FileCheck2;
  }
}

export const WhyChooseUs: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || TRUST_PILLARS.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TRUST_PILLARS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const activePillar = TRUST_PILLARS[activeIndex] || TRUST_PILLARS[0];
  const PillarIcon = getPillarIcon(activePillar?.iconName);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TRUST_PILLARS.length) % TRUST_PILLARS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TRUST_PILLARS.length);
  };

  return (
    <section
      id="why-us-section"
      className="py-12 sm:py-16 bg-white dark:bg-[#0B1624] border-b border-[#DCE2EA] dark:border-[#1E344E] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Section Editorial Intro */}
          <div className="lg:col-span-6 space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C]">
              Direct Licensed Fleet Operator
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
              Why Book Directly With KemetSpirit
            </h2>
            <p className="text-[#2D3F54] dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              We operate our own passenger yachts, speedboat charters, and resort transfer vans across Hurghada and El Gouna — delivering direct captain oversight and transparent local rates.
            </p>
          </div>

          {/* Single Small Rotating Fade Card */}
          <div
            className="lg:col-span-6 flex justify-start lg:justify-end"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="w-full max-w-md rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#0E1C2E] p-6 shadow-xs">
              <div className="min-h-[144px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePillar.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-num text-xs font-bold text-[#B58428] dark:text-[#E3B34C] tracking-widest">
                        0{activeIndex + 1} / 0{TRUST_PILLARS.length}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center">
                        <PillarIcon className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#0A192F] dark:text-white">
                      {activePillar.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-[#2D3F54] dark:text-slate-300 leading-relaxed">
                      {activePillar.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Compact Step Indicators & Controls */}
              <div className="mt-5 pt-3.5 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Direct booking highlights">
                  {TRUST_PILLARS.map((pillar, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={pillar.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={pillar.title}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'w-6 bg-[#0F4C81] dark:bg-sky-400'
                            : 'w-2 bg-[#DCE2EA] dark:bg-[#1E344E] hover:bg-[#5C6F84] dark:hover:bg-slate-500'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous highlight"
                    className="p-1.5 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#14263D] text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next highlight"
                    className="p-1.5 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#14263D] text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
