import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Clock, CalendarCheck } from 'lucide-react';
import { EDITORIAL_MEDIA } from '../../assets/editorialMedia';

interface FinalCTAProps {
  onExploreTours: () => void;
  onOpenMyBooking?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onExploreTours, onOpenMyBooking }) => {
  return (
    <section className="py-16 sm:py-24 bg-[#F6F7F9] dark:bg-[#07111C] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-[#0A192F] border border-[#1E344E] grid grid-cols-1 lg:grid-cols-12">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#E3B34C]">
                Direct Marina Reservation
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-semibold tracking-tight leading-[1.1]">
                Ready to Sail the Crystal Waters of the Red Sea?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Reserve your excursion online with complimentary resort pickup and free cancellation up to 24 hours before departure. Choose instant card checkout or cash at hotel pickup.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  id="final-cta-explore-btn"
                  onClick={onExploreTours}
                  className="px-6 py-3.5 bg-[#E3B34C] hover:bg-[#D1A23C] text-[#07111C] text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors group cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Tours &amp; Dates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="https://wa.me/201022124589"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#0D7A5F] hover:bg-[#09624B] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                {onOpenMyBooking && (
                  <button
                    type="button"
                    onClick={onOpenMyBooking}
                    className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CalendarCheck className="w-4 h-4 text-sky-300" />
                    <span>Find My Booking</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-[#1E344E] text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#E3B34C]" />
                  <span>Instant voucher dispatch</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#E3B34C]" />
                  <span>Licensed Egyptian operator #2491/ETB</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Twilight Yacht Visual Frame */}
          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full overflow-hidden">
            <img
              src={EDITORIAL_MEDIA.ctaSunset}
              alt="Red Sea twilight vista from teak yacht deck"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/30 to-transparent lg:block hidden pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent lg:hidden pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
