"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const marketingLinks = [
  { name: "Find Companions", path: "/companions" },
  { name: "How it Works", path: "/how-it-works" },
  { name: "Safety", path: "/safety" },
  { name: "Our Story", path: "/about" },
  { name: "FAQ", path: "/faq" },
  { name: "Become Companion", path: "/login?role=companion" },
];

const NavBarInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, logout, userData } = useAuth();

  const isSpecialRole =
    userData?.role === "admin" || userData?.role === "superadmin";
  const showLinks = !isSpecialRole;
  const links = showLinks ? marketingLinks : [];

  // Close the drawer whenever the route changes (covers browser back/forward,
  // not just link clicks). Adjusting state during render instead of in an
  // effect avoids the extra render pass the react-hooks lint rule flags.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  // Focused auth pages carry their own frame and close button; the marketing
  // nav's white-on-hero styling would be unreadable over their pale ground.
  const cleanPath = (pathname || "").replace(/\/+$/, "") || "/";
  if (["/login", "/verify-email", "/forgot-password", "/reset-password"].includes(cleanPath)) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-3 md:pt-4 px-3 pointer-events-none">
        {/* Always the dark pill. The old transparent top-of-page state relied on
            sitting over the dark hero; on any pale page its white text vanished. */}
        <header
          className="pointer-events-auto w-full max-w-6xl rounded-full border bg-[#1E3A2F] border-white/20 shadow-[0_12px_40px_-12px_rgba(30,58,47,0.7)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 h-14 md:h-[3.75rem] px-3.5 md:px-5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className={`nav-burger lg:hidden p-2.5 rounded-full text-white hover:bg-white/10 transition-colors ${
                  isMenuOpen ? "is-open" : ""
                }`}
                onClick={() => setIsMenuOpen((v) => !v)}
              >
                <span className="nav-burger-line" />
                <span className="nav-burger-line" />
                <span className="nav-burger-line" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-white lowercase leading-none px-1"
              >
                prsnn<span className="text-[#A3E635]">.</span>
              </button>
            </div>

            <nav className="hidden lg:flex items-center gap-0.5">
              {links.map((link) => {
                const isBecome = link.name === "Become Companion";
                const displayTitle = (isBecome && userData?.role === "companion") ? "Companion Hub" : link.name;
                const targetPath = (isBecome && userData?.role === "companion") ? "/companion/dashboard" : link.path;
                return (
                  <Link
                    key={link.path}
                    href={targetPath}
                    className="px-3.5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 text-white/90 hover:text-white hover:bg-white/15"
                  >
                    {displayTitle}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {!token && (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="hidden sm:inline-flex text-sm font-semibold text-white/85 hover:text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  Login
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/companions")}
                className="bg-signal text-ink px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-sm tracking-wide hover:bg-signal-deep hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shadow-sm"
              >
                Find Companion
              </button>
              {token ? (
                <div className="relative group z-50">
                  <button
                    type="button"
                    className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Account menu"
                  >
                    <span className="hidden md:block text-xs font-semibold text-white tracking-wide pr-1">
                      {userData?.username || "User"}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/25"
                      src={userData?.profilePhotoUrl || "/profile_pic.png"}
                      width={36}
                      height={36}
                      alt=""
                    />
                  </button>

                  <div className="absolute top-full right-0 pt-3 hidden group-hover:block min-w-64">
                    <div className="bg-paper border border-line shadow-neoblack rounded-2xl overflow-hidden py-1.5 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-line bg-mist/60">
                        <p className="text-xs font-semibold text-ink">Signed in as</p>
                        <p className="text-xs text-ink/50 truncate mt-0.5">
                          {userData?.email}
                        </p>
                      </div>
                      {userData?.is_verified || userData?.role === "superadmin" || userData?.role === "companion" || userData?.role === "admin" ? (
                        <>
                          {userData?.role !== "admin" &&
                            userData?.role !== "superadmin" && (
                              <>
                                <p
                                  onClick={() => router.push("/profile")}
                                  className="px-4 py-2.5 text-sm text-ink/70 hover:text-ink hover:bg-mist transition-colors cursor-pointer"
                                >
                                  My Profile
                                </p>
                                <p
                                  onClick={() => router.push("/settings/preferences")}
                                  className="px-4 py-2.5 text-sm font-medium text-moss hover:bg-mist transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>Matching Preferences</span>
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-moss-soft/60">Safety</span>
                                </p>
                                <p
                                  onClick={() => router.push("/my-bookings")}
                                  className="px-4 py-2.5 text-sm text-ink/70 hover:text-ink hover:bg-mist transition-colors cursor-pointer"
                                >
                                  My Bookings
                                </p>
                                <p
                                  onClick={() => router.push("/notifications")}
                                  className="px-4 py-2.5 text-sm text-ink/70 hover:text-ink hover:bg-mist transition-colors cursor-pointer"
                                >
                                  Notifications
                                </p>
                              </>
                            )}
                          {userData?.role === "companion" && (
                            <p
                              onClick={() => router.push("/companion/dashboard")}
                              className="px-4 py-2.5 text-sm font-bold text-[#1E3A2F] bg-[#E8EFE9] hover:bg-[#D5E3D8] transition-colors cursor-pointer flex items-center justify-between mx-2 rounded-xl my-1"
                            >
                              <span>Companion Dashboard</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1E3A2F] text-white">Hub</span>
                            </p>
                          )}
                          {(userData?.role === "admin" || userData?.role === "superadmin") && (
                            <p
                              onClick={() => router.push("/admin")}
                              className="px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist transition-colors cursor-pointer border-t border-line flex items-center justify-between"
                            >
                              <span>Admin Dashboard</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">Staff</span>
                            </p>
                          )}
                          {userData?.role === "superadmin" && (
                            <p
                              onClick={() => router.push("/super-admin")}
                              className="px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist transition-colors cursor-pointer border-t border-line flex items-center justify-between"
                            >
                              <span>Super Admin Dashboard</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Root</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <p
                          onClick={() =>
                            router.push(
                              userData?.role === "admin"
                                ? "/admin/onboarding"
                                : "/onboarding"
                            )
                          }
                          className="px-4 py-3 text-sm font-semibold text-ink hover:bg-signal/30 transition-colors cursor-pointer"
                        >
                          Complete Onboarding →
                        </p>
                      )}
                      <div className="h-px bg-line my-1 mx-3" />
                      <p
                        onClick={() => logout()}
                        className="px-4 py-2.5 text-sm font-semibold text-clay hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Logout
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={`nav-drawer-backdrop absolute inset-0 bg-ink/55 backdrop-blur-sm ${
            isMenuOpen ? "is-open" : ""
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`nav-drawer-panel absolute right-0 top-0 bottom-0 w-[min(88vw,22rem)] bg-paper border-l border-line shadow-[-12px_0_40px_-16px_rgba(14,17,13,0.25)] flex flex-col ${
            isMenuOpen ? "is-open" : ""
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
            <span className="font-display text-2xl font-bold text-ink lowercase">
              prsnn<span className="text-moss">.</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="nav-burger is-open p-2.5 rounded-full text-ink hover:bg-mist transition-colors"
            >
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
              <span className="nav-burger-line" />
            </button>
          </div>

          <ul className="flex flex-col p-3 gap-0.5 overflow-y-auto flex-1">
            {links.length > 0 && (
              <li
                className="nav-drawer-item px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40"
                style={{ animationDelay: "0.05s" }}
              >
                Navigate
              </li>
            )}
            {links.map((link, i) => (
              <li
                key={link.path}
                className="nav-drawer-item"
                style={{ animationDelay: `${0.08 + i * 0.05}s` }}
              >
                <Link
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-ink/80 hover:bg-mist hover:text-ink font-medium transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {token && (
              <>
                <li
                  className="nav-drawer-item h-px bg-line my-2 mx-3"
                  style={{ animationDelay: "0.28s" }}
                />
                <li
                  className="nav-drawer-item px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40"
                  style={{ animationDelay: "0.3s" }}
                >
                  Account
                </li>
                {userData?.is_verified || userData?.role === "superadmin" || userData?.role === "companion" || userData?.role === "admin" ? (
                  <>
                    {userData?.role !== "admin" &&
                      userData?.role !== "superadmin" && (
                        <>
                          <li className="nav-drawer-item" style={{ animationDelay: "0.34s" }}>
                            <Link
                              href="/profile"
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-4 py-3 rounded-xl text-ink/70 hover:bg-mist"
                            >
                              My Profile
                            </Link>
                          </li>
                          {userData?.role === "companion" && (
                            <li className="nav-drawer-item" style={{ animationDelay: "0.35s" }}>
                              <Link
                                href="/companion/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 rounded-xl bg-[#E8EFE9] text-[#1E3A2F] font-bold hover:bg-[#D5E3D8]"
                              >
                                Companion Dashboard ⭐️
                              </Link>
                            </li>
                          )}
                          <li className="nav-drawer-item" style={{ animationDelay: "0.36s" }}>
                            <Link
                              href="/settings/preferences"
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-4 py-3 rounded-xl text-moss font-semibold hover:bg-mist flex items-center justify-between"
                            >
                              <span>Matching Preferences</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-moss-soft/60">Safety</span>
                            </Link>
                          </li>
                          <li className="nav-drawer-item" style={{ animationDelay: "0.38s" }}>
                            <Link
                              href="/my-bookings"
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-4 py-3 rounded-xl text-ink/70 hover:bg-mist"
                            >
                              My Bookings
                            </Link>
                          </li>
                          <li className="nav-drawer-item" style={{ animationDelay: "0.42s" }}>
                            <Link
                              href="/notifications"
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-4 py-3 rounded-xl text-ink/70 hover:bg-mist"
                            >
                              Notifications
                            </Link>
                          </li>
                        </>
                      )}
                    {(userData?.role === "admin" || userData?.role === "superadmin") && (
                      <li className="nav-drawer-item" style={{ animationDelay: "0.34s" }}>
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 rounded-xl text-ink hover:bg-mist font-semibold"
                        >
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                    {userData?.role === "superadmin" && (
                      <li className="nav-drawer-item" style={{ animationDelay: "0.36s" }}>
                        <Link
                          href="/super-admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 rounded-xl text-ink hover:bg-mist font-semibold"
                        >
                          Super Admin Dashboard
                        </Link>
                      </li>
                    )}
                  </>
                ) : (
                  <li className="nav-drawer-item" style={{ animationDelay: "0.34s" }}>
                    <Link
                      href={
                        userData?.role === "admin"
                          ? "/admin/onboarding"
                          : "/onboarding"
                      }
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl font-semibold text-ink hover:bg-signal/25"
                    >
                      Complete Onboarding →
                    </Link>
                  </li>
                )}
                <li className="nav-drawer-item" style={{ animationDelay: "0.46s" }}>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-semibold text-clay hover:bg-red-50"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
            {!token && (
              <>
                <li
                  className="nav-drawer-item h-px bg-line my-2 mx-3"
                  style={{ animationDelay: "0.28s" }}
                />
                <li className="nav-drawer-item" style={{ animationDelay: "0.3s" }}>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-ink/80 hover:bg-mist font-medium"
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
            <li className="nav-drawer-item p-2 mt-auto" style={{ animationDelay: "0.34s" }}>
              <Link
                href="/companions"
                onClick={() => setIsMenuOpen(false)}
                className="btn-signal w-full"
              >
                Find Companion
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

const NavBar = () => (
  <Suspense fallback={null}>
    <NavBarInner />
  </Suspense>
);

export default NavBar;
