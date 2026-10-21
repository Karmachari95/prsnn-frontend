'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Reveal from '../common/Reveal';
import { useAuth } from '../../context/AuthContext';

const benefits = [
  { title: 'Flexible Hours', desc: 'Pick sessions that fit your week.' },
  { title: 'Extra Income', desc: 'Earn for time you’d share anyway.' },
  { title: 'Choose Sessions', desc: 'Accept only what feels right.' },
  { title: 'Verified Community', desc: 'Join a trusted, platonic network.' },
];

export default function BecomeCompanion() {
  const router = useRouter();
  const { token, userData } = useAuth();

  return (
    <section id="become" className="py-24 md:py-[7.5rem] bg-mist">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch overflow-hidden rounded-[1.75rem] bg-paper border border-line shadow-neoblack">
          <Reveal className="lg:col-span-6 relative min-h-[280px] lg:min-h-[520px]">
            <Image
              src="/mode-explore-together.png"
              alt="Become a companion"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/10" />
          </Reveal>

          <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss mb-3">
                Companions
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-ink tracking-tight leading-[1.1]">
                Become a Companion
              </h2>
              <p className="mt-4 text-lg text-ink/60 font-medium leading-relaxed max-w-md">
                Share calm presence in public. Flexible hours, clear boundaries,
                verified community.
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

            <Reveal delay={2} className="mt-9">
              <button
                type="button"
                onClick={() =>
                  router.push(userData ? '/onboarding?role=companion' : token ? '/onboarding?role=companion' : '/login?role=companion')
                }
                className="btn-primary text-base px-8 py-4 hover:scale-[1.02] active:scale-[0.98]"
              >
                Become Companion
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
