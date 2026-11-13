import React from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, Heart, Eye, Scale, Compass } from 'lucide-react';
import { Tour, CurrencyConfig } from '../../types';
import { formatPrice } from '../../data/toursData';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';

interface TourCardProps {
  tour: Tour;
  currency: CurrencyConfig;
  onViewTour: (tour: Tour) => void;
  onBookNow?: (tour: Tour) => void;
  onQuickView?: (tour: Tour) => void;
}

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  currency,
  onViewTour,
  onBookNow,
  onQuickView,
}) => {
  const { isFavorite, toggleFavorite } = useWishlist();
  const { isCompared, toggleCompare } = useComparison();

  const favorite = isFavorite(tour.slug);
  const compared = isCompared(tour.slug);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] overflow-hidden flex flex-col hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 transition-colors duration-200 group h-full relative"
    >
      {/* Image Frame */}
      <div
        className="tour-card-media relative overflow-hidden bg-[#EEF1F5] dark:bg-[#14263D] cursor-pointer shrink-0"
        onClick={() => onViewTour(tour)}
      >
        {tour.primaryImage ? (
          <img
            src={tour.primaryImage}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#EEF1F5] dark:bg-[#14263D] text-[#5C6F84] dark:text-slate-400">
            <Compass className="w-7 h-7 mb-1 opacity-60 text-[#0F4C81] dark:text-sky-400" />
            <span className="text-[10px] font-semibold tracking-widest uppercase">
              Photo Coming Soon
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[#07111C]/65 via-transparent to-[#07111C]/20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Editorial Top-Left Corner Flag (rectangular architectural tag, no pill) */}
        {tour.badge && (
          <div className="absolute top-3 left-3 bg-[#07111C]/85 text-[#E3B34C] text-[10px] font-bold px-2.5 py-1 rounded-md tracking-[0.14em] uppercase border border-white/10">
            {tour.badge}
          </div>
        )}

        {/* Quick View Hover Trigger */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(tour);
            }}
            className="hidden sm:flex absolute inset-0 m-auto w-32 h-9 rounded-lg bg-white/95 dark:bg-[#0E1C2E]/95 text-[#0A192F] dark:text-white text-xs font-semibold border border-[#DCE2EA] dark:border-[#1E344E] shadow-lg items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
            <span>Quick View</span>
          </button>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(tour.slug, tour.title);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-lg backdrop-blur-sm flex items-center justify-center transition-colors z-20 cursor-pointer ${
            favorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-[#07111C]/55 text-white hover:bg-white hover:text-[#0A192F]'
          }`}
          title={favorite ? 'Remove from saved' : 'Save to wishlist'}
          aria-label={favorite ? 'Remove from saved' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current text-rose-600' : ''}`} />
        </button>

        {/* Clean Bottom Image Readout */}
        <div className="hidden sm:flex absolute bottom-2.5 left-3 right-3 items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
          <span>Free 24h Cancellation</span>
          <span className="font-mono-num">{tour.durationHours}h</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-2">
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] font-medium text-[#5C6F84] dark:text-slate-400 min-w-0">
            <span className="text-[#0F4C81] dark:text-sky-400 font-semibold truncate">
              {tour.destination}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-[#DCE2EA] dark:text-slate-600">
              ·
            </span>
            <span className="hidden sm:inline truncate max-w-[130px]">
              {tour.category}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewTour(tour)}
            className="font-display text-sm sm:text-base font-semibold text-[#0A192F] dark:text-white leading-snug line-clamp-2 hover:text-[#0F4C81] dark:hover:text-sky-400 cursor-pointer transition-colors sm:min-h-[44px]"
            title={tour.title}
          >
            {tour.title}
          </h3>

          {/* Short Description */}
          <p className="hidden sm:block text-xs text-[#2D3F54] dark:text-slate-300 line-clamp-2 leading-relaxed sm:min-h-[38px]">
            {tour.shortDescription}
          </p>

          {/* Rating Line */}
          <div className="flex items-center gap-1.5 text-xs pt-0.5">
            {tour.reviewCount > 0 ? (
              <>
                <div className="flex text-[#B58428] dark:text-[#E3B34C]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(tour.rating) ? 'fill-current' : 'fill-current opacity-20'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono-num font-bold text-[#0A192F] dark:text-white">
                  {tour.rating.toFixed(1)}
                </span>
                <span className="text-[#DCE2EA] dark:text-slate-600">·</span>
                <span className="font-mono-num text-[#5C6F84] dark:text-slate-400 text-[11px]">
                  {tour.reviewCount} reviews
                </span>
              </>
            ) : (
              <span className="text-[#5C6F84] dark:text-slate-400 text-[11px] font-medium">
                New Season Release
              </span>
            )}
          </div>

          {/* Unboxed Pickup Line (No decorative dot) */}
          <p className="hidden sm:block text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
            {tour.pickupInfo}
          </p>
        </div>

        {/* Footer: Actions & Tabular Price */}
        <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] space-y-2.5">
          <div className="hidden sm:flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => toggleCompare(tour.slug, tour.title)}
              className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                compared
                  ? 'text-[#0F4C81] dark:text-sky-400 font-semibold'
                  : 'text-[#5C6F84] dark:text-slate-400 hover:text-[#0A192F] dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compared ? 'In Comparison' : 'Compare'}</span>
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(tour)}
                className="text-[#5C6F84] dark:text-slate-400 hover:text-[#0F4C81] dark:hover:text-sky-400 font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Quick details
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#5C6F84] dark:text-slate-400 tracking-wider">
                From
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono-num text-base sm:text-lg font-bold text-[#0A192F] dark:text-white">
                  {formatPrice(tour.priceEur, currency)}
                </span>
                <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                  / guest
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onViewTour(tour)}
                className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold text-[#2D3F54] dark:text-slate-200 hover:text-[#0A192F] dark:hover:text-white bg-[#EEF1F5] dark:bg-[#14263D] hover:bg-[#DCE2EA] dark:hover:bg-[#1E344E] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => (onBookNow ? onBookNow(tour) : onViewTour(tour))}
                className="flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-2 text-[11px] sm:text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 rounded-lg transition-colors flex items-center gap-1 group/btn cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Book</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
