import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";

const BUSINESS_TYPE_VALUES = [
  { value: "gaming_lounge",   labelKey: "form_type_gaming" },
  { value: "coworking_space", labelKey: "form_type_coworking" },
  { value: "cafe_restaurant", labelKey: "form_type_cafe" },
  { value: "other",           labelKey: "form_type_other" },
] as const;

type BusinessType = typeof BUSINESS_TYPE_VALUES[number]["value"];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 700,
        color: "#94A3B8", marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: 12, color: "#F87171" }}>{error}</p>}
    </div>
  );
}

export function DemoFormSection() {
  const { t, dir, lang } = useLangCtx();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    businessType: "" as BusinessType | "",
    businessName: "",
    branchesCount: "",
    message: "",
    _honey: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "white",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    textAlign: dir === "rtl" ? "right" : "left",
  };

  function validate() {
    const e: Record<string, string> = {};
    const req = t("form_error_required");
    if (!form.fullName.trim()) e.fullName = req;
    if (!form.phone.trim()) e.phone = req;
    if (!form.businessType) e.businessType = req;
    if (!form.businessName.trim()) e.businessName = req;
    if (form.email && !form.email.includes("@")) e.email = t("form_error_email");
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === "success") return;
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          company: form.businessName.trim(),
          businessType: form.businessType,
          city: "Cairo",
          message: form.message.trim() || undefined,
          source: "landing_page",
          _honey: form._honey,
        }),
      });
      if (!res.ok) { setStatus("error"); return; }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const focusStyle = { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.15)" };
  const blurStyle = (err?: string) => ({
    borderColor: err ? "#F87171" : "rgba(255,255,255,0.1)",
    boxShadow: "none",
  });

  const BENEFITS = [
    { titleKey: "demo_b1_title" as const, descKey: "demo_b1_desc" as const },
    { titleKey: "demo_b2_title" as const, descKey: "demo_b2_desc" as const },
    { titleKey: "demo_b3_title" as const, descKey: "demo_b3_desc" as const },
  ];

  return (
    <section id="demo" style={{
      background: "linear-gradient(160deg, #040C1B 0%, #050B18 100%)",
      padding: "96px 24px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      direction: dir,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="lp-demo-grid">

          {/* Text column */}
          <div>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              color: "#2563EB", marginBottom: 16,
            }}>{t("demo_eyebrow")}</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800,
              lineHeight: 1.15, marginBottom: 16, color: "white",
            }}>
              {t("demo_h2_1")}{" "}
              <span style={{ color: "#2563EB" }}>{t("demo_h2_2")}</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.85, marginBottom: 40, maxWidth: 380 }}>
              {t("demo_sub")}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {BENEFITS.map(({ titleKey, descKey }) => (
                <div key={titleKey} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={13} color="#2563EB" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{t(titleKey)}</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginTop: 3 }}>{t(descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form column */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 20, padding: "36px",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 0 80px rgba(37,99,235,0.06)",
          }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
                  background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={28} color="#4ADE80" strokeWidth={2.5} />
                </div>
                <h3 style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                  {t("form_success_h")}
                </h3>
                <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.8 }}>
                  {t("form_success_p")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot */}
                <input
                  type="text" value={form._honey} tabIndex={-1} aria-hidden="true"
                  onChange={e => setForm({ ...form, _honey: e.target.value })}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

                  <Field label={t("form_label_name")} error={errors.fullName}>
                    <input
                      type="text" value={form.fullName} placeholder={t("form_ph_name")}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.fullName ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.fullName))}
                    />
                  </Field>

                  <Field label={t("form_label_phone")} error={errors.phone}>
                    <input
                      type="tel" value={form.phone} placeholder="+20 10 0000 0000"
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.phone ? "#F87171" : "rgba(255,255,255,0.1)", direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.phone))}
                    />
                  </Field>

                  <Field label={t("form_label_type")} error={errors.businessType}>
                    <select
                      value={form.businessType}
                      onChange={e => setForm({ ...form, businessType: e.target.value as BusinessType })}
                      style={{
                        ...inputStyle, cursor: "pointer",
                        borderColor: errors.businessType ? "#F87171" : "rgba(255,255,255,0.1)",
                        color: form.businessType ? "white" : "#64748B",
                      }}
                    >
                      <option value="" disabled style={{ background: "#0A1628" }}>{t("form_ph_type")}</option>
                      {BUSINESS_TYPE_VALUES.map(bt => (
                        <option key={bt.value} value={bt.value} style={{ background: "#0A1628" }}>{t(bt.labelKey)}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("form_label_bname")} error={errors.businessName}>
                    <input
                      type="text" value={form.businessName} placeholder={t("form_ph_bname")}
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.businessName ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.businessName))}
                    />
                  </Field>

                  <Field label={t("form_label_email")} error={errors.email}>
                    <input
                      type="email" value={form.email} placeholder="you@example.com"
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.email ? "#F87171" : "rgba(255,255,255,0.1)", direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.email))}
                    />
                  </Field>

                  <Field label={t("form_label_branches")}>
                    <input
                      type="number" value={form.branchesCount} placeholder={lang === "ar" ? "١" : "1"}
                      min="1" max="9999"
                      onChange={e => setForm({ ...form, branchesCount: e.target.value })}
                      style={{ ...inputStyle, direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: 14 }}>
                  <Field label={t("form_label_message")}>
                    <textarea
                      value={form.message} rows={3}
                      placeholder={t("form_ph_message")}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{ ...inputStyle, resize: "none" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>
                </div>

                {status === "error" && (
                  <p style={{ marginTop: 12, fontSize: 13, color: "#F87171", textAlign: "center" }}>
                    {t("form_error_p")}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    marginTop: 20, width: "100%", padding: "14px",
                    background: status === "loading" ? "#1D4ED8" : "#2563EB",
                    color: "white", border: "none",
                    borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: status === "loading" ? "default" : "pointer",
                    fontFamily: "inherit", transition: "background 0.2s",
                    opacity: status === "loading" ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (status !== "loading") e.currentTarget.style.background = "#1D4ED8"; }}
                  onMouseLeave={e => { if (status !== "loading") e.currentTarget.style.background = "#2563EB"; }}
                >
                  {status === "loading" ? t("form_loading_cta") : t("form_submit_cta")}
                </button>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, marginTop: 14,
                }}>
                  <Lock size={11} color="#334155" />
                  <span style={{ color: "#334155", fontSize: 12 }}>
                    {t("form_privacy_note")}
                  </span>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .lp-demo-grid {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 1024px) { .lp-demo-grid { grid-template-columns: 42% 58%; gap: 48px; } }
        @media (max-width: 900px) { .lp-demo-grid { grid-template-columns: 1fr; gap: 48px; } }
        @media (max-width: 500px) {
          .lp-demo-grid > div:last-child form > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
