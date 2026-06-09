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

const DEMO_BENEFITS = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    text: "Live walkthrough of your exact business type",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    text: "Custom pricing based on your business size",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    text: "Full onboarding support from day one",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    text: "No commitment — just a conversation",
  },
];

export function DemoFormSection({ t, dir, lang }: DemoFormSectionProps) {
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
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";
  const labelBase = "block text-xs font-semibold mb-1.5 text-slate-600 uppercase tracking-wide";
  const errorBase = "mt-1 text-xs text-red-500";

  return (
    <section id="demo" className="py-24 sm:py-32 bg-[#f8fafc] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className={`flex flex-col lg:flex-row gap-16 lg:gap-20 items-start ${dir === "rtl" ? "lg:flex-row-reverse" : ""}`}>

          {/* ── Left: Headline + Benefits ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className={`lg:w-[40%] flex-shrink-0 ${dir === "rtl" ? "text-right" : "text-left"}`}
          >
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-600 mb-4">
              {t("eyebrow_demo")}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
              {t("form_headline")}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-10">
              {t("form_subheadline")}
            </p>

            {/* Benefits list */}
            <div className="space-y-4">
              {DEMO_BENEFITS.map((b, i) => (
                <div key={i} className={`flex items-start gap-3 ${dir === "rtl" ? "flex-row-reverse" : ""}`}>
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {b.icon}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div className="mt-10 flex items-center gap-2.5 text-xs text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Your info is private and never shared.</span>
            </div>
          </motion.div>

          {/* ── Right: Form card ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:flex-1 w-full"
          >
            <div className="bg-white rounded-3xl demo-card border border-slate-200/60 p-8 sm:p-10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-emerald-50 border-2 border-emerald-200">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
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
                    className="hidden"
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
                        className={`${inputBase} ${fieldErrors.businessType ? "border-red-400" : "border-slate-200"} ${form.businessType ? "text-slate-900" : "text-slate-400"}`}
                      >
                        <option value="" disabled>
                          {lang === "ar" ? "اختر نوع النشاط" : "Select type…"}
                        </option>
                        {BUSINESS_TYPES.map(({ value, labelKey }) => (
                          <option key={value} value={value} className="text-slate-900">
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

                    {/* Message */}
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
                    className="mt-6 w-full py-4 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                  >
                    {mutation.isPending ? t("form_submitting") : t("form_submit")}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
