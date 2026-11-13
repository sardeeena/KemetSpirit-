import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Share2, 
  Heart,
  Scale
} from 'lucide-react';
import { Tour, CurrencyConfig } from '../types';
import { formatPrice } from '../data/toursData';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { TourGallery } from '../components/tours/TourGallery';
import { TourBookingPanel } from '../components/tours/TourBookingPanel';
import { MobileBookingBar } from '../components/tours/MobileBookingBar';
import { Itinerary } from '../components/tours/Itinerary';
import { IncludedExcluded } from '../components/tours/IncludedExcluded';
import { ImportantInformation } from '../components/tours/ImportantInformation';
import { TourReviews } from '../components/tours/TourReviews';
import { RelatedTours } from '../components/tours/RelatedTours';
import { useWishlist } from '../contexts/WishlistContext';
import { useComparison } from '../contexts/ComparisonContext';
import { useToast } from '../contexts/ToastContext';
import { useSeo } from '../hooks/useSeo';
import { seoService } from '../services/seoService';
import { recordVisitorEvent } from '../services/visitorAnalyticsService';

interface TourDetailPageProps {
  tour: Tour;
  currency: CurrencyConfig;
  allTours?: Tour[];
  onNavigateHome: () => void;
  onNavigateExcursions: () => void;
  onViewTour: (tour: Tour) => void;
  onBookTour: (bookingDetails: {
    tour: Tour;
    date: string;
    adults: number;
    children: number;
    pickupLocation: string;
    selectedExtras: string[];
    totalEur: number;
  }) => void;
  onDirectBookNow?: (tour: Tour) => void;
}

export const TourDetailPage: React.FC<TourDetailPageProps> = ({
  tour,
  currency,
  allTours = [],
  onNavigateHome,
  onNavigateExcursions,
  onViewTour,
  onBookTour,
  onDirectBookNow,
}) => {
  const { isFavorite, toggleFavorite } = useWishlist();
  const { isCompared, toggleCompare } = useComparison();
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic SEO meta tags, OpenGraph, and Schema.org JSON-LD
  const seoData = React.useMemo(() => seoService.generateTourSeo(tour), [tour]);
  useSeo(seoData);
  React.useEffect(() => {
    void recordVisitorEvent({ event_name: 'tour_view', page_path: `/excursions/${tour.slug}`, event_data: { tour_slug: tour.slug, destination: tour.destination, category: tour.category } });
  }, [tour.slug, tour.destination, tour.category]);

  const favorite = isFavorite(tour.slug);
  const compared = isCompared(tour.slug);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    void recordVisitorEvent({ event_name: 'tour_shared', page_path: `/excursions/${tour.slug}`, event_data: { tour_slug: tour.slug, interaction: 'link_copied' } });
    setCopiedLink(true);
    showToast('Tour link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMobileBook = () => {
    if (onDirectBookNow) {
      onDirectBookNow(tour);
    } else {
      const el = document.getElementById('booking-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full bg-[#F6F7F9] dark:bg-[#07111C] min-h-screen transition-colors">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 lg:pb-12"
    >
      {/* Breadcrumbs & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: onNavigateHome },
            { label: 'Excursions', onClick: onNavigateExcursions },
            { label: tour.title },
          ]}
        />

        <div className="flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(tour.slug, tour.title)}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border cursor-pointer whitespace-nowrap ${
              favorite
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 font-semibold'
                : 'bg-white dark:bg-[#0E1C2E] border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 text-[#0A192F] dark:text-slate-200'
            }`}
            title={favorite ? 'Remove from saved' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current text-rose-600 dark:text-rose-400' : ''}`} />
            <span className="hidden sm:inline">
              {favorite ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => toggleCompare(tour.slug, tour.title)}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border cursor-pointer whitespace-nowrap ${
              compared
                ? 'bg-[#0F4C81]/10 dark:bg-sky-400/15 text-[#0F4C81] dark:text-sky-400 border-[#0F4C81]/30 dark:border-sky-400/30 font-semibold'
                : 'bg-white dark:bg-[#0E1C2E] border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 text-[#0A192F] dark:text-slate-200'
            }`}
            title="Compare with other excursions"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {compared ? 'In Comparison' : 'Compare'}
            </span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-2 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 rounded-xl text-[#0A192F] dark:text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Copy tour link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {copiedLink ? 'Link Copied!' : 'Share'}
            </span>
          </button>
        </div>
      </div>

      {/* TOP: Image Gallery */}
      <div className="my-4">
        <TourGallery
          primaryImage={tour.primaryImage}
          galleryImages={tour.galleryImages}
          tourTitle={tour.title}
        />
      </div>

      {/* Main Grid: Left Details & Right Booking Sticky Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        
        {/* Left Column: Comprehensive Details (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 min-w-0">
          
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold mb-2">
              <span className="text-[#B58428] dark:text-[#E3B34C] font-bold uppercase tracking-[0.14em] text-[11px]">
                {tour.category}
              </span>
              <span className="text-[#DCE2EA] dark:text-slate-600" aria-hidden="true">·</span>
              <span className="flex items-center text-[#0F4C81] dark:text-sky-400">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {tour.destination}
              </span>
              <span className="text-[#DCE2EA] dark:text-slate-600" aria-hidden="true">·</span>
              <span className="flex items-center text-[#5C6F84] dark:text-slate-400 font-mono-num">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {tour.durationLabel}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0A192F] dark:text-white leading-tight mb-3">
              {tour.title}
            </h1>

            {/* Rating & Review count */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {tour.reviewCount > 0 ? (
                <>
                  <div className="flex text-[#B58428] dark:text-[#E3B34C]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(tour.rating) ? 'fill-current' : 'fill-current opacity-25'}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono-num font-bold text-[#0A192F] dark:text-white text-sm">
                    {tour.rating.toFixed(1)}
                  </span>
                  <span className="text-[#DCE2EA] dark:text-slate-600">·</span>
                  <span className="font-mono-num text-[#5C6F84] dark:text-slate-400 font-medium">
                    {tour.reviewCount} customer reviews
                  </span>
                </>
              ) : (
                <span className="text-[#5C6F84] dark:text-slate-400 font-medium">
                  New Season Release · No reviews yet
                </span>
              )}
              {tour.pickupAvailable && (
                <>
                  <span className="text-[#DCE2EA] dark:text-slate-600">·</span>
                  <span className="text-[#0D7A5F] dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hotel Pickup Included</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Short description (clean hairline border card, no border-l-4 stripe) */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl text-xs sm:text-sm text-[#2D3F54] dark:text-slate-300 leading-relaxed">
            {tour.shortDescription}
          </div>

          {/* About this experience */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-[#0A192F] dark:text-white">
              About This Experience
            </h3>
            <p className="text-xs sm:text-sm text-[#2D3F54] dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {tour.fullDescription}
            </p>
          </div>

          {/* Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-[#0A192F] dark:text-white">
                Experience Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tour.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#2D3F54] dark:text-slate-300 p-3 rounded-xl bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E]"
                  >
                    <span className="font-mono-num text-[11px] font-bold text-[#B58428] dark:text-[#E3B34C] shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-snug">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ITINERARY */}
          <div className="pt-4 border-t border-stone-200">
            <Itinerary items={tour.itinerary} />
          </div>

          {/* WHAT'S INCLUDED / NOT INCLUDED */}
          <div className="pt-4 border-t border-stone-200">
            <IncludedExcluded
              included={tour.included}
              excluded={tour.excluded}
            />
          </div>

          {/* IMPORTANT INFORMATION */}
          <div className="pt-4 border-t border-stone-200">
            <ImportantInformation tour={tour} />
          </div>

          {/* REVIEWS SECTION */}
          <div className="pt-4 border-t border-stone-200">
            <TourReviews tour={tour} />
          </div>

          {/* RELATED TOURS */}
          <div className="pt-4">
            <RelatedTours
              currentTour={tour}
              allTours={allTours}
              currency={currency}
              onViewTour={onViewTour}
              onBookNow={(relTour) => (onDirectBookNow ? onDirectBookNow(relTour) : handleMobileBook())}
            />
          </div>

        </div>

        {/* Right Column: Sticky Booking Panel (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <TourBookingPanel
            tour={tour}
            currency={currency}
            onBook={onBookTour}
          />
        </div>

      </div>

      {/* Mobile Sticky Booking Bar */}
      <MobileBookingBar
        tour={tour}
        currency={currency}
        onBookNow={handleMobileBook}
      />

    </motion.div>
    </div>
  );
};
