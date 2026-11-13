import React from 'react';
import { Tour, CurrencyConfig } from '../../types';
import { formatPrice } from '../../data/toursData';

interface MobileBookingBarProps {
  tour: Tour;
  currency: CurrencyConfig;
  onBookNow: () => void;
}

export const MobileBookingBar: React.FC<MobileBookingBarProps> = ({
  tour,
  currency,
  onBookNow,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1726]/95 backdrop-blur-md border-t border-[#DCE2EA] dark:border-[#1E344E] px-4 py-3 flex items-center justify-between">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block leading-tight">
          Starting From
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-num text-xl font-bold text-[#0A192F] dark:text-white">
            {formatPrice(tour.priceEur, currency)}
          </span>
          <span className="text-xs text-[#5C6F84] dark:text-slate-400 font-medium">/ person</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBookNow}
        className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        Book Now
      </button>
    </div>
  );
};
