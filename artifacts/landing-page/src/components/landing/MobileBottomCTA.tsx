import { useState, useEffect } from "react";

export function MobileBottomCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <div
        className="lp-mobile-cta"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 999,
          background: "rgba(4,12,27,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "12px 20px 16px",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <button
          onClick={() => scrollTo("demo")}
          style={{
            width: "100%", padding: "14px",
            background: "#2563EB", color: "white", border: "none",
            borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
          }}
        >
          Request a Demo →
        </button>
      </div>
      <style>{`
        .lp-mobile-cta { display: none !important; }
        @media (max-width: 768px) { .lp-mobile-cta { display: block !important; } }
      `}</style>
    </>
  );
}
