import React from 'react';
import { MapPin, ArrowRight, ArrowLeft, MessageCircle, HelpCircle, Building } from 'lucide-react';
import { PickupLocation } from '../../types/booking';
import { CurrencyConfig } from '../../types';
import { STANDARD_PICKUP_LOCATIONS } from '../../data/bookingData';
import { formatCurrencyAmount } from '../../services/pricingService';
import { getWhatsAppSupportUrl } from '../../services/exportService';

interface StepPickupProps {
  selectedPickupId: string;
  onSelectPickup: (location: PickupLocation) => void;
  hotelName: string;
  onHotelNameChange: (name: string) => void;
  currency: CurrencyConfig;
  onNext: () => void;
  onBack: () => void;
  locations?: PickupLocation[];
}

export const StepPickup: React.FC<StepPickupProps> = ({
  selectedPickupId,
  onSelectPickup,
  hotelName,
  onHotelNameChange,
  currency,
  onNext,
  onBack,
  locations,
}) => {
  const pickupList = locations && locations.length > 0 ? locations : STANDARD_PICKUP_LOCATIONS;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
            Marina Transfer Logistics
          </span>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
            <span>Choose Your Hotel Transfer Area</span>
          </h2>
          <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
            Air-conditioned vehicles collect guests directly from resort reception lobbies to our embarkation berth.
          </p>
        </div>

        {/* Pickup Zone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {pickupList.map((loc) => {
            const isSelected = selectedPickupId === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectPickup(loc)}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0F4C81] dark:border-sky-400 bg-[#0F4C81]/[0.06] dark:bg-sky-400/[0.08] ring-1 ring-[#0F4C81] dark:ring-sky-400'
                    : 'border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 bg-[#F6F7F9]/60 dark:bg-[#07111C]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-bold text-[#0A192F] dark:text-white text-xs sm:text-sm">
                        {loc.name}
                      </span>
                      {loc.isPopular && (
                        <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#B58428] dark:text-[#E3B34C]">
                          · Standard
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
                      {loc.area}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    {loc.feeEurPerPerson === 0 ? (
                      <span className="text-xs font-bold text-[#0D7A5F] dark:text-emerald-400">
                        Included
                      </span>
                    ) : (
                      <span className="font-mono-num text-xs font-bold text-[#0A192F] dark:text-white">
                        +{formatCurrencyAmount(loc.feeEurPerPerson, currency)}
                        <span className="font-sans text-[10px] text-[#5C6F84] dark:text-slate-400 font-normal">
                          {' '}/ pers.
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {loc.note && (
                  <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 mt-3 pt-2.5 border-t border-[#DCE2EA] dark:border-[#1E344E] leading-normal w-full">
                    {loc.note}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Accommodation Name Input */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] space-y-2">
          <label
            htmlFor="hotel-input"
            className="block text-xs font-bold text-[#0A192F] dark:text-white flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
            <span>Hotel Name (Optional — can be provided later)</span>
          </label>
          <input
            id="hotel-input"
            type="text"
            value={hotelName}
            onChange={(e) => onHotelNameChange(e.target.value)}
            placeholder="e.g. Steigenberger ALDAU Beach, Sunrise Crystal Bay, etc."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] text-xs sm:text-sm text-[#0A192F] dark:text-white placeholder:text-[#5C6F84] dark:placeholder:text-slate-500 bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
          />
          <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
            Still finalizing your resort? Leave this blank and confirm via WhatsApp prior to sailing.
          </span>
        </div>

        {/* Unlisted Pickup Notice */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0A192F] dark:text-white block">
                Pickup location not listed?
              </span>
              <span className="text-[#5C6F84] dark:text-slate-400 text-[11px]">
                Staying in a private villa or apartment outside the resort strip? Message dispatch directly.
              </span>
            </div>
          </div>
          <a
            href={getWhatsAppSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline self-start sm:self-auto shrink-0 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#0D7A5F] dark:text-emerald-400" />
            <span>Contact Dispatch</span>
          </a>
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
