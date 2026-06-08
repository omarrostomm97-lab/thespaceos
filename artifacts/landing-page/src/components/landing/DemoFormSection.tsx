import { useState } from "react";
import { motion } from "framer-motion";
import { useCreateLead } from "@workspace/api-client-react";
import type { TranslationKey } from "@/lib/i18n";

interface DemoFormSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
  lang: string;
}

const BUSINESS_TYPES = [
  { value: "gaming_lounge", labelKey: "bt_gaming" as TranslationKey },
  { value: "coworking", labelKey: "bt_coworking" as TranslationKey },
  { value: "cafe", labelKey: "bt_cafe" as TranslationKey },
  { value: "restaurant", labelKey: "bt_restaurant" as TranslationKey },
  { value: "other", labelKey: "bt_other" as TranslationKey },
] as const;

export function DemoFormSection({ t, dir, lang }: DemoFormSectionProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "" as "gaming_lounge" | "coworking" | "cafe" | "restaurant" | "other" | "",
    city: "",
    _honey: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useCreateLead();

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Required";
    if (!form.email.includes("@")) errors.email = "Invalid email";
    if (!form.phone.trim()) errors.phone = "Required";
    if (!form.company.trim()) errors.company = "Required";
    if (!form.businessType) errors.businessType = "Required";
    if (!form.city.trim()) errors.city = "Required";
    return errors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const { _honey, ...rest } = form;
    mutation.mutate(
      {
        data: {
          ...rest,
          businessType: rest.businessType as "gaming_lounge" | "coworking" | "cafe" | "restaurant" | "other",
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 bg-white/5 border border-white/10
    focus:border-blue-500 focus:bg-white/8 placeholder-white/30
  `.trim();

  const labelClass = "block text-xs font-semibold mb-1.5 text-white/60 uppercase tracking-wide";

  return (
    <section id="demo" className="py-24" style={{ backgroundColor: "#0a1628" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("form_headline")}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
            {t("form_subheadline")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}
        >
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t("form_success_title")}
              </h3>
              <p className="text-slate-400">{t("form_success_desc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Honeypot */}
              <input
                type="text"
                name="_honey"
                value={form._honey}
                onChange={(e) => setForm({ ...form, _honey: e.target.value })}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className={labelClass}>{t("form_name")}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    placeholder={lang === "ar" ? "اسمك الكامل" : "Your full name"}
                    style={{ color: "white" }}
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>{t("form_email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    placeholder={lang === "ar" ? "بريدك الإلكتروني" : "you@example.com"}
                    style={{ color: "white" }}
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>{t("form_phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                    placeholder={lang === "ar" ? "+20 10 0000 0000" : "+20 10 0000 0000"}
                    style={{ color: "white" }}
                  />
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
                </div>

                {/* Company */}
                <div>
                  <label className={labelClass}>{t("form_company")}</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={inputClass}
                    placeholder={lang === "ar" ? "اسم نشاطك التجاري" : "Your business name"}
                    style={{ color: "white" }}
                  />
                  {fieldErrors.company && <p className="mt-1 text-xs text-red-400">{fieldErrors.company}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label className={labelClass}>{t("form_business_type")}</label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value as typeof form.businessType })}
                    className={inputClass}
                    style={{ color: form.businessType ? "white" : "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}
                  >
                    <option value="" disabled style={{ color: "#64748b", background: "#1e293b" }}>
                      {lang === "ar" ? "اختر نوع النشاط" : "Select type..."}
                    </option>
                    {BUSINESS_TYPES.map(({ value, labelKey }) => (
                      <option key={value} value={value} style={{ color: "white", background: "#1e293b" }}>
                        {t(labelKey)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.businessType && <p className="mt-1 text-xs text-red-400">{fieldErrors.businessType}</p>}
                </div>

                {/* City */}
                <div>
                  <label className={labelClass}>{t("form_city")}</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputClass}
                    placeholder={lang === "ar" ? "المدينة" : "Cairo, Alexandria..."}
                    style={{ color: "white" }}
                  />
                  {fieldErrors.city && <p className="mt-1 text-xs text-red-400">{fieldErrors.city}</p>}
                </div>
              </div>

              {mutation.isError && (
                <p className="mt-4 text-sm text-red-400 text-center">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-8 w-full py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:shadow-blue-500/30 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: mutation.isPending ? "#1d4ed8" : "#3b82f6" }}
              >
                {mutation.isPending ? t("form_submitting") : t("form_submit")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
