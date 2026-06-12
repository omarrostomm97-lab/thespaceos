import { Check } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL;
const imgQRSafe      = `${BASE}qr-screenshots/room-qr-marketing-safe.webp`;
const imgGuestOrder  = `${BASE}qr-screenshots/guest-order.png`;
const imgConfirm     = `${BASE}qr-screenshots/guest-confirm.png`;
const imgStaffOrders = `${BASE}qr-screenshots/staff-orders.png`;
const imgStaffDetails= `${BASE}qr-screenshots/staff-details.png`;

/* ─── Column header: numbered badge + short label ───────────────────── */
/*
 * Each column header has a circle badge (26 px) beside a label.
 * min-height: 48px ensures all 5 headers share the same baseline so the
 * mockup frames always start at the same vertical position on desktop.
 */

function ColHeader({ num, label }: { num: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 16,
        minHeight: 48,
        width: "100%",
        direction: "ltr",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.18)",
          border: "1.5px solid rgba(37,99,235,0.45)",
          color: "#60A5FA",
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {num}
      </span>
      <span
        style={{
          color: "white",
          fontSize: 12.5,
          fontWeight: 700,
          lineHeight: 1.35,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Caption under each mockup ─────────────────────────────────────── */

function ScreenLabel({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 10, textAlign: "center" }}>
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
  cropRatio = "9/18",
}: {
  img: string;
  alt: string;
  cropRatio?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 24,
        background: "#0A0A14",
        border: "2px solid rgba(255,255,255,0.13)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 20px 56px rgba(0,0,0,0.7), 0 0 40px rgba(37,99,235,0.14)",
        overflow: "hidden",
        direction: "ltr",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 22,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 11px",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>2:30</span>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[4, 6, 9].map((h, i) => (
            <div
              key={i}
              style={{ width: 2.5, height: h, borderRadius: 2, background: "rgba(255,255,255,0.75)" }}
            />
          ))}
          <svg width="11" height="8" viewBox="0 0 14 10">
            <path
              d="M7 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-2.8-2.5a4 4 0 0 1 5.6 0M1.4 3.4a8 8 0 0 1 11.2 0"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              width: 16,
              height: 8,
              border: "1.5px solid rgba(255,255,255,0.55)",
              borderRadius: 2,
              position: "relative",
              marginLeft: 2,
            }}
          >
            <div
              style={{ position: "absolute", inset: 2, background: "rgba(255,255,255,0.75)", borderRadius: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Screenshot crop */}
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
      <div
        style={{
          height: 16,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ width: 52, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.28)" }}
        />
      </div>
    </div>
  );
}

/* ─── Staff panel (dashboard frame) ────────────────────────────────── */

function StaffPanel({
  img,
  alt,
  panelLabel,
  cropHeight = 280,
}: {
  img: string;
  alt: string;
  panelLabel: string;
  cropHeight?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 11,
        overflow: "hidden",
        background: "#07111F",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow:
          "0 14px 48px rgba(0,0,0,0.65), 0 0 36px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.04)",
        direction: "ltr",
      }}
    >
      {/* App header bar */}
      <div
        style={{
          background: "linear-gradient(180deg, #0F1E35 0%, #081220 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "7px 11px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 15,
            height: 15,
            borderRadius: 4,
            background: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity="0.45" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.45" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" />
          </svg>
        </div>
        <span style={{ color: "#4B6380", fontSize: 9, fontWeight: 600 }}>The Space OS</span>
        <span style={{ color: "#243349", fontSize: 9 }}>›</span>
        <span style={{ color: "#5A7A9A", fontSize: 9, fontWeight: 600 }}>{panelLabel}</span>
      </div>

      {/* Screenshot crop */}
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

/* ─── Connector arrow ────────────────────────────────────────────────
 *
 * Desktop: `flex: 0 0 14px` track between two 200 px columns.
 *
 * Vertical alignment — targets the midpoint of the phone frames (cols 2 & 3):
 *   ColHeader height:   min-height(48px) + margin-bottom(16px) = 64 px
 *   PhoneFrame height:  status(22) + img(200×19/9 ≈ 422) + home(16) = 460 px
 *   Phone centre Y:     64 + 460/2 = 294 px from col top
 *   Arrow SVG height:   12 px  →  padding-top = 294 − 6 = 288 px
 *
 * ─────────────────────────────────────────────────────────────────── */

function ColArrow() {
  return (
    <div className="qr-arrow" aria-hidden>
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(37,99,235,0.45), rgba(37,99,235,0.12))",
        }}
      />
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M3 7h8M8 4l3 3-3 3"
          stroke="#3B82F6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ─── Process step ──────────────────────────────────────────────────── */

function StepItem({
  num,
  title,
  desc,
  isLast,
}: {
  num: number;
  title: string;
  desc: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {!isLast && (
        <div
          className="qr-step-connector"
          style={{
            position: "absolute",
            top: 15,
            left: "calc(50% + 16px)",
            right: "calc(-50% + 16px)",
            height: 1,
            background:
              "linear-gradient(90deg, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.08) 100%)",
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
      <div
        style={{ color: "white", fontSize: 12.5, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}
      >
        {title}
      </div>
      <div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ─── Translation key arrays ────────────────────────────────────────── */

const BENEFIT_KEYS: TranslationKey[] = [
  "qr_b1", "qr_b2", "qr_b3",
  "qr_b4", "qr_b5", "qr_b6",
  "qr_b7", "qr_b8", "qr_b9",
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

        {/* ── Section header ─────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
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
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#2563EB",
                display: "block",
                boxShadow: "0 0 8px rgba(37,99,235,0.9)",
              }}
            />
            <span
              style={{ color: "#93C5FD", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}
            >
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
            <span
              style={{
                background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("qr_headline_2")}
            </span>
          </h2>

          <p
            style={{
              color: "#94A3B8",
              fontSize: 15.5,
              lineHeight: 1.8,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            {t("qr_sub")}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            UNIFORM 5-COLUMN FLOW
            ─ All 5 cols: flex: 0 0 200px (fixed equal width, no stagger)
            ─ 4 ColArrow connectors: flex: 0 0 14px, bisecting phone midpoint
            ─ Direction always LTR (numbered steps 1–5 left-to-right)
            ─ Container is overflow-x:auto so row stays single-line at
              any viewport wider than mobile (≥641px)
            ─ Mobile (≤640px): stacks vertically, arrows hidden
            ══════════════════════════════════════════════════════════════ */}
        <div className="qr-row-outer">
          <div className="qr-row">

            {/* ── Col 1 · Scan the QR ── */}
            <div className="qr-col">
              <ColHeader num="1" label={t("qr_step1_title")} />
              {/*
               * QR card: height fixed to match Phone col 2 (cropRatio 9/19 at 200px):
               *   22 (status) + 200×(19/9) (img) + 16 (home) ≈ 460px
               * Uses object-fit:cover to fill the box from the top.
               */}
              <div className="qr-card-box">
                <img
                  src={imgQRSafe}
                  alt={
                    dir === "rtl"
                      ? "نموذج توضيحي غير فعال لكود طلب مخصص للغرفة"
                      : "Non-functional example of a room QR ordering card"
                  }
                  loading="lazy"
                  draggable={false}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top center",
                  }}
                />
              </div>
              <ScreenLabel text={t("qr_zone1_label")} />
            </div>

            <ColArrow />

            {/* ── Col 2 · Browse the Menu ── */}
            <div className="qr-col">
              <ColHeader num="2" label={t("qr_step2_title")} />
              {/* cropRatio 9/19 → img ≈ 422px + bars = 460px total */}
              <PhoneFrame img={imgGuestOrder} alt={t("qr_zone2_lbl1")} cropRatio="9/19" />
              <ScreenLabel text={t("qr_zone2_lbl1")} />
            </div>

            <ColArrow />

            {/* ── Col 3 · Confirm the Order ── */}
            <div className="qr-col">
              <ColHeader num="3" label={t("qr_step3_title")} />
              {/* cropRatio 9/19 → img ≈ 422px + bars = 460px total (matches cols 1, 2, 4, 5) */}
              <PhoneFrame img={imgConfirm} alt={t("qr_zone2_lbl3")} cropRatio="9/19" />
              <ScreenLabel text={t("qr_zone2_lbl3")} />
            </div>

            <ColArrow />

            {/* ── Col 4 · Staff Receives the Order ── */}
            <div className="qr-col">
              <ColHeader num="4" label={t("qr_step4_title")} />
              <StaffPanel
                img={imgStaffOrders}
                alt={t("qr_zone3_lbl1")}
                panelLabel="Orders"
                cropHeight={431}
              />
              <ScreenLabel text={t("qr_zone3_lbl1")} />
            </div>

            <ColArrow />

            {/* ── Col 5 · Manage the Workflow ── */}
            <div className="qr-col">
              <ColHeader num="5" label={t("qr_step5_title")} />
              <StaffPanel
                img={imgStaffDetails}
                alt={t("qr_zone3_lbl2")}
                panelLabel="Order #189"
                cropHeight={431}
              />
              <ScreenLabel text={t("qr_zone3_lbl2")} />
            </div>

          </div>{/* end qr-row */}
        </div>{/* end qr-row-outer */}

        {/* ── Process steps strip ──────────────────────────────────── */}
        <div
          style={{
            marginTop: 56,
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
                <span style={{ color: "#CBD5E1", fontSize: 13.5, lineHeight: 1.6 }}>
                  {t(key)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Business value CTA ───────────────────────────────────── */}
        <div
          style={{
            marginTop: 48,
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)",
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
            <h3
              style={{
                color: "white",
                fontSize: "clamp(17px, 2.4vw, 23px)",
                fontWeight: 800,
                marginBottom: 12,
                lineHeight: 1.25,
              }}
            >
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

        /* ════════════════════════════════════════════════════════════
           OUTER WRAPPER — allows horizontal scroll on narrow viewports
           so the single-row 5-col layout is never broken into wrapping.
           At ≥1200px the row fits within the 1240px max-width container
           (5×200 + 4×14 + 8×8 = 1120px) so no scrollbar appears.
           ════════════════════════════════════════════════════════════ */
        .qr-row-outer {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          /* hide scrollbar on desktop (row fits); keep on very narrow) */
          scrollbar-width: thin;
          scrollbar-color: rgba(37,99,235,0.25) transparent;
        }
        .qr-row-outer::-webkit-scrollbar { height: 4px; }
        .qr-row-outer::-webkit-scrollbar-track { background: transparent; }
        .qr-row-outer::-webkit-scrollbar-thumb {
          background: rgba(37,99,235,0.25);
          border-radius: 2px;
        }

        /* ════════════════════════════════════════════════════════════
           UNIFORM 5-COLUMN ROW (desktop + tablet: always single line)
           Total width: 5 × 200px cols + 4 × 14px arrows + 8 × 8px gaps
                      = 1000 + 56 + 64 = 1120px
           Fits comfortably within maxWidth 1240px at any viewport.
           ════════════════════════════════════════════════════════════ */
        .qr-row {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: flex-start;
          gap: 8px;
          direction: ltr;
          /* Prevent flex children from compressing below their declared size */
          min-width: max-content;
        }

        /* Each column: fixed 200px, flex-column, centred content */
        .qr-col {
          flex: 0 0 200px;
          width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── QR card box ───────────────────────────────────────────
         * Fixed height 460px = status(22) + img(200×19/9≈422) + home(16)
         * This matches Phone col 2 (cropRatio 9/19) exactly, so column 1
         * is the same visual height as column 2 on desktop.
         * ─────────────────────────────────────────────────────────── */
        .qr-card-box {
          width: 100%;
          height: 460px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 4px 24px rgba(0,0,0,0.5),
            0 20px 64px rgba(0,0,0,0.65),
            0 0 48px rgba(120,60,220,0.18);
        }

        /* ── Connector arrows ──────────────────────────────────────
         * flex: 0 0 14px  — thin track between cols.
         * padding-top: 288px positions the horizontal line so it
         * bisects the Phone frame midpoint (see ColArrow comment).
         * ─────────────────────────────────────────────────────────── */
        .qr-arrow {
          flex: 0 0 14px;
          display: flex;
          flex-direction: row;
          align-items: center;
          padding-top: 288px;
        }

        /* ════════════════════════════════════════════════════════════
           MOBILE (≤ 640px): single centred column, arrows hidden.
           Cols: min(280px, 88vw) — equivalent to the phone width at
           which mobile visitors naturally hold their devices.
           ════════════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .qr-row-outer { overflow-x: visible; }
          .qr-row {
            flex-direction: column;
            align-items: center;
            gap: 28px;
            min-width: 0;
          }
          .qr-col {
            flex: 0 0 auto;
            width: min(280px, 88vw);
          }
          .qr-arrow { display: none; }

          /* QR card: proportional height at 280px col width.
             280 × (460/200) = 644px → aspect-ratio ≈ 9/20.7 ≈ 9/21  */
          .qr-card-box {
            height: auto;
            aspect-ratio: 9 / 21;
          }

          /* Steps and benefits go single-column on mobile */
          .qr-steps-grid {
            grid-template-columns: 1fr !important;
          }
          .qr-step-connector { display: none !important; }
          .qr-benefits-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Process steps (desktop) ────────────────────────────── */
        .qr-steps-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          position: relative;
        }
        .qr-step-connector { display: block; }

        /* Steps: 2-col at medium widths */
        @media (max-width: 899px) and (min-width: 641px) {
          .qr-steps-grid {
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }
          .qr-step-connector { display: none !important; }
        }

        /* ── Benefits grid ────────────────────────────────────────── */
        .qr-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 899px) and (min-width: 641px) {
          .qr-benefits-grid { grid-template-columns: repeat(2, 1fr); }
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

      `}</style>
    </section>
  );
}
