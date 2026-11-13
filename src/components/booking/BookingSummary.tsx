import React from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { Tour, CurrencyConfig } from '../../types';
import { GuestCounts, PickupLocation, BookingExtra, BookingPricing } from '../../types/booking';

interface BookingSummaryProps {
  tour: Tour;
  date?: string;
  tourLanguage?: string;
  guests: GuestCounts;
  pickupLocation?: PickupLocation | null;
  hotelName?: string;
  selectedExtras?: BookingExtra[];
  pricing: BookingPricing;
  currency: CurrencyConfig;
  showGuarantee?: boolean;
  collapsibleMobile?: boolean;
  isMobileExpanded?: boolean;
  onToggleMobileExpand?: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  tour,
  date,
  tourLanguage,
  guests,
  pickupLocation,
  pricing,
  currency,
  showGuarantee = true,
  collapsibleMobile = false,
  isMobileExpanded = false,
  onToggleMobileExpand,
}) => {
  return (
    <aside className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl overflow-hidden text-xs">
      {/* Header with Tour Thumbnail */}
      <div className="p-4 sm:p-5 border-b border-[#DCE2EA] dark:border-[#1E344E]">
        <div className="flex items-start gap-3.5">
          {tour.primaryImage ? (
            <img
              src={tour.primaryImage}
              alt={tour.title}
              className="w-20 h-16 object-cover rounded-xl shrink-0 border border-[#DCE2EA] dark:border-[#1E344E]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-16 rounded-xl shrink-0 bg-[#EEF1F5] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0F4C81] dark:text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B58428] dark:text-[#E3B34C] block mb-0.5">
              {tour.category}
            </span>
            <h3 className="font-display font-semibold text-[#0A192F] dark:text-white text-sm line-clamp-2 leading-snug">
              {tour.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#5C6F84] dark:text-slate-400 mt-1">
              <span>{tour.destination}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">{tour.durationLabel}</span>
            </div>
          </div>
        </div>

        {/* Mobile quick expand bar */}
        {collapsibleMobile && (
          <button
            type="button"
            onClick={onToggleMobileExpand}
            className="w-full mt-3.5 pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-between text-[#0F4C81] dark:text-sky-400 font-semibold text-xs lg:hidden cursor-pointer"
          >
            <span>{isMobileExpanded ? 'Hide reservation summary' : `Show summary · ${pricing.formattedTotal}`}</span>
            {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Ledger Body */}
      <div className={`p-4 sm:p-5 space-y-4 ${collapsibleMobile && !isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
        {/* Reservation Specs Ledger (Unboxed hairline rows) */}
        <div className="divide-y divide-[#DCE2EA] dark:divide-[#1E344E] border-b border-[#DCE2EA] dark:border-[#1E344E] pb-2 text-[11px]">
          <div className="py-2 flex items-center justify-between gap-2">
            <span className="text-[#5C6F84] dark:text-slate-400">Departure Date</span>
            <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
              {date ? date : 'Select in Step 01'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between gap-2">
            <span className="text-[#5C6F84] dark:text-slate-400">Guests</span>
            <span className="font-semibold text-[#0A192F] dark:text-white text-right">
              <span className="font-mono-num">{guests.adults}</span> {guests.adults === 1 ? 'Adult' : 'Adults'}
              {guests.children > 0 && (
                <>
                  , <span className="font-mono-num">{guests.children}</span>{' '}
                  {guests.children === 1 ? 'Child' : 'Children'}
                </>
              )}
              {guests.infants > 0 && (
                <>
                  , <span className="font-mono-num">{guests.infants}</span>{' '}
                  {guests.infants === 1 ? 'Infant' : 'Infants'}
                </>
              )}
            </span>
          </div>

          {tourLanguage && (
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[#5C6F84] dark:text-slate-400">Guide Language</span>
              <span className="font-semibold text-[#0A192F] dark:text-white">{tourLanguage}</span>
            </div>
          )}

          {pickupLocation && (
            <div className="py-2 flex items-center justify-between gap-2">
              <span className="text-[#5C6F84] dark:text-slate-400 shrink-0">Pickup Zone</span>
              <span className="font-semibold text-[#0A192F] dark:text-white truncate text-right">
                {pickupLocation.name}
              </span>
            </div>
          )}
        </div>

        {/* Itemized Price Calculation */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
            <span>
              <span className="font-mono-num">{guests.adults}</span> Adult(s) ×{' '}
              <span className="font-mono-num">€{pricing.basePricePerAdultEur}</span>
            </span>
            <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
              €{pricing.adultSubtotalEur.toFixed(2)}
            </span>
          </div>

          {guests.children > 0 && (
            <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
              <span>
                <span className="font-mono-num">{guests.children}</span> Child(ren) ×{' '}
                <span className="font-mono-num">€{pricing.basePricePerChildEur}</span>
              </span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
                €{pricing.childSubtotalEur.toFixed(2)}
              </span>
            </div>
          )}

          {guests.infants > 0 && (
            <div className="flex justify-between text-[#5C6F84] dark:text-slate-400">
              <span>
                <span className="font-mono-num">{guests.infants}</span> Infant(s)
              </span>
              <span className="text-[#0D7A5F] dark:text-emerald-400 font-semibold">Complimentary</span>
            </div>
          )}

          {pickupLocation && (
            <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
              <span className="truncate pr-2">Transfer ({pickupLocation.name})</span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white shrink-0">
                {pricing.pickupSubtotalEur === 0 ? (
                  <span className="text-[#0D7A5F] dark:text-emerald-400 font-sans">Included</span>
                ) : (
                  `€${pricing.pickupSubtotalEur.toFixed(2)}`
                )}
              </span>
            </div>
          )}

          {pricing.extrasBreakdown.length > 0 && (
            <div className="pt-2.5 mt-2 border-t border-dashed border-[#DCE2EA] dark:border-[#1E344E] space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#5C6F84] dark:text-slate-400 block">
                Selected Upgrades
              </span>
              {pricing.extrasBreakdown.map((ex) => (
                <div key={ex.extraId} className="flex justify-between text-[#2D3F54] dark:text-slate-300">
                  <span className="truncate pr-2">{ex.name}</span>
                  <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white shrink-0">
                    €{ex.amountEur.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {pricing.discountEur > 0 && (
            <div className="flex justify-between text-[#0D7A5F] dark:text-emerald-400 pt-1">
              <span>Promo Discount</span>
              <span className="font-mono-num font-semibold">-€{pricing.discountEur.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Grand Total Bar */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E]">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[#0A192F] dark:text-white font-bold text-sm block">Total Due</span>
              <span className="text-[10px] text-[#5C6F84] dark:text-slate-400">
                Taxes and marine park fees included
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono-num font-bold text-2xl text-[#0F4C81] dark:text-sky-400">
                {pricing.formattedTotal}
              </span>
              {currency.code !== 'EUR' && (
                <span className="block font-mono-num text-[10px] text-[#5C6F84] dark:text-slate-400">
                  (approx. €{pricing.totalEur.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clean Unboxed Cancellation Assurance */}
        {showGuarantee && (
          <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-start gap-2.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#0D7A5F] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0A192F] dark:text-white block">Free 24h Cancellation</span>
              <span className="text-[#5C6F84] dark:text-slate-400">
                Cancel up to 24 hours before pickup for a full refund.
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
