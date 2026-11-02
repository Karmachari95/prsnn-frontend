'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import cachedFetch from '../utils/cache';
import CommunityIllustration from '../components/illustrations/CommunityIllustration';
import {
  IconAlone,
  IconSit,
  IconAround,
  IconExplore,
} from '../components/illustrations/ModeIcons';

const modesMeta = [
  {
    id: 'dont-go-alone',
    title: "Don't Go Alone",
    short: 'Events & cafés',
    Icon: IconAlone,
    image: '/mode-dont-go-alone.png',
  },
  {
    id: 'sit-with-me',
    title: 'Sit With Me',
    short: 'Quiet focus',
    Icon: IconSit,
    image: '/mode-sit-with-me.png',
  },
  {
    id: 'explore-together',
    title: 'Explore Together',
    short: 'Walks & city',
    Icon: IconExplore,
    image: '/mode-explore-together.png',
  },
  {
    id: 'be-around',
    title: 'Quiet Company',
    short: 'Soft presence',
    Icon: IconAround,
    image: '/mode-be-around.png',
  },
];

/** API category labels companions are tagged with */
const modeApiLabels = {
  'dont-go-alone': ["Don't Go Alone", 'Dont Go Alone'],
  'sit-with-me': ['Sit With Me'],
  'be-around': ['Be Around', 'Quiet Company'],
  'explore-together': ['Explore Together'],
};

const modeTags = {
  'dont-go-alone': ['Plus One', 'Cafe Hopping', 'Event Companion', 'Shopping', 'Waiting Room'],
  'sit-with-me': ['Silence', 'Sitting', 'Body Doubling', 'Study Buddy', 'Work Companion', 'Reading'],
  'be-around': ['Just Presence', 'Quiet', 'Homebody', 'Gaming', 'Movie Watcher'],
  'explore-together': ['Walking', 'Sightseeing', 'Photography', 'Foodie', 'Urban Hiking'],
};

const allInterestTags = [
  ...new Set(Object.values(modeTags).flat()),
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", 
  "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", 
  "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", 
  "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", 
  "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", 
  "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad",
  "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon",
  "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Dehradun"
].sort();

const popularCities = [
  'Bangalore',
  'Hyderabad',
  'Mumbai',
  'Chennai',
  'Vadodara',
  'Coimbatore',
  'Delhi',
  'Pune',
];

const daysOfWeek = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

function normalizeCompanions(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.companions)) return data.companions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

const CompanionsContent = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
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
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const handleMatchingFilterChange = (filter) => {
    setMatchingFilter(filter);
    if (typeof window !== 'undefined') {
      localStorage.setItem('genderPreference', filter);
    }
  };

  useEffect(() => {
    if (userData?.genderPreference) {
      setMatchingFilter(userData.genderPreference);
    }
  }, [userData]);

  const interestChips = mode ? modeTags[mode] || [] : allInterestTags.slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://prssn-backend.onrender.com';
        const data = await cachedFetch(`${apiUrl}/api/companions`);
        const list = normalizeCompanions(data);
        if (!cancelled) {
          setCompanions(list);
        }
      } catch (error) {
        console.error("Error fetching companions:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedTags([]);
    setPage(1);
  }, [mode]);

  useEffect(() => {
    setPage(1);
  }, [selectedTags, selectedCity, selectedArea, selectedDay, searchQuery, matchingFilter]);

  // When city changes, reset selected area
  useEffect(() => {
    setSelectedArea('');
  }, [selectedCity]);

  // Compute available areas for selected city
  const availableAreas = useMemo(() => {
    if (!selectedCity) return [];
    const areas = new Set();
    companions.forEach((c) => {
      if (c.city && c.city.toLowerCase() === selectedCity.toLowerCase() && c.area) {
        c.area.split(/[,/]+/).forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) areas.add(trimmed);
        });
      }
    });
    return Array.from(areas).sort();
  }, [companions, selectedCity]);

  const setMode = (id) => {
    if (id === mode) {
      router.push('/companions');
    } else {
      router.push(`/companions?mode=${id}`);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCity('');
    setSelectedArea('');
    setSelectedDay('');
    setSearchQuery('');
  };

  const activeFilterCount =
    (selectedCity ? 1 : 0) +
    (selectedArea ? 1 : 0) +
    (selectedDay ? 1 : 0) +
    selectedTags.length +
    (searchQuery.trim() ? 1 : 0) +
    (matchingFilter !== 'all' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const filteredCompanions = useMemo(() => {
    const tokens = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return companions.filter((companion) => {
      if (
        userData &&
        (companion._id === userData.id ||
          companion._id === userData._id ||
          companion.id === userData.id ||
          companion.id === userData._id)
      ) {
        return false;
      }

      // Safety & Matching filter: strictly honor user selection
      if (matchingFilter === 'women_only') {
        const g = (companion.gender || '').toLowerCase();
        if (g !== 'woman' && g !== 'female') {
          return false;
        }
      } else if (matchingFilter === 'men_only') {
        const g = (companion.gender || '').toLowerCase();
        if (g !== 'man' && g !== 'male') {
          return false;
        }
      }

      if (mode) {
        const labels = modeApiLabels[mode] || [];
        const tags = Array.isArray(companion.tags) ? companion.tags : [];
        const hasCategory = tags.some((t) =>
          labels.some(
            (label) => String(t).toLowerCase() === label.toLowerCase()
          )
        );
        if (!hasCategory) return false;
      }

      if (selectedCity) {
        if (
          !companion.city ||
          companion.city.toLowerCase() !== selectedCity.toLowerCase()
        ) {
          return false;
        }
      }

      if (selectedArea) {
        const areaStr = (companion.area || '').toLowerCase();
        if (!areaStr.includes(selectedArea.toLowerCase())) {
          return false;
        }
      }

      if (selectedDay) {
        const avail = companion.availability;
        const dayKey = selectedDay.toLowerCase();
        const dayAvail =
          avail &&
          (avail[dayKey] ||
            avail[selectedDay] ||
            companion[`${dayKey}_availability`]);
        if (!dayAvail) return false;
      }

      if (selectedTags.length > 0) {
        const tags = Array.isArray(companion.tags) ? companion.tags : [];
        if (tags.length === 0) return false;
        const hasTag = selectedTags.some((selected) =>
          tags.some(
            (t) => String(t).toLowerCase() === String(selected).toLowerCase()
          )
        );
        if (!hasTag) return false;
      }

      if (tokens.length > 0) {
        const hay = [
          companion.fullName,
          companion.name,
          companion.username,
          companion.email,
          companion.city,
          companion.description,
          companion.bio,
          ...(Array.isArray(companion.tags) ? companion.tags : []),
          ...(Array.isArray(companion.interests) ? companion.interests : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesAll = tokens.every((token) => hay.includes(token));
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [
    companions,
    userData,
    mode,
    selectedCity,
    selectedDay,
    selectedTags,
    searchQuery,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanions.length / itemsPerPage));
  const paginatedCompanions = filteredCompanions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const activeMode = modesMeta.find((m) => m.id === mode);

  return (
    <div className="min-h-screen bg-mist text-ink pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0">
          <Image
            src="/companions-banner.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/75 to-mist" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-10 md:pb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-signal mb-3 animate-hero-rise">
            Marketplace
          </p>
          <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold tracking-tight leading-[1.05] text-white max-w-3xl animate-hero-rise-d1">
            Find someone to share the moment.
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/70 font-medium max-w-xl leading-relaxed animate-hero-rise-d2">
            Browse verified companions first — then refine by experience, city,
            or day. Public meetups only. Leave anytime.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-8 -mt-6 md:-mt-8 relative z-20">
        {/* Horizontal mode selector */}
        <div className="animate-hero-rise-d3">
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
            {modesMeta.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`group snap-start shrink-0 w-[min(72vw,16.5rem)] sm:w-[15.5rem] text-left rounded-3xl overflow-hidden border transition-all duration-300 ${
                    active
                      ? 'border-ink bg-ink text-white shadow-neoblack scale-[1.01]'
                      : 'border-line bg-paper text-ink hover:-translate-y-1 hover:shadow-neoblack hover:border-ink/15'
                  }`}
                >
                  <div className="relative h-24 overflow-hidden">
                    <Image
                      src={m.image}
                      alt=""
                      fill
                      sizes="260px"
                      className={`object-cover transition-transform duration-700 ${
                        active ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                    <div
                      className={`absolute inset-0 ${
                        active
                          ? 'bg-ink/45'
                          : 'bg-ink/25 group-hover:bg-ink/15'
                      } transition-colors`}
                    />
                    <div
                      className={`absolute top-3 left-3 w-10 h-10 rounded-2xl flex items-center justify-center ${
                        active
                          ? 'bg-signal text-ink'
                          : 'bg-paper/95 text-moss'
                      }`}
                    >
                      <m.Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="font-display font-bold text-base tracking-tight leading-snug">
                      {m.title}
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        active ? 'text-white/55' : 'text-ink/45'
                      }`}
                    >
                      {m.short}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {mode && (
            <button
              type="button"
              onClick={() => router.push('/companions')}
              className="mt-3 text-sm font-semibold text-ink/50 hover:text-ink transition-colors"
            >
              Clear experience → show all
            </button>
          )}
        </div>

        {/* Sticky search + collapsible filters */}
        <div className="sticky top-20 z-30 mt-6 md:mt-8">
          <div className="rounded-3xl border border-line bg-paper/90 backdrop-blur-xl shadow-[0_16px_48px_-24px_rgba(14,17,13,0.35)] p-4 md:p-5">
            {/* Search always visible */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none" aria-hidden>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </span>
              <input
                type="text"
                inputMode="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                placeholder="Search by name, city, or interest…"
                className="w-full rounded-2xl bg-mist border border-line pl-12 pr-11 py-3.5 text-base font-medium text-ink placeholder:text-ink/35 focus:outline-none focus:border-moss focus:bg-paper transition-colors"
                aria-label="Search companions"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-ink/40 hover:text-ink hover:bg-mist-deep transition-colors flex items-center justify-center"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Matching Safety Preference Controls */}
            <div className="mt-3.5 pt-3.5 border-t border-line/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-ink mr-1">Matching View:</span>
                <button
                  type="button"
                  onClick={() => handleMatchingFilterChange('women_only')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    matchingFilter === 'women_only'
                      ? 'bg-[#1E3A2F] text-white shadow-sm'
                      : 'bg-paper text-ink/70 border border-line hover:border-[#1E3A2F]/30 hover:text-[#1E3A2F]'
                  }`}
                >
                  <span>Women Only ({companions.filter(c => (c.gender || '').toLowerCase() === 'woman' || (c.gender || '').toLowerCase() === 'female').length})</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full ${
                    matchingFilter === 'women_only' ? 'bg-white/20 text-white' : 'bg-[#E8EFE9] text-[#1E3A2F]'
                  }`}>Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMatchingFilterChange('all')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    matchingFilter === 'all'
                      ? 'bg-[#1E3A2F] text-white shadow-sm'
                      : 'bg-paper text-ink/70 border border-line hover:border-ink/20'
                  }`}
                >
                  All Companions ({companions.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleMatchingFilterChange('men_only')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    matchingFilter === 'men_only'
                      ? 'bg-[#1E3A2F] text-white shadow-sm'
                      : 'bg-paper text-ink/70 border border-line hover:border-ink/20'
                  }`}
                >
                  Men ({companions.filter(c => (c.gender || '').toLowerCase() === 'man' || (c.gender || '').toLowerCase() === 'male').length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/settings/preferences"
                  className="text-xs font-bold text-[#1E3A2F] hover:underline inline-flex items-center gap-1"
                >
                  <span>Change default in Settings</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Collapse toggle */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink transition-colors"
              >
                <span
                  className={`inline-flex w-7 h-7 items-center justify-center rounded-full border border-line bg-mist text-xs transition-transform duration-300 ${
                    filtersOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
                {filtersOpen ? 'Hide filters' : 'Show filters'}
                {!filtersOpen && activeFilterCount > 0 && (
                  <span className="inline-flex min-w-6 h-6 px-1.5 items-center justify-center rounded-full bg-ink text-signal text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-clay hover:text-ink transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Collapsible filter chips */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40 mb-2.5">
                      City {selectedCity ? `& Localities in ${selectedCity}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={!selectedCity}
                        onClick={() => setSelectedCity('')}
                        label="All cities"
                      />
                      {popularCities.map((city) => (
                        <FilterChip
                          key={city}
                          active={selectedCity === city}
                          onClick={() =>
                            setSelectedCity(selectedCity === city ? '' : city)
                          }
                          label={city}
                        />
                      ))}
                      <select
                        value={popularCities.includes(selectedCity) ? '' : selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          selectedCity && !popularCities.includes(selectedCity)
                            ? 'bg-ink text-paper border-ink'
                            : 'bg-paper text-ink/70 border-line hover:border-ink/20'
                        }`}
                        aria-label="Filter by more Indian cities"
                      >
                        <option value="">More Indian cities...</option>
                        {INDIAN_CITIES.filter(c => !popularCities.includes(c)).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {availableAreas.length > 0 && (
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            selectedArea
                              ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                              : 'bg-paper text-ink/70 border-line hover:border-ink/20'
                          }`}
                          aria-label={`Filter by locality in ${selectedCity}`}
                        >
                          <option value="">All localities in {selectedCity}</option>
                          {availableAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40 mb-2.5">
                      Available
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={!selectedDay}
                        onClick={() => setSelectedDay('')}
                        label="Any day"
                      />
                      {daysOfWeek.map((d) => (
                        <FilterChip
                          key={d.id}
                          active={selectedDay === d.id}
                          onClick={() =>
                            setSelectedDay(selectedDay === d.id ? '' : d.id)
                          }
                          label={d.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-line">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40 mb-2.5 mt-3">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {interestChips.map((tag) => (
                        <FilterChip
                          key={tag}
                          active={selectedTags.includes(tag)}
                          onClick={() => handleTagToggle(tag)}
                          label={tag}
                          tone="moss"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety banner */}
        <div className="mt-6 rounded-3xl bg-moss-soft/80 border border-moss/15 px-5 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-ink text-signal flex items-center justify-center text-lg font-bold">
              ✓
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-ink text-base md:text-lg tracking-tight">
                Designed around safety
              </p>
              <p className="text-sm text-ink/60 font-medium leading-snug mt-0.5">
                Verified identity · Public meetups only · Leave anytime
              </p>
            </div>
          </div>
          <Link
            href="/#safety"
            className="sm:ml-auto text-sm font-bold text-moss hover:text-ink transition-colors whitespace-nowrap"
          >
            How safety works →
          </Link>
        </div>

        {/* Results header */}
        <div className="mt-8 mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
              {activeMode ? activeMode.title : 'Companions near you'}
            </h2>
            <p className="mt-1 text-sm md:text-base text-ink/50 font-medium">
              {loading
                ? 'Loading verified companions…'
                : `${filteredCompanions.length} companion${
                    filteredCompanions.length === 1 ? '' : 's'
                  } ready to meet`}
            </p>
          </div>
        </div>

        {/* Active Filter Notice */}
        {matchingFilter === 'women_only' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#E8EFE9] border border-[#1E3A2F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A2F] shrink-0" />
              <p className="text-xs font-bold text-[#1E3A2F]">
                Matching Filter Active: Showing strictly verified Women Companions ({filteredCompanions.length}) only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleMatchingFilterChange('all')}
              className="text-xs font-bold text-[#1E3A2F] hover:underline text-left sm:text-right"
            >
              Show companions of any gender ({companions.length}) →
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[440px] bg-paper rounded-3xl border border-line animate-pulse"
              />
            ))}
          </div>
        ) : filteredCompanions.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters || Boolean(mode)}
            onClear={() => {
              clearFilters();
              if (mode) router.push('/companions');
            }}
            onBrowseModes={() => router.push('/companions')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {paginatedCompanions.map((companion, index) => (
                <CompanionCard
                  key={companion.id || companion._id || index}
                  companion={companion}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border border-line rounded-full disabled:opacity-40 font-semibold hover:bg-ink hover:text-paper transition-colors bg-paper text-ink"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-11 h-11 rounded-full font-semibold border flex items-center justify-center transition-colors ${
                      page === p
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-paper text-ink border-line hover:bg-mist'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 border border-line rounded-full disabled:opacity-40 font-semibold hover:bg-ink hover:text-paper transition-colors bg-paper text-ink"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function FilterChip({ active, onClick, label, tone = 'ink' }) {
  const activeClass =
    tone === 'moss'
      ? 'bg-moss text-signal border-moss'
      : 'bg-ink text-white border-ink';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        active
          ? activeClass
          : 'bg-mist text-ink/70 border-line hover:border-ink/25 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasFilters, onClear, onBrowseModes }) {
  return (
    <div className="rounded-3xl border border-line bg-paper overflow-hidden shadow-neoblack/20">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="p-8 md:p-12 order-2 md:order-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss mb-3">
            No matches yet
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight leading-snug">
            {hasFilters
              ? 'Nobody fits these filters right now.'
              : 'Companions are still joining this experience.'}
          </h3>
          <p className="mt-3 text-base text-ink/55 font-medium leading-relaxed max-w-md">
            Try another city or day, clear filters, or browse all experiences —
            new verified companions come online regularly.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            {hasFilters && (
              <button type="button" onClick={onClear} className="btn-primary">
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={onBrowseModes}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold border border-line text-ink hover:bg-mist transition-colors"
            >
              Browse all experiences
            </button>
          </div>
        </div>
        <div className="bg-mist order-1 md:order-2 flex items-center justify-center p-8 md:p-10 min-h-[220px]">
          <CommunityIllustration className="max-w-[240px] md:max-w-[280px] opacity-90" />
        </div>
      </div>
    </div>
  );
}

function CompanionCard({ companion }) {
  const initialImageUrl =
    companion.profilePhotoUrl || companion.profilePhoto || null;
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = imgFailed ? null : initialImageUrl;

  const displayName = companion.fullName || companion.username || '?';
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isAvailableToday = (() => {
    if (!companion.availability) return false;
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = days[new Date().getDay()];
    return Boolean(companion.availability[today]);
  })();

  const tags = Array.isArray(companion.tags) ? companion.tags : [];
  const interests = tags.filter(
    (t) =>
      ![
        "don't go alone",
        'dont go alone',
        'sit with me',
        'be around',
        'quiet company',
        'explore together',
      ].includes(String(t).toLowerCase())
  );

  const rating =
    companion.rating ??
    companion.averageRating ??
    companion.avgRating ??
    null;
  const sessions =
    companion.completedSessions ??
    companion.sessionsCompleted ??
    companion.totalSessions ??
    companion.sessionCount ??
    null;

  const verified =
    companion.is_verified || companion.verificationStatus === 'verified';

  return (
    <Link
      href={`/companions/${companion._id || companion.id}`}
      className="block group h-full"
    >
      <article className="h-full flex flex-col bg-paper border border-line rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-neoblack transition-[transform,border-color,box-shadow] duration-300">
      <div className="relative aspect-[4/5] overflow-hidden bg-mist-deep">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={displayName}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moss to-ink text-signal">
            <span className="font-display text-5xl font-bold tracking-wider">
              {initials || 'P'}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
          {verified && (
            <span className="bg-paper/95 backdrop-blur-sm text-ink text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-moss">✓</span> Verified
            </span>
          )}
          {isAvailableToday && (
            <span className="bg-signal text-ink text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Available today
            </span>
          )}
        </div>

        {companion.pricePerHour != null && companion.pricePerHour !== '' && (
          <div className="absolute bottom-3 right-3 bg-paper/95 backdrop-blur-sm text-ink px-3 py-1.5 rounded-full font-bold text-sm shadow-sm">
            ₹{companion.pricePerHour}
            <span className="font-semibold text-ink/45 text-xs">/hr</span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl md:text-[1.35rem] font-bold text-ink tracking-tight leading-snug truncate">
              {displayName}
            </h3>
            <p className="mt-1 text-sm font-medium text-ink/45 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 text-moss" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              {companion.city || 'City flexible'}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {rating != null ? (
              <p className="text-sm font-bold text-ink">
                <span className="text-amber-500">★</span>{' '}
                {Number(rating).toFixed(1)}
              </p>
            ) : (
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink/35">
                New
              </p>
            )}
            {sessions != null && (
              <p className="text-[11px] font-medium text-ink/40 mt-0.5">
                {sessions} session{Number(sessions) === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        {interests.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {interests.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-mist text-ink/60 text-[11px] font-semibold rounded-full border border-line"
              >
                {tag}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="px-2 py-1 text-ink/35 text-[11px] font-bold">
                +{interests.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <span className="px-2.5 py-1 bg-mist text-ink/40 text-[11px] font-semibold rounded-full border border-line">
              Open to presence
            </span>
          </div>
        )}

        <p className="mt-3 text-sm text-ink/50 font-medium line-clamp-2 leading-relaxed">
          {companion.description ||
            'Here to share presence — nothing more, nothing less.'}
        </p>

        <div className="mt-auto pt-5">
          <span className="btn-primary w-full text-sm py-3 inline-flex group-hover:scale-[1.01] transition-transform">
            View Profile
          </span>
        </div>
      </div>
      </article>
    </Link>
  );
}

const CompanionsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mist flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
        </div>
      }
    >
      <CompanionsContent />
    </Suspense>
  );
};

export default CompanionsPage;
