import { useState } from "react";
import { Check, Lock } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "gaming_lounge",   label: "محل بلايستيشن / جيمينج" },
  { value: "coworking_space", label: "مساحة عمل مشتركة" },
  { value: "cafe_restaurant", label: "كافيه / مطعم" },
  { value: "other",           label: "نشاط آخر" },
] as const;

const CONTACT_METHODS = [
  { value: "call",      label: "مكالمة" },
  { value: "whatsapp",  label: "واتساب" },
  { value: "email",     label: "بريد إلكتروني" },
] as const;

const benefits = [
  { title: "عرض تجريبي مخصص", desc: "نتعرف على نشاطك واحتياجاتك بدقة." },
  { title: "مساعدة في الإعداد", desc: "نساعدك على البدء بسرعة وبدون تعقيد." },
  { title: "رد سريع", desc: "فريقنا يرد بوضوح وسرعة في أقرب وقت." },
];

type BusinessType = typeof BUSINESS_TYPES[number]["value"];
type ContactMethod = typeof CONTACT_METHODS[number]["value"];

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
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    businessType: "" as BusinessType | "",
    businessName: "",
    branchesCount: "",
    preferredContactMethod: "" as ContactMethod | "",
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
    textAlign: "right",
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "مطلوب";
    if (!form.phone.trim()) e.phone = "مطلوب";
    if (!form.businessType) e.businessType = "مطلوب";
    if (!form.businessName.trim()) e.businessName = "مطلوب";
    if (form.email && !form.email.includes("@")) e.email = "بريد إلكتروني غير صحيح";
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
      if (!res.ok) {
        setStatus("error");
        return;
      }
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

  return (
    <section id="demo" style={{
      background: "linear-gradient(160deg, #040C1B 0%, #050B18 100%)",
      padding: "96px 24px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      direction: "rtl",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="lp-demo-grid">

          {/* Right — text */}
          <div>
            <p style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              color: "#2563EB", marginBottom: 16,
            }}>شاهده بنفسك</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800,
              lineHeight: 1.15, marginBottom: 16, color: "white",
            }}>
              احجز{" "}
              <span style={{ color: "#2563EB" }}>عرضك التجريبي</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.85, marginBottom: 40, maxWidth: 380 }}>
              فريقنا سيأخذك في جولة كاملة على The Space OS، يجاوب أسئلتك،
              ويشوف كيف النظام يناسب نشاطك.
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
                    <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{b.title}</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginTop: 3 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left — form */}
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
                  تم إرسال طلبك بنجاح!
                </h3>
                <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.8 }}>
                  فريق The Space OS سيتواصل معك قريبًا.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot — hidden from humans */}
                <input
                  type="text" value={form._honey} tabIndex={-1} aria-hidden="true"
                  onChange={e => setForm({ ...form, _honey: e.target.value })}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

                  <Field label="الاسم بالكامل *" error={errors.fullName}>
                    <input
                      type="text" value={form.fullName} placeholder="اسمك بالكامل"
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.fullName ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.fullName))}
                    />
                  </Field>

                  <Field label="رقم الهاتف *" error={errors.phone}>
                    <input
                      type="tel" value={form.phone} placeholder="+20 10 0000 0000"
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.phone ? "#F87171" : "rgba(255,255,255,0.1)", direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.phone))}
                    />
                  </Field>

                  <Field label="نوع النشاط *" error={errors.businessType}>
                    <select
                      value={form.businessType}
                      onChange={e => setForm({ ...form, businessType: e.target.value as BusinessType })}
                      style={{
                        ...inputStyle, cursor: "pointer",
                        borderColor: errors.businessType ? "#F87171" : "rgba(255,255,255,0.1)",
                        color: form.businessType ? "white" : "#64748B",
                      }}
                    >
                      <option value="" disabled style={{ background: "#0A1628" }}>اختر نوع النشاط…</option>
                      {BUSINESS_TYPES.map(t => (
                        <option key={t.value} value={t.value} style={{ background: "#0A1628" }}>{t.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="اسم النشاط التجاري *" error={errors.businessName}>
                    <input
                      type="text" value={form.businessName} placeholder="اسم نشاطك"
                      onChange={e => setForm({ ...form, businessName: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.businessName ? "#F87171" : "rgba(255,255,255,0.1)" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.businessName))}
                    />
                  </Field>

                  <Field label="البريد الإلكتروني" error={errors.email}>
                    <input
                      type="email" value={form.email} placeholder="you@example.com"
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ ...inputStyle, borderColor: errors.email ? "#F87171" : "rgba(255,255,255,0.1)", direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle(errors.email))}
                    />
                  </Field>

                  <Field label="عدد الفروع أو المساحات">
                    <input
                      type="number" value={form.branchesCount} placeholder="١"
                      min="1" max="9999"
                      onChange={e => setForm({ ...form, branchesCount: e.target.value })}
                      style={{ ...inputStyle, direction: "ltr", textAlign: "left" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>
                </div>

                <Field label="طريقة التواصل المفضلة">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {CONTACT_METHODS.map(m => (
                      <button
                        key={m.value} type="button"
                        onClick={() => setForm({ ...form, preferredContactMethod: form.preferredContactMethod === m.value ? "" : m.value as ContactMethod })}
                        style={{
                          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          background: form.preferredContactMethod === m.value ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
                          border: form.preferredContactMethod === m.value ? "1px solid rgba(37,99,235,0.5)" : "1px solid rgba(255,255,255,0.1)",
                          color: form.preferredContactMethod === m.value ? "#60A5FA" : "#94A3B8",
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div style={{ marginTop: 14 }}>
                  <Field label="رسالة أو ملاحظات">
                    <textarea
                      value={form.message} rows={3}
                      placeholder="أخبرنا أي تفاصيل عن نشاطك…"
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{ ...inputStyle, resize: "none" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle())}
                    />
                  </Field>
                </div>

                {status === "error" && (
                  <p style={{ marginTop: 12, fontSize: 13, color: "#F87171", textAlign: "center" }}>
                    حدث خطأ. يرجى المحاولة مرة أخرى.
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
                  {status === "loading" ? "جاري الإرسال…" : "احجز عرض تجريبي ←"}
                </button>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, marginTop: 14,
                }}>
                  <Lock size={11} color="#334155" />
                  <span style={{ color: "#334155", fontSize: 12 }}>
                    بياناتك محمية ولن تُشارك مع أي طرف ثالث.
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
