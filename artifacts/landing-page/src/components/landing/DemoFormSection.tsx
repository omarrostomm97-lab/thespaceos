import { useState } from "react";
import { Check, Lock } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "gaming_lounge", label: "Gaming Lounge" },
  { value: "coworking", label: "Coworking Space" },
  { value: "cafe", label: "Café / Coffee Shop" },
  { value: "restaurant", label: "Restaurant" },
  { value: "other", label: "Other" },
] as const;

const benefits = [
  { title: "Personalized walkthrough", desc: "We learn about your business and needs." },
  { title: "Setup guidance", desc: "We help you get started." },
  { title: "Fast response", desc: "Our team responds quickly and clearly." },
];

type BusinessType = typeof BUSINESS_TYPES[number]["value"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
  border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: 12, color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

export function DemoFormSection() {
  const [form, setForm] = useState({ name: "", businessType: "" as BusinessType | "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.businessType) e.businessType = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.includes("@")) e.email = "Invalid email";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitted(true);
  }

  return (
    <section id="demo" style={{ background: "#F1F5F9", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="lp-demo-grid">

          {/* Left */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563EB", marginBottom: 16 }}>
              See it in action
            </p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16, color: "#0F172A" }}>
              Book your{" "}
              <span style={{ color: "#2563EB" }}>personalized demo</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
              Our team will walk you through The Space OS, answer your questions, and show how it fits your business.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {benefits.map(b => (
                <div key={b.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={13} color="#2563EB" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color: "#0F172A", fontSize: 14, fontWeight: 600 }}>{b.title}</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form card */}
          <div style={{
            background: "white", borderRadius: 20, padding: "36px",
            boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.04)",
            border: "1px solid #E2E8F0",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
                  background: "#F0FDF4", border: "2px solid #BBF7D0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={28} color="#16A34A" strokeWidth={2.5} />
                </div>
                <h3 style={{ color: "#0F172A", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Request Received!</h3>
                <p style={{ color: "#64748B", fontSize: 15 }}>We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Field label="Full Name" error={errors.name}>
                    <input
                      type="text" value={form.name} placeholder="Your full name"
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.name ? "#EF4444" : "#E2E8F0" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.name ? "#EF4444" : "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="Business Type" error={errors.businessType}>
                    <select
                      value={form.businessType}
                      onChange={e => setForm({ ...form, businessType: e.target.value as BusinessType })}
                      style={{ ...inputStyle, borderColor: errors.businessType ? "#EF4444" : "#E2E8F0", cursor: "pointer", color: form.businessType ? "#0F172A" : "#9CA3AF" }}
                    >
                      <option value="" disabled>Select type…</option>
                      {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Phone / WhatsApp" error={errors.phone}>
                    <input
                      type="tel" value={form.phone} placeholder="+20 10 0000 0000"
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.phone ? "#EF4444" : "#E2E8F0" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.phone ? "#EF4444" : "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="Email Address" error={errors.email}>
                    <input
                      type="email" value={form.email} placeholder="you@example.com"
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : "#E2E8F0" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.email ? "#EF4444" : "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </Field>
                </div>

                <Field label="How can we help?">
                  <textarea
                    value={form.message} rows={3} placeholder="Tell us a bit about your business…"
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: "none" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </Field>

                <button type="submit"
                  style={{
                    marginTop: 20, width: "100%", padding: "13px",
                    background: "#2563EB", color: "white", border: "none", borderRadius: 12,
                    fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
                >
                  Request a Demo →
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
                  <Lock size={11} color="#94A3B8" />
                  <span style={{ color: "#94A3B8", fontSize: 12 }}>We respect your privacy. Your information is safe with us.</span>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
      <style>{`
        .lp-demo-grid {
          display: grid;
          grid-template-columns: 42% 58%;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .lp-demo-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 500px) {
          .lp-demo-grid > div:last-child form > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
