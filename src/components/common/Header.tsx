import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Search,
  CalendarCheck,
  MessageCircle,
  Globe,
  ChevronDown,
  Heart,
  Scale,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  HelpCircle,
  Sun,
  Moon,
  Compass,
  MapPin,
  Sparkles,
  BookOpen,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { CurrencyConfig } from '../../types';
import { recordVisitorEvent } from '../../services/visitorAnalyticsService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageCode } from '../../types/i18n';

interface HeaderProps {
  currentCurrency?: CurrencyConfig;
  onCurrencyChange?: (currency: CurrencyConfig) => void;
  onOpenMyBooking?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateHome?: () => void;
  onNavigateExcursions?: () => void;
  onNavigateBooking?: (tourSlug?: string) => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateAccount?: () => void;
  onNavigateAdmin?: () => void;
  onOpenWishlist?: () => void;
  onOpenCompare?: () => void;
  onOpenHelpInquiry?: () => void;
  onSearch?: (query: string) => void;
  initialSearchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMyBooking,
  onNavigateSection,
  onNavigateHome,
  onNavigateExcursions,
  onNavigateBooking,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateAccount,
  onNavigateAdmin,
  onOpenWishlist,
  onOpenCompare,
  onOpenHelpInquiry,
  onSearch,
  initialSearchQuery = '',
}) => {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const { wishlistCount } = useWishlist();
  const { comparisonCount } = useComparison();
  const { user, isAdmin, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearchQuery);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setSearchInput(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY <= 25) {
            setIsHeaderVisible(true);
            setIsScrolled(false);
            lastScrollY.current = currentScrollY;
            ticking = false;
            return;
          }

          setIsScrolled(true);

          if (mobileMenuOpen || userDropdownOpen) {
            setIsHeaderVisible(true);
            lastScrollY.current = currentScrollY;
            ticking = false;
            return;
          }

          if (currentScrollY > lastScrollY.current + 8 && currentScrollY > 70) {
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY.current - 6) {
            setIsHeaderVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, userDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExcursionsClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateExcursions) {
      onNavigateExcursions();
    } else {
      handleNavClick('tours-section');
    }
  };

  const handleBookingClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateBooking) {
      onNavigateBooking();
    } else if (onNavigateExcursions) {
      onNavigateExcursions();
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const trimmed = searchInput.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else if (onNavigateExcursions) {
      onNavigateExcursions();
    }
  };

  const handleClearHeaderSearch = () => {
    setSearchInput('');
    if (onSearch && window.location.pathname.startsWith('/excursions')) {
      onSearch('');
    }
  };

  const navLinkClass =
    'relative py-1.5 text-[13px] font-medium text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#0F4C81] dark:after:bg-sky-400 after:transition-all after:duration-200 hover:after:w-full';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out transform ${
        isHeaderVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`w-full border-b transition-colors duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#07111C]/95 backdrop-blur-md border-[#DCE2EA] dark:border-[#1E344E]'
            : 'bg-[#F6F7F9] dark:bg-[#07111C] border-[#DCE2EA] dark:border-[#1E344E]'
        } text-[#0A192F] dark:text-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 sm:gap-3 2xl:gap-5">
          {/* Zone 1: Brand Crest & Wordmark */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group focus:outline-hidden shrink-0"
            id="brand-logo-link"
            aria-label="KemetSpirit Home"
          >
            <img
              src="/logo.png"
              alt="KemetSpirit"
              width="40"
              height="49"
              fetchPriority="high"
              decoding="async"
              className="h-9 sm:h-10 w-auto object-contain dark:bg-[#F6F7F9] dark:p-1 dark:rounded-lg transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="hidden sm:inline-block font-display text-lg font-bold tracking-tight text-[#0A192F] dark:text-white whitespace-nowrap">
              KemetSpirit
            </span>
          </a>

          {/* Header Excursion Search Bar */}
          <form
            role="search"
            id="header-search-form"
            onSubmit={handleHeaderSearchSubmit}
            className="flex-1 min-w-0 max-w-none sm:max-w-[230px] md:max-w-xs xl:flex-none xl:w-44 2xl:w-56"
          >
            <div className="relative w-full">
              <Search
                className="w-3.5 h-3.5 text-[#5C6F84] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="header-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search excursions..."
                aria-label="Search excursions"
                className="w-full h-9 pl-8 pr-8 text-xs font-medium rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] text-[#0A192F] dark:text-white placeholder:text-[#5C6F84] dark:placeholder:text-slate-400 focus:outline-hidden focus:border-[#0F4C81] dark:focus:border-sky-400 transition-colors"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearHeaderSearch}
                  aria-label="Clear excursion search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#5C6F84] hover:text-[#0A192F] dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </form>

          {/* Zone 2: Primary Editorial Navigation */}
          <nav
            className="hidden xl:flex items-center gap-3.5 2xl:gap-6 shrink-0"
            aria-label="Main Navigation"
          >
            <button type="button" onClick={handleExcursionsClick} className={navLinkClass}>
              {t('nav.allExcursions')}
            </button>
            <button type="button" onClick={() => handleNavClick('destinations-section')} className={navLinkClass}>
              {t('nav.destinations')}
            </button>
            <button type="button" onClick={() => handleNavClick('categories-section')} className={navLinkClass}>
              {t('nav.experiences')}
            </button>
            <a href="/blog" aria-label="Visit the KemetSpirit blog" className={navLinkClass}>
              Journal
            </a>
            <a href="/support" aria-label="Open KemetSpirit customer support" className={navLinkClass}>
              Support
            </a>
          </nav>

          {/* Zone 3: Utility & Booking Action Cluster */}
          <div className="hidden xl:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="my-booking-header-btn"
              onClick={onOpenMyBooking}
              className="inline-flex items-center gap-1.5 p-2 2xl:px-2.5 2xl:py-1.5 text-[13px] font-medium text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 rounded-lg hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={t('nav.findMyBooking')}
              aria-label={t('nav.findMyBooking')}
            >
              <CalendarCheck className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
              <span className="hidden 2xl:inline">{t('nav.findMyBooking')}</span>
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2 text-[#2D3F54] dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] shrink-0"
              title="Saved Excursions"
              aria-label={`View ${wishlistCount} saved excursions`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white font-mono-num text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {comparisonCount > 0 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="relative p-2 text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer rounded-lg hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] shrink-0"
                title="Compare Excursions"
                aria-label={`Compare ${comparisonCount} excursions`}
              >
                <Scale className="w-4 h-4 text-[#0F4C81] dark:text-sky-400" />
                <span className="absolute -top-0.5 -right-0.5 bg-[#0F4C81] text-white font-mono-num text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center">
                  {comparisonCount}
                </span>
              </button>
            )}

            <button
              type="button"
              id="theme-toggle-main-nav"
              onClick={toggleTheme}
              className="p-2 text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 transition-colors cursor-pointer rounded-lg hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#E3B34C]" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F4C81]" />
              )}
            </button>

            <div className="h-5 w-px bg-[#DCE2EA] dark:bg-[#1E344E] mx-0.5" aria-hidden="true" />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="user-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] text-xs font-semibold text-[#0A192F] dark:text-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-5 h-5 rounded-md bg-[#0F4C81] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="max-w-[96px] truncate">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-[#5C6F84] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl shadow-lg py-1.5 z-50 text-xs overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 border-b border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#0B1624]">
                        <p className="font-bold text-[#0A192F] dark:text-white truncate">{user.fullName}</p>
                        <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest text-[#B58428] dark:text-[#E3B34C]">
                          {isAdmin ? 'Staff / Admin' : 'Voyager'}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onNavigateAccount) onNavigateAccount();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center gap-2 text-[#2D3F54] dark:text-slate-200 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                          <span>My Account Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onOpenMyBooking) onOpenMyBooking();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center gap-2 text-[#2D3F54] dark:text-slate-200 cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                          <span>My Reservations</span>
                        </button>

                        {isAdmin && onNavigateAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigateAdmin();
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center gap-2 text-[#B58428] dark:text-[#E3B34C] font-semibold cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin CMS Portal</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-[#DCE2EA] dark:border-[#1E344E] pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="header-sign-in-btn"
                  onClick={() => {
                    if (onNavigateLogin) onNavigateLogin();
                  }}
                  className="inline-flex items-center px-2.5 py-2 text-xs font-semibold text-[#2D3F54] dark:text-slate-200 hover:text-[#0F4C81] dark:hover:text-sky-400 hover:bg-[#EEF1F5] dark:hover:bg-[#14263D] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1 text-[#0F4C81] dark:text-sky-400" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  id="header-register-btn"
                  onClick={() => {
                    if (onNavigateRegister) onNavigateRegister();
                  }}
                  className="inline-flex items-center px-2.5 py-2 text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:bg-[#EBF3FA] dark:hover:bg-[#14263D] border border-[#0F4C81]/30 dark:border-sky-400/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Register</span>
                </button>
              </div>
            )}

            <button
              type="button"
              id="book-excursion-header-btn"
              onClick={handleBookingClick}
              className="inline-flex items-center px-3.5 2xl:px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] dark:hover:bg-sky-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('nav.bookExcursion')}
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 xl:hidden shrink-0">
            <button
              type="button"
              onClick={handleBookingClick}
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:text-[#07111C] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('nav.bookExcursion')}
            </button>

            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className={`inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                mobileMenuOpen
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81] dark:bg-sky-500 dark:text-[#07111C] dark:border-sky-500 shadow-xs'
                  : 'bg-white dark:bg-[#0E1C2E] text-[#0A192F] dark:text-slate-100 border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 hover:bg-[#EEF1F5] dark:hover:bg-[#14263D]'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 shrink-0" />
              ) : (
                <Menu className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden sm:inline whitespace-nowrap">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Collapsible Header Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="xl:hidden border-b border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9]/98 dark:bg-[#07111C]/98 backdrop-blur-lg shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <nav
              aria-label="Header Menu Navigation"
              className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
                {/* Column 1: Explore & Directory Cards */}
                <div className="md:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B58428] dark:text-[#E3B34C]">
                      Explore KemetSpirit
                    </span>
                    <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                      Direct Hurghada &amp; Red Sea Fleet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExcursionsClick}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#0F4C81]/25 dark:border-sky-400/25 bg-[#EBF3FA]/60 dark:bg-[#0E1C2E] hover:border-[#0F4C81] dark:hover:border-sky-400 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0F4C81] dark:bg-sky-500 text-white dark:text-[#07111C] flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0A192F] dark:text-white truncate">
                            {t('nav.allExcursions')}
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            Browse full Red Sea fleet
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('destinations-section')}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] text-[#0F4C81] dark:text-sky-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                            {t('nav.destinations')}
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            {t('mobile.destinationsDetailed')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5C6F84] dark:text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('categories-section')}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] text-[#B58428] dark:text-[#E3B34C] flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                            {t('nav.experiences')}
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            {t('mobile.categories')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5C6F84] dark:text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <a
                      href="/blog"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] text-[#0F4C81] dark:text-sky-400 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                            Journal &amp; Field Notes
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            Reef &amp; Egypt travel guides
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5C6F84] dark:text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </a>

                    <a
                      href="/support"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] text-[#0D7A5F] dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                            Customer Support
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            Helpdesk &amp; pickup questions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5C6F84] dark:text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenWishlist) onOpenWishlist();
                      }}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-current' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                            Saved Excursions
                          </p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                            Your shortlisted tours
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded-md bg-[#F6F7F9] dark:bg-[#14263D] text-[#0A192F] dark:text-white shrink-0">
                        {wishlistCount}
                      </span>
                    </button>

                    {comparisonCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenCompare) onOpenCompare();
                        }}
                        className="sm:col-span-2 group flex items-center justify-between gap-3 p-3 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-white dark:bg-[#0E1C2E] hover:border-[#0F4C81]/50 dark:hover:border-sky-400/50 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#EBF3FA] dark:bg-[#14263D] border border-[#0F4C81]/20 dark:border-sky-400/30 text-[#0F4C81] dark:text-sky-400 flex items-center justify-center shrink-0">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0A192F] dark:text-white truncate">
                              Compare Excursions
                            </p>
                            <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">
                              Side-by-side comparison tray
                            </p>
                          </div>
                        </div>
                        <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded-md bg-[#0F4C81] dark:bg-sky-500 text-white dark:text-[#07111C] shrink-0">
                          {comparisonCount}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Column 2: Account, Preferences & Direct Actions */}
                <div className="md:col-span-5 space-y-3">
                  <span className="block px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5C6F84] dark:text-slate-400">
                    Voyager Account &amp; Tools
                  </span>

                  {/* Account Card */}
                  {user ? (
                    <div className="p-3.5 bg-white dark:bg-[#0E1C2E] rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{user.fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#0A192F] dark:text-white truncate">{user.fullName}</p>
                          <p className="text-[11px] text-[#5C6F84] dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#DCE2EA] dark:border-[#1E344E]">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (onNavigateAccount) onNavigateAccount();
                          }}
                          className="flex-1 py-1.5 px-2.5 bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] rounded-lg text-xs font-semibold text-[#0A192F] dark:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                          <span>Profile</span>
                        </button>
                        {isAdmin && onNavigateAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onNavigateAdmin();
                            }}
                            className="py-1.5 px-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/40 rounded-lg text-xs font-semibold text-[#B58428] dark:text-[#E3B34C] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            signOut();
                          }}
                          className="py-1.5 px-2.5 bg-[#F6F7F9] dark:bg-[#14263D] border border-[#DCE2EA] dark:border-[#1E344E] rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onNavigateLogin) onNavigateLogin();
                        }}
                        className="py-2.5 px-3 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 rounded-xl text-xs font-bold text-[#0A192F] dark:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                        <span>Sign In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onNavigateRegister) onNavigateRegister();
                        }}
                        className="py-2.5 px-3 bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-[#07111C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register</span>
                      </button>
                    </div>
                  )}

                  {/* Preferences Box: Language + Theme */}
                  <div className="p-3 bg-white dark:bg-[#0E1C2E] rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-[#5C6F84] dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                        {t('mobile.selectLanguage')}
                      </span>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F6F7F9] dark:bg-[#14263D] text-[#0A192F] dark:text-white border border-[#DCE2EA] dark:border-[#1E344E] cursor-pointer"
                      >
                        {isDark ? <Sun className="w-3.5 h-3.5 text-[#E3B34C]" /> : <Moon className="w-3.5 h-3.5 text-[#0F4C81]" />}
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {supportedLanguages.map((langItem) => {
                        const isSelected = language === langItem.code;
                        return (
                          <button
                            key={langItem.code}
                            type="button"
                            onClick={() => {
                              setLanguage(langItem.code as LanguageCode);
                              void recordVisitorEvent({
                                event_name: 'language_changed',
                                page_path: window.location.pathname,
                                event_data: { language: langItem.code },
                              });
                            }}
                            className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#0F4C81] dark:bg-sky-500 text-white dark:text-[#07111C]'
                                : 'bg-[#F6F7F9] dark:bg-[#14263D] text-[#2D3F54] dark:text-slate-300 border border-[#DCE2EA] dark:border-[#1E344E]'
                            }`}
                          >
                            <span aria-hidden="true">{langItem.flag}</span>
                            <span>{langItem.code.toUpperCase()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Booking & Concierge Action Cluster */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleBookingClick}
                      className="w-full py-2.5 px-4 text-center font-bold text-xs sm:text-sm bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-[#07111C] rounded-xl transition-colors cursor-pointer"
                    >
                      {t('nav.bookExcursion')}
                    </button>

                    <div className={`grid gap-2 ${onOpenHelpInquiry ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenMyBooking) onOpenMyBooking();
                        }}
                        className="py-2 px-3 text-center font-semibold text-xs bg-white dark:bg-[#0E1C2E] text-[#0A192F] dark:text-white rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400 shrink-0" />
                        <span className="truncate">{t('nav.findMyBooking')}</span>
                      </button>

                      {onOpenHelpInquiry && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenHelpInquiry();
                          }}
                          className="py-2 px-3 text-center font-semibold text-xs bg-white dark:bg-[#0E1C2E] text-[#0F4C81] dark:text-sky-400 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Concierge Help</span>
                        </button>
                      )}
                    </div>

                    <a
                      href="https://wa.me/201515212741"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 text-center font-semibold text-xs bg-[#0D7A5F] hover:bg-[#09624B] text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>{t('mobile.contactWhatsApp')}</span>
                    </a>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
