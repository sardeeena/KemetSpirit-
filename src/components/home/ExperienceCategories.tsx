import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Ship,
  Waves,
  Compass,
  Sun,
  Anchor,
  Landmark,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Category } from '../../types';
import { getPublishedCategories, NEUTRAL_CATEGORY_PLACEHOLDER } from '../../services/tourService';

interface ExperienceCategoriesProps {
  onSelectCategory: (categoryName: string) => void;
  categories?: Category[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ExperienceCategories: React.FC<ExperienceCategoriesProps> = ({
  onSelectCategory,
  categories: propCategories,
  isLoading: propLoading,
  error: propError,
  onRetry,
}) => {
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(propCategories === undefined);
  const [internalError, setInternalError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setInternalLoading(true);
    setInternalError(null);
    try {
      const data = await getPublishedCategories();
      setInternalCategories(data || []);
    } catch (err: any) {
      console.warn('Failed to load published categories from database:', err);
      setInternalError(err.message || 'Unable to load categories from database.');
      setInternalCategories([]);
    } finally {
      setInternalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propCategories === undefined) {
      fetchCategories();
    }
  }, [propCategories, fetchCategories]);

  useEffect(() => {
    const handleDataUpdated = () => {
      if (onRetry) {
        onRetry();
      } else {
        fetchCategories();
      }
    };
    window.addEventListener('rse_data_updated', handleDataUpdated);
    return () => window.removeEventListener('rse_data_updated', handleDataUpdated);
  }, [onRetry, fetchCategories]);

  const categories = propCategories !== undefined ? propCategories : internalCategories;
  const isLoading = propLoading !== undefined ? propLoading : internalLoading;
  const error = propError !== undefined ? propError : internalError;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      fetchCategories();
    }
  };

  const getIcon = (iconName?: string) => {
    const key = (iconName || '').toLowerCase().trim();
    switch (key) {
      case 'ship':
      case 'boat':
        return <Ship className="w-4 h-4 text-[#E3B34C]" />;
      case 'waves':
      case 'snorkeling':
      case 'diving':
        return <Waves className="w-4 h-4 text-[#E3B34C]" />;
      case 'sun':
      case 'safari':
        return <Sun className="w-4 h-4 text-[#E3B34C]" />;
      case 'anchor':
        return <Anchor className="w-4 h-4 text-[#E3B34C]" />;
      case 'landmark':
      case 'sightseeing':
        return <Landmark className="w-4 h-4 text-[#E3B34C]" />;
      default:
        return <Compass className="w-4 h-4 text-[#E3B34C]" />;
    }
  };

  return (
    <section
      id="categories-section"
      className="py-16 sm:py-24 bg-[#F6F7F9] dark:bg-[#07111C] border-b border-[#DCE2EA] dark:border-[#1E344E] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] mb-2">
            Curated Marine &amp; Desert Adventures
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
            Explore by Experience
          </h2>
          <p className="text-[#2D3F54] dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Calm lagoon crossings, open-reef dolphin encounters, certified PADI dives, and canyon desert expeditions across Egypt.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="experience-loading">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] h-76 p-6 flex flex-col justify-end space-y-3 relative overflow-hidden select-none skeleton-delay-${i % 5}`}
              >
                <div className={`h-6 w-3/4 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i % 5}`} />
                <div className={`h-4 w-full bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i % 5}`} />
                <div className={`h-4 w-1/2 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i % 5}`} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-4 max-w-lg mx-auto"
            data-testid="experience-error"
          >
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
                Unable to Load Experiences
              </h3>
              <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Loading Experiences</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && categories.length === 0 && (
          <div
            className="rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] p-8 text-center space-y-2 max-w-md mx-auto"
            data-testid="experience-empty"
          >
            <Compass className="w-8 h-8 text-[#5C6F84] dark:text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-[#0A192F] dark:text-slate-200">
              No Excursion Categories Available
            </h3>
            <p className="text-xs text-[#5C6F84] dark:text-slate-400">
              Excursion categories are currently being updated in our database. Please check back shortly.
            </p>
          </div>
        )}

        {/* Database-Driven Categories Grid */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="experience-grid">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id || cat.slug || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => onSelectCategory(cat.name)}
                className="group relative rounded-2xl overflow-hidden border border-[#DCE2EA] dark:border-[#1E344E] bg-[#0E1C2E] cursor-pointer h-76 flex flex-col justify-between p-6 hover:border-[#0F4C81]/70 dark:hover:border-sky-400/60 transition-all duration-200"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-600 ease-out group-hover:scale-106"
                  style={{ backgroundImage: `url(${cat.image || NEUTRAL_CATEGORY_PLACEHOLDER})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#07111C]/95 via-[#07111C]/50 to-[#07111C]/30 group-hover:via-[#07111C]/40 transition-colors" />

                {/* Top row: Unboxed icon mark + tabular count */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#E3B34C]">
                    {getIcon(cat.iconName)}
                    <span className="font-mono-num text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
                      0{index + 1}
                    </span>
                  </div>
                  <span className="font-mono-num text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                    {cat.tourCount} {cat.tourCount === 1 ? 'Excursion' : 'Excursions'}
                  </span>
                </div>

                {/* Bottom Title & Summary */}
                <div className="relative z-10 space-y-2">
                  <h3 className="font-display text-xl font-semibold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between gap-2">
                    <span>{cat.name}</span>
                    <ArrowRight className="w-4 h-4 text-[#E3B34C] shrink-0 group-hover:translate-x-1 transition-transform" />
                  </h3>

                  {cat.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
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
