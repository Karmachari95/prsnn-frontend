'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Reveal from '../common/Reveal';
import { useAuth } from '../../context/AuthContext';

const benefits = [
  { title: 'Flexible Schedule', desc: 'Pick sessions and hours that fit your week.' },
  { title: 'Keep 85–90% of Earnings', desc: 'Clear hourly rates, direct and reliable payouts.' },
  { title: 'Choose Every Session', desc: 'Review activities and accept only what feels right.' },
  { title: 'Safety-First Community', desc: 'Verified identities, daylight hours, public meetups.' },
];

export default function BecomeCompanion() {
  const router = useRouter();
  const { token, userData } = useAuth();

  return (
    <section id="become" className="py-24 md:py-[7.5rem] bg-mist">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch overflow-hidden rounded-[1.75rem] bg-paper border border-line shadow-neoblack">
          <Reveal className="lg:col-span-6 relative min-h-[300px] lg:min-h-[520px]">
            <Image
              src="/mode-explore-together.webp"
              alt="Become a companion"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/15" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-line flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Average Earnings</p>
                <p className="text-xl font-bold text-moss">₹400 – ₹800 <span className="text-xs text-ink/50 font-medium">/ hour</span></p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-moss-soft text-moss text-xs font-bold">
                ✓ 100% Verified
              </span>
            </div>
          </Reveal>

          <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss mb-3">
                Join the Network
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-ink tracking-tight leading-[1.1]">
                Earn doing what you love
              </h2>
              <p className="mt-4 text-lg text-ink/60 font-medium leading-relaxed max-w-md">
                Become a PRSNN companion. Share your time, meet interesting people, and earn on your schedule. 100% verified & safe.
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <Reveal key={b.title} delay={i % 2 === 0 ? 1 : 2}>
                  <div className="rounded-[1.25rem] bg-mist border border-line p-5 hover:-translate-y-0.5 hover:shadow-neoblack transition-all duration-300">
                    <h3 className="font-display font-bold text-ink text-base">{b.title}</h3>
                    <p className="mt-1.5 text-sm text-ink/55 font-medium">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={2} className="mt-9 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push(userData ? '/onboarding?role=companion' : token ? '/onboarding?role=companion' : '/login?role=companion')
                }
                className="w-full sm:w-auto bg-[#1E3A2F] text-white font-bold text-base px-8 py-4 rounded-full hover:bg-[#152A22] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Apply as Companion</span>
                <span>→</span>
              </button>
              <p className="text-xs text-ink/45 font-medium">
                No upfront fees · Instant onboarding
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
