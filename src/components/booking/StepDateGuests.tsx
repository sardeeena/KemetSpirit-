import React, { useMemo } from 'react';
import { Calendar, Users, MapPin, Clock, AlertCircle, CheckCircle2, ShieldAlert, Plus, Minus, ArrowRight, Compass } from 'lucide-react';
import { Tour, CurrencyConfig } from '../../types';
import { GuestCounts, Availability } from '../../types/booking';
import { getEarliestSelectableDate, getTourAvailability, getTourAvailabilityFromServer } from '../../services/availabilityService';
import { formatCurrencyAmount } from '../../services/pricingService';

interface StepDateGuestsProps {
  tour: Tour;
  date: string;
  onDateChange: (date: string) => void;
  tourLanguage: string;
  onTourLanguageChange: (language: string) => void;
  guests: GuestCounts;
  onGuestsChange: (guests: GuestCounts) => void;
  currency: CurrencyConfig;
  onNext: () => void;
}

export const StepDateGuests: React.FC<StepDateGuestsProps> = ({
  tour,
  date,
  onDateChange,
  tourLanguage,
  onTourLanguageChange,
  guests,
  onGuestsChange,
  currency,
  onNext,
}) => {
  const earliestDate = useMemo(() => getEarliestSelectableDate(24), []);

  // Set default date to earliestDate if none set
  React.useEffect(() => {
    if (!date) {
      onDateChange(earliestDate);
    }
  }, [date, earliestDate, onDateChange]);

  const [availability, setAvailability] = React.useState<Availability>(() =>
    getTourAvailability(tour, date || earliestDate)
  );
  const [availabilityLoading, setAvailabilityLoading] = React.useState(true);
  const [availabilityError, setAvailabilityError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const selectedDate = date || earliestDate;

    setAvailabilityLoading(true);
    setAvailabilityError(false);

    getTourAvailabilityFromServer(tour, selectedDate)
      .then((result) => {
        if (active) setAvailability(result);
      })
      .catch((error) => {
        console.warn('Could not load authoritative tour availability:', error);
        if (active) {
          setAvailability({
            ...getTourAvailability(tour, selectedDate),
            isAvailable: false,
            isSoldOut: false,
            remaining: 0,
          });
          setAvailabilityError(true);
        }
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tour, date, earliestDate]);

  const handleAdultsChange = (delta: number) => {
    const next = Math.max(1, guests.adults + delta);
    onGuestsChange({ ...guests, adults: next });
  };

  const handleChildrenChange = (delta: number) => {
    const next = Math.max(0, guests.children + delta);
    onGuestsChange({ ...guests, children: next });
  };

  const handleInfantsChange = (delta: number) => {
    const next = Math.max(0, guests.infants + delta);
    onGuestsChange({ ...guests, infants: next });
  };

  const languageOptions = Array.from(new Set((tour.languages || []).map((language) => language.trim()).filter(Boolean)));
  const availableLanguages = languageOptions.length > 0 ? languageOptions : ['English'];

  const totalPartySize = guests.adults + guests.children + guests.infants;
  const exceedsCapacity = availability.isAvailable && totalPartySize > availability.remaining;
  const isFormValid = Boolean(
    date && !availabilityLoading && !availabilityError && availability.isAvailable && !availability.isSoldOut && !exceedsCapacity
  );

  return (
    <div className="space-y-6">
      {/* Selected Excursion Header Card */}
      <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {tour.primaryImage ? (
            <img
              src={tour.primaryImage}
              alt={tour.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#EEF1F5] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0F4C81] dark:text-sky-400 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-0.5">
              Selected Excursion
            </span>
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#0A192F] dark:text-white leading-snug">
              {tour.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                {tour.destination}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono-num">
                <Clock className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400" />
                {tour.durationLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 border-[#DCE2EA] dark:border-[#1E344E] pt-3 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-baseline sm:items-end shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
            Starting From
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-num text-xl font-bold text-[#0F4C81] dark:text-sky-400">
              {formatCurrencyAmount(tour.priceEur, currency)}
            </span>
            <span className="text-xs text-[#5C6F84] dark:text-slate-400">/ adult</span>
          </div>
        </div>
      </div>

      {/* Main Step Form Card */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl divide-y divide-[#DCE2EA] dark:divide-[#1E344E]">
        {/* Section 1: Tour Language */}
        <div className="p-5 sm:p-6 space-y-3">
          <label
            htmlFor="booking-tour-language"
            className="font-semibold text-[#0A192F] dark:text-white text-sm block"
          >
            01. Guide Language <span className="text-rose-500">*</span>
          </label>
          {availableLanguages.length > 1 ? (
            <select
              id="booking-tour-language"
              required
              value={tourLanguage}
              onChange={(e) => onTourLanguageChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] text-sm text-[#0A192F] dark:text-white bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
            >
              {availableLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] text-sm bg-[#F6F7F9] dark:bg-[#07111C] text-[#0A192F] dark:text-white font-medium">
              {availableLanguages[0]}
            </div>
          )}
          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400">
            Select the preferred language for your onboard escort or marine guide. Confirmed on your official voucher.
          </p>
        </div>

        {/* Section 2: Date Selection */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="booking-date"
              className="font-semibold text-[#0A192F] dark:text-white text-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
              <span>02. Departure Date</span>
            </label>
            <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
              Minimum 24 hours advance notice
            </span>
          </div>

          <div className="space-y-3">
            <input
              id="booking-date"
              type="date"
              required
              min={earliestDate}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] text-sm font-mono-num text-[#0A192F] dark:text-white bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
            />

            {/* Live Departure Availability Banner (Zero pills) */}
            <div>
              {availabilityLoading ? (
                <div className="p-3 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs text-[#5C6F84] dark:text-slate-400">
                  Checking vessel manifest availability…
                </div>
              ) : availabilityError ? (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  Live availability is temporarily unavailable. Please try again in a moment.
                </div>
              ) : availability.isSoldOut ? (
                <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Sold Out for this date</span>
                    <span>All passenger berths are reserved. Please select another departure date.</span>
                  </div>
                </div>
              ) : !availability.isAvailable ? (
                <div className="p-3 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs text-[#2D3F54] dark:text-slate-300">
                  This departure is currently closed. Please choose another date.
                </div>
              ) : exceedsCapacity ? (
                <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Party size exceeds remaining capacity</span>
                    <span>
                      You selected <span className="font-mono-num font-semibold">{totalPartySize}</span> guests, but only{' '}
                      <span className="font-mono-num font-semibold">{availability.remaining}</span> seats remain on this departure.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#0D7A5F]/[0.07] dark:bg-emerald-500/10 border border-[#0D7A5F]/25 dark:border-emerald-400/25 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#0A192F] dark:text-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-[#0D7A5F] dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong className="font-mono-num font-bold text-[#0D7A5F] dark:text-emerald-400">
                        {availability.remaining} seats available
                      </strong>{' '}
                      for selected departure
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0D7A5F] dark:text-emerald-400">
                    Live Availability
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Guest Steppers */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[#0A192F] dark:text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
              <span>03. Number of Travelers</span>
            </span>
            <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
              Ages on date of excursion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Adults */}
            <div className="p-4 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-bold text-[#0A192F] dark:text-white block text-xs">Adults</span>
                  <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">Age 12+</span>
                </div>
                <span className="font-mono-num font-bold text-xs text-[#0F4C81] dark:text-sky-400">
                  {formatCurrencyAmount(tour.priceEur, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                <button
                  type="button"
                  disabled={guests.adults <= 1}
                  onClick={() => handleAdultsChange(-1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Decrease adults"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-base">
                  {guests.adults}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdultsChange(1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 transition-colors cursor-pointer"
                  aria-label="Increase adults"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="p-4 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-bold text-[#0A192F] dark:text-white block text-xs">Children</span>
                  <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">Age 2–11</span>
                </div>
                <span className="font-mono-num font-bold text-xs text-[#0F4C81] dark:text-sky-400">
                  {formatCurrencyAmount(
                    tour.childPriceEur || Math.round(tour.priceEur * 0.5),
                    currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                <button
                  type="button"
                  disabled={guests.children <= 0}
                  onClick={() => handleChildrenChange(-1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Decrease children"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-base">
                  {guests.children}
                </span>
                <button
                  type="button"
                  onClick={() => handleChildrenChange(1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 transition-colors cursor-pointer"
                  aria-label="Increase children"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="p-4 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-bold text-[#0A192F] dark:text-white block text-xs">Infants</span>
                  <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">Under 2 yrs</span>
                </div>
                <span className="font-bold text-xs text-[#0D7A5F] dark:text-emerald-400">Free</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                <button
                  type="button"
                  disabled={guests.infants <= 0}
                  onClick={() => handleInfantsChange(-1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Decrease infants"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-base">
                  {guests.infants}
                </span>
                <button
                  type="button"
                  onClick={() => handleInfantsChange(1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 transition-colors cursor-pointer"
                  aria-label="Increase infants"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400">
            Minimum 1 adult required. Certified pediatric flotation vests are carried aboard all vessels.
          </p>
        </div>
      </div>

      {/* Step CTA Bar */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={onNext}
          className="w-full sm:w-auto px-7 py-3 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 disabled:bg-[#DCE2EA] dark:disabled:bg-[#1E344E] disabled:text-[#5C6F84] dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Choose Pickup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
