import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, RefreshCw, ChevronDown,
  User, Phone, Mail, Building2, Inbox,
  Calendar, MessageSquare, Tag, ExternalLink,
} from "lucide-react";
import { useLang } from "@/hooks/use-language";

const API = "/api";
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("gl_token") : null;
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

const STATUS_LABELS: Record<string, string> = {
  new:            "جديد",
  contacted:      "تم التواصل",
  qualified:      "مؤهل",
  demo_scheduled: "تم تحديد موعد",
  won:            "عميل",
  lost:           "لم يكمل",
};
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new:            { bg: "rgba(37,99,235,0.1)",  text: "#60A5FA", border: "rgba(37,99,235,0.25)" },
  contacted:      { bg: "rgba(234,179,8,0.1)",  text: "#FCD34D", border: "rgba(234,179,8,0.25)" },
  qualified:      { bg: "rgba(168,85,247,0.1)", text: "#C084FC", border: "rgba(168,85,247,0.25)" },
  demo_scheduled: { bg: "rgba(249,115,22,0.1)", text: "#FB923C", border: "rgba(249,115,22,0.25)" },
  won:            { bg: "rgba(22,163,74,0.1)",  text: "#4ADE80", border: "rgba(22,163,74,0.25)" },
  lost:           { bg: "rgba(239,68,68,0.1)",  text: "#F87171", border: "rgba(239,68,68,0.25)" },
};
const BIZ_TYPE_LABELS: Record<string, string> = {
  gaming_lounge: "بلايستيشن / جيمينج",
  coworking:     "مساحة عمل مشتركة",
  cafe:          "كافيه / مطعم",
  restaurant:    "مطعم",
  other:         "نشاط آخر",
};
const CONTACT_METHOD_LABELS: Record<string, string> = {
  call:      "مكالمة",
  whatsapp:  "واتساب",
  email:     "بريد إلكتروني",
};
const VALID_STATUSES = ["new", "contacted", "qualified", "demo_scheduled", "won", "lost"] as const;

interface Lead {
  id: number;
  fullName: string | null;
  phone: string;
  email: string | null;
  businessType: string;
  businessName: string | null;
  branchesCount: number | null;
  preferredContactMethod: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatusPicker({
  current, leadId, onClose,
}: { current: string; leadId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`${API}/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      onClose();
    },
  });

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 100,
      background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
      borderRadius: 10, padding: 6, minWidth: 170,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      {VALID_STATUSES.map(s => {
        const c = STATUS_COLORS[s];
        return (
          <button
            key={s}
            onClick={() => mutation.mutate(s)}
            disabled={mutation.isPending}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "7px 10px", borderRadius: 7, border: "none",
              background: s === current ? c.bg : "transparent",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, fontWeight: s === current ? 700 : 500,
              color: s === current ? c.text : "hsl(var(--foreground))",
              textAlign: "right",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.text, display: "block", flexShrink: 0 }} />
            {STATUS_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}

function LeadRow({ lead, onSelect }: { lead: Lead; onSelect: (l: Lead) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const dateStr = new Date(lead.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}
      className="lead-row"
    >
      <td style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{lead.fullName ?? "—"}</div>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2, direction: "ltr", textAlign: "right" }}>
          {lead.phone}
        </div>
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13 }}>
        <div style={{ fontWeight: 600 }}>{lead.businessName ?? "—"}</div>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
          {BIZ_TYPE_LABELS[lead.businessType] ?? lead.businessType}
        </div>
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
        {lead.email ?? "—"}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={() => setPickerOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 6, border: "none",
              background: "transparent", cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}
          >
            <StatusBadge status={lead.status} />
            <ChevronDown size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
          </button>
          {pickerOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setPickerOpen(false)} />
              <StatusPicker current={lead.status} leadId={lead.id} onClose={() => setPickerOpen(false)} />
            </>
          )}
        </div>
      </td>
      <td style={{ padding: "14px 16px", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{dateStr}</td>
      <td style={{ padding: "14px 16px" }}>
        <button
          onClick={() => onSelect(lead)}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
            borderRadius: 7, border: "1px solid hsl(var(--border))",
            background: "transparent", cursor: "pointer", fontFamily: "inherit",
            fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))",
          }}
        >
          <ExternalLink size={12} /> تفاصيل
        </button>
      </td>
      <style>{`.lead-row:hover td { background: hsl(var(--muted)/0.4); }`}</style>
    </tr>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const dateStr = new Date(lead.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div
        style={{
          width: "100%", maxWidth: 560, borderRadius: 16,
          background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid hsl(var(--border))",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{lead.fullName ?? "—"}</h2>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", margin: "4px 0 0" }}>
              {BIZ_TYPE_LABELS[lead.businessType] ?? lead.businessType}
            </p>
          </div>
          <StatusBadge status={lead.status} />
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: Phone, label: "الهاتف", value: lead.phone },
            { icon: Mail, label: "البريد الإلكتروني", value: lead.email ?? "—" },
            { icon: Building2, label: "اسم النشاط", value: lead.businessName ?? "—" },
            {
              icon: Tag, label: "عدد الفروع",
              value: lead.branchesCount != null ? String(lead.branchesCount) : "—"
            },
            {
              icon: Phone, label: "طريقة التواصل المفضلة",
              value: lead.preferredContactMethod ? (CONTACT_METHOD_LABELS[lead.preferredContactMethod] ?? lead.preferredContactMethod) : "—"
            },
            { icon: Calendar, label: "تاريخ التسجيل", value: dateStr },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
              </div>
            </div>
          ))}

          {lead.message && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MessageSquare size={15} style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 600, marginBottom: 4 }}>الرسالة</div>
                <div style={{
                  fontSize: 14, lineHeight: 1.7,
                  background: "hsl(var(--muted))", borderRadius: 8, padding: "10px 14px",
                }}>
                  {lead.message}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{
          padding: "14px 24px", borderTop: "1px solid hsl(var(--border))",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "1px solid hsl(var(--border))",
              background: "transparent", cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, fontWeight: 700, color: "hsl(var(--muted-foreground))",
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [bizFilter, setBizFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const queryClient = useQueryClient();

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (bizFilter) params.set("businessType", bizFilter);
  if (statusFilter) params.set("status", statusFilter);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-leads", search, bizFilter, statusFilter, offset],
    queryFn: async () => {
      const res = await fetch(`${API}/admin/leads?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ leads: Lead[]; total: number }>;
    },
    staleTime: 30_000,
  });

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;

  const statusCounts: Record<string, number> = {};
  for (const l of leads) {
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
  }

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setOffset(0);
  }, []);

  const summaryCards = [
    { label: "إجمالي العملاء المحتملين", value: total, color: "#2563EB" },
    { label: "جديد", value: leads.filter(l => l.status === "new").length, color: "#60A5FA" },
    { label: "تم التواصل", value: leads.filter(l => l.status === "contacted").length, color: "#FCD34D" },
    { label: "عملاء", value: leads.filter(l => l.status === "won").length, color: "#4ADE80" },
  ];

  return (
    <div className="p-6 space-y-6" style={{ direction: "rtl" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
            <Inbox size={18} style={{ color: "#2563EB" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">العملاء المحتملون</h1>
            <p className="text-sm text-muted-foreground">طلبات العروض التجريبية من الموقع</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{
            border: "1px solid hsl(var(--border))",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
        className="lp-leads-summary-grid">
        {summaryCards.map(c => (
          <div key={c.label} className="card-base rounded-xl p-4">
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-base rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: "hsl(var(--muted-foreground))",
          }} />
          <input
            type="text"
            placeholder="بحث باسم أو رقم هاتف أو نشاط…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 36px 9px 14px", borderRadius: 8,
              border: "1px solid hsl(var(--border))", background: "hsl(var(--background))",
              fontSize: 13, fontFamily: "inherit", color: "hsl(var(--foreground))",
              outline: "none", boxSizing: "border-box", textAlign: "right",
            }}
          />
        </div>

        <select
          value={bizFilter}
          onChange={e => { setBizFilter(e.target.value); setOffset(0); }}
          style={{
            padding: "9px 14px", borderRadius: 8, border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))", fontSize: 13, fontFamily: "inherit",
            color: "hsl(var(--foreground))", cursor: "pointer", textAlign: "right",
          }}
        >
          <option value="">كل الأنواع</option>
          {Object.entries(BIZ_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setOffset(0); }}
          style={{
            padding: "9px 14px", borderRadius: 8, border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))", fontSize: 13, fontFamily: "inherit",
            color: "hsl(var(--foreground))", cursor: "pointer", textAlign: "right",
          }}
        >
          <option value="">كل الحالات</option>
          {VALID_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-base rounded-xl overflow-hidden">
        {isError ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-semibold">حدث خطأ في تحميل البيانات</p>
            <button onClick={() => refetch()} className="mt-3 text-primary text-sm font-semibold">
              حاول مرة أخرى
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">جاري التحميل…</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="font-semibold text-muted-foreground">لا يوجد عملاء محتملون بعد</p>
            <p className="text-sm text-muted-foreground/60 mt-1">ستظهر طلبات العروض التجريبية هنا عندما تصل</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.4)" }}>
                  {["الاسم / الهاتف", "النشاط", "البريد الإلكتروني", "الحالة", "التاريخ", ""].map(h => (
                    <th key={h} style={{
                      padding: "11px 16px", fontSize: 11, fontWeight: 700, textAlign: "right",
                      color: "hsl(var(--muted-foreground))", letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <LeadRow key={lead.id} lead={lead} onSelect={setSelectedLead} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{offset + 1}–{Math.min(offset + limit, total)} من {total}</span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(o => Math.max(0, o - limit))}
              style={{
                padding: "6px 14px", borderRadius: 7, border: "1px solid hsl(var(--border))",
                background: "transparent", cursor: offset === 0 ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                opacity: offset === 0 ? 0.4 : 1,
              }}
            >السابق</button>
            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(o => o + limit)}
              style={{
                padding: "6px 14px", borderRadius: 7, border: "1px solid hsl(var(--border))",
                background: "transparent", cursor: offset + limit >= total ? "default" : "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                opacity: offset + limit >= total ? 0.4 : 1,
              }}
            >التالي</button>
          </div>
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .lp-leads-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .lp-leads-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
