"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BoaLogo } from "@/components/ui/BoaLogo";
import { api } from "@/lib/api";
import { resolvePermissions } from "@/lib/permissions";
import { PermissionsContext } from "@/lib/PermissionsContext";
import { saveSignal } from "@/lib/saveSignal";
import type { AdminUser } from "@/types";

const NAV = [
  {
    key: "questions", label: "Questions", href: "/admin/questions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[19px] h-[19px] flex-shrink-0">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    key: "responses", label: "Responses", href: "/admin/responses",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[19px] h-[19px] flex-shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 17h5M8 7h3"/>
      </svg>
    ),
  },
  {
    key: "settings", label: "Settings", href: "/admin/settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[19px] h-[19px] flex-shrink-0">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.14.36.4.66.74.85.34.19.5.24.86.24H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
];

const SIDEBAR_FULL = 256;
const SIDEBAR_MINI = 68;
const MOBILE_BREAKPOINT = 768;

type SaveState = "idle" | "saving" | "saved" | "error";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [user, setUser]             = useState<AdminUser | null>(null);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setMenu]         = useState(false);
  const [saveState, setSaveState]   = useState<SaveState>("idle");
  const [permData, setPermData]     = useState(() => resolvePermissions("admin", null));
  const [isMobile, setIsMobile]     = useState(false);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load user + permissions once on mount
  useEffect(() => {
    let cancelled = false;
    api.me().then(async (u) => {
      if (cancelled) return;
      setUser(u);
      try {
        const s = await api.getSettings();
        if (!cancelled) setPermData(resolvePermissions(u.role, s));
      } catch {
        if (!cancelled) setPermData(resolvePermissions(u.role, null));
      }
    }).catch(() => router.replace("/admin/login"));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once — router is stable

  // Subscribe to save signal (only updates the save indicator, not the page tree)
  useEffect(() => {
    return saveSignal.subscribe(setSaveState);
  }, []);

  // Stable permissions object — only changes when permData actually changes
  const stablePerms = useMemo(() => permData, [permData]);

  const active = NAV.find((n) => pathname.startsWith(n.href))?.key ?? "questions";
  const crumb  = NAV.find((n) => n.key === active)?.label ?? "";
  const sideW  = isMobile ? 0 : (collapsed ? SIDEBAR_MINI : SIDEBAR_FULL);

  const handleLogout = async () => {
    setMenu(false);
    await api.logout();
    router.replace("/admin/login");
  };

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <PermissionsContext.Provider value={stablePerms}>
      <div className="min-h-screen flex bg-[#F2F1EC]">

        {/* ── MOBILE OVERLAY ───────────────────────────────────────── */}
        {isMobile && mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── SIDEBAR ──────────────────────────────────────────────── */}
        <aside
          className={`fixed top-0 left-0 h-screen z-50 bg-[#0D0D0D] flex flex-col overflow-hidden transition-[width,transform] duration-300 ease-in-out ${
            isMobile
              ? `w-[256px] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
              : `${collapsed ? "w-[68px]" : "w-[256px]"} translate-x-0`
          }`}
        >
          {/* Brand */}
          <div className={`border-b border-white/[0.06] transition-all duration-300 ${!isMobile && collapsed ? "px-3 py-5 flex justify-center" : "px-5 py-6"}`}>
            {!isMobile && collapsed
              ? <Image src="/boa-mark.png" alt="BoA" width={36} height={28} style={{ objectFit: "contain", opacity: 0.8 }} />
              : <BoaLogo variant="sidebar" />
            }
          </div>

          <div className="px-5 pt-5 pb-1.5">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/20 font-semibold">Navigation</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1 px-3">
            {NAV.map((item) => {
              const isActive = active === item.key;
              const mini = !isMobile && collapsed;
              return (
                <div key={item.key} className="relative group">
                  <button
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-3 w-full text-left transition-all duration-150 rounded-[12px] ${
                      mini ? "px-[13px] py-3 justify-center" : "px-4 py-3"
                    } ${isActive ? "bg-[#E8A020] text-[#0D0D0D]" : "text-white/40 hover:text-white hover:bg-white/[0.07]"}`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-[#0D0D0D]" : "text-white/40 group-hover:text-white/80"}`}>
                      {item.icon}
                    </span>
                    <span
                      className="font-medium text-[13.5px] whitespace-nowrap overflow-hidden transition-all duration-300"
                      style={{ maxWidth: mini ? 0 : 160, opacity: mini ? 0 : 1 }}
                    >
                      {item.label}
                    </span>
                  </button>
                  {mini && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                      <div className="bg-white text-[#0D0D0D] text-[12.5px] font-semibold px-3 py-1.5 rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 border border-[#E6E5E0]">
                        {item.label}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <div className="px-3 pb-5 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setCollapsed((c) => !c)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[11px] text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? "Expand" : "Collapse"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                  className={`w-[17px] h-[17px] flex-shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
                  <path d="M15 18l-6-6 6-6"/>
                  <path d="M3 6h2M3 12h2M3 18h2"/>
                </svg>
                <span
                  className="font-medium text-[13px] whitespace-nowrap overflow-hidden transition-all duration-300"
                  style={{ maxWidth: collapsed ? 0 : 160, opacity: collapsed ? 0 : 1 }}
                >
                  Collapse
                </span>
              </button>
            </div>
          )}
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────── */}
        <div
          className="flex flex-col min-w-0 flex-1 transition-[margin-left] duration-300 ease-in-out"
          style={{ marginLeft: sideW }}
        >
          {/* Sticky topbar */}
          <header className="h-[56px] md:h-[64px] bg-[#F2F1EC] border-b border-[#E6E5E0] flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 flex-shrink-0">

            {/* Left: hamburger (mobile) + breadcrumb + save indicator */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {/* Hamburger — mobile only */}
              {isMobile && (
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="p-2 rounded-[8px] text-[#555] hover:bg-[#E6E5E0] transition-colors flex-shrink-0 -ml-1"
                  aria-label="Open menu"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
              )}
              <span className="text-[#888] font-mono text-[11px] tracking-wide hidden sm:block">BoA</span>
              <span className="text-[#BBBBB0] hidden sm:block">/</span>
              <span className="text-[#0D0D0D] font-semibold text-[13px] md:text-[13.5px] truncate">{crumb}</span>

              {saveState === "saving" && (
                <div className="flex items-center gap-1.5 text-[#888] ml-1 flex-shrink-0">
                  <span className="w-3 h-3 border-2 border-[#DDD] border-t-[#888] rounded-full animate-spin" />
                  <span className="font-mono text-[10.5px] hidden sm:block">Saving…</span>
                </div>
              )}
              {saveState === "saved" && (
                <div className="flex items-center gap-1.5 bg-[#1A6B3C]/10 border border-[#1A6B3C]/20 rounded-full px-2 py-0.5 ml-1 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-[#1A6B3C]">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <span className="font-mono text-[10.5px] text-[#1A6B3C] font-semibold hidden sm:block">Saved</span>
                </div>
              )}
              {saveState === "error" && (
                <span className="font-mono text-[10.5px] text-red-500 ml-1 hidden sm:block">Save failed</span>
              )}
            </div>

            {/* Right: live badge + user dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-1.5 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse flex-shrink-0" />
                <span className="font-mono text-[10px] text-[#B87C10] font-bold tracking-[0.1em]">LIVE</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-1.5 md:gap-2 bg-white border border-[#E6E5E0] rounded-[10px] px-2.5 md:px-3 py-2 hover:border-[#C8C8BF] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0D0D0D] flex items-center justify-center text-[#E8A020] font-bold text-[11px] flex-shrink-0">
                    {user?.full_name?.charAt(0) ?? "A"}
                  </div>
                  <span className="text-[13px] font-medium text-[#0D0D0D] hidden sm:block whitespace-nowrap">
                    {user?.full_name?.split(" ")[0] ?? "Admin"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-[#888]">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-[#E6E5E0] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-52 overflow-hidden">
                      <div className="px-4 py-3.5 border-b border-[#F2F1EC]">
                        <div className="text-[13px] font-semibold text-[#0D0D0D]">{user?.full_name}</div>
                        <div className="text-[11px] text-[#888] font-mono truncate mt-0.5">{user?.email}</div>
                        <div className="mt-2">
                          <span className="font-mono text-[9px] uppercase tracking-widest bg-[#E8A020]/10 text-[#B87C10] px-2 py-0.5 rounded-full font-bold">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <path d="M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-8 pb-16">
            {children}
          </main>
        </div>
      </div>
    </PermissionsContext.Provider>
  );
}
