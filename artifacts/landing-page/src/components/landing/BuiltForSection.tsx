import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL;

const SPACES: { nameKey: TranslationKey; descKey: TranslationKey; accent: string; img: string }[] = [
  { nameKey: "bfs1_name", descKey: "bfs1_desc", accent: "#3B82F6", img: `${BASE}biz-gaming.jpg` },
  { nameKey: "bfs2_name", descKey: "bfs2_desc", accent: "#22C55E", img: `${BASE}biz-coworking.jpg` },
  { nameKey: "bfs3_name", descKey: "bfs3_desc", accent: "#F59E0B", img: `${BASE}biz-cafe.jpg` },
  { nameKey: "bfs4_name", descKey: "bfs4_desc", accent: "#EF4444", img: `${BASE}biz-restaurant.jpg` },
  { nameKey: "bfs5_name", descKey: "bfs5_desc", accent: "#8B5CF6", img: `${BASE}biz-other.jpg` },
];

function SpaceCard({
  nameKey, descKey, accent, img,
}: (typeof SPACES)[0]) {
  const { t } = useLangCtx();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#07121F", borderRadius: 14,
        border: `1px solid ${hov ? accent + "55" : "rgba(255,255,255,0.08)"}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.5), 0 0 28px ${accent}18` : "none",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", height: 120 }}>
        <img
          src={img} alt={t(nameKey)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            transform: hov ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(7,18,31,0.1) 0%, rgba(7,18,31,0.55) 100%)",
        }} />
      </div>

      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: accent, boxShadow: `0 0 7px ${accent}` }} />
          <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: 0 }}>{t(nameKey)}</p>
        </div>
        <p style={{ color: "#475569", fontSize: 12, lineHeight: 1.6 }}>{t(descKey)}</p>
      </div>
    </div>
  );
}

export function BuiltForSection() {
  const { t, dir, lang } = useLangCtx();
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="solutions" style={{ background: "#050B18", padding: "96px 24px", direction: dir }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-builtfor-grid">

          {/* Text column */}
          <div>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              color: "#2563EB", marginBottom: 16,
            }}>{t("bf_eyebrow")}</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800,
              lineHeight: 1.15, marginBottom: 20,
            }}>
              <span style={{ color: "white" }}>{t("bf_h2_1")}</span><br />
              <span style={{ color: "#2563EB" }}>{t("bf_h2_2")}</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.8, marginBottom: 32, maxWidth: 340 }}>
              {t("bf_sub_full")}
            </p>
            <button onClick={() => scrollTo("demo")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                color: "#2563EB", fontSize: 14, fontWeight: 700, padding: 0, fontFamily: "inherit",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#60A5FA")}
              onMouseLeave={e => (e.currentTarget.style.color = "#2563EB")}
            >
              {t("bf_cta")}
              {lang === "ar" ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>

          {/* Cards column */}
          <div className="lp-venue-grid">
            {SPACES.map(s => <SpaceCard key={s.nameKey} {...s} />)}
          </div>

        </div>
      </div>

      <style>{`
        .lp-builtfor-grid {
          display: grid;
          grid-template-columns: 30% 70%;
          gap: 64px;
          align-items: center;
        }
        .lp-venue-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .lp-venue-grid > *:nth-child(4) { grid-column: 1 / 2; }
        .lp-venue-grid > *:nth-child(5) { grid-column: 2 / 4; }
        @media (max-width: 1024px) {
          .lp-builtfor-grid { grid-template-columns: 32% 68%; gap: 40px; }
          .lp-venue-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-venue-grid > *:nth-child(4),
          .lp-venue-grid > *:nth-child(5) { grid-column: auto; }
          .lp-venue-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        }
        @media (max-width: 900px) {
          .lp-builtfor-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 500px) {
          .lp-venue-grid { grid-template-columns: 1fr; }
          .lp-venue-grid > * { grid-column: auto !important; }
        }
      `}</style>
    </section>
  );
}
