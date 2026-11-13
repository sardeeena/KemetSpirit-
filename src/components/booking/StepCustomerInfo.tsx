import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Building,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { CustomerInfo } from '../../types/booking';
import { COUNTRY_DIAL_CODES } from '../../data/bookingData';
import { CountrySelect } from '../common/CountrySelect';
import { isValidEmail, isValidPhoneNumber, sanitizeString, sanitizeTextPreservingWhitespace } from '../../lib/security';
import { useAuth } from '../../contexts/AuthContext';

interface StepCustomerInfoProps {
  customer: CustomerInfo;
  onCustomerChange: (customer: CustomerInfo) => void;
  onNext: () => void;
  onBack: () => void;
  onNavigateLogin?: () => void;
}

export const StepCustomerInfo: React.FC<StepCustomerInfoProps> = ({
  customer,
  onCustomerChange,
  onNext,
  onBack,
  onNavigateLogin,
}) => {
  const { user } = useAuth();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-populate from logged-in user profile if fields are blank
  useEffect(() => {
    if (user && !customer.email) {
      const parts = (user.fullName || '').trim().split(' ');
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';
      onCustomerChange({
        ...customer,
        firstName: customer.firstName || first,
        lastName: customer.lastName || last,
        email: customer.email || user.email,
        phoneNumber: customer.phoneNumber || user.phoneNumber || '',
        countryCode: customer.countryCode || user.countryCode || '+20',
        country: customer.country || user.country || 'Egypt',
      });
    }
  }, [user]);

  const errors = {
    firstName: !customer.firstName.trim() ? 'Please enter your first name.' : '',
    lastName: !customer.lastName.trim() ? 'Please enter your last name.' : '',
    email: !customer.email.trim()
      ? 'Please enter your email address.'
      : !isValidEmail(customer.email)
      ? 'Please enter a valid email address.'
      : '',
    phoneNumber: !customer.phoneNumber.trim()
      ? 'Please enter your phone number.'
      : !isValidPhoneNumber(customer.phoneNumber)
      ? 'Please enter a valid phone number with dial code.'
      : '',
    country: !customer.country.trim() ? 'Please select your country.' : '',
  };

  const isValid = !errors.firstName && !errors.lastName && !errors.email && !errors.phoneNumber && !errors.country;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerChange({
      ...customer,
      [field]: field === 'specialRequests' ? sanitizeTextPreservingWhitespace(value) : sanitizeString(value),
    });
  };

  const handleCountryDialSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = COUNTRY_DIAL_CODES.find((c) => c.dial === e.target.value);
    onCustomerChange({
      ...customer,
      countryCode: e.target.value,
      country: found ? found.country : customer.country,
    });
  };

  const handleSubmitAttempt = () => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      country: true,
    });

    if (isValid) {
      onNext();
    }
  };

  const inputBase =
    'w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#0A192F] dark:text-white placeholder:text-[#5C6F84] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400 transition-colors';
  const validBorder = 'border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#07111C]';
  const errorBorder = 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/20';

  return (
    <div className="space-y-6">
      {/* Main Form Card */}
      <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 sm:p-6 space-y-5">
        {/* Account / Guest Status Strip */}
        <div className="pb-4 border-b border-[#DCE2EA] dark:border-[#1E344E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {user ? (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D7A5F] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0A192F] dark:text-white block">
                    Signed in as {user.fullName}
                  </span>
                  <span className="text-[#5C6F84] dark:text-slate-400 text-[11px]">
                    Reservation links automatically to {user.email}.
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                Edit below if reserving for another traveler
              </span>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0A192F] dark:text-white block">
                    Guest Checkout — No Account Required
                  </span>
                  <span className="text-[#5C6F84] dark:text-slate-400 text-[11px]">
                    Vouchers and evening pickup dispatches send straight to your email and WhatsApp.
                  </span>
                </div>
              </div>
              {onNavigateLogin && (
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="px-3.5 py-2 bg-[#EEF1F5] dark:bg-[#14263D] hover:bg-[#DCE2EA] dark:hover:bg-[#1E344E] text-[#0A192F] dark:text-white rounded-xl font-semibold text-[11px] shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                  <span>Sign In to Autofill</span>
                </button>
              )}
            </>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1">
            Coast Guard &amp; Dispatch Manifest
          </span>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0A192F] dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
            <span>Your Contact Details</span>
          </h2>
          <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">
            We transmit your confirmation voucher and evening pickup window to this email and mobile number.
          </p>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="first-name"
              type="text"
              required
              value={customer.firstName}
              onBlur={() => handleBlur('firstName')}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Marcus"
              className={`${inputBase} ${touched.firstName && errors.firstName ? errorBorder : validBorder}`}
            />
            {touched.firstName && errors.firstName && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.firstName}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="last-name" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="last-name"
              type="text"
              required
              value={customer.lastName}
              onBlur={() => handleBlur('lastName')}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Weber"
              className={`${inputBase} ${touched.lastName && errors.lastName ? errorBorder : validBorder}`}
            />
            {touched.lastName && errors.lastName && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span>Email Address</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={customer.email}
              onBlur={() => handleBlur('email')}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. markus.weber@example.com"
              className={`${inputBase} ${touched.email && errors.email ? errorBorder : validBorder}`}
            />
            {touched.email && errors.email ? (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.email}
              </span>
            ) : (
              <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 mt-1.5 block">
                Your confirmation voucher is dispatched here.
              </span>
            )}
          </div>

          <div>
            <label htmlFor="phone-number" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span>WhatsApp / Mobile Phone</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                aria-label="Country dial code"
                value={customer.countryCode || '+20'}
                onChange={handleCountryDialSelect}
                className="w-28 px-2 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] text-xs font-mono-num text-[#0A192F] dark:text-white bg-[#EEF1F5] dark:bg-[#14263D] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] dark:focus:ring-sky-400 shrink-0"
              >
                {COUNTRY_DIAL_CODES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.flag} {c.dial} ({c.code})
                  </option>
                ))}
              </select>

              <input
                id="phone-number"
                type="tel"
                required
                value={customer.phoneNumber}
                onBlur={() => handleBlur('phoneNumber')}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="170 1234567"
                className={`${inputBase} flex-1 font-mono-num ${touched.phoneNumber && errors.phoneNumber ? errorBorder : validBorder}`}
              />
            </div>
            {touched.phoneNumber && errors.phoneNumber ? (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.phoneNumber}
              </span>
            ) : (
              <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 mt-1.5 block">
                Drivers send WhatsApp lobby arrival notifications here.
              </span>
            )}
          </div>
        </div>

        {/* Hotel Name */}
        <div>
          <label htmlFor="customer-hotel-name" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
            <span>Hotel / Accommodation Name</span>
          </label>
          <input
            id="customer-hotel-name"
            type="text"
            value={customer.hotelName || ''}
            onChange={(e) => handleChange('hotelName', e.target.value)}
            placeholder="e.g. Steigenberger ALDAU Beach Hotel, Desert Rose Resort, etc."
            className={`${inputBase} ${validBorder}`}
          />
          <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 mt-1.5 block">
            Transfer drivers meet you in your main resort reception lobby.
          </span>
        </div>

        {/* Country of Residence & Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
              <span>Country of Residence</span>
              <span className="text-rose-500">*</span>
            </label>
            <CountrySelect
              id="country"
              value={customer.country}
              required
              onChange={(value) => {
                handleChange('country', value);
                handleBlur('country');
              }}
              placeholder="Select your country of residence"
              className={`${inputBase} ${touched.country && errors.country ? errorBorder : validBorder}`}
            />
            {touched.country && errors.country && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.country}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="room-number" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400" />
              <span>Room Number (Optional)</span>
            </label>
            <input
              id="room-number"
              type="text"
              value={customer.roomNumber || ''}
              onChange={(e) => handleChange('roomNumber', e.target.value)}
              placeholder="e.g. Room 412 (can provide later)"
              className={`${inputBase} ${validBorder}`}
            />
            <span className="text-[10px] text-[#5C6F84] dark:text-slate-400 mt-1.5 block">
              Helps concierge notify your room if needed at pickup.
            </span>
          </div>
        </div>

        {/* Special Requests */}
        <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E]">
          <label htmlFor="special-requests" className="block text-xs font-bold text-[#0A192F] dark:text-white mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400" />
            <span>Special Requests &amp; Dietary Notes (Optional)</span>
          </label>
          <textarea
            id="special-requests"
            rows={2}
            value={customer.specialRequests || ''}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            placeholder="e.g. Vegetarian meal onboard, celebrating anniversary, non-swimmer in party..."
            className={`${inputBase} ${validBorder}`}
          />
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
          onClick={handleSubmitAttempt}
          className="px-7 py-3 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Review Booking</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
