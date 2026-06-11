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
  { title: "Setup guidance", desc: "We help you get started quickly." },
  { title: "Fast response", desc: "Our team responds quickly and clearly." },
];

type BusinessType = typeof BUSINESS_TYPES[number]["value"];

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: "#94A3B8", marginBottom: 6, letterSpacing: "0.01em",
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: 12, color: "#F87171" }}>{error}</p>}
    </div>
  );
}

export function DemoFormSection() {
  const [form, setForm] = useState({
    name: "", businessType: "" as BusinessType | "",
    businessName: "", phone: "", email: "", city: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "white",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.businessType) e.businessType = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.includes("@")) e.email = "Invalid email";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const focusStyle = { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.15)" };
  const blurStyle = (err?: string) => ({
    borderColor: err ? "#F87171" : "rgba(255,255,255,0.1)",
    boxShadow: "none",
  });

  return (
    <section id="demo" style={{
      background: "linear-gradient(160deg, #040C1B 0%, #050B18 100%)",
      padding: "96px 24px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="lp-demo-grid">

          {/* Left */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#2563EB", marginBottom: 16,
            }}>See it in action</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700,
              lineHeight: 1.12, marginBottom: 16, color: "white",
            }}>
              Book your{" "}
              <span style={{ color: "#2563EB" }}>personalized demo</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.75, marginBottom: 40, maxWidth: 380 }}>
              Our team will walk you through The Space OS, answer your questions,
              and show how it fits your business.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {benefits.map(b => (
                <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={13} color="#2563EB" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ color: "white", fontSize: 14, fontWeight: 600 }}>{b.title}</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginTop: 3 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
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
                <h3 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Request Received!
                </h3>
                <p style={{ color: "#64748B", fontSize: 15 }}>We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

                  <Field label="Full Name *" error={errors.name}>
                    <input
                      type="text" value={form.name} placeholder="Your full name"
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.name ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.name))}
                    />
                  </Field>

                  <Field label="Business Type *" error={errors.businessType}>
                    <select
                      value={form.businessType}
                      onChange={e => setForm({ ...form, businessType: e.target.value as BusinessType })}
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        borderColor: errors.businessType ? "#F87171" : "rgba(255,255,255,0.1)",
                        color: form.businessType ? "white" : "#64748B",
                      }}
                    >
                      <option value="" disabled style={{ background: "#0A1628" }}>Select type…</option>
                      {BUSINESS_TYPES.map(t => (
                        <option key={t.value} value={t.value} style={{ background: "#0A1628" }}>{t.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Phone / WhatsApp *" error={errors.phone}>
                    <input
                      type="tel" value={form.phone} placeholder="+20 10 0000 0000"
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.phone ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.phone))}
                    />
                  </Field>

                  <Field label="Email Address *" error={errors.email}>
                    <input
                      type="email" value={form.email} placeholder="you@example.com"
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.email ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.email))}
                    />
                  </Field>

                  <Field label="Business Name">
                    <input
                      type="text" value={form.businessName} placeholder="Your business name"
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      style={inputStyle}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>

                  <Field label="City">
                    <input
                      type="text" value={form.city} placeholder="Cairo, Alexandria…"
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      style={inputStyle}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>
                </div>

                <Field label="Message (optional)">
                  <textarea
                    value={form.message} rows={3}
                    placeholder="Tell us a bit about your business…"
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: "none" }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                  />
                </Field>

                {status === "error" && (
                  <p style={{ marginTop: 12, fontSize: 13, color: "#F87171", textAlign: "center" }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    marginTop: 20, width: "100%", padding: "14px",
                    background: status === "loading" ? "#1D4ED8" : "#2563EB",
                    color: "white", border: "none",
                    borderRadius: 10, fontSize: 15, fontWeight: 600,
                    cursor: status === "loading" ? "default" : "pointer",
                    fontFamily: "inherit", transition: "background 0.2s",
                    opacity: status === "loading" ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (status !== "loading") e.currentTarget.style.background = "#1D4ED8"; }}
                  onMouseLeave={e => { if (status !== "loading") e.currentTarget.style.background = "#2563EB"; }}
                >
                  {status === "loading" ? "Sending…" : "Request a Demo →"}
                </button>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, marginTop: 14,
                }}>
                  <Lock size={11} color="#334155" />
                  <span style={{ color: "#334155", fontSize: 12 }}>
                    We respect your privacy. Your information is safe with us.
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
