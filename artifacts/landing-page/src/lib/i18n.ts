export type Lang = "en" | "ar";

const translations = {
  en: {
    nav_features: "Features",
    nav_built_for: "Built For",
    nav_how_it_works: "How It Works",
    nav_demo: "Demo",
    nav_login: "Login",
    nav_request_demo: "Request a Demo",

    hero_headline: "One System. Total Control.",
    hero_subheadline: "Manage sessions, bookings, orders, staff, shifts, payments, and reports from one powerful platform.",
    hero_cta_primary: "Request a Demo",
    hero_cta_secondary: "Explore Features",

    social_proof_text: "Built for modern businesses that manage customers, bookings, staff, and daily operations.",
    sp_gaming: "Gaming Lounge",
    sp_coworking: "Coworking",
    sp_cafe: "Café",
    sp_restaurant: "Restaurant",
    sp_more: "& More",

    problems_headline: "Stop Managing Operations Manually",
    problems_subheadline: "The Space OS centralizes everything in one dashboard.",
    p1_title: "Manual Session Tracking",
    p1_desc: "Losing track of who's playing, for how long, and what they owe.",
    p2_title: "Lost or Missed Orders",
    p2_desc: "Orders falling through the cracks with no visibility into status.",
    p3_title: "Poor Staff Accountability",
    p3_desc: "No clear record of who did what, when, or why.",
    p4_title: "Difficult Shift Management",
    p4_desc: "Manual cash reconciliation and no shift history.",
    p5_title: "No Financial Visibility",
    p5_desc: "Running blind without real-time revenue and expense data.",
    p6_title: "Can't Monitor Remotely",
    p6_desc: "Owners unable to see what's happening without being on-site.",

    features_headline: "Everything You Need in One Platform",
    f1_name: "Sessions",
    f1_desc: "Start, pause, and end sessions with automatic billing.",
    f2_name: "Kitchen Display",
    f2_desc: "Real-time order routing to your kitchen staff.",
    f3_name: "Finance",
    f3_desc: "Full P&L, expenses, and revenue tracking.",
    f4_name: "Bookings",
    f4_desc: "Manage reservations, rooms, and customer check-ins.",
    f5_name: "POS",
    f5_desc: "Fast, flexible point-of-sale for any order type.",
    f6_name: "Reports",
    f6_desc: "Daily, weekly, and monthly performance dashboards.",

    built_for_headline: "Built For Your Business",
    bf1_name: "Gaming Lounges",
    bf1_desc: "Sessions, devices, buffet orders, tournaments, and revenue tracking. The complete gaming lounge management system.",
    bf2_name: "Coworking Spaces",
    bf2_desc: "Bookings, memberships, meeting rooms, and check-ins. Booking management software built for shared workspaces.",
    bf3_name: "Cafés & Coffee Shops",
    bf3_desc: "POS, orders, staff scheduling, and daily operations. Restaurant management software adapted for cafés.",
    bf4_name: "Restaurants",
    bf4_desc: "Tables, orders, kitchen workflow, and detailed reporting. Full restaurant management software in one platform.",
    bf5_name: "More Businesses",
    bf5_desc: "Any business managing customers, bookings, staff, or operations. One operations management software for all.",

    why_headline: "Why Businesses Choose The Space OS",
    w1: "Real-time operations dashboard",
    w2: "Arabic & English support",
    w3: "Multi-location ready",
    w4: "Staff roles & permissions",
    w5: "Sessions, POS, bookings & finance in one platform",
    w6: "Mobile-friendly management",

    how_headline: "Up and Running in 3 Steps",
    how1_title: "Sign Up",
    how1_desc: "Create your account and set up your business profile.",
    how2_title: "Set Up Your Space",
    how2_desc: "Add your rooms, staff, menu items, and settings.",
    how3_title: "Go Live",
    how3_desc: "Start taking sessions, orders, and bookings immediately.",

    form_headline: "Request a Demo",
    form_subheadline: "See The Space OS in action. Fill in your details and we'll reach out within 24 hours.",
    form_name: "Full Name",
    form_email: "Email Address",
    form_phone: "Phone Number",
    form_company: "Business Name",
    form_business_type: "Business Type",
    form_city: "City",
    form_submit: "Request Demo",
    form_submitting: "Sending...",
    form_success_title: "Request Received!",
    form_success_desc: "We'll be in touch within 24 hours.",
    bt_gaming: "Gaming Lounge",
    bt_coworking: "Coworking Space",
    bt_cafe: "Café / Coffee Shop",
    bt_restaurant: "Restaurant",
    bt_other: "Other",

    footer_slogan: "The Space OS — One System. Total Control.",
    footer_copyright: "© 2025 The Space OS. All rights reserved.",
    footer_features: "Features",
    footer_built_for: "Built For",
    footer_how: "How It Works",
    footer_demo: "Request Demo",

    hero_badge: "Operations Management Platform",
    kpi_sessions: "Active Sessions",
    kpi_revenue: "Revenue Today",
    kpi_orders: "Pending Orders",
    kpi_staff: "Staff on Shift",
    mockup_active: "Active",
    form_error_required: "Required",
    form_error_email: "Invalid email",
    form_error_server: "Something went wrong. Please try again.",
  },
  ar: {
    nav_features: "الميزات",
    nav_built_for: "مناسب لـ",
    nav_how_it_works: "كيف يعمل",
    nav_demo: "طلب عرض",
    nav_login: "تسجيل الدخول",
    nav_request_demo: "طلب عرض تجريبي",

    hero_headline: "نظام واحد. تحكم كامل.",
    hero_subheadline: "أدِر الجلسات والحجوزات والطلبات والموظفين والورديات والمدفوعات والتقارير من منصة واحدة قوية.",
    hero_cta_primary: "طلب عرض تجريبي",
    hero_cta_secondary: "استكشف الميزات",

    social_proof_text: "مصمم للأعمال الحديثة التي تدير عملاءها وحجوزاتها وموظفيها وعملياتها اليومية.",
    sp_gaming: "قاعات الألعاب",
    sp_coworking: "مساحات العمل",
    sp_cafe: "كافيهات",
    sp_restaurant: "مطاعم",
    sp_more: "والمزيد",

    problems_headline: "توقف عن الإدارة اليدوية",
    problems_subheadline: "The Space OS يجمع كل شيء في لوحة تحكم واحدة.",
    p1_title: "تتبع الجلسات يدوياً",
    p1_desc: "فقدان السيطرة على من يلعب ومدة اللعب والمبالغ المستحقة.",
    p2_title: "طلبات ضائعة أو فائتة",
    p2_desc: "طلبات تسقط دون متابعة أو وضوح في حالتها.",
    p3_title: "ضعف مساءلة الموظفين",
    p3_desc: "لا سجل واضح لمن فعل ماذا ومتى ولماذا.",
    p4_title: "إدارة ورديات صعبة",
    p4_desc: "تسوية نقدية يدوية وغياب تاريخ الورديات.",
    p5_title: "لا وضوح مالي",
    p5_desc: "العمل دون بيانات إيرادات ومصروفات فورية.",
    p6_title: "لا مراقبة عن بُعد",
    p6_desc: "المالك لا يرى ما يحدث بدون وجوده في المكان.",

    features_headline: "كل ما تحتاجه في منصة واحدة",
    f1_name: "الجلسات",
    f1_desc: "بدء الجلسات وإيقافها وإنهاؤها مع الفوترة التلقائية.",
    f2_name: "شاشة المطبخ",
    f2_desc: "توجيه الطلبات الفوري لموظفي المطبخ.",
    f3_name: "المالية",
    f3_desc: "تتبع كامل للأرباح والخسائر والمصروفات والإيرادات.",
    f4_name: "الحجوزات",
    f4_desc: "إدارة الحجوزات والغرف وتسجيلات العملاء.",
    f5_name: "نقطة البيع",
    f5_desc: "نقطة بيع سريعة ومرنة لكل أنواع الطلبات.",
    f6_name: "التقارير",
    f6_desc: "لوحات أداء يومية وأسبوعية وشهرية.",

    built_for_headline: "مصمم لعملك",
    bf1_name: "قاعات الألعاب",
    bf1_desc: "جلسات، أجهزة، طلبات بوفيه، بطولات، وتتبع الإيرادات. نظام إدارة قاعات البلايستيشن الشامل.",
    bf2_name: "مساحات العمل المشتركة",
    bf2_desc: "حجوزات، عضويات، غرف اجتماعات، وتسجيل الدخول. برنامج إدارة الحجوزات لمساحات العمل المشتركة.",
    bf3_name: "كافيهات ومحلات القهوة",
    bf3_desc: "نقطة بيع، طلبات، جدولة الموظفين، والعمليات اليومية. برنامج إدارة الكافيهات الشامل.",
    bf4_name: "مطاعم",
    bf4_desc: "طاولات، طلبات، سير عمل المطبخ، وتقارير مفصلة. برنامج إدارة المطاعم في منصة واحدة.",
    bf5_name: "أعمال أخرى",
    bf5_desc: "أي نشاط تجاري يدير عملاء أو حجوزات أو موظفين أو عمليات. برنامج إدارة الأعمال لكل قطاع.",

    why_headline: "لماذا تختار الأعمال The Space OS",
    w1: "لوحة عمليات فورية",
    w2: "دعم العربية والإنجليزية",
    w3: "جاهز لمتعدد الفروع",
    w4: "أدوار وصلاحيات الموظفين",
    w5: "جلسات، POS، حجوزات، ومالية في منصة واحدة",
    w6: "إدارة متوافقة مع الجوال",

    how_headline: "جاهز للعمل في 3 خطوات",
    how1_title: "إنشاء الحساب",
    how1_desc: "أنشئ حسابك وأعد ملف تعريف نشاطك التجاري.",
    how2_title: "أعد مساحتك",
    how2_desc: "أضف غرفك، موظفيك، قائمة طعامك، وإعداداتك.",
    how3_title: "ابدأ العمل",
    how3_desc: "ابدأ فوراً في استقبال الجلسات والطلبات والحجوزات.",

    form_headline: "طلب عرض تجريبي",
    form_subheadline: "شاهد The Space OS في الواقع. أكمل بياناتك وسنتواصل معك خلال 24 ساعة.",
    form_name: "الاسم الكامل",
    form_email: "البريد الإلكتروني",
    form_phone: "رقم الهاتف",
    form_company: "اسم النشاط التجاري",
    form_business_type: "نوع النشاط التجاري",
    form_city: "المدينة",
    form_submit: "طلب عرض تجريبي",
    form_submitting: "جاري الإرسال...",
    form_success_title: "تم استلام طلبك!",
    form_success_desc: "سنتواصل معك خلال 24 ساعة.",
    bt_gaming: "قاعة ألعاب",
    bt_coworking: "مساحة عمل مشتركة",
    bt_cafe: "كافيه / محل قهوة",
    bt_restaurant: "مطعم",
    bt_other: "أخرى",

    footer_slogan: "The Space OS — نظام واحد. تحكم كامل.",
    footer_copyright: "© 2025 The Space OS. جميع الحقوق محفوظة.",
    footer_features: "الميزات",
    footer_built_for: "مناسب لـ",
    footer_how: "كيف يعمل",
    footer_demo: "طلب عرض",

    hero_badge: "منصة إدارة العمليات",
    kpi_sessions: "الجلسات النشطة",
    kpi_revenue: "إيرادات اليوم",
    kpi_orders: "طلبات معلقة",
    kpi_staff: "موظفون في الوردية",
    mockup_active: "نشط",
    form_error_required: "مطلوب",
    form_error_email: "البريد الإلكتروني غير صالح",
    form_error_server: "حدث خطأ. حاول مرة أخرى.",
  },
};

export type TranslationKey = keyof typeof translations.en;

export function getT(lang: Lang) {
  return (key: TranslationKey): string => translations[lang][key] ?? key;
}

import { useState, useEffect, useCallback } from "react";

export function useLang() {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("space_os_lang");
    if (stored === "ar" || stored === "en") return stored;
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("space_os_lang", lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const t = getT(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return { t, lang, dir, toggleLang };
}
