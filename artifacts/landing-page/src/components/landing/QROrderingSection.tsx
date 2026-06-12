import { Check, Zap } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL;
const imgQRSafe      = `${BASE}qr-screenshots/room-qr-marketing-safe.webp`;
const imgGuestOrder  = `${BASE}qr-screenshots/guest-order.png`;
const imgConfirm     = `${BASE}qr-screenshots/guest-confirm.png`;
const imgStaffOrders = `${BASE}qr-screenshots/staff-orders.png`;
const imgStaffDetails= `${BASE}qr-screenshots/staff-details.png`;

/* ─── Zone header (1 · Scan / 2 · Order / 3 · Manage) ──────────────── */

function ZoneHeader({ num, title }: { num: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.18)",
          border: "1.5px solid rgba(37,99,235,0.45)",
          color: "#60A5FA",
          fontSize: 13,
          fontWeight: 800,
          flexShrink: 0,
          direction: "ltr",
        }}
      >
        {num}
      </span>
      <span
        style={{
          color: "white",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

/* ─── Supporting label under each screenshot ────────────────────────── */

function ScreenLabel({
  text,
  align = "center",
}: {
  text: string;
  align?: "center" | "flex-start";
}) {
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        justifyContent: align,
        textAlign: align === "center" ? "center" : "start",
      }}
    >
      <span style={{ color: "#64748B", fontSize: 11.5, fontWeight: 600, lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

/* ─── Phone frame ───────────────────────────────────────────────────── */

function PhoneFrame({
  img,
  alt,
  width = 175,
  cropRatio = "9/18",
}: {
  img: string;
  alt: string;
  width?: number;
  cropRatio?: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: 30,
        background: "#0A0A14",
        border: "2px solid rgba(255,255,255,0.13)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(37,99,235,0.14)",
        overflow: "hidden",
        width,
        direction: "ltr",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 26,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>2:30</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[5, 8, 11].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: "rgba(255,255,255,0.75)" }} />
          ))}
          <svg width="13" height="9" viewBox="0 0 14 10">
            <path
              d="M7 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-2.8-2.5a4 4 0 0 1 5.6 0M1.4 3.4a8 8 0 0 1 11.2 0"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ width: 20, height: 10, border: "1.5px solid rgba(255,255,255,0.55)", borderRadius: 3, position: "relative", marginLeft: 2 }}>
            <div style={{ position: "absolute", inset: 2, background: "rgba(255,255,255,0.75)", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <img
        src={img}
        alt={alt}
        loading="lazy"
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          objectPosition: "top center",
          aspectRatio: cropRatio,
        }}
      />

      {/* Home indicator */}
      <div style={{ height: 20, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 68, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
      </div>
    </div>
  );
}

/* ─── Staff panel (wide dashboard frame) ────────────────────────────── */

function StaffPanel({
  img,
  alt,
  panelLabel,
  width = 195,
  cropHeight = 290,
}: {
  img: string;
  alt: string;
  panelLabel: string;
  width?: number | string;
  cropHeight?: number;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: 14,
        overflow: "hidden",
        background: "#07111F",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow:
          "0 16px 56px rgba(0,0,0,0.65), 0 0 40px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.04)",
        width,
        direction: "ltr",
      }}
    >
      {/* App header */}
      <div
        style={{
          background: "linear-gradient(180deg, #0F1E35 0%, #081220 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 5, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity="0.45" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.45" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" />
          </svg>
        </div>
        <span style={{ color: "#4B6380", fontSize: 10, fontWeight: 600 }}>The Space OS</span>
        <span style={{ color: "#243349", fontSize: 10 }}>›</span>
        <span style={{ color: "#5A7A9A", fontSize: 10, fontWeight: 600 }}>{panelLabel}</span>
      </div>

      {/* Screenshot crop (top portion — the operational content) */}
      <img
        src={img}
        alt={alt}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: cropHeight,
          objectFit: "cover",
          objectPosition: "top center",
        }}
      />
    </div>
  );
}

/* ─── Connector: thin arrow line ────────────────────────────────────── */

function ConnectorArrow({ dir }: { dir: string }) {
  const flip = dir === "rtl";
  return (
    <div className="qr-conn-arrow" aria-hidden>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(37,99,235,0.5), rgba(37,99,235,0.15))" }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: flip ? "scaleX(-1)" : "none" }}>
        <path d="M3 7h8M8 4l3 3-3 3" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─── Connector: badge (Guest → Staff) ─────────────────────────────── */

function BadgeConnector({ label }: { label: string }) {
  return (
    <div className="qr-conn-badge" aria-hidden>
      <div style={{ width: 1, background: "rgba(37,99,235,0.3)", alignSelf: "stretch", minHeight: 16 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(37,99,235,0.1)",
          border: "1px solid rgba(37,99,235,0.28)",
          borderRadius: 8,
          padding: "5px 10px",
          flexShrink: 0,
        }}
      >
        <Zap size={11} color="#2563EB" fill="rgba(37,99,235,0.35)" />
        <span style={{ color: "#93C5FD", fontSize: 10, fontWeight: 700, lineHeight: 1.35, textAlign: "center" }}>
          {label}
        </span>
      </div>
      <div style={{ width: 1, background: "rgba(37,99,235,0.3)", alignSelf: "stretch", minHeight: 16 }} />
    </div>
  );
}

/* ─── Process step ──────────────────────────────────────────────────── */

function StepItem({ num, title, desc, isLast }: { num: number; title: string; desc: string; isLast?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
      {!isLast && (
        <div
          className="qr-step-connector"
          style={{
            position: "absolute",
            top: 15,
            left: "calc(50% + 16px)",
            right: "calc(-50% + 16px)",
            height: 1,
            background: "linear-gradient(90deg, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.08) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.13)",
          border: "1.5px solid rgba(37,99,235,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#3B82F6",
          fontSize: 11,
          fontWeight: 800,
          marginBottom: 9,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          direction: "ltr",
        }}
      >
        {num}
      </div>
      <div style={{ color: "white", fontSize: 12.5, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{title}</div>
      <div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ─── Translation key arrays ────────────────────────────────────────── */

const BENEFIT_KEYS: TranslationKey[] = [
  "qr_b1","qr_b2","qr_b3",
  "qr_b4","qr_b5","qr_b6",
  "qr_b7","qr_b8","qr_b9",
];

const STEPS: { titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { titleKey: "qr_step1_title", descKey: "qr_step1_desc" },
  { titleKey: "qr_step2_title", descKey: "qr_step2_desc" },
  { titleKey: "qr_step3_title", descKey: "qr_step3_desc" },
  { titleKey: "qr_step4_title", descKey: "qr_step4_desc" },
  { titleKey: "qr_step5_title", descKey: "qr_step5_desc" },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export function QROrderingSection() {
  const { t, dir } = useLangCtx();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="qr-ordering"
      style={{
        background: "linear-gradient(180deg, #040C1B 0%, #060E1F 60%, #040C1B 100%)",
        padding: "80px 24px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        position: "relative",
        direction: dir,
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 1100,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.25)",
              borderRadius: 20,
              padding: "5px 14px",
              marginBottom: 20,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", display: "block", boxShadow: "0 0 8px rgba(37,99,235,0.9)" }} />
            <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
              {t("qr_feature_badge")}
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4.2vw, 50px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "white",
              marginBottom: 18,
            }}
          >
            {t("qr_headline_1")}
            <br />
            <span style={{ background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("qr_headline_2")}
            </span>
          </h2>

          <p style={{ color: "#94A3B8", fontSize: 15.5, lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
            {t("qr_sub")}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            THREE-ZONE WORKFLOW
            Zone order reverses automatically in RTL via flex direction.
            ══════════════════════════════════════════════════════════════ */}
        <div className="qr-workflow">

          {/* ── Zone 1 — SCAN ── */}
          <div className="qr-zone qr-zone-1">
            <ZoneHeader num="1" title={t("qr_zone_scan")} />

            {/* Marketing-safe QR card — non-decodable, no real token */}
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                background: "transparent",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.5), 0 24px 72px rgba(0,0,0,0.65), 0 0 48px rgba(120,60,220,0.2)",
                flexShrink: 0,
                width: "100%",
              }}
            >
              <img
                src={imgQRSafe}
                alt={
                  dir === "rtl"
                    ? "نموذج توضيحي غير فعال لكود طلب مخصص للغرفة"
                    : "Non-functional example of a dedicated room QR ordering card"
                }
                loading="lazy"
                draggable={false}
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
            <ScreenLabel text={t("qr_zone1_label")} />
          </div>

          {/* ── Connector 1 → ── */}
          <ConnectorArrow dir={dir} />

          {/* ── Zone 2 — ORDER ── */}
          <div className="qr-zone qr-zone-2">
            <ZoneHeader num="2" title={t("qr_zone_order")} />

            <div className="qr-phones-row">
              {/* Main guest phone — dominant visual */}
              <div className="qr-phone-wrap qr-phone-main">
                <PhoneFrame
                  img={imgGuestOrder}
                  alt={t("qr_zone2_lbl1")}
                  width={310}
                  cropRatio="9/19.5"
                />
                <ScreenLabel text={t("qr_zone2_lbl1")} />
              </div>

              {/* Supporting confirmation phone — smaller, staggered */}
              <div className="qr-phone-wrap qr-phone-sec">
                <PhoneFrame
                  img={imgConfirm}
                  alt={t("qr_zone2_lbl3")}
                  width={170}
                  cropRatio="9/18"
                />
                <ScreenLabel text={t("qr_zone2_lbl3")} />
              </div>
            </div>
          </div>

          {/* ── Connector 2 badge ── */}
          <BadgeConnector label={t("qr_instant_badge")} />

          {/* ── Zone 3 — MANAGE ── */}
          <div className="qr-zone qr-zone-3">
            <ZoneHeader num="3" title={t("qr_zone_manage")} />

            {/* Primary: Staff Orders dashboard */}
            <div className="qr-staff-primary">
              <StaffPanel
                img={imgStaffOrders}
                alt={t("qr_zone3_lbl1")}
                panelLabel="Orders"
                width="100%"
                cropHeight={330}
              />
              <ScreenLabel text={t("qr_zone3_lbl1")} align="flex-start" />
            </div>

            {/* Details drawer — connected panel below, slightly indented */}
            <div className="qr-staff-details">
              <StaffPanel
                img={imgStaffDetails}
                alt={t("qr_zone3_lbl2")}
                panelLabel="Order #189"
                width="100%"
                cropHeight={265}
              />
              <ScreenLabel text={t("qr_zone3_lbl2")} align="flex-start" />
            </div>
          </div>

        </div>{/* end qr-workflow */}

        {/* ── Process steps strip ──────────────────────────────────── */}
        <div
          style={{
            marginTop: 52,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "28px 28px",
          }}
        >
          <div className="qr-steps-grid">
            {STEPS.map(({ titleKey, descKey }, i) => (
              <StepItem
                key={titleKey}
                num={i + 1}
                title={t(titleKey)}
                desc={t(descKey)}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* ── Benefits grid ─────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <div className="qr-benefits-grid">
            {BENEFIT_KEYS.map((key) => (
              <div key={key} className="qr-benefit-card">
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 1,
                    background: "rgba(37,99,235,0.12)",
                    border: "1px solid rgba(37,99,235,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={11} color="#2563EB" strokeWidth={3} />
                </div>
                <span style={{ color: "#CBD5E1", fontSize: 13.5, lineHeight: 1.6 }}>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Business value CTA ───────────────────────────────────── */}
        <div
          style={{
            marginTop: 48,
            background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: 20,
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ color: "white", fontSize: "clamp(17px, 2.4vw, 23px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.25 }}>
              {t("qr_bv_title")}
            </h3>
            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.8, maxWidth: 500 }}>
              {t("qr_bv_text")}
            </p>
          </div>
          <button
            onClick={() => scrollTo("demo")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              padding: "14px 28px",
              fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(37,99,235,0.4)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1D4ED8";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.4)";
            }}
          >
            {t("qr_cta")}
          </button>
        </div>

      </div>{/* end container */}

      {/* ══ CSS ══════════════════════════════════════════════════════════ */}
      <style>{`

        /* ── Three-zone workflow row ─────────────────────────────────── */

        .qr-workflow {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 0;
        }

        /* ── Zones ──────────────────────────────────────────────────── */

        .qr-zone {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        /* Zone 1 — Scan */
        .qr-zone-1 {
          flex: 0 0 210px;
        }

        /* Zone 2 — Order */
        .qr-zone-2 {
          flex: 0 0 510px;
          min-width: 0;
        }

        /* Zone 3 — Manage */
        .qr-zone-3 {
          flex: 1;
          min-width: 0;
        }

        /* ── Guest phones ───────────────────────────────────────────── */

        .qr-phones-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 0;
          direction: ltr;
        }

        .qr-phone-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Main guest phone — dominant */
        .qr-phone-main {
          z-index: 2;
          flex: 0 0 auto;
        }

        /* Confirmation phone — supporting, staggered behind */
        .qr-phone-sec {
          z-index: 3;
          flex: 0 0 auto;
          margin-left: -24px;
          margin-top: 64px;
        }

        /* ── Staff panels (column stack inside zone 3) ───────────────── */

        .qr-staff-primary {
          width: 100%;
          z-index: 2;
          position: relative;
        }

        /* Details drawer — clean card below primary, left-border thread connects them */
        .qr-staff-details {
          margin-top: 10px;
          margin-left: 22px;
          margin-right: 0;
          width: calc(100% - 22px);
          z-index: 3;
          position: relative;
          border-left: 2px solid rgba(37,99,235,0.30);
          padding-left: 16px;
        }

        /* ── Connector: thin arrow ───────────────────────────────────── */

        .qr-conn-arrow {
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          gap: 0;
          padding-top: 196px;
          direction: ltr;
        }

        /* ── Connector: badge ────────────────────────────────────────── */

        .qr-conn-badge {
          flex: 0 0 68px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding-top: 168px;
          direction: ltr;
          text-align: center;
        }

        /* ── Process steps ──────────────────────────────────────────── */

        .qr-steps-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          position: relative;
        }
        .qr-step-connector { display: block; }

        /* ── Benefits ───────────────────────────────────────────────── */

        .qr-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .qr-benefit-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 13px 15px;
          transition: border-color 0.2s, background 0.2s;
        }
        .qr-benefit-card:hover {
          border-color: rgba(37,99,235,0.3) !important;
          background: rgba(37,99,235,0.05) !important;
        }

        /* ════════════════════════════════════════════════════════════
           TABLET (768–1140px) — two rows
           ════════════════════════════════════════════════════════════ */

        @media (max-width: 1140px) {
          .qr-workflow {
            flex-wrap: wrap;
            gap: 32px;
            justify-content: center;
          }

          .qr-conn-arrow,
          .qr-conn-badge { display: none; }

          .qr-zone-1 {
            flex: 0 0 190px;
            order: 1;
          }

          .qr-zone-2 {
            flex: 1 1 460px;
            order: 2;
          }

          .qr-zone-3 {
            flex: 0 0 100%;
            order: 3;
          }

          /* Reset desktop border-thread; panels go full-width on tablet */
          .qr-staff-details {
            margin-top: 14px;
            margin-left: 0;
            width: 100%;
            border-left: none;
            padding-left: 0;
          }

          .qr-steps-grid {
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }
          .qr-step-connector { display: none !important; }
          .qr-benefits-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ════════════════════════════════════════════════════════════
           MOBILE (≤ 640px) — uniform-width vertical stack
           All five mockups: min(290px, 88vw), gap 28px throughout
           ════════════════════════════════════════════════════════════ */

        @media (max-width: 640px) {
          .qr-workflow {
            flex-direction: column;
            align-items: center;
            gap: 28px;
          }

          /* Zone 1 — QR card: same width as phones */
          .qr-zone-1 {
            flex: 0 0 auto;
            order: 1;
            width: min(290px, 88vw);
            align-self: center;
          }

          /* Zone 2 — phones stack vertically, centered */
          .qr-zone-2 {
            flex: 0 0 auto;
            order: 2;
            width: 100%;
          }

          /* Zone 3 — staff panels centered, uniform width */
          .qr-zone-3 {
            flex: 0 0 auto;
            order: 3;
            width: 100%;
            align-items: center;
          }

          /* Phones: vertical stack, uniform 28px gap */
          .qr-phones-row {
            flex-direction: column;
            align-items: center;
            gap: 28px;
          }

          /* Kill desktop overlap/stagger */
          .qr-phone-main,
          .qr-phone-sec {
            margin-left: 0 !important;
            margin-top: 0 !important;
          }

          /* Each phone wrapper = same fixed width */
          .qr-phone-wrap {
            width: min(290px, 88vw);
          }
          /* Force PhoneFrame div inside to fill the wrapper */
          .qr-phone-wrap > div:first-child {
            width: 100% !important;
          }

          /* Staff panels — same width as phones, centred by zone's align-items */
          .qr-staff-primary {
            width: min(290px, 88vw);
          }
          .qr-staff-details {
            width: min(290px, 88vw);
            margin-top: 28px;
            margin-left: 0;
            border-left: none;
            padding-left: 0;
          }

          /* Steps: one column */
          .qr-steps-grid { grid-template-columns: 1fr; }
          .qr-benefits-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
