import { Check, Zap } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL;
const imgGuestMenu   = `${BASE}qr-screenshots/guest-menu.png`;
const imgGuestCart   = `${BASE}qr-screenshots/guest-cart.png`;
const imgConfirm     = `${BASE}qr-screenshots/guest-confirm.png`;
const imgStaffOrders = `${BASE}qr-screenshots/staff-orders.png`;
const imgStaffDetails= `${BASE}qr-screenshots/staff-details.png`;

/* ─── Mockup primitives ──────────────────────────────────────────────────── */

function PhoneFrame({
  img,
  alt,
  scale = 1,
  zIndex = 1,
}: {
  img: string;
  alt: string;
  scale?: number;
  zIndex?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        zIndex,
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        borderRadius: 36,
        background: "#0A0A14",
        border: "2px solid rgba(255,255,255,0.14)",
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.06),
          0 24px 64px rgba(0,0,0,0.7),
          0 0 48px rgba(37,99,235,0.14)
        `,
        overflow: "hidden",
        width: 200,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 28,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          direction: "ltr",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>2:30</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {/* signal bars */}
          {[5, 8, 11].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 2,
                background: "rgba(255,255,255,0.75)",
              }}
            />
          ))}
          {/* wifi */}
          <svg width="14" height="10" viewBox="0 0 14 10" style={{ marginLeft: 2 }}>
            <path
              d="M7 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-2.8-2.5a4 4 0 0 1 5.6 0M1.4 3.4a8 8 0 0 1 11.2 0"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          {/* battery */}
          <div
            style={{
              width: 22,
              height: 11,
              border: "1.5px solid rgba(255,255,255,0.6)",
              borderRadius: 3,
              position: "relative",
              marginLeft: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 2,
                background: "rgba(255,255,255,0.75)",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -4,
                top: "50%",
                transform: "translateY(-50%)",
                width: 2,
                height: 5,
                background: "rgba(255,255,255,0.4)",
                borderRadius: "0 1px 1px 0",
              }}
            />
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <img
        src={img}
        alt={alt}
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          objectPosition: "top center",
          aspectRatio: "9/18",
        }}
        loading="lazy"
      />

      {/* Home indicator */}
      <div
        style={{
          height: 22,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 5,
            borderRadius: 3,
            background: "rgba(255,255,255,0.3)",
          }}
        />
      </div>
    </div>
  );
}

function DashboardFrame({
  img,
  alt,
  title,
}: {
  img: string;
  alt: string;
  title: string;
}) {
  return (
    <div
      style={{
        background: "#07111F",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        overflow: "hidden",
        boxShadow: "0 16px 56px rgba(0,0,0,0.6), 0 0 40px rgba(37,99,235,0.1)",
        direction: "ltr",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "linear-gradient(180deg, #0D1A2D 0%, #071020 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
            <span
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: c,
                display: "block",
                boxShadow: `0 0 4px ${c}88`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 5,
            height: 20,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: 5,
            marginLeft: 6,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: 10, color: "#475569" }}>app.thespaceos.com — {title}</span>
        </div>
      </div>

      {/* Screenshot */}
      <img
        src={img}
        alt={alt}
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          objectPosition: "top center",
          maxHeight: 320,
        }}
        loading="lazy"
      />
    </div>
  );
}

/* ─── Step pill ──────────────────────────────────────────────────────────── */

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
      {/* Connector line (desktop) */}
      {!isLast && (
        <div
          className="qr-step-connector"
          style={{
            position: "absolute",
            top: 18,
            left: "calc(50% + 18px)",
            right: "calc(-50% + 18px)",
            height: 1,
            background: "linear-gradient(90deg, rgba(37,99,235,0.5) 0%, rgba(37,99,235,0.15) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.15)",
          border: "1.5px solid rgba(37,99,235,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#3B82F6",
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 12,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {num}
      </div>
      <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{title}</div>
      <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────────── */

const BENEFIT_KEYS: TranslationKey[] = [
  "qr_b1","qr_b2","qr_b3","qr_b4","qr_b5","qr_b6","qr_b7","qr_b8","qr_b9",
];

const STEPS: { titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { titleKey: "qr_step1_title", descKey: "qr_step1_desc" },
  { titleKey: "qr_step2_title", descKey: "qr_step2_desc" },
  { titleKey: "qr_step3_title", descKey: "qr_step3_desc" },
  { titleKey: "qr_step4_title", descKey: "qr_step4_desc" },
  { titleKey: "qr_step5_title", descKey: "qr_step5_desc" },
];

export function QROrderingSection() {
  const { t, dir } = useLangCtx();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="qr-ordering"
      style={{
        background: "linear-gradient(180deg, #040C1B 0%, #060E1F 60%, #040C1B 100%)",
        padding: "100px 24px",
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
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow blob */}
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: 800, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
              borderRadius: 20, padding: "5px 14px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#2563EB", display: "block",
                boxShadow: "0 0 8px rgba(37,99,235,0.9)",
              }} />
              <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
                {t("qr_feature_badge")}
              </span>
            </div>
          </div>

          <h2 style={{
            fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 900,
            lineHeight: 1.1, letterSpacing: "-0.02em",
            color: "white", marginBottom: 20,
          }}>
            {t("qr_headline_1")}
            <br />
            <span style={{
              background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {t("qr_headline_2")}
            </span>
          </h2>

          <p style={{
            color: "#94A3B8", fontSize: 16, lineHeight: 1.85,
            maxWidth: 620, margin: "0 auto",
          }}>
            {t("qr_sub")}
          </p>
        </div>

        {/* ── Main visual composition ── */}
        <div className="qr-main-visual">

          {/* Guest side — 3 phones */}
          <div className="qr-guest-side">
            <div className="qr-phones-row">

              {/* Phone 1: Menu (largest, center on desktop) */}
              <div className="qr-phone-wrap qr-phone-main">
                <PhoneFrame img={imgGuestMenu} alt={t("qr_phone1_label")} />
                <div className="qr-phone-label">
                  <span className="qr-step-num">1</span>
                  {t("qr_phone1_label")}
                </div>
              </div>

              {/* Phone 2: Cart */}
              <div className="qr-phone-wrap qr-phone-side">
                <PhoneFrame img={imgGuestCart} alt={t("qr_phone2_label")} scale={0.88} />
                <div className="qr-phone-label">
                  <span className="qr-step-num">2</span>
                  {t("qr_phone2_label")}
                </div>
              </div>

              {/* Phone 3: Confirmation */}
              <div className="qr-phone-wrap qr-phone-side">
                <PhoneFrame img={imgConfirm} alt={t("qr_phone3_label")} scale={0.88} />
                <div className="qr-phone-label">
                  <span className="qr-step-num">3</span>
                  {t("qr_phone3_label")}
                </div>
              </div>

            </div>
          </div>

          {/* Center connector */}
          <div className="qr-connector-col">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 1, height: 40, background: "rgba(37,99,235,0.3)",
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(37,99,235,0.15)",
                border: "1.5px solid rgba(37,99,235,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={18} color="#2563EB" fill="rgba(37,99,235,0.3)" />
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(37,99,235,0.3)" }} />
              <div style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
                borderRadius: 8, padding: "7px 12px",
                color: "#93C5FD", fontSize: 11, fontWeight: 700,
                textAlign: "center", lineHeight: 1.4, maxWidth: 120,
              }}>
                {t("qr_connector")}
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(37,99,235,0.3)" }} />
            </div>
          </div>

          {/* Staff side — 2 dashboard screens */}
          <div className="qr-staff-side">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div>
                <DashboardFrame
                  img={imgStaffOrders}
                  alt={t("qr_staff1_label")}
                  title="Orders"
                />
                <div className="qr-phone-label" style={{ marginTop: 10 }}>
                  <span className="qr-step-num">4</span>
                  {t("qr_staff1_label")}
                </div>
              </div>

              <div>
                <DashboardFrame
                  img={imgStaffDetails}
                  alt={t("qr_staff2_label")}
                  title="Order #189"
                />
                <div className="qr-phone-label" style={{ marginTop: 10 }}>
                  <span className="qr-step-num">5</span>
                  {t("qr_staff2_label")}
                </div>
              </div>

            </div>
          </div>

        </div>{/* end qr-main-visual */}

        {/* ── Process steps ── */}
        <div style={{
          marginTop: 80,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "40px 32px",
        }}>
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

        {/* ── Benefits grid ── */}
        <div style={{ marginTop: 64 }}>
          <div className="qr-benefits-grid">
            {BENEFIT_KEYS.map((key) => (
              <div
                key={key}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "14px 16px",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37,99,235,0.3)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(37,99,235,0.05)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={10} color="#2563EB" strokeWidth={3} />
                </div>
                <span style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 1.55 }}>
                  {t(key)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Business value block ── */}
        <div style={{
          marginTop: 56,
          background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: 20,
          padding: "40px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{
              color: "white", fontSize: "clamp(18px, 2.5vw, 24px)",
              fontWeight: 800, marginBottom: 12, lineHeight: 1.25,
            }}>
              {t("qr_bv_title")}
            </h3>
            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.8, maxWidth: 500 }}>
              {t("qr_bv_text")}
            </p>
          </div>
          <button
            onClick={() => scrollTo("demo")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#2563EB", color: "white", border: "none",
              borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700,
              padding: "14px 28px", fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(37,99,235,0.4)",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#1D4ED8";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.4)";
            }}
          >
            {t("qr_cta")}
          </button>
        </div>

      </div>{/* end container */}

      <style>{`
        /* ─ Main visual ─ */
        .qr-main-visual {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
        }
        .qr-connector-col {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
        }

        /* ─ Guest phones ─ */
        .qr-phones-row {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 12px;
        }
        .qr-phone-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .qr-phone-main { z-index: 2; }
        .qr-phone-side { z-index: 1; margin-top: 28px; }

        /* ─ Staff side ─ */
        .qr-staff-side { width: 100%; }

        /* ─ Phone labels ─ */
        .qr-phone-label {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #94A3B8;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          line-height: 1.3;
        }
        .qr-step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(37,99,235,0.35);
          color: #3B82F6;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }

        /* ─ Steps ─ */
        .qr-steps-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          position: relative;
        }
        .qr-step-connector { display: block; }

        /* ─ Benefits ─ */
        .qr-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        /* ─── Mobile ─── */
        @media (max-width: 900px) {
          .qr-main-visual {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .qr-connector-col {
            padding: 0;
            flex-direction: row;
          }
          .qr-connector-col > div {
            flex-direction: row !important;
          }
          .qr-connector-col > div > div:first-child,
          .qr-connector-col > div > div:last-child {
            width: 40px !important;
            height: 1px !important;
          }
          .qr-phones-row {
            gap: 8px;
          }
          .qr-phone-side { margin-top: 20px; }
          .qr-step-connector { display: none !important; }
          .qr-steps-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .qr-benefits-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .qr-phones-row {
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .qr-phone-side { margin-top: 0; }
          .qr-phone-wrap { width: 220px; }
          .qr-phone-wrap > div { width: 100% !important; }
          .qr-steps-grid { grid-template-columns: 1fr; }
          .qr-benefits-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
