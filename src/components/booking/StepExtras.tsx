import React from 'react';
import { Sparkles, Check, ArrowRight, ArrowLeft, Plus, Minus, Info } from 'lucide-react';
import { BookingExtra } from '../../types/booking';
import { CurrencyConfig } from '../../types';
import { GLOBAL_BOOKING_EXTRAS } from '../../data/bookingData';
import { formatCurrencyAmount } from '../../services/pricingService';

interface StepExtrasProps {
  selectedExtraIds: string[];
  onToggleExtra: (extraId: string) => void;
  currency: CurrencyConfig;
  onNext: () => void;
  onBack: () => void;
  extras?: BookingExtra[];
  extraQuantities?: Record<string, number>;
  onUpdateQuantity?: (extraId: string, quantity: number) => void;
}

export const StepExtras: React.FC<StepExtrasProps> = ({
  selectedExtraIds,
  onToggleExtra,
  currency,
  onNext,
  onBack,
  extras,
  extraQuantities = {},
  onUpdateQuantity,
}) => {
  // Authoritative: Never fall back to global extras if tour-assigned extras list was passed (even if empty)
  const extrasList = extras !== undefined ? extras : GLOBAL_BOOKING_EXTRAS;

  const getPricingLabel = (type: string) => {
    switch (type) {
      case 'per_person':
        return 'Per Guest';
      case 'per_adult':
        return 'Per Adult';
      case 'per_child':
        return 'Per Child';
      case 'per_vehicle':
        return 'Per Vehicle';
      case 'per_item':
        return 'Per Item';
      case 'per_booking':
      default:
        return 'Flat Per Booking';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
            Tailor Your Crossing
          </span>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
            <span>Optional Extras &amp; Add-ons</span>
          </h2>
          <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
            Enhance your excursion with private transfers or onboard photography. You can skip this step at any time.
          </p>
        </div>

        {/* Empty State */}
        {extrasList.length === 0 ? (
          <div className="p-8 text-center bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D7A5F]/10 dark:bg-emerald-500/15 text-[#0D7A5F] dark:text-emerald-400 border border-[#0D7A5F]/25 dark:border-emerald-400/25 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A192F] dark:text-white">
                All Primary Equipment Is Already Included
              </h3>
              <p className="text-xs text-[#5C6F84] dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                This excursion includes all primary gear, marine park permits, and scheduled activities with no optional upgrades required.
              </p>
            </div>
          </div>
        ) : (
          /* Extras Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {extrasList.map((extra) => {
              const isSelected = selectedExtraIds.includes(extra.id);
              const qty = extraQuantities[extra.id] || extra.minQuantity || 1;
              const maxQty = extra.maxQuantity || 10;
              const minQty = extra.minQuantity || 1;

              return (
                <div
                  key={extra.id}
                  className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0F4C81] dark:border-sky-400 bg-[#0F4C81]/[0.06] dark:bg-sky-400/[0.08] ring-1 ring-[#0F4C81] dark:ring-sky-400'
                      : 'border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 bg-[#F6F7F9]/60 dark:bg-[#07111C]/60'
                  }`}
                >
                  <div onClick={() => onToggleExtra(extra.id)} className="cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-[#0A192F] dark:text-white text-xs sm:text-sm block leading-snug">
                          {extra.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#0F4C81] dark:text-sky-400 block">
                          {getPricingLabel(extra.pricingType)}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                          isSelected
                            ? 'bg-[#0F4C81] dark:bg-sky-500 border-[#0F4C81] dark:border-sky-500 text-white dark:text-[#07111C]'
                            : 'border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 mt-2.5 leading-relaxed">
                      {extra.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-mono-num font-bold text-[#0F4C81] dark:text-sky-400 text-xs sm:text-sm">
                        +{formatCurrencyAmount(extra.priceEur, currency)}
                        {extra.pricingType === 'per_person' && (
                          <span className="font-sans text-[10px] text-[#5C6F84] dark:text-slate-400 font-normal">
                            {' '}/ person
                          </span>
                        )}
                        {extra.pricingType === 'per_vehicle' && (
                          <span className="font-sans text-[10px] text-[#5C6F84] dark:text-slate-400 font-normal">
                            {' '}/ vehicle
                          </span>
                        )}
                        {extra.pricingType === 'per_item' && (
                          <span className="font-sans text-[10px] text-[#5C6F84] dark:text-slate-400 font-normal">
                            {' '}/ item
                          </span>
                        )}
                      </span>
                    </div>

                    {isSelected &&
                      (extra.pricingType === 'per_vehicle' ||
                        extra.pricingType === 'per_item' ||
                        (extra.maxQuantity && extra.maxQuantity > 1)) && (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-lg px-2 py-0.5">
                          <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 font-medium mr-0.5">
                            Qty
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateQuantity) {
                                onUpdateQuantity(extra.id, Math.max(minQty, qty - 1));
                              }
                            }}
                            disabled={qty <= minQty}
                            className="w-5 h-5 flex items-center justify-center rounded text-[#0A192F] dark:text-white hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono-num font-bold text-xs text-[#0A192F] dark:text-white w-4 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateQuantity) {
                                onUpdateQuantity(extra.id, Math.min(maxQty, qty + 1));
                              }
                            }}
                            disabled={qty >= maxQty}
                            className="w-5 h-5 flex items-center justify-center rounded text-[#0A192F] dark:text-white hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center gap-2 text-[11px] text-[#5C6F84] dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400 shrink-0" />
          <span>Optional upgrades can be modified or removed free of charge up to 24 hours before departure.</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 text-[#0A192F] dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-7 py-3 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
