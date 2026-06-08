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

type BusinessType = "gaming_lounge" | "coworking" | "cafe" | "restaurant" | "other";

export function DemoFormSection({ t, lang }: DemoFormSectionProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "" as BusinessType | "",
    city: "",
    message: "",
    _honey: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useCreateLead();

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = t("form_error_required");
    if (!form.email.includes("@")) errors.email = t("form_error_email");
    if (!form.phone.trim()) errors.phone = t("form_error_required");
    if (!form.company.trim()) errors.company = t("form_error_required");
    if (!form.businessType) errors.businessType = t("form_error_required");
    if (!form.city.trim()) errors.city = t("form_error_required");
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

    mutation.mutate(
      {
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          businessType: form.businessType as BusinessType,
          city: form.city,
          _honey: form._honey,
        } as any,
      },
      { onSuccess: () => setSubmitted(true) }
    );
  }

  const inputBase =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";
  const labelBase = "block text-xs font-semibold mb-1.5 text-slate-600 uppercase tracking-wide";
  const errorBase = "mt-1 text-xs text-red-500";

  return (
    <section id="demo" className="py-20 sm:py-28 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("form_headline")}
          </h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto">
            {t("form_subheadline")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-6 sm:p-8 border border-slate-200"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
        >
          {submitted ? (
            <div className="text-center py-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#f0fdf4", border: "2px solid #86efac" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t("form_success_title")}
              </h3>
              <p className="text-slate-500">{t("form_success_desc")}</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className={labelBase}>{t("form_name")}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${inputBase} ${fieldErrors.name ? "border-red-400" : "border-slate-200"}`}
                    placeholder={lang === "ar" ? "الاسم الكامل" : "Your full name"}
                  />
                  {fieldErrors.name && <p className={errorBase}>{fieldErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={labelBase}>{t("form_email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`${inputBase} ${fieldErrors.email ? "border-red-400" : "border-slate-200"}`}
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && <p className={errorBase}>{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={labelBase}>{t("form_phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`${inputBase} ${fieldErrors.phone ? "border-red-400" : "border-slate-200"}`}
                    placeholder="+20 10 0000 0000"
                  />
                  {fieldErrors.phone && <p className={errorBase}>{fieldErrors.phone}</p>}
                </div>

                {/* Company */}
                <div>
                  <label className={labelBase}>{t("form_company")}</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={`${inputBase} ${fieldErrors.company ? "border-red-400" : "border-slate-200"}`}
                    placeholder={lang === "ar" ? "اسم النشاط التجاري" : "Your business name"}
                  />
                  {fieldErrors.company && <p className={errorBase}>{fieldErrors.company}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label className={labelBase}>{t("form_business_type")}</label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value as BusinessType | "" })}
                    className={`${inputBase} ${fieldErrors.businessType ? "border-red-400" : "border-slate-200"}`}
                    style={{ color: form.businessType ? "#0f172a" : "#94a3b8" }}
                  >
                    <option value="" disabled>
                      {lang === "ar" ? "اختر نوع النشاط" : "Select type…"}
                    </option>
                    {BUSINESS_TYPES.map(({ value, labelKey }) => (
                      <option key={value} value={value} style={{ color: "#0f172a" }}>
                        {t(labelKey)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.businessType && <p className={errorBase}>{fieldErrors.businessType}</p>}
                </div>

                {/* City */}
                <div>
                  <label className={labelBase}>{t("form_city")}</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`${inputBase} ${fieldErrors.city ? "border-red-400" : "border-slate-200"}`}
                    placeholder={lang === "ar" ? "المدينة" : "Cairo, Alexandria…"}
                  />
                  {fieldErrors.city && <p className={errorBase}>{fieldErrors.city}</p>}
                </div>

                {/* Message — full width */}
                <div className="sm:col-span-2">
                  <label className={labelBase}>{t("form_message")}</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${inputBase} resize-none border-slate-200`}
                    placeholder={lang === "ar" ? "أي تفاصيل إضافية..." : "Any additional details…"}
                  />
                </div>
              </div>

              {mutation.isError && (
                <p className="mt-4 text-sm text-red-500 text-center">{t("form_error_server")}</p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-6 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#3b82f6", boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
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
