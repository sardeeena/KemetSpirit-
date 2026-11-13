import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Wind, Sun, Eye, Anchor, ChevronDown, ShieldCheck } from 'lucide-react';

export const WeatherConditionsBar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white text-[#2D3F54] dark:bg-[#0B1624] dark:text-slate-300 border-b border-[#DCE2EA] dark:border-[#1E344E] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Maritime bulletin label (zero pulsing dot, zero pill) */}
          <div className="flex items-center gap-2.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D7A5F] dark:text-emerald-400 shrink-0" />
            <span className="font-bold uppercase tracking-[0.12em] text-[#0D7A5F] dark:text-emerald-400">
              Port Open
            </span>
            <span className="text-[#DCE2EA] dark:text-slate-700">·</span>
            <span className="text-[#5C6F84] dark:text-slate-400 hidden sm:inline">
              Hurghada &amp; Sinai Marine Bulletin
            </span>
          </div>

          {/* Center: Telemetry readout */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px]">
            <div className="flex items-center gap-1.5" title="Water Temperature">
              <Waves className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span className="text-[#5C6F84] dark:text-slate-400">Sea:</span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">25°C</span>
            </div>

            <div className="flex items-center gap-1.5" title="Wave height">
              <Anchor className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span className="text-[#5C6F84] dark:text-slate-400">Swell:</span>
              <span className="font-mono-num font-semibold text-[#0D7A5F] dark:text-emerald-400">0.3m Calm</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5" title="Wind conditions">
              <Wind className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span className="text-[#5C6F84] dark:text-slate-400">Wind:</span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">9 kts NNE</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5" title="Reef Visibility">
              <Eye className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span className="text-[#5C6F84] dark:text-slate-400">Visibility:</span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">30m+</span>
            </div>
          </div>

          {/* Right: Advisory toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-[#0F4C81] hover:text-[#0B3A63] dark:text-sky-400 dark:hover:text-white transition-colors text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{expanded ? 'Hide Advisory' : 'Sea Advisory'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 pb-1 border-t border-[#DCE2EA] dark:border-[#1E344E] mt-2.5 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1">
                <div className="space-y-1">
                  <span className="font-bold text-[#0A192F] dark:text-white text-[11px] flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                    Snorkeling &amp; Reef Clarity
                  </span>
                  <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 leading-relaxed">
                    Optimal visibility across Giftun Island and Abu Ramada reefs. Calm morning surface conditions suited for full-day crossings.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#0A192F] dark:text-white text-[11px] flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-[#B58428] dark:text-[#E3B34C]" />
                    Eastern Desert Trails
                  </span>
                  <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 leading-relaxed">
                    Clear late-afternoon skies across canyon corridors. Softening light after 16:30 for sunset ridge stops and Bedouin dinner.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#0A192F] dark:text-white text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0D7A5F] dark:text-emerald-400" />
                    Harbor Weather Guarantee
                  </span>
                  <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 leading-relaxed">
                    Every vessel departure is verified daily with marina authorities. Weather cancellations receive priority rescheduling or full refund.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
