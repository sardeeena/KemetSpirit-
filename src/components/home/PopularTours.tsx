import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Filter } from 'lucide-react';
import { Tour, CurrencyConfig } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { TourCard } from '../tours/TourCard';
import { TourCardSkeleton } from '../tours/TourCardSkeleton';
import { TourPreviewModal } from './TourPreviewModal';
import { QuickBookModal } from './QuickBookModal';

interface PopularToursProps {
  tours: Tour[];
  currency: CurrencyConfig;
  isLoading?: boolean;
  onSelectTour: (tour: Tour) => void;
  onQuickBook: (tour: Tour) => void;
  onViewAllExcursions?: () => void;
  activeFilterSummary?: string;
  onClearFilters?: () => void;
}

export const PopularTours: React.FC<PopularToursProps> = ({
  tours,
  currency,
  isLoading = false,
  onSelectTour,
  onQuickBook,
  onViewAllExcursions,
  activeFilterSummary,
  onClearFilters,
}) => {
  const { t } = useLanguage();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [previewTour, setPreviewTour] = useState<Tour | null>(null);
  const [quickBookTargetTour, setQuickBookTargetTour] = useState<Tour | null>(null);

  // Dynamically derive category tabs from genuine loaded tours
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of tours) {
      if (item.category) set.add(item.category);
      if (Array.isArray(item.categories)) {
        for (const c of item.categories) {
          if (c) set.add(c);
        }
      }
    }
    return ['All', ...Array.from(set)];
  }, [tours]);

  const filteredTours =
    selectedCategoryTab === 'All'
      ? tours
      : tours.filter(
          (item) =>
            item.category === selectedCategoryTab ||
            (Array.isArray(item.categories) &&
              item.categories.includes(selectedCategoryTab))
        );

  return (
    <section
      id="tours-section"
      className="py-16 sm:py-24 bg-[#F6F7F9] dark:bg-[#07111C] border-b border-[#DCE2EA] dark:border-[#1E344E] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] mb-2">
              Handpicked Expeditions &amp; Crossings
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
              {t('popular.title')}
            </h2>
            <p className="text-[#2D3F54] dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
              {t('popular.subtitle')}
            </p>
          </div>

          {activeFilterSummary && (
            <div className="flex items-center bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-lg px-3.5 py-2 text-xs text-[#2D3F54] dark:text-slate-200 self-start md:self-auto">
              <Filter className="w-3.5 h-3.5 mr-2 text-[#0F4C81] dark:text-sky-400 shrink-0" />
              <span className="font-medium mr-2">{activeFilterSummary}</span>
              {onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-[#0F4C81] dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Underline Category Navigation Strip */}
        <div className="flex items-center gap-6 overflow-x-auto border-b border-[#DCE2EA] dark:border-[#1E344E] mb-8 no-scrollbar text-xs sm:text-sm font-medium">
          {dynamicCategories.map((cat) => {
            const isSelected = selectedCategoryTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryTab(cat)}
                className={`relative pb-3 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'text-[#0F4C81] dark:text-sky-400 font-semibold'
                    : 'text-[#5C6F84] dark:text-slate-400 hover:text-[#0A192F] dark:hover:text-white'
                }`}
              >
                <span>{cat === 'All' ? 'All Experiences' : cat}</span>
                {isSelected && (
                  <motion.span
                    layoutId="popular-category-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F4C81] dark:bg-sky-400"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tours Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 min-w-0 w-full"
            aria-busy="true"
            aria-label="Loading handpicked excursions from Supabase"
          >
            {[...Array(8)].map((_, index) => (
              <TourCardSkeleton key={index} staggerIndex={index} />
            ))}
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] p-12 text-center my-6">
            <p className="text-[#0A192F] dark:text-white font-semibold text-base mb-1">
              No excursions match your current filter.
            </p>
            <p className="text-[#5C6F84] dark:text-slate-400 text-xs mb-4">
              Try clearing your filters or selecting a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryTab('All');
                if (onClearFilters) onClearFilters();
              }}
              className="px-4 py-2 bg-[#0F4C81] dark:bg-sky-500 text-white dark:text-[#07111C] text-xs font-semibold rounded-lg hover:bg-[#0B3A63] dark:hover:bg-sky-400 transition-colors cursor-pointer"
            >
              Show All Excursions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-0 w-full">
            <AnimatePresence mode="popLayout">
              {filteredTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
                >
                  <TourCard
                    tour={tour}
                    currency={currency}
                    onViewTour={onSelectTour}
                    onBookNow={onQuickBook}
                    onQuickView={(tItem) => setPreviewTour(tItem)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View All CTA */}
        {onViewAllExcursions && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={onViewAllExcursions}
              className="inline-flex items-center gap-2.5 px-7 py-3 bg-[#0A192F] hover:bg-[#0F4C81] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-[#07111C] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer group whitespace-nowrap"
            >
              <span>{t('popular.viewAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <TourPreviewModal
        tour={previewTour}
        currency={currency}
        onClose={() => setPreviewTour(null)}
        onBookNow={(tItem) => {
          setPreviewTour(null);
          onQuickBook(tItem);
        }}
      />

      <QuickBookModal
        tour={quickBookTargetTour}
        currency={currency}
        onClose={() => setQuickBookTargetTour(null)}
        onSuccess={() => {
          if (quickBookTargetTour) {
            onQuickBook(quickBookTargetTour);
          }
        }}
      />
    </section>
  );
};
