'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { cachedFetch } from '../../utils/cache';

const floatingChips = [
  { label: 'Verified', pos: 'top-4 left-4 md:-left-4' },
  { label: 'Public Meetup', pos: 'top-20 right-2 md:-right-6' },
  { label: 'Safe', pos: 'bottom-28 left-2 md:-left-8' },
  { label: 'Platonic', pos: 'bottom-10 right-4 md:right-0' },
];

const trustItems = [
  'Verified Identity',
  'Public Meetups',
  'Leave Anytime',
  'Safety First',
];

const Hero = () => {
  const router = useRouter();
  const { userData, token } = useAuth();
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const data = await cachedFetch(`${apiUrl}/api/public/stats`);
        if (!cancelled && data) {
          setStats(data);
        }
      } catch (err) {
        // graceful fallback
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#162720] text-paper">
      <div className="absolute inset-0">
        <Image
          src="/herobg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-kenburns opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#162720] via-[#1E3A2F]/80 to-[#162720]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#162720]/95 via-[#1E3A2F]/60 to-[#162720]/30" />
        <div className="noise absolute inset-0" aria-hidden />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center min-h-[100svh]">
        <div className="lg:col-span-6 flex flex-col">
          <div className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 animate-hero-rise">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/95">
              Verified Companions Online
            </span>
          </div>

          <p className="font-display text-2xl md:text-3xl font-extrabold lowercase tracking-tight text-white/90 animate-hero-rise-d1 mb-4">
            prsnn<span className="text-signal">.</span>
          </p>

          <h1 className="font-display text-[clamp(2.75rem,7vw,5.25rem)] font-bold tracking-tight leading-[1.05] text-white max-w-xl animate-hero-rise-d1">
            Never Go Alone Again.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/75 font-medium max-w-lg leading-relaxed animate-hero-rise-d2">
            You&apos;re not alone in feeling this way. Book a verified companion to accompany you to events, cafés, study
            sessions, hospital visits, walks, or simply spend quiet time together.
          </p>
          <p className="mt-3 text-base md:text-lg text-white/55 font-medium animate-hero-rise-d2">
            Presence without pressure. 100% platonic. Public meetups only. Verified companions.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-hero-rise-d3">
            <button
              type="button"
              onClick={() => router.push('/companions')}
              className="btn-signal text-base px-8 py-4 hover:scale-[1.02] active:scale-[0.98]"
            >
              Find a Companion
            </button>
            <button
              type="button"
              onClick={() => router.push(userData ? '/onboarding?role=companion' : token ? '/onboarding?role=companion' : '/login?role=companion')}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-base border border-white/25 text-white hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              Become a Companion
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 animate-hero-rise-d3">
            <span className="text-signal text-sm tracking-tight">★★★★★</span>
            <span className="text-sm font-medium text-white/60">
              Trusted by {stats ? `${stats.users}+ users and ${stats.companions}+ verified companions` : 'early users across India'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 animate-hero-rise-d3">
            {trustItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/8 border border-white/15 text-sm font-medium text-white/85 backdrop-blur-sm"
              >
                <span className="text-signal font-bold">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 relative animate-hero-rise-d2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] aspect-[4/5] md:aspect-[5/6]">
              <Image
                src="/hero-right.webp"
                alt="Companions sharing easy company"
                fill
                sizes="(max-width:1024px) 90vw, 480px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            </div>

            {floatingChips.map((chip) => (
              <div
                key={chip.label}
                className={`absolute ${chip.pos} z-10 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white text-sm font-semibold shadow-lg flex items-center gap-1.5`}
              >
                <span className="text-signal">✔</span>
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
