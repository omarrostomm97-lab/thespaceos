import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HeroSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

function DashboardMockup({ t }: { t: (key: TranslationKey) => string }) {
  const sidebarItems = [
    { label: "Dashboard", active: true },
    { label: "Sessions", active: false },
    { label: "Orders", active: false },
    { label: "Bookings", active: false },
    { label: "Finance", active: false },
    { label: "Staff", active: false },
    { label: "Settings", active: false },
  ];

  const sessions = [
    { id: "#S-042", device: "PS4 Room 1", customer: "Ahmed M.", time: "1h 25m", amount: "75 EGP" },
    { id: "#S-041", device: "PC Station 3", customer: "Karim H.", time: "0h 45m", amount: "45 EGP" },
    { id: "#S-040", device: "Pool Table 1", customer: "Walk-in", time: "2h 10m", amount: "120 EGP" },
    { id: "#S-039", device: "PS5 Room 2", customer: "Omar S.", time: "3h 00m", amount: "150 EGP" },
  ];

  return (
    <div className="relative w-full">
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 48px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 h-10"
          style={{ background: "#1a2035", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#27c840" }} />
          </div>
          <div
            className="flex-1 mx-2 h-6 rounded-md flex items-center px-2.5 gap-2"
            style={{ background: "rgba(0,0,0,0.28)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "0.01em" }}>
              app.thespaceos.com
            </span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ background: "#0f172a", height: "clamp(280px, 34vw, 460px)" }}>
          {/* Sidebar */}
          <div
            className="hidden sm:flex flex-col flex-shrink-0"
            style={{ width: "160px", background: "#0b1120", borderRight: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-2.5 px-3.5 py-3.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
                  <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                  <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                  <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
                </svg>
              </div>
              <span style={{ color: "rgba(255,255,255,0.92)", fontSize: "12px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}>
                Space OS
              </span>
            </div>
            <div className="flex flex-col gap-0.5 p-2.5 pt-3">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: item.active ? "rgba(59,130,246,0.14)" : "transparent",
                    color: item.active ? "#60a5fa" : "rgba(255,255,255,0.32)",
                    fontSize: "11.5px",
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: item.active ? "#3b82f6" : "rgba(255,255,255,0.12)" }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ color: "rgba(255,255,255,0.92)", fontSize: "13px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}>
                  Dashboard Overview
                </div>
                <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "10px", marginTop: "2px" }}>
                  Mon, Jun 08, 2026
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.18)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                  <span style={{ color: "#34d399", fontSize: "10px", fontWeight: 500 }}>Shift Open</span>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", fontSize: "11px", fontWeight: 700 }}
                >
                  A
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {[
                { label: t("kpi_sessions"), value: "12", color: "#3b82f6", trend: "+3 today" },
                { label: t("kpi_revenue"), value: "4,850", color: "#8b5cf6", suffix: "EGP" },
                { label: t("kpi_orders"), value: "7", color: "#f59e0b", badge: "live" },
                { label: t("kpi_staff"), value: "5", color: "#10b981" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ color: "rgba(255,255,255,0.32)", fontSize: "9px", marginBottom: "5px", lineHeight: 1.3, letterSpacing: "0.02em" }}>
                    {kpi.label}
                  </div>
                  <div style={{ color: kpi.color, fontSize: "20px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {kpi.value}
                  </div>
                  {kpi.suffix && (
                    <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "9px", marginTop: "3px" }}>
                      {kpi.suffix}
                    </div>
                  )}
                  {kpi.trend && (
                    <div style={{ color: "#10b981", fontSize: "9px", marginTop: "3px", fontWeight: 500 }}>
                      ↑ {kpi.trend}
                    </div>
                  )}
                  {kpi.badge && (
                    <div style={{ color: "#f59e0b", fontSize: "9px", marginTop: "3px", fontWeight: 500 }}>
                      live
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sessions table */}
            <div
              className="flex-1 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", minHeight: 0 }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Active Sessions
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span style={{ color: "#34d399", fontSize: "9px", fontWeight: 500 }}>12 active</span>
                  <span style={{ color: "#3b82f6", fontSize: "10px", marginLeft: "8px" }}>View all →</span>
                </div>
              </div>
              {sessions.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2"
                  style={{ borderBottom: i < sessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div className="flex-shrink-0" style={{ minWidth: "52px" }}>
                    <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "10px", fontWeight: 600 }}>{s.id}</div>
                    <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "9px", marginTop: "1px" }}>{s.device}</div>
                  </div>
                  <div className="flex-1 truncate">
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{s.customer}</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.32)", fontSize: "10px", flexShrink: 0 }}>{s.time}</div>
                  <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "10px", fontWeight: 600, flexShrink: 0 }}>{s.amount}</div>
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}
                  >
                    <div className="w-1 h-1 rounded-full" style={{ background: "#10b981" }} />
                    <span style={{ color: "#34d399", fontSize: "8.5px", fontWeight: 500 }}>{t("mockup_active")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ t, dir }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden pt-24 pb-0"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ opacity: 0.38 }} />

      {/* Radial gradient top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(59,130,246,0.13) 0%, transparent 65%)",
        }}
      />

      {/* Blue orb left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "-8%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      {/* Purple orb right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          right: "-6%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Text block */}
        <div className="max-w-3xl mx-auto text-center pt-14 sm:pt-20 pb-14 sm:pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.12em] uppercase"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.22)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            {t("hero_badge")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-bold text-white leading-[1.06] tracking-tight mb-5"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(3rem, 6vw, 5rem)",
            }}
          >
            {t("hero_headline")}
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="max-w-xl mx-auto mb-9 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.2vw, 1.125rem)", color: "rgba(148,163,184,0.9)" }}
          >
            {t("hero_subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{ background: "#3b82f6", boxShadow: "0 4px 24px rgba(59,130,246,0.38)" }}
            >
              {t("hero_cta_primary")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "rtl" ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />
              </svg>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95"
              style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}
            >
              {t("hero_cta_secondary")}
            </a>
          </motion.div>
        </div>

        {/* Dashboard mockup — expanded to max-w-6xl to fill the hero width */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.32 }}
          className="relative max-w-6xl mx-auto"
        >
          <DashboardMockup t={t} />
          {/* Gradient fade from dark navy into white for the next section */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "140px",
              background: "linear-gradient(to bottom, transparent 0%, rgba(15,23,42,0.6) 35%, #ffffff 100%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
