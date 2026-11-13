import React from 'react';

interface TourCardSkeletonProps {
  className?: string;
  staggerIndex?: number;
}

export const TourCardSkeleton: React.FC<TourCardSkeletonProps> = ({
  className = '',
  staggerIndex,
}) => {
  const staggerClass =
    staggerIndex !== undefined ? `skeleton-delay-${(staggerIndex % 5) + 1}` : '';

  return (
    <article
      className={`bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] overflow-hidden flex flex-col h-full relative select-none transition-colors ${staggerClass} ${className}`}
      aria-hidden="true"
      role="status"
      aria-label="Loading excursion details"
    >
      <div
        className={`tour-card-media relative bg-[#EEF1F5] dark:bg-[#14263D] animate-shimmer overflow-hidden ${staggerClass}`}
      >
        <div className="absolute top-3 left-3 w-20 h-5 bg-[#DCE2EA] dark:bg-[#1E344E] rounded-md" />
        <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-[#DCE2EA] dark:bg-[#1E344E] rounded-lg" />
      </div>

      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
        <div>
          <div className="flex items-center space-x-2 mb-2.5">
            <div className={`w-16 h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer ${staggerClass}`} />
            <div className={`w-24 h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer ${staggerClass}`} />
          </div>

          <div className="space-y-2 mb-3">
            <div className={`w-11/12 h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer ${staggerClass}`} />
            <div className={`w-3/4 h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer ${staggerClass}`} />
          </div>

          <div className="space-y-1.5 mb-3">
            <div className={`w-full h-3 bg-[#F6F7F9] dark:bg-[#14263D]/60 rounded animate-shimmer ${staggerClass}`} />
            <div className={`w-5/6 h-3 bg-[#F6F7F9] dark:bg-[#14263D]/60 rounded animate-shimmer ${staggerClass}`} />
          </div>
        </div>

        <div className="pt-3 border-t border-[#DCE2EA] dark:border-[#1E344E] space-y-2.5">
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className={`w-8 h-2.5 bg-[#EEF1F5] dark:bg-[#14263D] rounded mb-1 animate-shimmer ${staggerClass}`} />
              <div className={`w-16 h-5 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer ${staggerClass}`} />
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-14 h-8 bg-[#EEF1F5] dark:bg-[#14263D] rounded-lg" />
              <div className={`w-16 h-8 bg-[#0F4C81]/25 dark:bg-sky-500/25 rounded-lg animate-shimmer ${staggerClass}`} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

interface TourGridSkeletonProps {
  count?: number;
  className?: string;
}

export const TourGridSkeleton: React.FC<TourGridSkeletonProps> = ({
  count = 8,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      {[...Array(count)].map((_, index) => (
        <TourCardSkeleton key={index} staggerIndex={index} />
      ))}
    </div>
  );
};

export default TourCardSkeleton;
