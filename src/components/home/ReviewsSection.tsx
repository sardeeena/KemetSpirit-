import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { getPublishedReviews, PublishedReviewsResult } from '../../services/tourService';

export const ReviewsSection: React.FC = () => {
  const [data, setData] = useState<PublishedReviewsResult>({
    reviews: [],
    averageRating: 0,
    totalCount: 0,
    recommendationRate: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPublishedReviews();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load guest reviews:', err);
      setError(err?.message || 'Unable to load guest reviews at this moment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();

    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (!customEvent.detail?.entity || customEvent.detail.entity === 'reviews') {
        loadReviews();
      }
    };

    window.addEventListener('rse_data_updated', handleDataUpdated);
    return () => window.removeEventListener('rse_data_updated', handleDataUpdated);
  }, [loadReviews]);

  return (
    <section
      id="reviews-section"
      className="py-16 sm:py-24 bg-[#F6F7F9] dark:bg-[#07111C] border-b border-[#DCE2EA] dark:border-[#1E344E] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] mb-2">
              Authentic Guest Experiences
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
              What Travelers Say
            </h2>
            <p className="text-[#2D3F54] dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Verified guest reflections recorded after completed excursions across Egypt’s Red Sea coast.
            </p>
          </div>

          {!isLoading && !error && data.totalCount > 0 && (
            <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] px-5 py-4 rounded-2xl flex items-center gap-5 self-start md:self-auto">
              <div>
                <span className="font-display font-mono-num text-3xl font-bold text-[#0A192F] dark:text-white block leading-none">
                  {data.averageRating.toFixed(1)}
                </span>
                <div className="flex text-[#B58428] dark:text-[#E3B34C] mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(data.averageRating)
                          ? 'fill-current'
                          : 'stroke-current text-[#DCE2EA] dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-[#DCE2EA] dark:bg-[#1E344E]" />
              <div>
                <span className="text-xs font-bold font-mono-num text-[#0A192F] dark:text-white block">
                  {data.totalCount} Published {data.totalCount === 1 ? 'Review' : 'Reviews'}
                </span>
                {data.recommendationRate > 0 && (
                  <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                    {data.recommendationRate}% guest satisfaction
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div
            id="review-loading"
            data-testid="review-loading"
            aria-busy="true"
            aria-label="Loading verified traveler reviews"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] p-6 space-y-4 select-none skeleton-delay-${idx + 1}`}
              >
                <div className="flex justify-between items-center">
                  <div className={`h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded w-24 animate-shimmer skeleton-delay-${idx + 1}`} />
                  <div className={`h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded w-16 animate-shimmer skeleton-delay-${idx + 1}`} />
                </div>
                <div className={`h-3.5 bg-[#EEF1F5] dark:bg-[#14263D] rounded w-36 animate-shimmer skeleton-delay-${idx + 1}`} />
                <div className="space-y-2">
                  <div className={`h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded w-full animate-shimmer skeleton-delay-${idx + 1}`} />
                  <div className={`h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded w-4/5 animate-shimmer skeleton-delay-${idx + 1}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && error && (
          <div
            id="review-error"
            data-testid="review-error"
            className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center max-w-lg mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-[#0A192F] dark:text-white mb-1">
              Could not load customer reviews
            </h3>
            <p className="text-xs text-[#5C6F84] dark:text-slate-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={loadReviews}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && data.reviews.length === 0 && (
          <div
            id="review-empty"
            data-testid="review-empty"
            className="bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] p-12 text-center max-w-md mx-auto"
          >
            <MessageSquare className="w-8 h-8 text-[#0F4C81] dark:text-sky-400 mx-auto mb-3" />
            <h3 className="font-semibold text-[#0A192F] dark:text-white text-base mb-1">
              No Guest Reviews Published Yet
            </h3>
            <p className="text-xs text-[#5C6F84] dark:text-slate-400 leading-relaxed">
              Real reviews from verified travelers are reviewed and published here following completed excursions.
            </p>
          </div>
        )}

        {/* REVIEWS GRID */}
        {!isLoading && !error && data.reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.reviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                id={`review-card-${rev.id}`}
                data-testid="review-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] p-6 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#B58428] dark:text-[#E3B34C]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#5C6F84] dark:text-slate-400 font-mono-num">
                      {rev.date}
                    </span>
                  </div>

                  {rev.tourTitle && (
                    <span className="text-xs font-semibold text-[#0F4C81] dark:text-sky-400 block mb-2.5 line-clamp-1">
                      {rev.tourTitle}
                    </span>
                  )}

                  <p className="text-xs sm:text-[13px] text-[#2D3F54] dark:text-slate-200 leading-relaxed mb-6">
                    “{rev.comment}”
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#0A192F] dark:text-white block truncate">
                      {rev.authorName}
                    </span>
                    <div className="text-[11px] text-[#5C6F84] dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{rev.country}</span>
                      {rev.travelerType && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{rev.travelerType}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {rev.verifiedBooking && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0D7A5F] dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
