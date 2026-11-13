import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, ArrowUpRight, AlertTriangle, RotateCcw } from 'lucide-react';
import { Destination } from '../../types';
import { getPublishedDestinations, NEUTRAL_DESTINATION_PLACEHOLDER } from '../../services/tourService';

interface DestinationsSectionProps {
  onSelectDestination: (destName: string) => void;
  destinations?: Destination[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  onSelectDestination,
  destinations: propDestinations,
  isLoading: propLoading,
  error: propError,
  onRetry,
}) => {
  const [internalDestinations, setInternalDestinations] = useState<Destination[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(propDestinations === undefined);
  const [internalError, setInternalError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async () => {
    setInternalLoading(true);
    setInternalError(null);
    try {
      const data = await getPublishedDestinations();
      setInternalDestinations(data || []);
    } catch (err: any) {
      console.warn('Failed to load published destinations from database:', err);
      setInternalError(err.message || 'Unable to load destinations from database.');
      setInternalDestinations([]);
    } finally {
      setInternalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propDestinations === undefined) {
      fetchDestinations();
    }
  }, [propDestinations, fetchDestinations]);

  useEffect(() => {
    const handleDataUpdated = () => {
      if (onRetry) {
        onRetry();
      } else {
        fetchDestinations();
      }
    };
    window.addEventListener('rse_data_updated', handleDataUpdated);
    return () => window.removeEventListener('rse_data_updated', handleDataUpdated);
  }, [onRetry, fetchDestinations]);

  const destinations = propDestinations !== undefined ? propDestinations : internalDestinations;
  const isLoading = propLoading !== undefined ? propLoading : internalLoading;
  const error = propError !== undefined ? propError : internalError;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      fetchDestinations();
    }
  };

  return (
    <section
      id="destinations-section"
      className="py-16 sm:py-24 bg-white dark:bg-[#0B1624] border-b border-[#DCE2EA] dark:border-[#1E344E] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C] mb-2">
              Red Sea Coastal Regions
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight">
              Destinations We Serve
            </h2>
            <p className="text-[#2D3F54] dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Scheduled marina departures and door-to-door resort transfers spanning the primary hubs of Egypt’s Red Sea coast.
            </p>
          </div>
          <div className="text-xs text-[#2D3F54] dark:text-slate-300 flex items-center gap-2 border-b border-[#DCE2EA] dark:border-[#1E344E] pb-2 self-start md:self-auto">
            <Navigation className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
            <span className="font-medium">Complimentary resort pickup included</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="destination-loading">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-[#F6F7F9] dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] overflow-hidden flex flex-col justify-between select-none skeleton-delay-${i}`}
              >
                <div>
                  <div className={`aspect-[16/9] bg-[#EEF1F5] dark:bg-[#14263D] animate-shimmer skeleton-delay-${i}`} />
                  <div className="p-5 space-y-3">
                    <div className={`h-5 w-1/2 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i}`} />
                    <div className={`h-3 w-1/3 bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i}`} />
                    <div className={`h-3 w-full bg-[#EEF1F5] dark:bg-[#14263D] rounded animate-shimmer skeleton-delay-${i}`} />
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-[#DCE2EA] dark:border-[#1E344E] h-10" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-4 max-w-lg mx-auto"
            data-testid="destination-error"
          >
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
                Unable to Load Destinations
              </h3>
              <p className="text-xs text-[#5C6F84] dark:text-slate-400 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Loading Destinations</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && destinations.length === 0 && (
          <div
            className="rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#0E1C2E] p-8 text-center space-y-2 max-w-md mx-auto"
            data-testid="destination-empty"
          >
            <MapPin className="w-8 h-8 text-[#5C6F84] dark:text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-[#0A192F] dark:text-slate-200">
              No Destinations Available
            </h3>
            <p className="text-xs text-[#5C6F84] dark:text-slate-400">
              Coastal destination records are currently being updated in our database. Please check back shortly.
            </p>
          </div>
        )}

        {/* Destinations Editorial Grid */}
        {!isLoading && !error && destinations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="destination-grid">
            {destinations.map((dest, idx) => (
              <motion.div
                key={dest.id || dest.slug || idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => onSelectDestination(dest.name)}
                className={`group bg-[#F6F7F9] dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] overflow-hidden cursor-pointer hover:border-[#0F4C81]/60 dark:hover:border-sky-400/50 transition-all duration-200 flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EEF1F5] dark:bg-[#14263D]">
                    <img
                      src={dest.image || NEUTRAL_DESTINATION_PLACEHOLDER}
                      alt={dest.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = NEUTRAL_DESTINATION_PLACEHOLDER;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#07111C]/75 via-[#07111C]/15 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Bottom unboxed image telemetry strip */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-semibold text-white">
                      <span className="font-mono-num uppercase tracking-wider text-[#E3B34C]">
                        {dest.tourCount} {dest.tourCount === 1 ? 'Excursion' : 'Excursions'}
                      </span>
                      {dest.distanceFromAirport && (
                        <span className="text-slate-200 text-[10px]">
                          {dest.distanceFromAirport}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-[#0A192F] dark:text-white group-hover:text-[#0F4C81] dark:group-hover:text-sky-400 transition-colors">
                        {dest.name}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-[#5C6F84] dark:text-slate-400 group-hover:text-[#0F4C81] dark:group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>

                    {dest.tagline && (
                      <p className="text-xs text-[#0F4C81] dark:text-sky-400 font-semibold">
                        {dest.tagline}
                      </p>
                    )}

                    {dest.description && (
                      <p className="text-xs text-[#2D3F54] dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>
                    )}

                    {dest.highlights && dest.highlights.length > 0 && (
                      <p className="pt-1 text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                        {dest.highlights.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#07111C]/60 flex items-center justify-between text-xs font-semibold text-[#0F4C81] dark:text-sky-400">
                  <span>View {dest.name} Schedule</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
