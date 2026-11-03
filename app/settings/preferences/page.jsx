"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";

export default function SettingsPreferencesPage() {
  const router = useRouter();
  const { userData, token, login } = useAuth();

  const [gender, setGender] = useState("woman");
  const [genderPreference, setGenderPreference] = useState("women_only");
  const [genderConsentAcknowledged, setGenderConsentAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }

    if (userData) {
      setGender(userData.gender || "woman");
      setGenderPreference(userData.genderPreference || "women_only");
      setGenderConsentAcknowledged(Boolean(userData.genderConsentAcknowledged));
      setLoading(false);
    } else {
      const stored = localStorage.getItem("userData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGender(parsed.gender || "woman");
          setGenderPreference(parsed.genderPreference || "women_only");
          setGenderConsentAcknowledged(Boolean(parsed.genderConsentAcknowledged));
        } catch (e) {
          console.error("Failed to parse stored user data", e);
        }
      }
      setLoading(false);
    }
  }, [userData, token, router]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setAlert(null);

    if (genderPreference === "any" && !genderConsentAcknowledged) {
      setAlert({
        type: "warning",
        message: "Please acknowledge the safety guideline consent checkbox to match with companions of any gender.",
      });
      return;
    }

    setSaving(true);
    try {
      const activeToken = token || localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          gender,
          genderPreference,
          genderConsentAcknowledged,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update matching preferences");
      }

      // Update local storage and context
      const updatedUser = {
        ...(userData || {}),
        gender,
        genderPreference,
        genderConsentAcknowledged,
      };
      if (activeToken) {
        login(activeToken, updatedUser);
      }

      setAlert({
        type: "success",
        message: "Your matching preferences have been saved successfully! Your changes take effect immediately.",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: err.message || "Something went wrong while saving preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col justify-between">
        <NavBar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-moss/20 border-t-moss rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const isCompanion = userData?.role === "companion";

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-moss selection:text-paper">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink/50 uppercase tracking-wider">
          <button onClick={() => router.push("/profile")} className="hover:text-ink transition-colors">
            Account
          </button>
          <span>/</span>
          <span className="text-ink">Settings &amp; Preferences</span>
          <span>/</span>
          <span className="text-moss font-bold">Matching Preferences</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-moss-soft/60 border border-moss/15 text-moss text-xs font-bold uppercase tracking-wider mb-3">
            <span>🛡️</span>
            <span>Safety &amp; Matching Controls</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Your matching preferences
          </h1>
          <p className="mt-2 text-base text-ink/65 font-medium leading-relaxed max-w-2xl">
            Your comfort matters. Choose the matching preference that works for you. You have a completely free hand to change or update this preference whenever you want.
          </p>
        </div>

        {/* Alert notification */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-sm font-medium flex items-start gap-3 transition-all ${
              alert.type === "success"
                ? "bg-moss-soft border-moss/20 text-moss"
                : alert.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <span className="text-lg">
              {alert.type === "success" ? "✓" : alert.type === "warning" ? "⚠️" : "✕"}
            </span>
            <div className="flex-1">{alert.message}</div>
          </div>
        )}

        <div className="space-y-6">
          {/* Main Preference Card */}
          <form onSubmit={handleSave} className="bg-paper rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-7">
            {/* Gender identity selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-ink">
                I identify as
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "woman", label: "Woman" },
                  { id: "man", label: "Man" },
                  { id: "non_binary", label: "Non-binary" },
                  { id: "prefer_not_to_say", label: "Prefer not to say" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGender(g.id);
                      if (g.id === "woman" && !genderPreference) {
                        setGenderPreference("women_only");
                      }
                    }}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all ${
                      gender === g.id
                        ? "bg-ink text-white border-ink shadow-sm"
                        : "bg-mist/60 text-ink/70 border-line hover:border-ink/20 hover:bg-mist"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-line" />

            {/* Matching Preference options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink">
                  {isCompanion
                    ? "Who are you comfortable accepting bookings from?"
                    : "Who would you feel comfortable booking?"}
                </label>
                <p className="text-xs text-ink/55 mt-0.5 font-medium">
                  Select your matching filter. You can switch between these options freely at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Women only */}
                <label
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    genderPreference === "women_only"
                      ? "bg-moss-soft border-moss shadow-sm ring-2 ring-moss/10"
                      : "bg-paper border-line hover:border-ink/20 hover:bg-mist/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-ink block">
                        Women companions only
                      </span>
                      <span className="inline-block text-[11px] font-bold text-moss bg-white/80 px-2 py-0.5 rounded-md border border-moss/15">
                        Selected by default · Highest Safety
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="genderPreference"
                      value="women_only"
                      checked={genderPreference === "women_only"}
                      onChange={() => {
                        setGenderPreference("women_only");
                        setGenderConsentAcknowledged(false);
                      }}
                      className="mt-1 w-4 h-4 text-moss focus:ring-moss cursor-pointer"
                    />
                  </div>
                  <p className="mt-4 text-xs text-ink/65 leading-relaxed font-medium">
                    {isCompanion
                      ? "Receive booking requests exclusively from verified women members."
                      : "Discover and connect exclusively with verified women companions."}
                  </p>
                </label>

                {/* Option 2: Any gender */}
                <label
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    genderPreference === "any"
                      ? "bg-amber-50/60 border-amber-600/40 shadow-sm ring-2 ring-amber-600/10"
                      : "bg-paper border-line hover:border-ink/20 hover:bg-mist/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-ink block">
                        Companions of any gender
                      </span>
                      <span className="inline-block text-[11px] font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                        Optional · Affirmative consent
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="genderPreference"
                      value="any"
                      checked={genderPreference === "any"}
                      onChange={() => setGenderPreference("any")}
                      className="mt-1 w-4 h-4 text-moss focus:ring-moss cursor-pointer"
                    />
                  </div>
                  <p className="mt-4 text-xs text-ink/65 leading-relaxed font-medium">
                    {isCompanion
                      ? "Open your availability to accept booking requests from eligible members of any gender."
                      : "Search and book trusted companions of any gender for shared presence and public meetups."}
                  </p>
                </label>
              </div>

              {/* Affirmative Consent Checkbox for any gender */}
              {genderPreference === "any" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <span>⚠️</span>
                    <span>Affirmative Safety Consent</span>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={genderConsentAcknowledged}
                      onChange={(e) => setGenderConsentAcknowledged(e.target.checked)}
                      className="mt-0.5 rounded text-moss focus:ring-moss"
                    />
                    <span className="text-xs text-amber-950 leading-relaxed font-medium">
                      I understand that selecting companions of any gender may allow me to be matched with eligible companions of different genders. I have reviewed PRSNN&apos;s safety guidelines and voluntarily choose this preference.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Women's Safety First Banner */}
            <div className="p-4 rounded-2xl bg-moss-soft border border-moss/15 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-moss">
                <span className="w-2 h-2 rounded-full bg-moss" />
                <span>Women&apos;s Safety First — Complete User Freedom</span>
              </div>
              <p className="text-xs leading-relaxed text-ink/80 font-medium">
                We put women&apos;s safety on top priority. By default, you will receive bookings from women companions only. You can optionally choose to accept bookings from people of any gender with your clear consent.
              </p>
              <div className="text-xs leading-relaxed text-moss font-semibold bg-white/80 p-2.5 rounded-xl border border-moss/10">
                ✨ <strong>Total Free Hand:</strong> You have complete freedom to change or update this preference whenever you want. Your selection applies immediately to all future matches.
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-line text-xs font-bold text-ink/70 hover:text-ink hover:bg-mist transition-colors"
              >
                ← Back to Profile
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-moss text-paper text-sm font-bold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <span>Save Matching Preferences</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-paper border border-line space-y-1.5">
              <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span>📍</span>
                <span>Public Meetups Only</span>
              </p>
              <p className="text-xs text-ink/60 leading-relaxed font-medium">
                All PRSNN sessions strictly take place in approved public settings (cafés, parks, bookstores, public events).
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-paper border border-line space-y-1.5">
              <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Verified Profiles</span>
              </p>
              <p className="text-xs text-ink/60 leading-relaxed font-medium">
                Companions complete identity verification and agree to the PRSNN Boundaries Agreement before meeting.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
