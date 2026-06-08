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
  ];

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(59,130,246,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2.5 px-4 h-9"
          style={{ background: "#1e2435", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f56" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27c840" }} />
          </div>
          <div
            className="flex-1 mx-2 h-5 rounded flex items-center px-2 gap-1.5"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", letterSpacing: "0.01em" }}>
              app.thespaceos.com
            </span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ background: "#0f172a", height: "clamp(240px, 38vw, 340px)" }}>
          {/* Sidebar — hidden on small screens */}
          <div
            className="hidden sm:flex flex-col flex-shrink-0"
            style={{ width: "148px", background: "#0b1120", borderRight: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "#3b82f6" }}
              >
                <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.5" />
                  <path d="M9 2V1M9 17V16M2 9H1M17 9H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Space OS
              </span>
            </div>

            {/* Nav */}
            <div className="flex flex-col gap-0.5 p-2 pt-3">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                  style={{
                    background: item.active ? "rgba(59,130,246,0.15)" : "transparent",
                    color: item.active ? "#60a5fa" : "rgba(255,255,255,0.35)",
                    fontSize: "11px",
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: item.active ? "#3b82f6" : "rgba(255,255,255,0.15)" }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "12px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Dashboard Overview
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginTop: "1px" }}>
                  Mon, Jun 08, 2026
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                  <span style={{ color: "#34d399", fontSize: "10px", fontWeight: 500 }}>Shift Open</span>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#3b82f6", color: "white", fontSize: "10px", fontWeight: 700 }}
                >
                  A
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { label: t("kpi_sessions"), value: "12", color: "#3b82f6", trend: "+3" },
                { label: t("kpi_revenue"), value: "4,850", color: "#8b5cf6", suffix: " EGP" },
                { label: t("kpi_orders"), value: "7", color: "#f59e0b", trend: "live" },
                { label: t("kpi_staff"), value: "5", color: "#10b981" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg p-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", marginBottom: "4px", lineHeight: 1.2 }}>
                    {kpi.label}
                  </div>
                  <div style={{ color: kpi.color, fontSize: "18px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                  {kpi.suffix && (
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", marginTop: "2px" }}>
                      {kpi.suffix}
                    </div>
                  )}
                  {kpi.trend && (
                    <div style={{ color: "#10b981", fontSize: "9px", marginTop: "2px" }}>↑ {kpi.trend}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Sessions table */}
            <div
              className="flex-1 rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", minHeight: 0 }}
            >
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Active Sessions
                </span>
                <span style={{ color: "#3b82f6", fontSize: "10px", cursor: "pointer" }}>View All →</span>
              </div>
              {sessions.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: i < sessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div className="flex-shrink-0" style={{ minWidth: "50px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", fontWeight: 500 }}>{s.id}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>{s.device}</div>
                  </div>
                  <div className="flex-1 truncate">
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{s.customer}</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", flexShrink: 0 }}>{s.time}</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", fontWeight: 500, flexShrink: 0 }}>{s.amount}</div>
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.12)" }}
                  >
                    <div className="w-1 h-1 rounded-full" style={{ background: "#10b981" }} />
                    <span style={{ color: "#34d399", fontSize: "9px" }}>{t("mockup_active")}</span>
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
      style={{ backgroundColor: "#0f172a", minHeight: "auto" }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ opacity: 0.5 }} />

      {/* Radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 70% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Text block */}
        <div className="max-w-3xl mx-auto text-center pt-12 sm:pt-16 pb-12 sm:pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            {t("hero_badge")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-bold text-white leading-[1.08] tracking-tight mb-5"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            }}
          >
            {t("hero_headline")}
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.125rem)" }}
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white transition-all duration-200 hover:bg-blue-600 active:scale-95"
              style={{ background: "#3b82f6", boxShadow: "0 4px 20px rgba(59,130,246,0.35)" }}
            >
              {t("hero_cta_primary")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "rtl" ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />
              </svg>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.8)" }}
            >
              {t("hero_cta_secondary")}
            </a>
          </motion.div>
        </div>

        {/* Dashboard mockup — sits at the bottom, fades into the next section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="relative pb-0"
        >
          <DashboardMockup t={t} />
          {/* Fade out at the bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #0f172a)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
