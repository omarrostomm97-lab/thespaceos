import { Gamepad2, Settings, Rocket } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const STEPS: { num: number; icon: typeof Gamepad2; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { num: 1, icon: Gamepad2, titleKey: "step1_title", descKey: "step1_desc" },
  { num: 2, icon: Settings, titleKey: "step2_title", descKey: "step2_desc" },
  { num: 3, icon: Rocket,   titleKey: "step3_title", descKey: "step3_desc" },
];

export function HowItWorksSection() {
  const { t, dir } = useLangCtx();

  return (
    <section style={{
      background: "#050B18", padding: "96px 24px",
      borderTop: "1px solid rgba(255,255,255,0.06)", direction: dir,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            color: "#2563EB", marginBottom: 16,
          }}>{t("how_eyebrow")}</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "white", lineHeight: 1.15 }}>
            {t("how_h2_text")}
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <div className="lp-step-line">
            <svg width="100%" height="2" style={{ overflow: "visible" }}>
              <line x1="16.7%" y1="1" x2="83.3%" y2="1"
                stroke="#1E3A5F" strokeWidth="1.5"
                strokeDasharray="8 5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="lp-steps-grid">
            {STEPS.map(({ num, icon: Icon, titleKey, descKey }) => (
              <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 16,
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={28} color="#2563EB" strokeWidth={1.5} />
                  </div>
                  <div style={{
                    position: "absolute", top: -10, right: -10,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "#2563EB", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>{num}</div>
                </div>

                <h3 style={{ color: "white", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{t(titleKey)}</h3>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.8, maxWidth: 260 }}>{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        .lp-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .lp-step-line {
          position: absolute;
          top: 36px;
          left: 0; right: 0;
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .lp-steps-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-step-line { display: none; }
        }
      `}</style>
    </section>
  );
}
