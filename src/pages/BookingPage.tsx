import React, { useState, useEffect, useMemo, useRef } from 'react';
import { recordVisitorEvent } from '../services/visitorAnalyticsService';
import { motion, AnimatePresence } from 'motion/react';
import { Tour, CurrencyConfig } from '../types';
import { GuestCounts, BookingExtra, CustomerInfo, Booking, PickupLocation } from '../types/booking';
import { STANDARD_PICKUP_LOCATIONS } from '../data/bookingData';
import { getPublishedPickupLocations, getPublishedTourExtras } from '../services/tourService';
import { calculateBookingPrice } from '../services/pricingService';
import { bookingRepository, generateBookingReference } from '../services/bookingRepository';
import { notificationService } from '../services/notificationService';
import { loadBookingDraft, saveBookingDraft, clearBookingDraft, BookingDraftState } from '../services/draftStorage';
import { BookingSummary } from '../components/booking/BookingSummary';
import { StepDateGuests } from '../components/booking/StepDateGuests';
import { StepPickup } from '../components/booking/StepPickup';
import { StepExtras } from '../components/booking/StepExtras';
import { StepCustomerInfo } from '../components/booking/StepCustomerInfo';
import { StepReview } from '../components/booking/StepReview';
import { StepPayment } from '../components/booking/StepPayment';
import {
  Calendar,
  MapPin,
  Sparkles,
  User,
  CheckSquare,
  Lock,
  Check,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface BookingPageProps {
  tours: Tour[];
  initialTourSlug?: string;
  currency: CurrencyConfig;
  onBookingSuccess: (booking: Booking) => void;
  onNavigate: (page: string, param?: string) => void;
}

const STEPS = [
  { id: 1, num: '01', label: 'Date & Guests', icon: Calendar },
  { id: 2, num: '02', label: 'Pickup', icon: MapPin },
  { id: 3, num: '03', label: 'Extras', icon: Sparkles },
  { id: 4, num: '04', label: 'Guest Details', icon: User },
  { id: 5, num: '05', label: 'Review', icon: CheckSquare },
  { id: 6, num: '06', label: 'Payment', icon: Lock },
];

export const BookingPage: React.FC<BookingPageProps> = ({
  tours,
  initialTourSlug,
  currency,
  onBookingSuccess,
  onNavigate,
}) => {
  const { showToast } = useToast();

  // Find current tour or fallback
  const [selectedTourSlug] = useState<string>(
    initialTourSlug || (tours.length > 0 ? tours[0].slug : '')
  );

  const currentTour = useMemo(() => {
    return (
      tours.find((t) => t.slug === selectedTourSlug) ||
      tours.find((t) => t.id === selectedTourSlug) ||
      tours[0]
    );
  }, [tours, selectedTourSlug]);

  // Load persisted draft
  const initialDraft = useMemo(() => {
    return loadBookingDraft(currentTour?.slug);
  }, [currentTour?.slug]);

  const [currentStep, setCurrentStep] = useState<number>(initialDraft.currentStep || 1);
  const bookingAnalyticsStarted = useRef(false);
  const previousBookingStep = useRef<number | null>(null);
  useEffect(() => {
    if (!bookingAnalyticsStarted.current) {
      bookingAnalyticsStarted.current = true;
      previousBookingStep.current = currentStep;
      void recordVisitorEvent({ event_name: 'booking_started', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown' } });
      void recordVisitorEvent({ event_name: 'booking_step_viewed', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown', booking_step: currentStep } });
      return;
    }
    if (previousBookingStep.current !== null && previousBookingStep.current !== currentStep) {
      void recordVisitorEvent({ event_name: 'booking_step_completed', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown', booking_step: previousBookingStep.current } });
      void recordVisitorEvent({ event_name: 'booking_step_viewed', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown', booking_step: currentStep } });
      previousBookingStep.current = currentStep;
    }
  }, [currentStep, currentTour?.slug]);

  const [date, setDate] = useState<string>(initialDraft.date || '');
  const [selectedTourLanguage, setSelectedTourLanguage] = useState<string>(
    initialDraft.selectedTourLanguage || currentTour?.languages?.[0] || 'English'
  );
  const [guests, setGuests] = useState<GuestCounts>(initialDraft.guests);
  const [pickupLocationId, setPickupLocationId] = useState<string>(initialDraft.pickupLocationId || 'hurghada');
  const [hotelName, setHotelName] = useState<string>(initialDraft.hotelName || '');
  const [roomNumber, setRoomNumber] = useState<string>(initialDraft.roomNumber || '');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(initialDraft.selectedExtraIds || []);
  const [customer, setCustomer] = useState<CustomerInfo>(initialDraft.customer);
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_pickup' | 'pay_online'>(
    initialDraft.paymentMethod || 'pay_at_pickup'
  );
  const [couponCode, setCouponCode] = useState<string>(initialDraft.couponCode || '');
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState<string>(
    initialDraft.idempotencyKey || `idem_${crypto.randomUUID()}`
  );
  const lastDraftFingerprint = useRef<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(initialDraft.termsAccepted || false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState<boolean>(false);

  useEffect(() => {
    const options = Array.from(new Set((currentTour?.languages || []).map((language) => language.trim()).filter(Boolean)));
    const supported = options.length > 0 ? options : ['English'];
    setSelectedTourLanguage((current) => (supported.includes(current) ? current : supported[0]));
  }, [currentTour?.slug, currentTour?.languages?.join('|')]);

  // Dynamic database-backed pickup locations & extras
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>(STANDARD_PICKUP_LOCATIONS);
  const [availableExtras, setAvailableExtras] = useState<BookingExtra[]>([]);
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadEntities() {
      if (!currentTour) return;
      try {
        const [locs, exts] = await Promise.all([
          getPublishedPickupLocations(currentTour.destination || currentTour.id),
          getPublishedTourExtras(currentTour.id || currentTour.slug),
        ]);
        if (isMounted) {
          setPickupLocations(locs);
          if (locs.length > 0 && !locs.some((l) => l.id === pickupLocationId)) {
            setPickupLocationId(locs[0].id);
          }
          setAvailableExtras(exts);
          // Deselect any extras not assigned to this tour
          setSelectedExtraIds((prev) => prev.filter((id) => exts.some((e) => e.id === id)));
        }
      } catch (err) {
        console.warn('Could not load dynamic booking locations/extras:', err);
      }
    }
    loadEntities();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const entity = customEvent.detail?.entity;
      if (!entity || entity === 'locations' || entity === 'extras') {
        loadEntities();
      }
    };
    window.addEventListener('rse_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('rse_data_updated', handleUpdate);
    };
  }, [currentTour?.slug, currentTour?.id, currentTour?.destination]);

  const draftFingerprint = useMemo(
    () =>
      JSON.stringify({
        tourSlug: currentTour?.slug,
        date,
        selectedTourLanguage,
        guests,
        pickupLocationId,
        hotelName,
        roomNumber,
        selectedExtraIds,
        extraQuantities,
        customer,
        paymentMethod,
        couponCode,
      }),
    [
      currentTour?.slug,
      date,
      selectedTourLanguage,
      guests,
      pickupLocationId,
      hotelName,
      roomNumber,
      selectedExtraIds,
      extraQuantities,
      customer,
      paymentMethod,
      couponCode,
    ]
  );

  useEffect(() => {
    if (lastDraftFingerprint.current === null) {
      lastDraftFingerprint.current = draftFingerprint;
      return;
    }
    if (lastDraftFingerprint.current !== draftFingerprint) {
      lastDraftFingerprint.current = draftFingerprint;
      setCheckoutIdempotencyKey(`idem_${crypto.randomUUID()}`);
    }
  }, [draftFingerprint]);

  // Synchronize draft to sessionStorage
  useEffect(() => {
    if (!currentTour) return;
    const draft: BookingDraftState = {
      tourSlug: currentTour.slug,
      selectedTourLanguage,
      currentStep,
      date,
      guests,
      pickupLocationId,
      hotelName: hotelName || customer.hotelName || '',
      roomNumber: roomNumber || customer.roomNumber || '',
      selectedExtraIds,
      customer: {
        ...customer,
        hotelName: customer.hotelName || hotelName || '',
        roomNumber: customer.roomNumber || roomNumber || '',
      },
      paymentMethod,
      termsAccepted,
      idempotencyKey: checkoutIdempotencyKey,
      couponCode,
    };
    saveBookingDraft(draft);
  }, [
    currentTour,
    currentStep,
    date,
    selectedTourLanguage,
    guests,
    pickupLocationId,
    hotelName,
    roomNumber,
    selectedExtraIds,
    customer,
    paymentMethod,
    termsAccepted,
    checkoutIdempotencyKey,
    couponCode,
  ]);

  // Selected pickup object
  const selectedPickup = useMemo(() => {
    return pickupLocations.find((p) => p.id === pickupLocationId) || pickupLocations[0];
  }, [pickupLocations, pickupLocationId]);

  // Selected extras objects
  const selectedExtras = useMemo(() => {
    return availableExtras.filter((e) => selectedExtraIds.includes(e.id));
  }, [availableExtras, selectedExtraIds]);

  // Pricing calculation via dedicated engine
  const pricing = useMemo(() => {
    if (!currentTour) {
      return calculateBookingPrice({
        tour: tours[0],
        guests,
        pickupLocation: selectedPickup,
        selectedExtras: [],
        currency,
      });
    }
    return calculateBookingPrice({
      tour: currentTour,
      guests,
      pickupLocation: selectedPickup,
      selectedExtras: selectedExtras.map((e) => ({
        extra: e,
        quantity: extraQuantities[e.id] || 1,
      })),
      currency,
    });
  }, [currentTour, tours, guests, selectedPickup, selectedExtras, extraQuantities, currency]);

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  const handleUpdateQuantity = (extraId: string, quantity: number) => {
    setExtraQuantities((prev) => ({
      ...prev,
      [extraId]: quantity,
    }));
  };

  const handleHotelNameChange = (name: string) => {
    setHotelName(name);
    setCustomer((prev) => ({ ...prev, hotelName: name }));
  };

  const handleCustomerChange = (newCustomer: CustomerInfo) => {
    setCustomer(newCustomer);
    if (newCustomer.hotelName && newCustomer.hotelName !== hotelName) {
      setHotelName(newCustomer.hotelName);
    }
    if (newCustomer.roomNumber && newCustomer.roomNumber !== roomNumber) {
      setRoomNumber(newCustomer.roomNumber);
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentTour) return;
    setIsSubmitting(true);

    try {
      const ref = generateBookingReference();
      const payingGuests = (guests.adults || 1) + (guests.children || 0);
      const effectiveHotel = customer.hotelName || hotelName || '';
      const effectiveRoom = customer.roomNumber || roomNumber || '';

      const newBooking: Booking = {
        bookingId: `b-${Date.now()}`,
        bookingReference: ref,
        idempotencyKey: checkoutIdempotencyKey,
        couponCode: couponCode.trim() || undefined,
        tourId: currentTour.id,
        tourSlug: currentTour.slug,
        tourTitle: currentTour.title,
        tourImage: currentTour.primaryImage,
        tourDestination: currentTour.destination,
        tourDuration: currentTour.durationLabel,
        tourLanguage: selectedTourLanguage,
        date,
        guests,
        pickup: {
          locationId: selectedPickup.id,
          locationName: selectedPickup.name,
          area: selectedPickup.area,
          feeEur: selectedPickup.feeEurPerPerson,
          hotelName: effectiveHotel,
          roomNumber: effectiveRoom,
        },
        extras: selectedExtras.map((e) => {
          const qty = extraQuantities[e.id] || 1;
          const amountEur =
            e.pricingType === 'per_person'
              ? e.priceEur * payingGuests * qty
              : e.pricingType === 'per_adult'
              ? e.priceEur * (guests.adults || 1) * qty
              : e.pricingType === 'per_child'
              ? e.priceEur * (guests.children || 0) * qty
              : e.priceEur * qty;
          return {
            extraId: e.id,
            name: e.name,
            priceEur: e.priceEur,
            pricingType: e.pricingType,
            quantity: qty,
            amountEur,
          };
        }),
        customer: {
          ...customer,
          hotelName: effectiveHotel,
          roomNumber: effectiveRoom,
        },
        pricing,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await bookingRepository.createBooking(newBooking);
      void recordVisitorEvent({ event_name: 'booking_submitted', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown', booking_step: currentStep } });
      clearBookingDraft();
      notificationService.sendBookingConfirmation(newBooking);
      void recordVisitorEvent({ event_name: 'booking_confirmed', page_path: '/booking', event_data: { tour_slug: currentTour?.slug || 'unknown' } });
      showToast('Reservation submitted successfully!', 'success');
      onBookingSuccess(newBooking);
    } catch (err: any) {
      console.error('Failed to save booking:', err);
      showToast(err.message || 'An error occurred while confirming your reservation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F6F7F9] dark:bg-[#07111C] text-[#0A192F] dark:text-slate-100 min-h-screen transition-colors">
      {/* Architectural Sticky Progress Rail */}
      <div className="bg-white/95 dark:bg-[#0B1726]/95 backdrop-blur-md border-b border-[#DCE2EA] dark:border-[#1E344E] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop 6-Step Progress Bar */}
          <nav aria-label="Booking progress" className="hidden md:grid grid-cols-6 gap-2">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.id;
              const isCompleted = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isCompleted && !isCurrent}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(s.id);
                  }}
                  className={`relative flex items-center gap-2.5 py-3.5 px-2 text-left transition-colors whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'text-[#0F4C81] dark:text-sky-400'
                      : isCompleted
                      ? 'text-[#0A192F] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 cursor-pointer'
                      : 'text-[#5C6F84]/60 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono-num text-[11px] font-bold shrink-0 border transition-colors ${
                      isCurrent
                        ? 'bg-[#0F4C81] dark:bg-sky-500 border-[#0F4C81] dark:border-sky-500 text-white dark:text-[#07111C]'
                        : isCompleted
                        ? 'bg-[#0D7A5F]/10 dark:bg-emerald-500/15 border-[#0D7A5F]/40 dark:border-emerald-400/40 text-[#0D7A5F] dark:text-emerald-400'
                        : 'bg-[#EEF1F5] dark:bg-[#14263D] border-[#DCE2EA] dark:border-[#1E344E] text-[#5C6F84] dark:text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
                  </span>
                  <span className={`text-xs truncate ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                    {s.label}
                  </span>
                  {isCurrent && (
                    <motion.span
                      layoutId="booking-step-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F4C81] dark:bg-sky-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Step Progress */}
          <div className="md:hidden py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider text-[#B58428] dark:text-[#E3B34C] block">
                Step 0{currentStep} of 0{STEPS.length}
              </span>
              <span className="text-xs font-bold text-[#0A192F] dark:text-white truncate block">
                {STEPS[currentStep - 1]?.label}
              </span>
            </div>
            <div className="w-28 bg-[#DCE2EA] dark:bg-[#1E344E] h-1.5 rounded-full overflow-hidden shrink-0">
              <div
                className="bg-[#0F4C81] dark:bg-sky-400 h-full transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
        {/* Editorial Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-7 border-b border-[#DCE2EA] dark:border-[#1E344E]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] block mb-1.5">
              Direct Vessel Reservation
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight leading-tight">
              Reserve Your Excursion
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('excursions')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6F84] dark:text-slate-400 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse other excursions</span>
          </button>
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Step Flow */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <StepDateGuests
                    tour={currentTour}
                    date={date}
                    onDateChange={setDate}
                    tourLanguage={selectedTourLanguage}
                    onTourLanguageChange={setSelectedTourLanguage}
                    guests={guests}
                    onGuestsChange={setGuests}
                    currency={currency}
                    onNext={() => setCurrentStep(2)}
                  />
                )}

                {currentStep === 2 && (
                  <StepPickup
                    selectedPickupId={pickupLocationId}
                    onSelectPickup={(loc) => setPickupLocationId(loc.id)}
                    hotelName={hotelName}
                    onHotelNameChange={handleHotelNameChange}
                    currency={currency}
                    locations={pickupLocations}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                  />
                )}

                {currentStep === 3 && (
                  <StepExtras
                    selectedExtraIds={selectedExtraIds}
                    onToggleExtra={handleToggleExtra}
                    currency={currency}
                    extras={availableExtras}
                    extraQuantities={extraQuantities}
                    onUpdateQuantity={handleUpdateQuantity}
                    onNext={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                  />
                )}

                {currentStep === 4 && (
                  <StepCustomerInfo
                    customer={customer}
                    onCustomerChange={handleCustomerChange}
                    onNext={() => setCurrentStep(5)}
                    onBack={() => setCurrentStep(3)}
                    onNavigateLogin={() => onNavigate('login')}
                  />
                )}

                {currentStep === 5 && (
                  <StepReview
                    tour={currentTour}
                    date={date}
                    tourLanguage={selectedTourLanguage}
                    guests={guests}
                    pickupLocation={selectedPickup}
                    hotelName={hotelName}
                    selectedExtras={selectedExtras}
                    customer={customer}
                    pricing={pricing}
                    currency={currency}
                    onGoToStep={(step) => setCurrentStep(step)}
                    onNext={() => setCurrentStep(6)}
                    onBack={() => setCurrentStep(4)}
                  />
                )}

                {currentStep === 6 && (
                  <StepPayment
                    pricing={pricing}
                    couponCode={couponCode}
                    onCouponCodeChange={setCouponCode}
                    currency={currency}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    termsAccepted={termsAccepted}
                    onTermsAcceptedChange={setTermsAccepted}
                    isSubmitting={isSubmitting}
                    onSubmitBooking={handleConfirmBooking}
                    onBack={() => setCurrentStep(5)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Booking Summary */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32 space-y-4">
            <BookingSummary
              tour={currentTour}
              date={date}
              tourLanguage={selectedTourLanguage}
              guests={guests}
              pickupLocation={selectedPickup}
              hotelName={hotelName}
              selectedExtras={selectedExtras}
              pricing={pricing}
              currency={currency}
              collapsibleMobile
              isMobileExpanded={isMobileSummaryExpanded}
              onToggleMobileExpand={() => setIsMobileSummaryExpanded((prev) => !prev)}
            />

            {/* Direct Operator Guarantee */}
            <div className="p-4 bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#0D7A5F] dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Operator Direct Guarantee</span>
              </div>
              <p className="text-[#5C6F84] dark:text-slate-400 text-[11px] leading-relaxed">
                Reservations transmit directly to our marine fleet operations desk in Hurghada. Free cancellation up to 24 hours prior to departure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
