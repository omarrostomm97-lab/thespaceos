import { useState, useRef, useCallback } from "react";
import { useLang } from "@/hooks/use-language";
import { guideModules, type ModuleGuide, type GuideRole } from "@/lib/guide-content";
import {
  BookOpen, Search, ChevronDown, ChevronUp, Copy, Check,
  FileText, Video, FileDown, Printer, Filter, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LangFilter = "both" | "en" | "ar";
type RoleFilter = "all" | GuideRole;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);
  return (
    <button
      onClick={handle}
      title={copied ? "Copied!" : "Copy"}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all shrink-0",
        copied
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : "bg-muted/60 text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GuideBlock({
  label,
  content,
  dir: blockDir,
}: {
  label: string;
  content: string | string[];
  dir: "ltr" | "rtl";
}) {
  const text = Array.isArray(content) ? content.join("\n• ") : content;
  const displayText = Array.isArray(content)
    ? "• " + content.join("\n• ")
    : content;

  return (
    <div className="space-y-1" dir={blockDir}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <CopyButton text={displayText} />
      </div>
      <div
        className="text-sm leading-relaxed rounded-xl p-3 whitespace-pre-line"
        style={{
          background: "var(--sb-glass-bg)",
          border: "1px solid var(--sb-glass-border)",
          color: "hsl(var(--foreground))",
        }}
      >
        {Array.isArray(content) ? (
          <ul className="space-y-1 list-none">
            {content.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function VideoScriptTable({ module, showEN, showAR }: { module: ModuleGuide; showEN: boolean; showAR: boolean }) {
  return (
    <div className="space-y-3">
      {module.videoScript.map((scene) => (
        <div
          key={scene.scene}
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--card-border))",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: "rgba(0,111,238,0.2)", color: "#006FEE" }}
            >
              {scene.scene}
            </span>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scene {scene.scene}</p>
          </div>
          <div className="grid gap-3">
            {showEN && (
              <div dir="ltr">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Voiceover EN</p>
                  <CopyButton text={scene.voiceoverEN} />
                </div>
                <p
                  className="text-sm leading-relaxed rounded-lg p-2.5"
                  style={{ background: "rgba(0,111,238,0.07)", border: "1px solid rgba(0,111,238,0.15)" }}
                >
                  {scene.voiceoverEN}
                </p>
              </div>
            )}
            {showAR && (
              <div dir="rtl">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">تعليق صوتي AR</p>
                  <CopyButton text={scene.voiceoverAR} />
                </div>
                <p
                  className="text-sm leading-relaxed rounded-lg p-2.5"
                  style={{ background: "rgba(23,201,100,0.07)", border: "1px solid rgba(23,201,100,0.15)" }}
                >
                  {scene.voiceoverAR}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Screen Action</p>
                <CopyButton text={scene.screenAction} />
              </div>
              <p
                className="text-sm leading-relaxed rounded-lg p-2.5 italic"
                style={{ background: "rgba(245,165,36,0.07)", border: "1px solid rgba(245,165,36,0.15)", color: "hsl(var(--muted-foreground))" }}
              >
                {scene.screenAction}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleCard({
  module,
  langFilter,
}: {
  module: ModuleGuide;
  langFilter: LangFilter;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"guide" | "video">("guide");

  const showEN = langFilter === "both" || langFilter === "en";
  const showAR = langFilter === "both" || langFilter === "ar";

  const SECTION_LABELS_EN: Record<string, string> = {
    overview: "Overview",
    steps: "Step-by-Step",
    buttons: "Buttons & Actions",
    fields: "Fields",
    bestPractices: "Best Practices",
    commonMistakes: "Common Mistakes",
  };
  const SECTION_LABELS_AR: Record<string, string> = {
    overview: "نظرة عامة",
    steps: "خطوات بالتفصيل",
    buttons: "الأزرار والإجراءات",
    fields: "الحقول",
    bestPractices: "أفضل الممارسات",
    commonMistakes: "الأخطاء الشائعة",
  };

  const guideKeys: (keyof typeof module.guideEN)[] = [
    "overview", "steps", "buttons", "fields", "bestPractices", "commonMistakes",
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow duration-200 card-base"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--card-border))",
      }}
    >
      {/* Card Header */}
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,111,238,0.15)", color: "#006FEE" }}
          >
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                {module.nameEN}
              </p>
              <span className="text-muted-foreground text-xs">·</span>
              <p className="font-semibold text-sm text-muted-foreground" dir="rtl">
                {module.nameAR}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {module.descriptionEN}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1">
            {module.roles.map((r) => (
              <span
                key={r}
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(0,111,238,0.12)", color: "#006FEE" }}
              >
                {r.replace("_", " ")}
              </span>
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "hsl(var(--card-border))" }}>
          {/* Tab Bar */}
          <div className="flex gap-1 p-4 pb-0">
            <button
              onClick={() => setActiveTab("guide")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "guide"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                activeTab === "guide"
                  ? { background: "rgba(0,111,238,0.2)", border: "1px solid rgba(0,111,238,0.3)" }
                  : { border: "1px solid transparent" }
              }
            >
              <FileText className="h-3 w-3" />
              Guide
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "video"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                activeTab === "video"
                  ? { background: "rgba(245,165,36,0.2)", border: "1px solid rgba(245,165,36,0.3)" }
                  : { border: "1px solid transparent" }
              }
            >
              <Video className="h-3 w-3" />
              Video Script
            </button>
          </div>

          <div className="p-4 space-y-6">
            {activeTab === "guide" && (
              <>
                {showEN && (
                  <div dir="ltr" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: "rgba(0,111,238,0.2)" }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 shrink-0">English Guide</p>
                      <div className="h-px flex-1" style={{ background: "rgba(0,111,238,0.2)" }} />
                    </div>
                    <div className="space-y-4">
                      {guideKeys.map((key) => (
                        <GuideBlock
                          key={key}
                          label={SECTION_LABELS_EN[key]}
                          content={module.guideEN[key] as string | string[]}
                          dir="ltr"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {showAR && (
                  <div dir="rtl" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: "rgba(23,201,100,0.2)" }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 shrink-0">الدليل بالعربية</p>
                      <div className="h-px flex-1" style={{ background: "rgba(23,201,100,0.2)" }} />
                    </div>
                    <div className="space-y-4">
                      {guideKeys.map((key) => (
                        <GuideBlock
                          key={key}
                          label={SECTION_LABELS_AR[key]}
                          content={module.guideAR[key] as string | string[]}
                          dir="rtl"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "video" && (
              <VideoScriptTable module={module} showEN={showEN} showAR={showAR} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserGuideScripts() {
  const { t, dir } = useLang();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [langFilter, setLangFilter] = useState<LangFilter>("both");
  const [expandAll, setExpandAll] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = guideModules.filter((mod) => {
    const matchSearch =
      !search ||
      mod.nameEN.toLowerCase().includes(search.toLowerCase()) ||
      mod.nameAR.includes(search);
    const matchRole =
      roleFilter === "all" || mod.roles.includes(roleFilter as GuideRole);
    return matchSearch && matchRole;
  });

  const handleExportPDF = (mode: "all" | "en" | "ar" | "video") => {
    const showEN = mode === "all" || mode === "en";
    const showAR = mode === "all" || mode === "ar";
    const showGuide = mode !== "video";
    const showVideo = mode === "all" || mode === "video";

    const SECTION_LABELS_EN: Record<string, string> = {
      overview: "Overview", steps: "Step-by-Step", buttons: "Buttons & Actions",
      fields: "Fields", bestPractices: "Best Practices", commonMistakes: "Common Mistakes",
    };
    const SECTION_LABELS_AR: Record<string, string> = {
      overview: "نظرة عامة", steps: "خطوات بالتفصيل", buttons: "الأزرار والإجراءات",
      fields: "الحقول", bestPractices: "أفضل الممارسات", commonMistakes: "الأخطاء الشائعة",
    };
    const guideKeys = ["overview", "steps", "buttons", "fields", "bestPractices", "commonMistakes"] as const;

    const renderBlock = (label: string, content: string | string[], rtl: boolean) => {
      const lines = Array.isArray(content)
        ? content.map((s) => `<li style="margin-bottom:4px">${s}</li>`).join("")
        : "";
      const body = Array.isArray(content)
        ? `<ul style="margin:0;padding-inline-start:1.2em">${lines}</ul>`
        : `<p style="margin:0">${content}</p>`;
      return `<div style="margin-bottom:12px;direction:${rtl ? "rtl" : "ltr"}">
        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#666;margin:0 0 4px">${label}</p>
        <div style="background:#f5f5f5;border-radius:6px;padding:10px 12px;font-size:12px;line-height:1.6">${body}</div>
      </div>`;
    };

    const modulesHTML = filtered.map((mod) => {
      const guideEN = showGuide && showEN ? `
        <div style="margin-bottom:20px;direction:ltr">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a6fef;border-bottom:1px solid #dce8ff;padding-bottom:4px;margin-bottom:10px">English Guide</p>
          ${guideKeys.map((k) => renderBlock(SECTION_LABELS_EN[k], mod.guideEN[k] as string | string[], false)).join("")}
        </div>` : "";

      const guideAR = showGuide && showAR ? `
        <div style="margin-bottom:20px;direction:rtl">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#17a864;border-bottom:1px solid #d0f0e0;padding-bottom:4px;margin-bottom:10px">الدليل بالعربية</p>
          ${guideKeys.map((k) => renderBlock(SECTION_LABELS_AR[k], mod.guideAR[k] as string | string[], true)).join("")}
        </div>` : "";

      const videoRows = mod.videoScript.map((s) => `
        <tr>
          <td style="padding:6px 8px;border:1px solid #e0e0e0;font-weight:700;text-align:center;width:40px">${s.scene}</td>
          ${showEN ? `<td style="padding:6px 8px;border:1px solid #e0e0e0;font-size:11px;direction:ltr">${s.voiceoverEN}</td>` : ""}
          ${showAR ? `<td style="padding:6px 8px;border:1px solid #e0e0e0;font-size:11px;direction:rtl">${s.voiceoverAR}</td>` : ""}
          <td style="padding:6px 8px;border:1px solid #e0e0e0;font-size:10px;color:#666;font-style:italic">${s.screenAction}</td>
        </tr>`).join("");

      const videoScript = showVideo ? `
        <div style="margin-bottom:20px">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c47a00;border-bottom:1px solid #fde9b0;padding-bottom:4px;margin-bottom:10px">Video Script</p>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#f9f9f9">
                <th style="padding:6px 8px;border:1px solid #e0e0e0;text-align:center">#</th>
                ${showEN ? `<th style="padding:6px 8px;border:1px solid #e0e0e0;text-align:left">Voiceover EN</th>` : ""}
                ${showAR ? `<th style="padding:6px 8px;border:1px solid #e0e0e0;text-align:right">تعليق AR</th>` : ""}
                <th style="padding:6px 8px;border:1px solid #e0e0e0;text-align:left">Screen Action</th>
              </tr>
            </thead>
            <tbody>${videoRows}</tbody>
          </table>
        </div>` : "";

      return `
        <div style="page-break-inside:avoid;margin-bottom:32px;border:1px solid #e0e0e0;border-radius:8px;padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #e8eef8">
            <div>
              <h2 style="margin:0;font-size:15px;font-weight:700;color:#1a1a2e">${mod.nameEN}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:#555;direction:rtl">${mod.nameAR}</p>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
              ${mod.roles.map((r) => `<span style="font-size:8px;font-weight:700;text-transform:uppercase;padding:2px 6px;border-radius:4px;background:#e8eef8;color:#1a6fef">${r.replace("_", " ")}</span>`).join("")}
            </div>
          </div>
          ${guideEN}${guideAR}${videoScript}
        </div>`;
    }).join("");

    const modeLabel = { all: "Full Guide", en: "English Only", ar: "Arabic Only", video: "Video Scripts" }[mode];
    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>The Space OS — User Guide (${modeLabel})</title>
      <style>
        body { font-family: system-ui, -apple-system, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 24px; background: #fff; }
        @page { margin: 15mm; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>
      <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1a6fef">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#1a1a2e">The Space OS — User Guide</h1>
        <p style="margin:4px 0 0;color:#555;font-size:13px">${modeLabel} · ${filtered.length} modules · ${new Date().toLocaleDateString()}</p>
      </div>
      ${modulesHTML}
    </body></html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to export PDF."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const handleExportDocx = async () => {
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx");
      const children: InstanceType<typeof Paragraph>[] = [];

      children.push(
        new Paragraph({
          text: "The Space OS — User Guide",
          heading: HeadingLevel.TITLE,
        })
      );

      for (const mod of filtered) {
        children.push(
          new Paragraph({
            text: `${mod.nameEN} / ${mod.nameAR}`,
            heading: HeadingLevel.HEADING_1,
          })
        );

        children.push(new Paragraph({ text: "English Guide", heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Overview: ", bold: true }), new TextRun(mod.guideEN.overview)] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Steps:", bold: true })] }));
        mod.guideEN.steps.forEach((s, i) =>
          children.push(new Paragraph({ text: `${i + 1}. ${s}`, indent: { left: 360 } }))
        );
        children.push(new Paragraph({ children: [new TextRun({ text: "Best Practices:", bold: true })] }));
        mod.guideEN.bestPractices.forEach((s) =>
          children.push(new Paragraph({ text: `• ${s}`, indent: { left: 360 } }))
        );
        children.push(new Paragraph({ children: [new TextRun({ text: "Common Mistakes:", bold: true })] }));
        mod.guideEN.commonMistakes.forEach((s) =>
          children.push(new Paragraph({ text: `• ${s}`, indent: { left: 360 } }))
        );

        children.push(new Paragraph({ text: "Arabic Guide / الدليل بالعربية", heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph({ children: [new TextRun({ text: "نظرة عامة: ", bold: true }), new TextRun(mod.guideAR.overview)] }));
        children.push(new Paragraph({ children: [new TextRun({ text: "الخطوات:", bold: true })] }));
        mod.guideAR.steps.forEach((s, i) =>
          children.push(new Paragraph({ text: `${i + 1}. ${s}`, indent: { left: 360 } }))
        );

        children.push(new Paragraph({ text: "Video Script", heading: HeadingLevel.HEADING_2 }));
        mod.videoScript.forEach((scene) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `Scene ${scene.scene}: `, bold: true }), new TextRun(scene.voiceoverEN)],
              indent: { left: 360 },
            })
          );
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `المشهد ${scene.scene} (AR): `, bold: true }), new TextRun(scene.voiceoverAR)],
              indent: { left: 360 },
            })
          );
          children.push(
            new Paragraph({
              children: [new TextRun({ text: "Screen Action: ", bold: true, italics: true }), new TextRun({ text: scene.screenAction, italics: true })],
              indent: { left: 360 },
            })
          );
        });

        children.push(new Paragraph({ text: "" }));
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gaming-lounge-user-guide.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("DOCX export failed", e);
    }
  };

  const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
    { value: "all", label: t("ug_role_all") },
    { value: "owner", label: t("role_owner") },
    { value: "manager", label: t("role_manager") },
    { value: "cashier", label: t("role_cashier") },
    { value: "buffet_worker", label: t("role_buffet_worker") },
  ];

  const LANG_OPTIONS: { value: LangFilter; label: string }[] = [
    { value: "both", label: t("ug_lang_both") },
    { value: "en", label: t("ug_lang_en") },
    { value: "ar", label: t("ug_lang_ar") },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6" dir={dir} id="ug-print-root" ref={printRef}>

      {/* Page Header */}
      <div className="ug-hide-print">
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,111,238,0.25) 0%, rgba(0,111,238,0.1) 100%)",
              border: "1px solid rgba(0,111,238,0.25)",
            }}
          >
            <BookOpen className="h-5 w-5" style={{ color: "#006FEE" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              {t("ug_page_title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("ug_page_subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Export Toolbar */}
      <div className="ug-hide-print flex flex-wrap gap-2">
        <button
          onClick={() => handleExportPDF("all")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border hover:border-primary/40 hover:text-primary"
          style={{ background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <Printer className="h-3.5 w-3.5" />
          {t("ug_export_all_pdf")}
        </button>
        <button
          onClick={() => handleExportPDF("en")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border hover:border-blue-400/40 hover:text-blue-400"
          style={{ background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <Printer className="h-3.5 w-3.5" />
          {t("ug_export_en_pdf")}
        </button>
        <button
          onClick={() => handleExportPDF("ar")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border hover:border-emerald-400/40 hover:text-emerald-400"
          style={{ background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <Printer className="h-3.5 w-3.5" />
          {t("ug_export_ar_pdf")}
        </button>
        <button
          onClick={() => handleExportPDF("video")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border hover:border-amber-400/40 hover:text-amber-400"
          style={{ background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <Printer className="h-3.5 w-3.5" />
          {t("ug_export_video_pdf")}
        </button>
        <button
          onClick={handleExportDocx}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "rgba(0,111,238,0.12)",
            border: "1px solid rgba(0,111,238,0.25)",
            color: "#006FEE",
          }}
        >
          <FileDown className="h-3.5 w-3.5" />
          {t("ug_export_docx")}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="ug-hide-print flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div
          className="relative flex-1 min-w-[200px]"
        >
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ug_search_placeholder")}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-xl outline-none transition-all"
            style={{
              background: "hsl(var(--input))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRoleFilter(opt.value)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border",
                  roleFilter === opt.value
                    ? ""
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={
                  roleFilter === opt.value
                    ? { background: "rgba(0,111,238,0.15)", borderColor: "rgba(0,111,238,0.3)", color: "#006FEE" }
                    : { background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div className="flex gap-1">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLangFilter(opt.value)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border",
                langFilter === opt.value ? "" : "text-muted-foreground hover:text-foreground"
              )}
              style={
                langFilter === opt.value
                  ? { background: "rgba(23,201,100,0.15)", borderColor: "rgba(23,201,100,0.3)", color: "#17c964" }
                  : { background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Expand/Collapse all */}
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border text-muted-foreground hover:text-foreground ms-auto"
          style={{ background: "var(--sb-glass-bg)", borderColor: "hsl(var(--border))" }}
        >
          {expandAll ? t("ug_collapse_all") : t("ug_expand_all")}
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground ug-hide-print">
        {filtered.length} {t("ug_modules_count")}
      </p>

      {/* Module Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {t("no_data")}
          </div>
        ) : (
          filtered.map((mod) => (
            <ExpandableModuleCard
              key={mod.id}
              module={mod}
              langFilter={langFilter}
              forceExpand={expandAll}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ExpandableModuleCard({
  module,
  langFilter,
  forceExpand,
}: {
  module: ModuleGuide;
  langFilter: LangFilter;
  forceExpand: boolean;
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"guide" | "video">("guide");

  const expanded = forceExpand || localExpanded;

  const showEN = langFilter === "both" || langFilter === "en";
  const showAR = langFilter === "both" || langFilter === "ar";

  const SECTION_LABELS_EN: Record<string, string> = {
    overview: "Overview",
    steps: "Step-by-Step",
    buttons: "Buttons & Actions",
    fields: "Fields",
    bestPractices: "Best Practices",
    commonMistakes: "Common Mistakes",
  };
  const SECTION_LABELS_AR: Record<string, string> = {
    overview: "نظرة عامة",
    steps: "خطوات بالتفصيل",
    buttons: "الأزرار والإجراءات",
    fields: "الحقول",
    bestPractices: "أفضل الممارسات",
    commonMistakes: "الأخطاء الشائعة",
  };

  const guideKeys: (keyof typeof module.guideEN)[] = [
    "overview", "steps", "buttons", "fields", "bestPractices", "commonMistakes",
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden card-base"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--card-border))",
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-white/[0.02] transition-colors"
        onClick={() => setLocalExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,111,238,0.15)", color: "#006FEE" }}
          >
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2">
              <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
                {module.nameEN}
              </p>
              <span className="text-muted-foreground text-xs">·</span>
              <p className="font-semibold text-sm text-muted-foreground" dir="rtl">
                {module.nameAR}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {module.descriptionEN}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex gap-1 flex-wrap">
            {module.roles.map((r) => (
              <span
                key={r}
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(0,111,238,0.1)", color: "#006FEE" }}
              >
                {r.replace("_", " ")}
              </span>
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "hsl(var(--card-border))" }}>
          {/* Tab Bar */}
          <div className="flex gap-1 p-4 pb-0 ug-hide-print">
            <button
              onClick={() => setActiveTab("guide")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "guide"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                activeTab === "guide"
                  ? { background: "rgba(0,111,238,0.2)", border: "1px solid rgba(0,111,238,0.3)" }
                  : { border: "1px solid transparent" }
              }
            >
              <FileText className="h-3 w-3" />
              Guide
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === "video"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                activeTab === "video"
                  ? { background: "rgba(245,165,36,0.2)", border: "1px solid rgba(245,165,36,0.3)" }
                  : { border: "1px solid transparent" }
              }
            >
              <Video className="h-3 w-3" />
              Video Script
            </button>
          </div>

          <div className="p-4 space-y-6">
            {(activeTab === "guide") && (
              <>
                {/* English Guide */}
                {showEN && (
                  <div dir="ltr" className="space-y-4 ug-en-block ug-guide-block">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: "rgba(0,111,238,0.2)" }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 shrink-0">English Guide</p>
                      <div className="h-px flex-1" style={{ background: "rgba(0,111,238,0.2)" }} />
                    </div>
                    {guideKeys.map((key) => (
                      <GuideBlock
                        key={`en-${key}`}
                        label={SECTION_LABELS_EN[key]}
                        content={module.guideEN[key] as string | string[]}
                        dir="ltr"
                      />
                    ))}
                  </div>
                )}

                {/* Arabic Guide */}
                {showAR && (
                  <div dir="rtl" className="space-y-4 ug-ar-block ug-guide-block">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: "rgba(23,201,100,0.2)" }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 shrink-0">الدليل بالعربية</p>
                      <div className="h-px flex-1" style={{ background: "rgba(23,201,100,0.2)" }} />
                    </div>
                    {guideKeys.map((key) => (
                      <GuideBlock
                        key={`ar-${key}`}
                        label={SECTION_LABELS_AR[key]}
                        content={module.guideAR[key] as string | string[]}
                        dir="rtl"
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "video" && (
              <div className="ug-video-block">
                <VideoScriptTable module={module} showEN={showEN} showAR={showAR} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
