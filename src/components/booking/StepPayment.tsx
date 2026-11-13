import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { CurrencyConfig } from '../../types';
import { BookingPricing, PaymentMethod } from '../../types/booking';
import { APP_CONFIG } from '../../config/appConfig';
import { BOOKING_LEGAL_TERMS } from '../../data/bookingData';

interface StepPaymentProps {
  pricing: BookingPricing;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  currency: CurrencyConfig;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
  isSubmitting: boolean;
  onSubmitBooking: () => void;
  onBack: () => void;
}

export const StepPayment: React.FC<StepPaymentProps> = ({
  pricing,
  couponCode,
  onCouponCodeChange,
  paymentMethod,
  onPaymentMethodChange,
  termsAccepted,
  onTermsAcceptedChange,
  isSubmitting,
  onSubmitBooking,
  onBack,
}) => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
            Final Step · Instant Reservation
          </span>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
            <span>Payment Method</span>
          </h2>
          <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
            Choose how you wish to settle your excursion. Zero prepayment is required today.
          </p>
        </div>

        {/* Payment Options */}
        <div className="grid grid-cols-1 gap-3.5">
          {/* Pay on Hotel Pickup */}
          <button
            type="button"
            onClick={() => onPaymentMethodChange('pay_at_pickup')}
            className={`p-4 sm:p-5 rounded-xl border text-left transition-colors cursor-pointer w-full ${
              paymentMethod === 'pay_at_pickup'
                ? 'border-[#0F4C81] dark:border-sky-400 bg-[#0F4C81]/[0.06] dark:bg-sky-400/[0.08] ring-1 ring-[#0F4C81] dark:ring-sky-400'
                : 'border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 bg-[#F6F7F9]/60 dark:bg-[#07111C]/60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0D7A5F]/10 dark:bg-emerald-500/15 text-[#0D7A5F] dark:text-emerald-400 border border-[#0D7A5F]/20 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-bold text-[#0A192F] dark:text-white text-sm">
                      Pay on Hotel Pickup
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0D7A5F] dark:text-emerald-400">
                      · Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#2D3F54] dark:text-slate-300 mt-1 leading-relaxed">
                    Pay in cash (EUR, USD, GBP, or EGP) or by card when our transfer vehicle meets you at your hotel.
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  paymentMethod === 'pay_at_pickup'
                    ? 'border-[#0F4C81] dark:border-sky-400 bg-[#0F4C81] dark:bg-sky-400'
                    : 'border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E]'
                }`}
              >
                {paymentMethod === 'pay_at_pickup' && (
                  <div className="w-2 h-2 rounded-full bg-white dark:bg-[#07111C]" />
                )}
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center gap-2 text-[11px] text-[#0D7A5F] dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Instant voucher confirmation · Free cancellation up to 24 hours prior.</span>
            </div>
          </button>

          {/* Pay Online (Unavailable / Coming Soon) */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9]/70 dark:bg-[#07111C]/60 opacity-75">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EEF1F5] dark:bg-[#14263D] text-[#5C6F84] dark:text-slate-400 border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-bold text-[#2D3F54] dark:text-slate-300 text-sm">
                      Pay Online via Credit / Debit Card
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C6F84] dark:text-slate-400">
                      · Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1 leading-relaxed">
                    {APP_CONFIG.PAYMENT_SETTINGS.ONLINE_PAYMENT_NOTICE}
                  </p>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full border border-[#DCE2EA] dark:border-[#1E344E] bg-[#EEF1F5] dark:bg-[#14263D] shrink-0 mt-1 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Promo / Discount Code */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] space-y-2">
          <label htmlFor="booking-coupon-code" className="block text-xs font-bold text-[#0A192F] dark:text-white">
            Discount Code (Optional)
          </label>
          <input
            id="booking-coupon-code"
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
            maxLength={64}
            autoComplete="off"
            placeholder="ENTER PROMO CODE"
            className="w-full px-3.5 py-2.5 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs font-mono-num uppercase tracking-wider text-[#0A192F] dark:text-white placeholder:text-[#5C6F84] dark:placeholder:text-slate-500 bg-[#F6F7F9] dark:bg-[#07111C] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400"
          />
          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400">
            Promo codes are verified when you submit. Invalid, expired, or exhausted codes will not create a reservation.
          </p>
        </div>

        {/* Free Cancellation Policy Recap */}
        <div className="p-3.5 bg-[#0D7A5F]/[0.07] dark:bg-emerald-500/10 border border-[#0D7A5F]/25 dark:border-emerald-400/25 rounded-xl text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0D7A5F] dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#0A192F] dark:text-white block">Free 24-hour cancellation</span>
            <p className="text-[11px] text-[#2D3F54] dark:text-slate-300 leading-normal">
              Plans change? Reschedule or cancel up to 24 hours prior to hotel pickup at zero cost.
            </p>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => onTermsAcceptedChange(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-[#0F4C81] dark:accent-sky-400 border-[#DCE2EA] dark:border-[#1E344E] cursor-pointer"
            />
            <span className="text-xs text-[#2D3F54] dark:text-slate-300 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-[#0F4C81] dark:text-sky-400 font-semibold underline hover:opacity-80 cursor-pointer"
              >
                Terms &amp; Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-[#0F4C81] dark:text-sky-400 font-semibold underline hover:opacity-80 cursor-pointer"
              >
                Cancellation Policy
              </button>
              . I understand payment is settled in cash or card upon hotel pickup.
            </span>
          </label>
        </div>
      </div>

      {/* Navigation & Submit CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="px-5 py-2.5 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 text-[#0A192F] dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={!termsAccepted || isSubmitting}
          onClick={onSubmitBooking}
          className="px-8 py-3.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 disabled:bg-[#DCE2EA] dark:disabled:bg-[#1E344E] disabled:text-[#5C6F84] dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Confirming reservation…</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Confirm Booking (<span className="font-mono-num">{pricing.formattedTotal}</span>)</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1C2E] max-w-lg w-full rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#0B1726] flex items-center justify-between">
              <h3 className="font-display font-semibold text-base text-[#0A192F] dark:text-white">
                {BOOKING_LEGAL_TERMS.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close terms"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C6F84] dark:text-slate-400 hover:bg-[#DCE2EA]/60 dark:hover:bg-[#1E344E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#2D3F54] dark:text-slate-300">
              <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 font-mono-num">
                Last updated: {BOOKING_LEGAL_TERMS.lastUpdated}
              </p>
              {BOOKING_LEGAL_TERMS.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="font-bold text-[#0A192F] dark:text-white text-xs">{sec.heading}</h4>
                  <p className="leading-relaxed">{sec.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#0B1726] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onTermsAcceptedChange(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                I Understand &amp; Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
