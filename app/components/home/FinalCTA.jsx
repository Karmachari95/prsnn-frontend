'use client';

import { useRouter } from 'next/navigation';
import Reveal from '../common/Reveal';
import { useAuth } from '../../context/AuthContext';

export default function FinalCTA() {
  const router = useRouter();
  const { userData, token } = useAuth();

  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-gradient-to-b from-[#182F26] via-[#1E3A2F] to-[#14231C] text-paper">
      {/* Deep olive green radiant ambient glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[28rem] rounded-full bg-[#2A4F40]/70 blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 -left-20 w-[32rem] h-[32rem] rounded-full bg-[#1E3A2F]/90 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] rounded-full bg-[#162C24] blur-[110px]" />
        <div className="noise absolute inset-0 opacity-20" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 md:px-8 text-center z-10">
        <Reveal variant="scale">
          <p className="font-display text-2xl md:text-3xl font-extrabold lowercase tracking-tight text-white/90 mb-6">
            prsnn<span className="text-emerald-400">.</span>
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-bold tracking-tight leading-[1.08] text-white">
            Everyone needs company sometimes.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-2xl mx-auto">
            Whether it&apos;s a wedding, a café, a study session, or simply a quiet
            walk — you don&apos;t have to do it alone.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-signal/30 blur-lg group-hover:bg-signal/50 transition-all opacity-80" />
              <button
                type="button"
                onClick={() => router.push('/companions')}
                className="relative inline-flex items-center justify-center text-base font-bold px-8 py-4 rounded-full bg-signal text-ink hover:bg-signal-deep hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg"
              >
                Find a Companion
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                router.push(userData ? '/onboarding?role=companion' : token ? '/onboarding?role=companion' : '/login?role=companion')
              }
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-base border border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              Become a Companion
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
