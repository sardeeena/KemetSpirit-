import React from 'react';

export const BookingPageSkeleton: React.FC = () => {
  return (
    <div
      className="bg-[#F6F7F9] dark:bg-[#07111C] min-h-screen select-none transition-colors"
      role="status"
      aria-label="Loading booking portal"
    >
      {/* Top Stepper Navigation Skeleton */}
      <div className="bg-white dark:bg-[#0B1726] border-b border-[#DCE2EA] dark:border-[#1E344E] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="grid grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md bg-[#DCE2EA] dark:bg-[#1E344E] animate-shimmer shrink-0 skeleton-delay-${step % 5}`} />
                <div className={`w-16 h-3 bg-[#DCE2EA]/80 dark:bg-[#1E344E]/80 rounded animate-shimmer hidden sm:block skeleton-delay-${step % 5}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="pb-6 mb-7 border-b border-[#DCE2EA] dark:border-[#1E344E] space-y-2">
          <div className="w-36 h-3 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
          <div className="w-64 h-8 bg-[#DCE2EA] dark:bg-[#1E344E] rounded-lg animate-shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2.5">
                <div className="w-28 h-3 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
                <div className="w-3/4 sm:w-1/2 h-7 bg-[#DCE2EA] dark:bg-[#1E344E] rounded-lg animate-shimmer" />
                <div className="w-full sm:w-2/3 h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer" />
              </div>

              <div className="space-y-5 pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                <div className="space-y-2">
                  <div className="w-32 h-3.5 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
                  <div className="w-full h-11 bg-[#EEF1F5] dark:bg-[#14263D] rounded-xl animate-shimmer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-[#EEF1F5] dark:bg-[#14263D] rounded-xl animate-shimmer" />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                <div className="w-40 h-11 bg-[#0F4C81]/25 dark:bg-sky-500/25 rounded-xl animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside className="lg:col-span-5 xl:col-span-4 sticky top-32">
            <div className="bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#DCE2EA] dark:border-[#1E344E]">
                <div className="w-20 h-16 rounded-xl bg-[#EEF1F5] dark:bg-[#14263D] shrink-0 animate-shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="w-16 h-3 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
                  <div className="w-full h-4 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
                  <div className="w-24 h-3 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer" />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer" />
                <div className="h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer" />
                <div className="h-4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer" />
              </div>
              <div className="pt-4 border-t border-[#DCE2EA] dark:border-[#1E344E] flex justify-between items-baseline">
                <div className="w-16 h-4 bg-[#DCE2EA] dark:bg-[#1E344E] rounded animate-shimmer" />
                <div className="w-24 h-7 bg-[#0F4C81]/25 dark:bg-sky-500/25 rounded animate-shimmer" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
