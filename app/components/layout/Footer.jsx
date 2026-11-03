'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { userData } = useAuth();

  return (
    <footer className="relative w-full bg-ink text-paper overflow-hidden mt-0">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-signal blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-[24rem] h-[24rem] rounded-full bg-moss-mid blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">
          <div className="md:col-span-5">
            <Link
              href="/"
              className="font-display text-4xl md:text-5xl font-bold tracking-tight lowercase text-paper"
            >
              prsnn<span className="text-signal">.</span>
            </Link>
            <p className="mt-5 text-paper/55 font-medium leading-relaxed max-w-sm text-base">
              Verified companionship for moments that feel lighter with someone nearby.
            </p>
            <div className="flex gap-3 mt-8">
              {[
                { href: 'https://x.com/prsnn_india', label: 'X' },
                { href: 'https://www.linkedin.com/company/112081521', label: 'in' },
                { href: 'https://www.instagram.com/prsnn_india', label: 'IG' },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-semibold text-paper/70 hover:bg-signal hover:text-ink hover:border-signal transition-colors duration-250"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-semibold text-paper/40 uppercase tracking-[0.14em] text-[11px] mb-5">
              Navigate
            </h4>
            <ul className="space-y-3.5 text-[15px]">
              <li>
                <Link href="/companions" className="text-paper/70 hover:text-signal transition-colors">
                  Find Companion
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-paper/70 hover:text-signal transition-colors">
                  Our Story & Founder
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-paper/70 hover:text-signal transition-colors">
                  Safety & Boundaries
                </Link>
              </li>
              <li>
                <Link href="/login?role=companion" className="text-paper/70 hover:text-signal transition-colors">
                  Become Companion
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-paper/70 hover:text-signal transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-paper/70 hover:text-signal transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-paper/70 hover:text-signal transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-semibold text-paper/40 uppercase tracking-[0.14em] text-[11px] mb-5">
              Legal & Safety
            </h4>
            <ul className="space-y-3.5 text-[15px]">
              {[
                ['/safety', 'Safety Standards'],
                ['/agreement', 'Participation & Boundaries'],
                ['/privacy-policy', 'Privacy Policy'],
                ['/terms-of-service', 'Terms of Service'],
                ['/code-of-conduct', 'Code of Conduct'],
                ['/dispute-policy', 'Disputes & Refunds'],
              ].map(([href, label]) => (
                <li key={href + label}>
                  <Link href={href} className="text-paper/70 hover:text-signal transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[11px] font-semibold text-paper/40 uppercase tracking-[0.12em]">
          <p suppressHydrationWarning>© {new Date().getFullYear()} prsnn. All rights reserved.</p>
          <p className="opacity-90 text-paper/70 font-medium">Mumbai · Bengaluru · Delhi · Hyderabad · Chennai</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
