'use client';

import SectionHeader from '../common/SectionHeader';

const cardsData = [
  {
    name: 'Rahul Sharma',
    place: 'Mumbai',
    mode: "Don't Go Alone",
    rating: 5,
    text: "Needed someone for my cousin's wedding so I wouldn't walk in alone. Booked, met at the venue, left after dinner. Felt steady the whole time.",
  },
  {
    name: 'Ananya Singh',
    place: 'Bangalore',
    mode: 'Explore Together',
    rating: 5,
    text: 'Verification gave me peace of mind. Found a walking partner near Cubbon in minutes — no weird energy, just matched pace.',
  },
  {
    name: 'Amit Kumar',
    place: 'Delhi',
    mode: 'Sit With Me',
    rating: 5,
    text: 'Body-doubling for late study sessions changed my week. Quiet company across the table. Zero pressure to perform.',
  },
  {
    name: 'Priya Verma',
    place: 'Hyderabad',
    mode: "Don't Go Alone",
    rating: 5,
    text: "Café hopping alone used to drain me. Now I book when I need a soft plus-one. That's the whole product — and it works.",
  },
  {
    name: 'Karan Gupta',
    place: 'Pune',
    mode: 'Quiet Company',
    rating: 5,
    text: 'The boundaries are written clearly. That honesty is why I keep coming back. Presence without guessing games.',
  },
  {
    name: 'Neha Joshi',
    place: 'Chennai',
    mode: 'Explore Together',
    rating: 5,
    text: 'Walked the marina once with a companion. Felt like the city opened up again — without needing a social performance.',
  },
];

function TestimonialCard({ card }) {
  return (
    <article className="w-[300px] sm:w-[340px] md:w-[380px] shrink-0 rounded-[1.5rem] bg-white/70 backdrop-blur-md border border-line/80 p-6 md:p-8 shadow-[0_20px_50px_-28px_rgba(14,17,13,0.35)] hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-ink text-signal font-display font-bold text-lg md:text-xl flex items-center justify-center shrink-0">
          {card.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-ink text-base truncate">{card.name}</p>
          <p className="text-ink/45 text-sm mt-0.5">{card.place}</p>
        </div>
      </div>
      <p className="text-amber-500 text-sm tracking-tight mb-3" aria-label={`${card.rating} stars`}>
        {'★'.repeat(card.rating)}
      </p>
      <p className="text-ink/70 font-medium leading-relaxed text-[15px] md:text-base min-h-[5.5rem]">
        &ldquo;{card.text}&rdquo;
      </p>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-moss">
        {card.mode}
      </p>
    </article>
  );
}

function MarqueeRow({ items, direction = 'left', className = '' }) {
  const loop = [...items, ...items];
  const animationClass =
    direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse-slow';

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-paper to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-paper to-transparent z-10" />

      <div
        className={`flex w-max gap-5 px-4 hover:[animation-play-state:paused] ${animationClass}`}
      >
        {loop.map((card, i) => (
          <TestimonialCard key={`${direction}-${card.name}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const topRow = cardsData;
  const bottomRow = [...cardsData].reverse();

  return (
    <section id="testimonials" className="py-12 md:py-16 bg-paper overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12 md:mb-16">
        <SectionHeader
          eyebrow="Testimonials"
          title="Trusted by early users."
          subtitle="Real sessions across Indian cities — clear boundaries, soft landings."
        />
      </div>

      <div className="space-y-5 md:space-y-6" aria-label="Scrolling testimonials">
        {/* Top: right → left */}
        <MarqueeRow items={topRow} direction="left" />
        {/* Bottom: left → right */}
        <MarqueeRow items={bottomRow} direction="right" />
      </div>
    </section>
  );
}
