import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useListAssets } from "@workspace/api-client-react";
import type { Asset } from "@workspace/api-client-react";
import { Gamepad2, Printer, X, Loader2, LayoutGrid, Square } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const LOGO = `${BASE}/gaming-lounge-os-logo.png`;

type Layout = "single" | "compact";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ── Full-page card (one per page) ── */
function QrCard({ asset, qrUrl, venueName }: { asset: Asset; qrUrl: string; venueName: string }) {
  return (
    <div
      className="qr-card relative flex flex-col items-center overflow-hidden"
      style={{
        width: 340,
        background: "linear-gradient(160deg, #0f0720 0%, #0a0a0f 40%, #12072a 100%)",
        borderRadius: 24,
        boxShadow: "0 0 0 1px rgba(124,58,237,0.4), 0 24px 80px rgba(0,0,0,0.6)",
        padding: "0 0 28px",
        printColorAdjust: "exact",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
        backgroundSize: "20px 20px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
        width: 280, height: 180,
        background: "radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
        padding: "16px 20px 12px",
        display: "flex", alignItems: "center", gap: 10, position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)" }} />
        <div style={{
          background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", flexShrink: 0, position: "relative",
        }}>
          <Gamepad2 style={{ width: 16, height: 16, color: "white" }} />
        </div>
        <div style={{ position: "relative", color: "white", fontSize: 13, fontWeight: 700 }}>
          {venueName || "Gaming Lounge"}
        </div>
      </div>
      <div style={{ padding: "22px 20px 16px", textAlign: "center", width: "100%" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 100, padding: "3px 12px", marginBottom: 10,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#34d399" }}>
            Room Order
          </span>
        </div>
        <h2 style={{
          color: "white", fontSize: asset.name.length > 14 ? 22 : 28, fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>{asset.name}</h2>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", inset: -16,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
          borderRadius: 24,
        }} />
        <div style={{ background: "white", borderRadius: 18, padding: 14, position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <QRCodeCanvas value={qrUrl} size={200} bgColor="#ffffff" fgColor="#0a0a0f" level="M" includeMargin={false} />
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "20px 20px 0" }}>
        <div style={{ width: 36, height: 2, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 15 }}>📱</span>
          <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>Scan to Order</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, margin: 0, lineHeight: 1.5 }}>
          Order food &amp; drinks right from your seat
        </p>
      </div>
      <div style={{
        marginTop: 24, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.08em" }}>POWERED BY</span>
        <img src={LOGO} alt="Gaming Lounge OS" style={{ width: 44, height: 44, borderRadius: 9, objectFit: "cover" }} />
      </div>
    </div>
  );
}

/* ── Compact card (6 per page, 2×3 grid) ── */
function CompactQrCard({ asset, qrUrl, venueName }: { asset: Asset; qrUrl: string; venueName: string }) {
  return (
    <div
      className="qr-card relative flex flex-col items-center overflow-hidden"
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(160deg, #0f0720 0%, #0a0a0f 40%, #12072a 100%)",
        borderRadius: 14,
        boxShadow: "0 0 0 1px rgba(124,58,237,0.35)",
        padding: "0 0 10px",
        printColorAdjust: "exact",
      }}
    >
      {/* header */}
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
        padding: "8px 12px 6px",
        display: "flex", alignItems: "center", gap: 6, position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" }} />
        <div style={{
          background: "rgba(255,255,255,0.15)", borderRadius: 6, width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative",
        }}>
          <Gamepad2 style={{ width: 11, height: 11, color: "white" }} />
        </div>
        <span style={{ position: "relative", color: "white", fontSize: 9, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {venueName || "Gaming Lounge"}
        </span>
      </div>

      {/* room name */}
      <div style={{ padding: "8px 10px 6px", textAlign: "center", width: "100%" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 100, padding: "2px 8px", marginBottom: 5,
        }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#34d399" }}>
            Room Order
          </span>
        </div>
        <div style={{
          color: "white", fontSize: asset.name.length > 12 ? 13 : 16, fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-0.01em",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{asset.name}</div>
      </div>

      {/* QR */}
      <div style={{ background: "white", borderRadius: 10, padding: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
        <QRCodeCanvas value={qrUrl} size={120} bgColor="#ffffff" fgColor="#0a0a0f" level="M" includeMargin={false} />
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "8px 8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ fontSize: 11 }}>📱</span>
          <span style={{ color: "white", fontSize: 9, fontWeight: 800 }}>Scan to Order</span>
        </div>
      </div>

      {/* footer */}
      <div style={{
        marginTop: "auto", paddingTop: 6,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 6, letterSpacing: "0.08em" }}>POWERED BY</span>
        <img src={LOGO} alt="" style={{ width: 18, height: 18, borderRadius: 4, objectFit: "cover" }} />
      </div>
    </div>
  );
}

/* ── Page ── */
export default function PrintAllQrPage() {
  const { user, impersonatedTenant } = useAuth();
  const venueName = impersonatedTenant?.name ?? user?.tenantName ?? "";
  const [layout, setLayout] = useState<Layout>("single");

  const { data: assets, isLoading } = useListAssets();
  const assetsWithQr = (assets ?? []).filter(a => a.qrToken);

  const CARDS_PER_PAGE = 6; // 2 columns × 3 rows

  const pages = layout === "compact" ? chunk(assetsWithQr, CARDS_PER_PAGE) : [];

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .card-page {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 210mm;
            height: 297mm;
            background: white;
            page-break-after: always;
          }
          .compact-page {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr 1fr !important;
            gap: 6mm !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 8mm !important;
            box-sizing: border-box !important;
            background: white !important;
            page-break-after: always !important;
          }
          .compact-cell {
            display: flex !important;
          }
          .qr-card {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        @media screen {
          body { background: #f0f0f0; }
          .card-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 20px 40px;
          }
          .compact-page {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 16px;
            max-width: 720px;
            margin: 0 auto;
            padding: 72px 20px 40px;
          }
          .compact-cell {
            display: flex;
            aspect-ratio: 0.85;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <X className="h-4 w-4" /> Close
        </button>
        <div className="flex-1" />

        {/* Layout toggle */}
        {!isLoading && assetsWithQr.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLayout("single")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                layout === "single"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Square className="h-3.5 w-3.5" /> 1 per page
            </button>
            <button
              onClick={() => setLayout("compact")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                layout === "compact"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> 6 per page
            </button>
          </div>
        )}

        {isLoading ? (
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading rooms…
          </span>
        ) : (
          <span className="text-sm text-gray-400">
            {assetsWithQr.length} room{assetsWithQr.length !== 1 ? "s" : ""}
            {layout === "compact" ? ` · ${pages.length} page${pages.length !== 1 ? "s" : ""}` : ""}
          </span>
        )}

        <button
          onClick={() => window.print()}
          disabled={isLoading || assetsWithQr.length === 0}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 rounded-lg px-4 py-1.5 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" /> Print All
        </button>
      </div>

      {/* Cards */}
      <div>
        {isLoading && (
          <div className="card-page">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          </div>
        )}

        {/* Single layout: one card per page */}
        {!isLoading && layout === "single" && assetsWithQr.map(asset => {
          const qrUrl = `${window.location.origin}/qr/${asset.qrToken}`;
          return (
            <div key={asset.id} className="card-page">
              <QrCard asset={asset} qrUrl={qrUrl} venueName={venueName} />
            </div>
          );
        })}

        {/* Compact layout: 6 per page in 2×3 grid */}
        {!isLoading && layout === "compact" && pages.map((group, pageIdx) => (
          <div key={pageIdx} className="compact-page">
            {group.map(asset => {
              const qrUrl = `${window.location.origin}/qr/${asset.qrToken}`;
              return (
                <div key={asset.id} className="compact-cell">
                  <CompactQrCard asset={asset} qrUrl={qrUrl} venueName={venueName} />
                </div>
              );
            })}
          </div>
        ))}

        {!isLoading && assetsWithQr.length === 0 && (
          <div className="card-page" style={{ flexDirection: "column", gap: 12 }}>
            <Gamepad2 className="h-12 w-12 text-purple-400 mx-auto" />
            <p className="text-gray-500 text-sm">No rooms have QR codes generated yet.</p>
            <p className="text-gray-400 text-xs">Go to Assets → generate a QR code for each room first.</p>
          </div>
        )}
      </div>
    </>
  );
}
