'use client';

import { useRouter } from 'next/navigation';
import Reveal from '../common/Reveal';
import { useAuth } from '../../context/AuthContext';

export default function FinalCTA() {
  const router = useRouter();
  const { userData, token } = useAuth();

  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] rounded-full bg-moss/50 blur-[100px] animate-blob" />
        <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-signal/20 blur-[110px] animate-blob-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[20rem] h-[20rem] rounded-full bg-moss-mid/40 blur-[90px] animate-blob-slow" />
        <div className="noise absolute inset-0 opacity-30" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 md:px-8 text-center">
        <Reveal variant="scale">
          <p className="font-display text-2xl md:text-3xl font-extrabold lowercase tracking-tight text-white/80 mb-6">
            prsnn<span className="text-signal">.</span>
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-bold tracking-tight leading-[1.08] text-white">
            Everyone needs company sometimes.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">
            Whether it&apos;s a wedding, a café, a study session, or simply a quiet
            walk — you don&apos;t have to do it alone.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => router.push('/companions')}
              className="btn-signal text-base px-8 py-4 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_40px_-8px_rgba(200,240,60,0.55)]"
            >
              Find a Companion
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(userData ? '/onboarding?role=companion' : token ? '/onboarding?role=companion' : '/login?role=companion')
              }
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-base border border-white/25 text-white hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              Become a Companion
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
