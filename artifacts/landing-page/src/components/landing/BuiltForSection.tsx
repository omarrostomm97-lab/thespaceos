import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const spaces = [
  {
    name: "محلات البلايستيشن والجيمينج",
    desc: "تحكم في الجلسات، إدارة الأجهزة، وتتبع وقت اللعب بدقة.",
    accent: "#3B82F6",
    img: `${BASE}biz-gaming.jpg`,
  },
  {
    name: "مساحات العمل المشتركة",
    desc: "حجز المكاتب والغرف، إدارة الأعضاء، والمساحات بكل سهولة.",
    accent: "#22C55E",
    img: `${BASE}biz-coworking.jpg`,
  },
  {
    name: "الكافيهات",
    desc: "الطلبات، القائمة، نقطة البيع، وسير عمل المطبخ في مكان واحد.",
    accent: "#F59E0B",
    img: `${BASE}biz-cafe.jpg`,
  },
  {
    name: "المطاعم",
    desc: "إدارة الطاولات، شاشة المطبخ، وأتمتة الطلبات بالكامل.",
    accent: "#EF4444",
    img: `${BASE}biz-restaurant.jpg`,
  },
  {
    name: "أي نشاط يدير غرفًا أو جلسات",
    desc: "صالونات، عيادات، استوديوهات، وأكثر — كل شيء في منصة واحدة.",
    accent: "#8B5CF6",
    img: `${BASE}biz-other.jpg`,
  },
];

function SpaceCard({ name, desc, accent, img }: (typeof spaces)[0]) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#07121F",
        borderRadius: 14,
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
          src={img} alt={name}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            transform: hov ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(7,18,31,0.1) 0%, rgba(7,18,31,0.55) 100%)`,
        }} />
      </div>

      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: accent, boxShadow: `0 0 7px ${accent}` }} />
          <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: 0 }}>{name}</p>
        </div>
        <p style={{ color: "#475569", fontSize: 12, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export function BuiltForSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="solutions" style={{ background: "#050B18", padding: "96px 24px", direction: "rtl" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-builtfor-grid">

          {/* Right — text */}
          <div>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              color: "#2563EB", marginBottom: 16,
            }}>مصمم للأنشطة التجارية الحديثة</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800,
              lineHeight: 1.15, marginBottom: 20,
            }}>
              <span style={{ color: "white" }}>مصمم لطريقة</span><br />
              <span style={{ color: "#2563EB" }}>تشغيلك الفعلية</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.8, marginBottom: 32, maxWidth: 340 }}>
              منصة واحدة تتكيف مع طريقة إدارتك لنشاطك التجاري.
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
              شاهد كيف يعمل <ArrowLeft size={14} />
            </button>
          </div>

          {/* Left — cards */}
          <div className="lp-venue-grid">
            {spaces.map(s => <SpaceCard key={s.name} {...s} />)}
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
