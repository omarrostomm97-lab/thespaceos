import { useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Gamepad2, Printer, X } from "lucide-react";

export default function PrintQrPage() {
  const params = new URLSearchParams(window.location.search);
  const url     = params.get("url")    ?? "";
  const title   = params.get("title")  ?? "";
  const type    = params.get("type")   ?? "room"; // "room" | "menu"
  const venue   = params.get("venue")  ?? "";
  const canvasRef = useRef<HTMLDivElement>(null);

  const isMenu   = type === "menu";
  const cta      = isMenu ? "Scan to View Our Menu" : "Scan to Order";
  const tagline  = isMenu
    ? "Browse our full menu from your phone"
    : "Order food & drinks right from your seat";

  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${title.replace(/\s+/g, "-").toLowerCase() || "menu"}.png`;
    a.click();
  };

  return (
    <>
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .print-page {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 210mm;
            height: 297mm;
            background: white;
          }
          .qr-card {
            box-shadow: none !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        @media screen {
          body { background: #f0f0f0; }
        }
      `}</style>

      {/* ── Screen toolbar ── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <X className="h-4 w-4" /> Close
        </button>
        <div className="flex-1" />
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          Download PNG
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg px-4 py-1.5 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* ── Page wrapper ── */}
      <div className="print-page min-h-screen flex items-center justify-center p-10 pt-20 bg-[#f0f0f0]">

        {/* ── QR Card ── */}
        <div
          className="qr-card relative flex flex-col items-center overflow-hidden"
          style={{
            width: 360,
            background: "linear-gradient(160deg, #0f0720 0%, #0a0a0f 40%, #12072a 100%)",
            borderRadius: 24,
            boxShadow: "0 0 0 1px rgba(124,58,237,0.4), 0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.15)",
            padding: "0 0 36px",
            printColorAdjust: "exact",
          }}
        >
          {/* Dot grid texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.06,
            backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }} />

          {/* Purple glow top */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 300, height: 200,
            background: "radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* ── Header strip ── */}
          <div style={{
            width: "100%",
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
            padding: "18px 24px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}>
            {/* Sheen */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
            }} />
            <div style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 10,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)", flexShrink: 0, position: "relative",
            }}>
              <Gamepad2 style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700, letterSpacing: "0.02em" }}>
                {venue || "The Space OS"}
              </div>
            </div>
          </div>

          {/* ── Room / Menu label ── */}
          <div style={{ padding: "28px 24px 20px", textAlign: "center", position: "relative", width: "100%" }}>
            <div style={{
              display: "inline-block",
              background: isMenu ? "rgba(124,58,237,0.15)" : "rgba(16,185,129,0.12)",
              border: `1px solid ${isMenu ? "rgba(124,58,237,0.35)" : "rgba(16,185,129,0.3)"}`,
              borderRadius: 100, padding: "4px 14px", marginBottom: 14,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: isMenu ? "#a78bfa" : "#34d399",
              }}>
                {isMenu ? "Walk-in Menu" : "Room Order"}
              </span>
            </div>

            <h1 style={{
              color: "white",
              fontSize: title.length > 14 ? 26 : 32,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}>
              {title || (isMenu ? "Menu" : "Room")}
            </h1>
          </div>

          {/* ── QR Code ── */}
          <div style={{ position: "relative" }}>
            {/* Glow behind QR */}
            <div style={{
              position: "absolute", inset: -16,
              background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
              borderRadius: 24,
            }} />
            <div
              ref={canvasRef}
              style={{
                background: "white",
                borderRadius: 20,
                padding: 16,
                position: "relative",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <QRCodeCanvas
                value={url || "https://example.com"}
                size={220}
                bgColor="#ffffff"
                fgColor="#0a0a0f"
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ textAlign: "center", padding: "24px 24px 0", position: "relative" }}>
            {/* Divider */}
            <div style={{
              width: 40, height: 2,
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)",
              margin: "0 auto 20px",
            }} />

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 8,
            }}>
              <span style={{ fontSize: 17 }}>📱</span>
              <span style={{
                color: "white", fontSize: 15, fontWeight: 800,
                letterSpacing: "0.01em",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}>
                {cta}
              </span>
            </div>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 11,
              margin: 0, lineHeight: 1.5, maxWidth: 240,
            }}>
              {tagline}
            </p>
          </div>

          {/* ── Powered by footer ── */}
          <div style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.08em" }}>
              POWERED BY
            </span>
            <img
              src={`${import.meta.env.BASE_URL}the-space-os-logo.png`}
              alt="The Space OS"
              style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
