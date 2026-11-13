import React, { useState } from 'react';
import { Calendar, MapPin, ShieldCheck, ArrowRight, Plus, Minus } from 'lucide-react';
import { Tour, CurrencyConfig } from '../../types';
import { formatPrice } from '../../data/toursData';

interface TourBookingPanelProps {
  tour: Tour;
  currency: CurrencyConfig;
  onBook: (bookingState: {
    tour: Tour;
    date: string;
    adults: number;
    children: number;
    pickupLocation: string;
    selectedExtras: string[];
    totalEur: number;
  }) => void;
}

export const TourBookingPanel: React.FC<TourBookingPanelProps> = ({
  tour,
  currency,
  onBook,
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [date, setDate] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [pickupLocation, setPickupLocation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  // Price calculations
  const adultSubtotal = adults * tour.priceEur;
  const childSubtotal = children * (tour.childPriceEur || tour.priceEur * 0.5);

  const extrasSubtotal = (tour.optionalExtras || []).reduce((acc, extra) => {
    return selectedExtras.includes(extra.id) ? acc + extra.priceEur : acc;
  }, 0);

  const totalEur = adultSubtotal + childSubtotal + extrasSubtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      tour,
      date,
      adults,
      children,
      pickupLocation,
      selectedExtras,
      totalEur,
    });
  };

  return (
    <div
      id="booking-panel"
      className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 sm:p-6 sticky top-24"
    >
      {/* Price Header */}
      <div className="pb-4 border-b border-[#DCE2EA] dark:border-[#1E344E]">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#B58428] dark:text-[#E3B34C] block">
              Starting From
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-num text-2xl sm:text-3xl font-bold text-[#0A192F] dark:text-white">
                {formatPrice(tour.priceEur, currency)}
              </span>
              <span className="text-xs text-[#5C6F84] dark:text-slate-400 font-medium">/ person</span>
            </div>
          </div>
          {tour.childPriceEur && (
            <span className="font-mono-num text-[11px] text-[#5C6F84] dark:text-slate-400">
              Child: {formatPrice(tour.childPriceEur, currency)}
            </span>
          )}
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
        {/* Date Selector */}
        <div>
          <label className="block font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
            <span>Select Date</span>
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs font-mono-num text-[#0A192F] dark:text-white bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
          />
        </div>

        {/* Guests Steppers */}
        <div className="grid grid-cols-2 gap-3">
          {/* Adults */}
          <div className="p-3 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#0A192F] dark:text-white">Adults</span>
              <span className="text-[10px] text-[#5C6F84] dark:text-slate-400">Age 12+</span>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={adults <= 1}
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white disabled:opacity-30 hover:border-[#0F4C81] dark:hover:border-sky-400 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-sm">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(adults + 1)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="p-3 bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#0A192F] dark:text-white">Children</span>
              <span className="text-[10px] text-[#5C6F84] dark:text-slate-400">Age 2–11</span>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={children <= 0}
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white disabled:opacity-30 hover:border-[#0F4C81] dark:hover:border-sky-400 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-sm">{children}</span>
              <button
                type="button"
                onClick={() => setChildren(children + 1)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:border-[#0F4C81] dark:hover:border-sky-400 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
            <span>Hotel Pickup Location</span>
          </label>
          <input
            type="text"
            required
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="e.g. Sunrise Crystal Bay, Hurghada"
            className="w-full px-3.5 py-2.5 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs text-[#0A192F] dark:text-white placeholder:text-[#5C6F84] dark:placeholder:text-slate-500 bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
          />
          <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 mt-1 block">
            Exact lobby pickup time is dispatched before departure.
          </span>
        </div>

        {/* Optional Extras */}
        {tour.optionalExtras && tour.optionalExtras.length > 0 && (
          <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E]">
            <span className="block font-bold text-[#0A192F] dark:text-white mb-2">
              Optional Extras
            </span>
            <div className="space-y-2">
              {tour.optionalExtras.map((extra) => {
                const checked = selectedExtras.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#0F4C81] dark:border-sky-400 bg-[#0F4C81]/[0.06] dark:bg-sky-400/[0.08]'
                        : 'border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/40 bg-[#F6F7F9]/60 dark:bg-[#07111C]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleExtra(extra.id)}
                        className="rounded border-[#DCE2EA] dark:border-[#1E344E] accent-[#0F4C81] dark:accent-sky-400 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-[#0A192F] dark:text-white block text-xs">
                          {extra.name}
                        </span>
                        {extra.description && (
                          <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 block">
                            {extra.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono-num font-bold text-[#0F4C81] dark:text-sky-400 text-xs shrink-0 ml-2">
                      +{formatPrice(extra.priceEur, currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Ledger Breakdown */}
        <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
            <span>
              <span className="font-mono-num">{adults}</span> Adult(s) × {formatPrice(tour.priceEur, currency)}
            </span>
            <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
              {formatPrice(adultSubtotal, currency)}
            </span>
          </div>

          {children > 0 && (
            <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
              <span>
                <span className="font-mono-num">{children}</span> Child(ren)
              </span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
                {formatPrice(childSubtotal, currency)}
              </span>
            </div>
          )}

          {extrasSubtotal > 0 && (
            <div className="flex justify-between text-[#2D3F54] dark:text-slate-300">
              <span>Optional Extras</span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
                {formatPrice(extrasSubtotal, currency)}
              </span>
            </div>
          )}

          <div className="pt-2.5 border-t border-[#DCE2EA] dark:border-[#1E344E] flex justify-between items-baseline">
            <span className="font-bold text-[#0A192F] dark:text-white text-sm">Total</span>
            <span className="font-mono-num font-bold text-xl text-[#0F4C81] dark:text-sky-400">
              {formatPrice(totalEur, currency)}
            </span>
          </div>
        </div>

        {/* Unboxed Cancellation Notice */}
        <div className="pt-2 flex items-start gap-2 text-[11px] text-[#0D7A5F] dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{tour.cancellationPolicy || 'Cancellation terms are shown on your booking voucher.'}</span>
        </div>

        {/* Large CTA button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>Book This Excursion</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-center text-[#5C6F84] dark:text-slate-400">
          Zero prepayment required. Pay upon hotel pickup.
        </p>
      </form>
    </div>
  );
};
