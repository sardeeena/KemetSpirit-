import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { subscribeToNewsletter } from '../../services/newsletterService';
import { useToast } from '../../contexts/ToastContext';

interface NewsletterSubscribeProps {
  className?: string;
  source?: string;
}

export const NewsletterSubscribe: React.FC<NewsletterSubscribeProps> = ({
  className = '',
  source = 'footer',
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [websiteUrlHp, setWebsiteUrlHp] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    discountCode: string;
    message: string;
    alreadySubscribed?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm your consent to receive newsletter emails.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await subscribeToNewsletter(email, source, websiteUrlHp, consentAccepted);
      if (res.success) {
        setSuccessData({
          discountCode: res.discountCode,
          message: res.message,
          alreadySubscribed: res.alreadySubscribed,
        });
        showToast(
          res.alreadySubscribed ? 'Voucher code ready: REDSEA15' : res.message,
          res.emailStatus === 'failed' ? 'info' : 'success',
          5000
        );
      } else {
        setErrorMsg(res.message || 'Could not subscribe at this time. Please try again.');
      }
    } catch {
      setErrorMsg('A connection error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!successData?.discountCode) return;
    try {
      await navigator.clipboard.writeText(successData.discountCode);
      setCopied(true);
      showToast(`Copied voucher code ${successData.discountCode} to clipboard!`, 'info');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setEmail('');
    setConsentAccepted(false);
    setSuccessData(null);
    setErrorMsg(null);
    setCopied(false);
  };

  return (
    <div className={`bg-[#0E223B] border border-[#1E3A5A] rounded-2xl p-6 sm:p-8 transition-colors ${className}`}>
      {!successData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E3B34C] block">
              Voyager Dispatch · Member Voucher
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Receive 15% Off Your First Excursion
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Seasonal reef clarity reports, early-bird private charter windows, and direct subscriber pricing sent strictly when relevant.
            </p>

            <div className="flex flex-wrap gap-y-1.5 gap-x-5 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant 15% promo voucher</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Seasonal reef clarity bulletins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Priority boat charter access</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="opacity-0 absolute -left-[9999px] h-0 w-0 overflow-hidden pointer-events-none" aria-hidden="true" tabIndex={-1}>
                <label htmlFor="newsletter_url_hp">Website URL</label>
                <input
                  id="newsletter_url_hp"
                  type="text"
                  name="newsletter_url_hp"
                  value={websiteUrlHp}
                  onChange={(e) => setWebsiteUrlHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="relative">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#07111C] border border-[#294566] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                />
              </div>

              <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => {
                    setConsentAccepted(e.target.checked);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-[#294566] bg-[#07111C] text-sky-400 focus:ring-sky-400"
                />
                <span>
                  I agree to receive occasional travel updates and promotional emails from KemetSpirit. Unsubscribe anytime.
                </span>
              </label>

              {errorMsg && (
                <div className="flex items-start gap-1.5 text-rose-300 text-xs py-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-5 rounded-xl bg-[#E3B34C] hover:bg-[#D1A23C] text-[#07111C] text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#07111C] border-t-transparent rounded-full animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Claim 15% Discount Voucher</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Strictly zero spam. Direct KemetSpirit dispatch only.</span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-[#07111C] border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 max-w-2xl mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              {successData.alreadySubscribed ? 'Welcome Back' : 'Your Voucher Is Ready'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {successData.message}
            </p>
          </div>

          <div className="bg-[#0E1C2E] border border-[#294566] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Promotional Voucher Code
              </span>
              <span className="font-mono-num text-base font-bold text-[#E3B34C] tracking-wider">
                {successData.discountCode}
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">
                15% off eligible excursions at checkout
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="w-full sm:w-auto px-4 py-2 bg-[#E3B34C] hover:bg-[#D1A23C] text-[#07111C] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Subscribe another email address
          </button>
        </div>
      )}
    </div>
  );
};
