import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Compass,
  Users,
  Search,
  ChevronDown,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { Destination, Category } from '../../types';
import { getPublishedDestinations, getPublishedCategories } from '../../services/tourService';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchModuleProps {
  onSearch: (filters: { destination: string; category: string; date: string; guests: number }) => void;
  resultCount?: number;
  destinations?: Destination[];
  categories?: Category[];
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  onSearch,
  destinations: propDestinations,
  categories: propCategories,
}) => {
  const { t } = useLanguage();
  const [internalDestinations, setInternalDestinations] = useState<Destination[]>([]);
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!propDestinations) {
      getPublishedDestinations().then(setInternalDestinations).catch(() => setInternalDestinations([]));
    }
  }, [propDestinations]);

  useEffect(() => {
    if (!propCategories) {
      getPublishedCategories().then(setInternalCategories).catch(() => setInternalCategories([]));
    }
  }, [propCategories]);

  const destinations = propDestinations || internalDestinations;
  const categories = propCategories || internalCategories;
  const [destination, setDestination] = useState<string>('All Destinations');
  const [category, setCategory] = useState<string>('All Activities');
  const [date, setDate] = useState<string>('');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const [destOpen, setDestOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const guestsRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setGuestsOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setDestOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalGuests = adults + children;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      destination,
      category,
      date,
      guests: totalGuests,
    });
    const section = document.getElementById('tours-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="search-section" className="w-full relative z-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#0E1C2E] rounded-2xl border border-[#DCE2EA] dark:border-[#1E344E] p-3 sm:p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-0 lg:divide-x divide-[#DCE2EA] dark:divide-[#1E344E] items-center">
          {/* Destination Selector */}
          <div className="lg:col-span-3 relative lg:pr-3" ref={destRef}>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C6F84] dark:text-slate-400 mb-1 pl-1">
              {t('search.destination')}
            </label>
            <button
              type="button"
              id="search-destination-btn"
              onClick={() => {
                setDestOpen(!destOpen);
                setCatOpen(false);
                setGuestsOpen(false);
              }}
              className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/60 text-[#0A192F] dark:text-white text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
                <span className="truncate font-semibold">
                  {destination === 'All Destinations' ? t('search.allDestinations') : destination}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5C6F84] shrink-0 ml-1 transition-transform duration-200 ${
                  destOpen ? 'rotate-180 text-[#0F4C81] dark:text-sky-400' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {destOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl shadow-xl py-1.5 z-30 max-h-64 overflow-y-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDestination('All Destinations');
                      setDestOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#0A192F] dark:text-white">
                      {t('search.allDestinations')}
                    </span>
                    {destination === 'All Destinations' && (
                      <Check className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                    )}
                  </button>
                  {destinations.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDestination(d.name);
                        setDestOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-medium text-[#0A192F] dark:text-slate-100">{d.name}</span>
                        <span className="block text-[10px] font-mono-num text-[#5C6F84] dark:text-slate-400">
                          {d.tourCount} {d.tourCount === 1 ? 'excursion' : 'excursions'}
                        </span>
                      </div>
                      {destination === d.name && (
                        <Check className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity Selector */}
          <div className="lg:col-span-3 relative lg:px-3" ref={catRef}>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C6F84] dark:text-slate-400 mb-1 pl-1">
              {t('search.activity')}
            </label>
            <button
              type="button"
              id="search-category-btn"
              onClick={() => {
                setCatOpen(!catOpen);
                setDestOpen(false);
                setGuestsOpen(false);
              }}
              className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/60 text-[#0A192F] dark:text-white text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Compass className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
                <span className="truncate font-semibold">
                  {category === 'All Activities' ? t('search.allActivities') : category}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5C6F84] shrink-0 ml-1 transition-transform duration-200 ${
                  catOpen ? 'rotate-180 text-[#0F4C81] dark:text-sky-400' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl shadow-xl py-1.5 z-30 max-h-64 overflow-y-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('All Activities');
                      setCatOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[#0A192F] dark:text-white">
                      {t('search.allActivities')}
                    </span>
                    {category === 'All Activities' && (
                      <Check className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                    )}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.name);
                        setCatOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-medium text-[#0A192F] dark:text-slate-100">{c.name}</span>
                        <span className="block text-[10px] font-mono-num text-[#5C6F84] dark:text-slate-400">
                          {c.tourCount} {c.tourCount === 1 ? 'option' : 'options'}
                        </span>
                      </div>
                      {category === c.name && (
                        <Check className="w-3.5 h-3.5 text-[#0F4C81] dark:text-sky-400" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Selector */}
          <div className="lg:col-span-2 lg:px-3">
            <label
              htmlFor="search-date-input"
              className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C6F84] dark:text-slate-400 mb-1 pl-1"
            >
              {t('search.date')}
            </label>
            <input
              type="date"
              id="search-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-[#DCE2EA] dark:border-[#1E344E] bg-[#F6F7F9] dark:bg-[#07111C] text-[#0A192F] dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C81] transition-colors cursor-pointer"
            />
          </div>

          {/* Guests Popover */}
          <div className="lg:col-span-2 relative lg:px-3" ref={guestsRef}>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C6F84] dark:text-slate-400 mb-1 pl-1">
              {t('search.guests')}
            </label>
            <button
              type="button"
              id="search-guests-btn"
              onClick={() => {
                setGuestsOpen(!guestsOpen);
                setDestOpen(false);
                setCatOpen(false);
              }}
              className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl bg-[#F6F7F9] dark:bg-[#07111C] border border-[#DCE2EA] dark:border-[#1E344E] hover:border-[#0F4C81]/60 dark:hover:border-sky-400/60 text-[#0A192F] dark:text-white text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-[#0F4C81] dark:text-sky-400 shrink-0" />
                <span className="font-semibold font-mono-num">
                  {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5C6F84] shrink-0 transition-transform duration-200 ${
                  guestsOpen ? 'rotate-180 text-[#0F4C81] dark:text-sky-400' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {guestsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0E1C2E] border border-[#DCE2EA] dark:border-[#1E344E] rounded-xl shadow-xl p-4 z-30"
                >
                  <div className="flex items-center justify-between py-2 border-b border-[#DCE2EA] dark:border-[#1E344E]">
                    <div>
                      <span className="text-xs font-semibold text-[#0A192F] dark:text-white block">
                        {t('search.adults')}
                      </span>
                      <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                        {t('search.ageAdult')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white disabled:opacity-30 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#0A192F] dark:text-white font-mono-num">
                        {adults}
                      </span>
                      <button
                        type="button"
                        disabled={adults >= 20}
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-xs font-semibold text-[#0A192F] dark:text-white block">
                        {t('search.children')}
                      </span>
                      <span className="text-[11px] text-[#5C6F84] dark:text-slate-400">
                        {t('search.ageChild')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-7 h-7 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white disabled:opacity-30 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#0A192F] dark:text-white font-mono-num">
                        {children}
                      </span>
                      <button
                        type="button"
                        disabled={children >= 10}
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 rounded-lg border border-[#DCE2EA] dark:border-[#1E344E] flex items-center justify-center text-[#0A192F] dark:text-white hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#DCE2EA] dark:border-[#1E344E] mt-2">
                    <button
                      type="button"
                      onClick={() => setGuestsOpen(false)}
                      className="w-full py-1.5 text-center text-xs font-semibold text-[#0F4C81] dark:text-sky-400 hover:bg-[#F6F7F9] dark:hover:bg-[#14263D] rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Submit Button */}
          <div className="lg:col-span-2 lg:pl-3 flex flex-col justify-end pt-1 lg:pt-0">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.14em] text-transparent mb-1 select-none pointer-events-none" aria-hidden="true">
              &nbsp;
            </span>
            <button
              type="submit"
              id="search-submit-btn"
              className="w-full h-[44px] bg-[#0F4C81] hover:bg-[#0B3A63] dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-[#07111C] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              title={t('search.submit')}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{t('search.submit')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
