import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const IMG_DASHBOARD = `${import.meta.env.BASE_URL}hero-dashboard.png`;
const IMG_ROOMS     = `${import.meta.env.BASE_URL}hero-rooms.png`;

const BULLET_KEYS: TranslationKey[] = ["pss_b1","pss_b2","pss_b3","pss_b4","pss_b5","pss_b6"];

function ScreenshotCard({
  img, title, caption,
}: {
  img: string; title: string; caption: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        background: "#0A1628",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${hov ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.1)"}`,
        boxShadow: hov
          ? "0 16px 56px rgba(0,0,0,0.25), 0 0 32px rgba(37,99,235,0.12)"
          : "0 8px 32px rgba(0,0,0,0.15)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Browser chrome */}
      <div style={{
        background: "#071020", padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 6,
        direction: "ltr",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57","#FFBD2E","#28C840"].map((c,i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "block" }} />
          ))}
        </div>
        <div style={{
          flex: 1, marginLeft: 6,
          background: "rgba(255,255,255,0.05)", borderRadius: 4,
          height: 18, display: "flex", alignItems: "center", padding: "0 8px",
        }}>
          <span style={{ color: "#334155", fontSize: 9 }}>app.thespaceos.com</span>
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={img} alt={title}
          style={{
            width: "100%", display: "block",
            objectFit: "cover", objectPosition: "top left",
            aspectRatio: "16/10",
          }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: "linear-gradient(to bottom, transparent, #0A1628)",
          pointerEvents: "none",
        }} />
      </div>

      <div style={{ padding: "12px 16px" }}>
        <p style={{ color: "white", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{title}</p>
        <p style={{ color: "#64748B", fontSize: 11, lineHeight: 1.5 }}>{caption}</p>
      </div>
    </div>
  );
}

export function ProductScreenshotsSection() {
  const { t, dir, lang } = useLangCtx();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="features" style={{ background: "#F8FAFC", padding: "96px 24px", direction: dir }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-connected-grid">

          {/* Text column */}
          <div>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              color: "#2563EB", marginBottom: 14,
            }}>{t("pss_eyebrow")}</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800,
              lineHeight: 1.15, marginBottom: 18, color: "#0F172A",
            }}>
              {t("pss_h2_1")}<br />
              <span style={{ color: "#2563EB" }}>{t("pss_h2_2")}</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.85, marginBottom: 28, maxWidth: 400 }}>
              {t("pss_sub")}
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 36, display: "flex", flexDirection: "column", gap: 10 }}>
              {BULLET_KEYS.map(key => (
                <li key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={10} color="#2563EB" strokeWidth={3} />
                  </div>
                  <span style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>{t(key)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => scrollTo("demo")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                background: "transparent", border: "1px solid rgba(37,99,235,0.35)",
                borderRadius: 8, color: "#2563EB", fontSize: 14, fontWeight: 700,
                padding: "10px 20px", fontFamily: "inherit", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(37,99,235,0.06)";
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.35)";
              }}
            >
              {t("pss_cta")}
              {lang === "ar" ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>

          {/* Screenshot cards */}
          <div className="lp-cards-row">
            <ScreenshotCard
              img={IMG_DASHBOARD}
              title={t("pss_card1_title")}
              caption={t("pss_card1_cap")}
            />
            <ScreenshotCard
              img={IMG_ROOMS}
              title={t("pss_card2_title")}
              caption={t("pss_card2_cap")}
            />
          </div>

        </div>
      </div>

      <style>{`
        .lp-connected-grid {
          display: grid;
          grid-template-columns: 38% 62%;
          gap: 64px;
          align-items: center;
        }
        .lp-cards-row {
          display: flex;
          flex-direction: row;
          gap: 16px;
          align-items: stretch;
        }
        .lp-cards-row > * { min-width: 0; }
        @media (max-width: 1024px) {
          .lp-connected-grid { grid-template-columns: 44% 56%; gap: 48px; }
        }
        @media (max-width: 900px) {
          .lp-connected-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 580px) {
          .lp-cards-row { flex-direction: column; }
        }
      `}</style>
    </section>
  );
}
