import React from 'react';
import { Tour, CurrencyConfig } from '../../types';
import { GuestCounts, PickupLocation, BookingExtra, CustomerInfo, BookingPricing } from '../../types/booking';
import { Edit2, ArrowRight, ArrowLeft, MapPin, Clock } from 'lucide-react';

interface StepReviewProps {
  tour: Tour;
  date: string;
  tourLanguage: string;
  guests: GuestCounts;
  pickupLocation?: PickupLocation | null;
  hotelName: string;
  selectedExtras: BookingExtra[];
  customer: CustomerInfo;
  pricing: BookingPricing;
  currency: CurrencyConfig;
  onGoToStep: (stepNumber: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  tour,
  date,
  tourLanguage,
  guests,
  pickupLocation,
  hotelName,
  selectedExtras,
  customer,
  onGoToStep,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Unified Architectural Review Dossier */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl divide-y divide-[#DCE2EA] dark:divide-[#1E344E]">
        {/* Header */}
        <div className="p-5 sm:p-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
            Pre-Submission Verification
          </span>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white">
            Review Your Booking
          </h2>
          <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
            Confirm departure schedule, hotel pickup zone, and traveler details prior to checkout.
          </p>
        </div>

        {/* 01. Excursion & Schedule */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A192F] dark:text-white">
              <span className="font-mono-num text-[#B58428] dark:text-[#E3B34C] mr-2">01.</span>
              Excursion &amp; Date
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-display font-semibold text-[#0A192F] dark:text-white text-base block">
                {tour.title}
              </span>
              <div className="flex items-center gap-2.5 text-[#5C6F84] dark:text-slate-400 mt-1 text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0F4C81] dark:text-sky-400" />
                  {tour.destination}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono-num">
                  <Clock className="w-3 h-3" />
                  {tour.durationLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 sm:text-right pt-2 sm:pt-0">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                  Travel Date
                </span>
                <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white">
                  {date}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                  Guests
                </span>
                <span className="font-semibold text-[#0A192F] dark:text-white">
                  <span className="font-mono-num">{guests.adults}</span> Adult{guests.adults > 1 ? 's' : ''}
                  {guests.children > 0 && `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}`}
                  {guests.infants > 0 && `, ${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                  Language
                </span>
                <span className="font-semibold text-[#0A192F] dark:text-white">{tourLanguage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 02. Pickup & Transfer */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A192F] dark:text-white">
              <span className="font-mono-num text-[#B58428] dark:text-[#E3B34C] mr-2">02.</span>
              Pickup &amp; Transfer
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Transfer Region
              </span>
              <span className="font-semibold text-[#0A192F] dark:text-white block mt-0.5">
                {pickupLocation ? pickupLocation.name : 'Hurghada Standard'}
              </span>
              <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
                {pickupLocation?.area}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Hotel / Resort Name
              </span>
              <span className="font-semibold text-[#0A192F] dark:text-white block mt-0.5">
                {hotelName ? hotelName : customer.hotelName || 'To be confirmed before departure'}
              </span>
              {customer.roomNumber && (
                <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 font-mono-num block">
                  Room {customer.roomNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 03. Selected Extras */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A192F] dark:text-white">
              <span className="font-mono-num text-[#B58428] dark:text-[#E3B34C] mr-2">03.</span>
              Selected Extras
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {selectedExtras.length === 0 ? (
            <p className="text-xs text-[#5C6F84] dark:text-slate-400 italic">No optional extras selected.</p>
          ) : (
            <div className="divide-y divide-[#DCE2EA] dark:divide-[#1E344E] text-xs">
              {selectedExtras.map((extra) => (
                <div key={extra.id} className="py-2 flex justify-between items-center text-[#2D3F54] dark:text-slate-300">
                  <span className="font-medium text-[#0A192F] dark:text-white">{extra.name}</span>
                  <span className="font-mono-num font-semibold text-[#0F4C81] dark:text-sky-400">
                    +€{extra.priceEur}{' '}
                    <span className="font-sans text-[11px] font-normal text-[#5C6F84] dark:text-slate-400">
                      ({extra.pricingType === 'per_person' ? 'per guest' : 'flat'})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 04. Lead Traveler Contact */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0A192F] dark:text-white">
              <span className="font-mono-num text-[#B58428] dark:text-[#E3B34C] mr-2">04.</span>
              Lead Traveler Contact
            </h3>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Full Name
              </span>
              <span className="font-semibold text-[#0A192F] dark:text-white block mt-0.5">
                {customer.firstName} {customer.lastName}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Email Address
              </span>
              <span className="font-semibold text-[#0A192F] dark:text-white block mt-0.5 break-all">
                {customer.email}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                WhatsApp / Phone
              </span>
              <span className="font-mono-num font-semibold text-[#0A192F] dark:text-white block mt-0.5">
                {customer.countryCode} {customer.phoneNumber}
              </span>
            </div>
          </div>

          {customer.specialRequests && (
            <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block mb-0.5">
                Special Requests
              </span>
              <span className="text-[#2D3F54] dark:text-slate-300">{customer.specialRequests}</span>
            </div>
          )}
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
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
