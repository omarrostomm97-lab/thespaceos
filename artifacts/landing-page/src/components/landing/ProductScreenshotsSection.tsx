import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface ProductScreenshotsSectionProps {
  t: (key: TranslationKey) => string;
}

function SessionsMockup({ t }: { t: (key: TranslationKey) => string }) {
  const rows = [
    { id: "#S-042", device: "PS4 Room 1", time: "1h 25m", amount: "75 EGP", active: true },
    { id: "#S-041", device: "PC Station 3", time: "0h 45m", amount: "45 EGP", active: true },
    { id: "#S-040", device: "Pool Table 1", time: "2h 10m", amount: "120 EGP", active: true },
    { id: "#S-039", device: "PS5 Room 2", time: "3h 00m", amount: "150 EGP", active: false },
  ];
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
          {t("ss_sessions")}
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span style={{ color: "#34d399", fontSize: "10px", fontWeight: 500 }}>12 {t("mockup_active")}</span>
        </div>
      </div>
      <div>
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
          >
            <div className="flex-shrink-0" style={{ width: "52px" }}>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: 500 }}>{r.id}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", marginTop: "1px" }}>{r.device}</div>
            </div>
            <div className="flex-1" />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{r.time}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: 500 }}>{r.amount}</div>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: r.active ? "#10b981" : "rgba(255,255,255,0.15)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersMockup({ t }: { t: (key: TranslationKey) => string }) {
  const statuses = [
    { label: "New", count: 3, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { label: "Preparing", count: 5, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Ready", count: 2, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  ];
  const orders = [
    { id: "#O-089", items: "2x Pepsi, 1x Burger", table: "Table 3", status: "Preparing", color: "#f59e0b" },
    { id: "#O-088", items: "1x Coffee, 1x Sandwich", table: "Takeaway", status: "Ready", color: "#10b981" },
    { id: "#O-087", items: "3x Red Bull, 2x Pizza", table: "Session #41", status: "New", color: "#3b82f6" },
  ];
  return (
    <div>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
          {t("ss_orders")}
        </span>
      </div>
      <div className="flex gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: s.bg }}>
            <span style={{ color: s.color, fontSize: "16px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{s.count}</span>
            <span style={{ color: s.color, fontSize: "10px" }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div>
        {orders.map((o, i) => (
          <div
            key={o.id}
            className="flex items-start gap-3 px-4 py-2.5"
            style={{ borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
          >
            <div className="flex-shrink-0">
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: 500 }}>{o.id}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", marginTop: "1px" }}>{o.table}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{o.items}</div>
            </div>
            <div
              className="flex-shrink-0 px-1.5 py-0.5 rounded"
              style={{ background: `${o.color}18`, color: o.color, fontSize: "9px", fontWeight: 500 }}
            >
              {o.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceMockup({ t }: { t: (key: TranslationKey) => string }) {
  const bars = [65, 82, 55, 90, 70, 95, 78];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
          {t("ss_reports")}
        </span>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: "Revenue Today", value: "4,850 EGP", color: "#8b5cf6" },
          { label: "This Week", value: "31,200 EGP", color: "#3b82f6" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", marginBottom: "3px" }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: "15px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3">
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", marginBottom: "8px" }}>Weekly Revenue</div>
        <div className="flex items-end gap-1.5" style={{ height: "52px" }}>
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${(h / 100) * 48}px`,
                  background: i === 5 ? "#3b82f6" : i === 3 ? "#8b5cf6" : "rgba(59,130,246,0.22)",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "8px" }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffMockup({ t }: { t: (key: TranslationKey) => string }) {
  const staff = [
    { name: "Ahmed Nour", role: "Cashier", status: "On Shift", hours: "6h 12m", color: "#10b981" },
    { name: "Sara Kamal", role: "Server", status: "On Shift", hours: "4h 30m", color: "#10b981" },
    { name: "Khaled Ali", role: "Supervisor", status: "On Break", hours: "5h 00m", color: "#f59e0b" },
    { name: "Mona Tarek", role: "Cashier", status: "Off Shift", hours: "—", color: "#475569" },
  ];
  return (
    <div>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
          {t("ss_staff")}
        </span>
      </div>
      <div>
        {staff.map((s, i) => (
          <div
            key={s.name}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: i < staff.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: "rgba(59,130,246,0.22)", fontSize: "11px", fontWeight: 600 }}
            >
              {s.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: 500 }}>{s.name}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>{s.role}</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", flexShrink: 0 }}>{s.hours}</div>
            <div
              className="px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color, fontSize: "9px", fontWeight: 500 }}
            >
              {s.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const screenshots = [
  {
    titleKey: "ss_sessions" as TranslationKey,
    descKey: "ss_sessions_desc" as TranslationKey,
    mockup: (t: (key: TranslationKey) => string) => <SessionsMockup t={t} />,
    accent: "#3b82f6",
  },
  {
    titleKey: "ss_orders" as TranslationKey,
    descKey: "ss_orders_desc" as TranslationKey,
    mockup: (t: (key: TranslationKey) => string) => <OrdersMockup t={t} />,
    accent: "#f59e0b",
  },
  {
    titleKey: "ss_reports" as TranslationKey,
    descKey: "ss_reports_desc" as TranslationKey,
    mockup: (t: (key: TranslationKey) => string) => <FinanceMockup t={t} />,
    accent: "#8b5cf6",
  },
  {
    titleKey: "ss_staff" as TranslationKey,
    descKey: "ss_staff_desc" as TranslationKey,
    mockup: (t: (key: TranslationKey) => string) => <StaffMockup t={t} />,
    accent: "#10b981",
  },
];

export function ProductScreenshotsSection({ t }: ProductScreenshotsSectionProps) {
  return (
    <section id="product" className="py-20 sm:py-28" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="section-eyebrow text-slate-500 mb-3">{t("eyebrow_product")}</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            {t("ss_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            {t("ss_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {screenshots.map(({ titleKey, descKey, mockup, accent }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(15,23,42,0.07)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.05)",
              }}
            >
              {/* Mockup — dark gradient header bleeding edge-to-edge */}
              <div
                style={{
                  background: "linear-gradient(170deg, #141d2e 0%, #0f172a 60%, #111827 100%)",
                  borderBottom: `2px solid ${accent}`,
                }}
              >
                <div className="px-4 pt-4 pb-3">
                  {mockup(t)}
                </div>
              </div>

              {/* Caption — with colored left accent bar */}
              <div
                className="flex items-start gap-3 px-5 py-4"
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: accent }}
                />
                <div>
                  <h3
                    className="text-sm font-semibold text-slate-900 mb-0.5"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {t(titleKey)}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
