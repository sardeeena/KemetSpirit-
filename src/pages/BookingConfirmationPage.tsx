import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Calendar,
  MessageCircle,
  MapPin,
  Clock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { Booking } from '../types/booking';
import { CurrencyConfig } from '../types';
import { downloadCalendarEvent, getWhatsAppSupportUrl, triggerPrintVoucher } from '../services/exportService';
import { useAuth } from '../contexts/AuthContext';

interface BookingConfirmationPageProps {
  booking: Booking;
  currency: CurrencyConfig;
  onNavigate: (page: string, param?: string) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  booking,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(booking.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#07111C] text-[#0A192F] dark:text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Editorial Confirmation Header */}
        <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#0D7A5F]/10 dark:bg-emerald-500/15 text-[#0D7A5F] dark:text-emerald-400 border border-[#0D7A5F]/25 dark:border-emerald-400/25 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0D7A5F] dark:text-emerald-400 block mb-2">
            {booking.status === 'confirmed' ? 'Booking Confirmed' : 'Reservation Received'}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
            {booking.status === 'confirmed' ? 'Your booking is confirmed' : 'Your reservation has been received'}
          </h1>
          <p className="text-xs sm:text-sm text-[#2D3F54] dark:text-slate-300 max-w-md mx-auto mt-2">
            We have saved your booking and sent the details to{' '}
            <strong className="text-[#0A192F] dark:text-white">{booking.customer.email}</strong>.
          </p>

          {/* Reference Readout Strip */}
          <div className="mt-6 pt-5 border-t border-[#DCE2EA] dark:border-[#1E344E] inline-flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#5C6F84] dark:text-slate-400 block">
                Booking Reference
              </span>
              <span className="font-mono-num font-bold text-xl text-[#0F4C81] dark:text-sky-400 tracking-wider">
                {booking.bookingReference}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="px-3.5 py-2 bg-[#EEF1F5] dark:bg-[#14263D] hover:bg-[#DCE2EA] dark:hover:bg-[#1E344E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs font-semibold text-[#0A192F] dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0D7A5F] dark:text-emerald-400" />
                  <span className="text-[#0D7A5F] dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400" />
                  <span>Copy Reference</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
          <button
            type="button"
            onClick={triggerPrintVoucher}
            className="p-3.5 bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs font-semibold text-[#0A192F] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
            <span>Print Voucher (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCalendarEvent(booking)}
            className="p-3.5 bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl text-xs font-semibold text-[#0A192F] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
            <span>Add to Calendar</span>
          </button>

          <a
            href={getWhatsAppSupportUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-[#0D7A5F] hover:bg-[#0A624C] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact on WhatsApp</span>
          </a>
        </div>

        {/* Printable Official Voucher Card */}
        <div
          id="printable-ticket"
          className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Print-Only Official Company Header */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-[#0F4C81] pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0A192F] uppercase">
                KemetSpirit
              </h1>
              <p className="text-xs text-slate-600">
                Official Excursion Ticket &amp; Hotel Pickup Voucher · Red Sea, Egypt
              </p>
            </div>
            <div className="text-right text-xs text-slate-700">
              <p className="font-mono font-bold text-sm text-[#0F4C81]">REF: {booking.bookingReference}</p>
              <p className="text-[11px] text-slate-500">24/7 Support: +20 102 2124589</p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-[#DCE2EA] dark:border-[#1E344E] pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
                Official Voucher
              </span>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white">
                {booking.tourTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C6F84] dark:text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                  {booking.tourDestination}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono-num">
                  <Clock className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400" />
                  {booking.tourDuration}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Status
              </span>
              <span
                className={`text-xs font-bold ${
                  booking.status === 'confirmed'
                    ? 'text-[#0D7A5F] dark:text-emerald-400'
                    : 'text-[#B58428] dark:text-[#E3B34C]'
                }`}
              >
                {booking.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
              </span>
            </div>
          </div>

          {/* Architectural Ledger Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl overflow-hidden text-xs">
            <div className="p-4 border-b sm:border-r border-[#DCE2EA] dark:border-[#1E344E] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Date of Excursion
              </span>
              <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-sm block">
                {booking.date}
              </span>
              <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
                Vessel departure approx. 08:30 – 09:00 AM
              </span>
            </div>

            <div className="p-4 border-b border-[#DCE2EA] dark:border-[#1E344E] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Guests Reserved
              </span>
              <span className="font-bold text-[#0A192F] dark:text-white text-sm block">
                <span className="font-mono-num">{booking.guests.adults}</span> Adult(s)
                {booking.guests.children > 0 && `, ${booking.guests.children} Child(ren)`}
                {booking.guests.infants > 0 && `, ${booking.guests.infants} Infant(s)`}
              </span>
              <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
                Marine park admission pass included
              </span>
            </div>

            <div className="p-4 border-b sm:border-r border-[#DCE2EA] dark:border-[#1E344E] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Hotel / Pickup Point
              </span>
              <span className="font-bold text-[#0A192F] dark:text-white text-sm block">
                {booking.pickup.hotelName || booking.customer.hotelName || booking.pickup.locationName}
              </span>
              <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 block">
                Transfer Zone: {booking.pickup.area}
                {(booking.pickup.roomNumber || booking.customer.roomNumber) &&
                  ` (Room ${booking.pickup.roomNumber || booking.customer.roomNumber})`}
              </span>
            </div>

            <div className="p-4 border-b border-[#DCE2EA] dark:border-[#1E344E] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Tour Language
              </span>
              <span className="font-bold text-[#0A192F] dark:text-white text-sm block">
                {booking.tourLanguage || 'To be confirmed'}
              </span>
            </div>

            <div className="p-4 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F6F7F9]/60 dark:bg-[#14263D]/40">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                  Payment Terms
                </span>
                <span className="font-bold text-[#0A192F] dark:text-white text-sm">
                  {booking.paymentMethod === 'pay_online' ? 'Paid Online' : 'Pay on Hotel Pickup'}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                  Amount Payable
                </span>
                <span className="font-mono-num text-lg font-bold text-[#0F4C81] dark:text-sky-400">
                  {booking.pricing.formattedTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Extras */}
          {booking.extras && booking.extras.length > 0 && (
            <div className="pt-2 border-t border-[#DCE2EA] dark:border-[#1E344E]">
              <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#5C6F84] dark:text-slate-400 block mb-2.5">
                Included Upgrades &amp; Add-ons
              </span>
              <div className="divide-y divide-[#DCE2EA] dark:divide-[#1E344E] text-xs">
                {booking.extras.map((ex) => (
                  <div key={ex.extraId} className="py-2 flex justify-between items-center text-[#2D3F54] dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-[#0A192F] dark:text-white">{ex.name}</span>
                      <span className="font-mono-num text-[11px] text-[#5C6F84] dark:text-slate-400 ml-2">
                        ({ex.quantity || 1}× €{ex.priceEur.toFixed(2)}
                        {ex.pricingType === 'per_person' ? '/pers' : ''})
                      </span>
                    </div>
                    <span className="font-mono-num font-bold text-[#0A192F] dark:text-white">
                      €{(ex.amountEur || ex.priceEur * (ex.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Traveler */}
          <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6F84] dark:text-slate-400 block">
                Lead Traveler
              </span>
              <span className="font-semibold text-[#0A192F] dark:text-white">
                {booking.customer.firstName} {booking.customer.lastName} ({booking.customer.country})
              </span>
            </div>
            <div className="text-[#5C6F84] dark:text-slate-400 font-mono-num">
              <span>{booking.customer.email}</span> · <span>{booking.customer.countryCode} {booking.customer.phoneNumber}</span>
            </div>
          </div>

          {/* What to Expect Next */}
          <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] text-xs space-y-2">
            <span className="font-bold text-[#0A192F] dark:text-white block">
              What happens next:
            </span>
            <ul className="space-y-1.5 text-[11px] text-[#2D3F54] dark:text-slate-300 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-[#0A192F] dark:text-white">WhatsApp dispatch:</strong> We send your exact pickup time and driver details the evening before departure (18:00–20:00).
              </li>
              <li>
                <strong className="text-[#0A192F] dark:text-white">What to bring:</strong> Passports (or hotel card for Coast Guard check), beach towels, swimwear, sunglasses, and reef-safe sun protection.
              </li>
              <li>
                <strong className="text-[#0A192F] dark:text-white">Meeting point:</strong> Please wait in your main hotel lobby 10 minutes before your scheduled pickup.
              </li>
              <li>
                <strong className="text-[#0A192F] dark:text-white">24/7 Operations Desk:</strong> <span className="font-mono-num">+20 102 2124589</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Guest Account Prompt */}
        {!user && (
          <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="text-center sm:text-left space-y-1">
              <span className="font-bold text-sm text-[#0A192F] dark:text-white block">
                Link this reservation to a KemetSpirit account
              </span>
              <p className="text-xs text-[#5C6F84] dark:text-slate-400">
                Access vouchers, adjust dates, and receive instant dispatch alerts in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-4 py-2.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={() => onNavigate('my-booking', booking.bookingReference)}
            className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:underline cursor-pointer"
          >
            View or manage booking in My Booking
          </button>

          <button
            type="button"
            onClick={() => onNavigate('excursions')}
            className="px-6 py-2.5 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>View All Excursions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
