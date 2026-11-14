import React from 'react';
import {
  MapPin,
  Phone,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { NewsletterSubscribe } from './NewsletterSubscribe';
import { useTheme } from '../../contexts/ThemeContext';

interface FooterProps {
  onSelectDestination?: (dest: string) => void;
  onSelectCategory?: (cat: string) => void;
  onOpenMyBooking?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenResetPassword?: () => void;
  onOpenAdmin?: () => void;
  onOpenHelpInquiry?: () => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectDestination,
  onSelectCategory,
  onOpenMyBooking,
  onOpenLogin,
  onOpenRegister,
  onOpenResetPassword,
  onOpenHelpInquiry,
  onOpenCookieSettings,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <footer className="bg-[#0A192F] text-slate-300 dark:bg-[#050C15] dark:text-slate-400 text-xs border-t border-[#162C46] transition-colors duration-300">
      {/* Harbor Operations Hairline Strip */}
      <div className="border-b border-[#162C46] py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#E3B34C] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block text-xs">Hurghada Office</span>
              <span className="text-[11px] text-slate-400">Hurghada New Marina, Berth B-14, Red Sea, Egypt</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#E3B34C] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block text-xs">Phone &amp; Dispatch</span>
              <a href="tel:+201022124589" className="text-[11px] text-slate-400 hover:text-sky-300 transition-colors">
                +20 102 212 4589 · Daily 06:00 – 22:00
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block text-xs">WhatsApp Concierge</span>
              <span className="text-[11px] text-slate-400">Direct replies in English, German &amp; Russian</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#E3B34C] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block text-xs">Licensed Maritime Operator</span>
              <span className="text-[11px] text-slate-400">Egyptian Tourism Chamber License #2491/ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <NewsletterSubscribe source="footer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="KemetSpirit Logo"
                width="68"
                height="84"
                loading="lazy"
                decoding="async"
                className="h-16 w-auto object-contain shrink-0 bg-[#F6F7F9] p-1.5 rounded-xl"
              />
              <div>
                <span className="font-display text-xl font-bold text-white tracking-tight block">
                  KemetSpirit
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#E3B34C]">
                  Red Sea &amp; Nile Expeditions
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Discover boat trips, island escapes, snorkeling, diving and desert adventures across Egypt, operated with direct marina coordination and transparent local dispatch.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Safety inspected vessels and licensed Egyptology &amp; dive guides</span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-bold text-white text-[11px] uppercase tracking-[0.14em] mb-4">
              Destinations
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => onSelectDestination?.('Hurghada')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Hurghada Excursions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectDestination?.('El Gouna')} className="hover:text-white transition-colors cursor-pointer text-left">
                  El Gouna Cruises
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectDestination?.('Makadi Bay & Sahl Hasheesh')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Makadi Bay &amp; Sahl Hasheesh
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectDestination?.('Marsa Alam')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Marsa Alam &amp; Turtle Bay
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectDestination?.('Safaga & Soma Bay')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Safaga &amp; Sharm El Naga
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectDestination?.('Sharm El-Sheikh')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Sharm El-Sheikh &amp; Ras Mohammed
                </button>
              </li>
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h3 className="font-bold text-white text-[11px] uppercase tracking-[0.14em] mb-4">
              Tour Categories
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Boat & Yacht Cruises')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Orange Bay &amp; Giftun Island
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Snorkeling Excursions')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Dolphin House Snorkeling
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Scuba Diving (PADI)')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Certified 2-Tank Boat Dives
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Desert Quad & Buggy Safaris')} className="hover:text-white transition-colors cursor-pointer text-left">
                  ATV Quad &amp; Bedouin Dinner
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Private Charters & Speedboats')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Private Speedboat Charters
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory?.('Historical Day Trips (Luxor & Cairo)')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Luxor &amp; Valley of the Kings
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-bold text-white text-[11px] uppercase tracking-[0.14em] mb-4">
              Guest Services
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={onOpenMyBooking} className="text-sky-300 hover:underline font-semibold cursor-pointer text-left">
                  My Booking &amp; Voucher
                </button>
              </li>
              {onOpenHelpInquiry && (
                <li>
                  <button type="button" onClick={onOpenHelpInquiry} className="text-[#E3B34C] hover:underline flex items-center gap-1.5 cursor-pointer text-left">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Require Help &amp; Concierge</span>
                  </button>
                </li>
              )}
              {onOpenLogin && (
                <li>
                  <button type="button" onClick={onOpenLogin} className="hover:text-white transition-colors cursor-pointer">
                    Customer Sign In
                  </button>
                </li>
              )}
              {onOpenRegister && (
                <li>
                  <button type="button" onClick={onOpenRegister} className="hover:text-white transition-colors cursor-pointer">
                    Register Account
                  </button>
                </li>
              )}
              {onOpenResetPassword && (
                <li>
                  <button type="button" onClick={onOpenResetPassword} className="hover:text-white transition-colors cursor-pointer">
                    Reset Password
                  </button>
                </li>
              )}
              <li><a href="/blog" className="hover:text-white transition-colors">Travel Journal</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About KemetSpirit</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/marine-safety" className="hover:text-white transition-colors">Safety &amp; Departure Info</a></li>
              <li><a href="/booking-conditions" className="hover:text-white transition-colors">Booking Information</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="/cancellation-policy" className="hover:text-white transition-colors">Cancellation &amp; Refunds</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a></li>
              {onOpenCookieSettings && (
                <li>
                  <button type="button" onClick={onOpenCookieSettings} className="hover:text-white transition-colors cursor-pointer">
                    Cookie Settings
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Payment Strip */}
        <div className="mt-12 pt-6 border-t border-[#162C46] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© {new Date().getFullYear()} KemetSpirit. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <button
              type="button"
              id="theme-toggle-footer-btn"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1C2E] hover:bg-[#14263D] text-slate-200 border border-[#1E344E] transition-colors cursor-pointer text-[11px] font-medium"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E3B34C]" />
                  <span>Theme: Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-300" />
                  <span>Theme: Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-[11px] text-slate-400">
            <span>Accepted:</span>
            <span className="font-mono-num text-slate-300">Visa · Mastercard · Apple Pay · Cash on Pickup</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
