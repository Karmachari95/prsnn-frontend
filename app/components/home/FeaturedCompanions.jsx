'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cachedFetch from '../../utils/cache';

const cities = ['All', 'Bangalore', 'Hyderabad', 'Mumbai', 'Chennai', 'Vadodara', 'Coimbatore'];

export default function FeaturedCompanions() {
  const [companions, setCompanions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
        const raw = sessionStorage.getItem(`prsnn_cache_${apiUrl}/api/companions-{}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const data = parsed?.data;
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.companions)
            ? data.companions
            : Array.isArray(data?.data)
            ? data.data
            : [];
          if (list.length > 0) return list;
        }
      } catch {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
        const raw = sessionStorage.getItem(`prsnn_cache_${apiUrl}/api/companions-{}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.data?.length > 0 || parsed?.data?.companions?.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });

  const [selectedCity, setSelectedCity] = useState('All');
  const [matchingFilter, setMatchingFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedPref = localStorage.getItem('genderPreference');
        if (storedPref) return storedPref;
        const stored = localStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.genderPreference) return parsed.genderPreference;
        }
      } catch (e) {}
    }
    return 'all';
  });
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
        const data = await cachedFetch(`${apiUrl}/api/companions`);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.companions)
          ? data.companions
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (!cancelled && list.length > 0) {
          setCompanions(list);
        }
      } catch (err) {
        console.error("Error fetching featured companions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSave = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMatchingChange = (filter) => {
    setMatchingFilter(filter);
    if (typeof window !== 'undefined') {
      localStorage.setItem('genderPreference', filter);
    }
  };

  const filtered = companions.filter((c) => {
    // If women_only, strictly show ONLY female companions
    if (matchingFilter === 'women_only') {
      const g = (c.gender || '').toLowerCase().trim();
      if (g !== 'woman' && g !== 'female') {
        return false;
      }
    } else if (matchingFilter === 'men_only') {
      const g = (c.gender || '').toLowerCase().trim();
      if (g !== 'man' && g !== 'male') {
        return false;
      }
    }

    if (selectedCity === 'All') return true;
    return (
      c.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (selectedCity === 'Bengaluru' && c.city?.toLowerCase().includes('bangalore'))
    );
  }).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E3A2F] text-xs font-bold uppercase tracking-wider mb-3">
              <span>●</span> Verified Companions
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-[#181B18] tracking-tight">
              Ready to meet today.
            </h2>
            <p className="mt-2 text-base md:text-lg text-[#181B18]/60 font-medium">
              Platonic, background-checked companions in your city.
            </p>
          </div>

          <Link
            href="/companions"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2F4A34] hover:text-[#1E3A2F] transition-colors self-start md:self-end"
          >
            <span>Explore all companions</span>
            <span>→</span>
          </Link>
        </div>

        {/* Matching Safety Preference Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#181B18] mr-1">Matching View:</span>
            <button
              type="button"
              onClick={() => handleMatchingChange('women_only')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                matchingFilter === 'women_only'
                  ? 'bg-[#1E3A2F] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#181B18]/70 border border-[#EAE6DF] hover:border-[#1E3A2F]/30 hover:text-[#1E3A2F]'
              }`}
            >
              <span>Women Companions Only</span>
              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full ${
                matchingFilter === 'women_only' ? 'bg-white/20 text-white' : 'bg-[#E8EFE9] text-[#1E3A2F]'
              }`}>Default</span>
            </button>
            <button
              type="button"
              onClick={() => handleMatchingChange('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                matchingFilter === 'all'
                  ? 'bg-[#1E3A2F] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#181B18]/70 border border-[#EAE6DF] hover:border-[#181B18]/20'
              }`}
            >
              All Companions
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/settings/preferences"
              className="text-xs font-bold text-[#1E3A2F] hover:underline inline-flex items-center gap-1"
            >
              <span>Settings</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {cities.map((city) => {
            const active = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[#1E3A2F] text-white shadow-sm'
                    : 'bg-white text-[#181B18]/70 border border-[#EAE6DF] hover:border-[#1E3A2F]/30 hover:text-[#181B18]'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {/* Companions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[460px] rounded-3xl bg-white border border-[#EAE6DF] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#EAE6DF]">
            <p className="text-lg font-bold text-[#181B18]">No companions found in {selectedCity}</p>
            <p className="mt-1 text-sm text-[#181B18]/50">Browse all cities or check back soon.</p>
            <button
              type="button"
              onClick={() => setSelectedCity('All')}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#1E3A2F] text-white font-bold text-sm"
            >
              Show all cities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((companion) => {
              const id = companion._id || companion.id;
              const name = companion.fullName || companion.username || 'Companion';
              const photo = companion.profilePhotoUrl || companion.profilePhoto;
              const rating = companion.rating || companion.avgRating || 4.9;
              const price = companion.pricePerHour || 450;
              const isSaved = savedIds.has(id);
              const tags = Array.isArray(companion.tags) ? companion.tags.slice(0, 3) : ['Quiet Company', 'Walking'];

              return (
                <Link
                  key={id}
                  href={`/companions/${id}`}
                  className="group block h-full"
                >
                  <article className="h-full flex flex-col bg-white rounded-3xl border border-[#EAE6DF] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)] transition-all duration-300">
                    {/* Photo Container */}
                    <div className="relative aspect-[4/5] bg-[#F0EDE6] overflow-hidden">
                      {photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photo}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E3A2F] to-[#152A22] text-white text-4xl font-bold font-display">
                          {name[0]?.toUpperCase()}
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1E3A2F] text-[11px] font-bold shadow-sm border border-[#EAE6DF]">
                          ✓ Verified
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSave(id, e)}
                        aria-label="Save companion"
                        className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                          isSaved
                            ? 'bg-[#2F4A34] text-white scale-105'
                            : 'bg-white/90 text-gray-700 hover:bg-white hover:text-black'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* Price Pill */}
                      <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#181B18] shadow-sm border border-[#EAE6DF]">
                        ₹{price} <span className="text-[#181B18]/50 font-normal">/ hr</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-xl text-[#181B18] group-hover:text-[#1E3A2F] transition-colors truncate">
                            {name}
                          </h3>
                          <p className="mt-0.5 text-xs font-medium text-[#181B18]/50 flex items-center gap-1">
                            <span>📍</span> {companion.city || 'Available Citywide'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#181B18] bg-[#FAF8F5] px-2 py-1 rounded-full border border-[#EAE6DF]">
                          <span className="text-amber-500">★</span>
                          <span>{Number(rating).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[11px] font-semibold text-[#181B18]/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-3 text-xs text-[#181B18]/60 line-clamp-2 leading-relaxed">
                        {companion.description || companion.bio || 'Available for quiet company, coffee, city walks, or event visits.'}
                      </p>

                      <div className="mt-auto pt-4">
                        <span className="w-full py-3 rounded-full bg-[#1E3A2F] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 group-hover:bg-[#152A22] transition-colors">
                          <span>View Profile & Book</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Plan something special section matching Screen 6 */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl font-black text-[#181B18] tracking-tight">
                Plan something special
              </h3>
              <p className="text-xs text-[#181B18]/50 mt-0.5">Explore popular activities</p>
            </div>
            <Link
              href="/companions"
              className="text-xs font-bold text-[#2F4A34] hover:underline"
            >
              See all activities →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: 'Cafés & Coffee',
                desc: 'Quiet reading, casual coffee talks or laptop work companion.',
                image: '/mode-sit-with-me.png',
                tag: 'Cafe Hopping',
              },
              {
                title: 'Events & Culture',
                desc: 'Never attend a music event, festival or gallery opening alone.',
                image: '/mode-dont-go-alone.png',
                tag: 'Event Companion',
              },
              {
                title: 'City Walks & Exploring',
                desc: 'Discover parks, street food and quiet neighborhood strolls.',
                image: '/mode-explore-together.png',
                tag: 'Walking',
              },
            ].map((exp) => (
              <Link
                key={exp.title}
                href={`/companions?tag=${encodeURIComponent(exp.tag)}`}
                className="group relative h-56 rounded-3xl overflow-hidden border border-[#EAE6DF] shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="380px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute bottom-5 inset-x-5 text-white">
                  <h4 className="font-display font-bold text-xl leading-tight">
                    {exp.title}
                  </h4>
                  <p className="mt-1 text-xs text-white/75 line-clamp-2 leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/companions"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#1E3A2F] text-white font-bold text-sm shadow-sm hover:bg-[#152A22] hover:scale-105 transition-all"
          >
            Browse all verified companions in your area →
          </Link>
        </div>
      </div>
    </section>
  );
}
