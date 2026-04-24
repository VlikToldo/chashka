import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LocalizedString } from "../../types/menu";
import { useLanguage } from "../../context/LanguageContext";
import type { Lang } from "../../i18n/translations";

const ALL_KEYS: Lang[] = ["es", "uk", "en"];
const LANG_LABEL: Record<Lang, string> = { es: "ES", uk: "UA", en: "EN" };

interface Props {
  label: string;
  value: LocalizedString;
  onChange: (val: LocalizedString) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}

export default function LocalizedInput({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  rows = 3,
  required = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();

  const baseClass =
    "flex-1 bg-transparent border-b border-border py-1.5 text-sm outline-none focus:border-foreground transition-colors";

  const secondaryLangs = ALL_KEYS.filter((k) => k !== lang) as Lang[];
  const hasSecondaryValues = secondaryLangs.some((k) => value[k]?.trim());

  const handleBlur = (key: Lang) => {
    const trimmed = value[key]?.trimEnd() ?? "";
    if (trimmed !== value[key]) onChange({ ...value, [key]: trimmed });
  };

  const renderField = (key: Lang, isPrimary = false) => {
    const langLabel = LANG_LABEL[key];
    const labelClass = isPrimary
      ? "text-[10px] w-6 pt-2 text-foreground/70 font-medium uppercase shrink-0"
      : "text-[10px] w-6 pt-2 text-muted-foreground/60 uppercase shrink-0";

    return multiline ? (
      <div key={key} className="flex items-start gap-2 flex-1">
        <span className={labelClass}>{langLabel}</span>
        <textarea
          rows={rows}
          required={isPrimary && required}
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          onBlur={() => handleBlur(key)}
          placeholder={`${placeholder} (${langLabel})`}
          className={`${baseClass} resize-none`}
        />
      </div>
    ) : (
      <div key={key} className="flex items-center gap-2 flex-1">
        <span className={labelClass}>{langLabel}</span>
        <input
          required={isPrimary && required}
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          onBlur={() => handleBlur(key)}
          placeholder={`${placeholder} (${langLabel})`}
          className={baseClass}
        />
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <label className="text-xs tracking-wide uppercase text-muted-foreground">
        {label}
      </label>

      {/* Primary: current UI language */}
      {renderField(lang, true)}

      {/* Expand toggle — below primary */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1.5 pl-8 text-[10px] tracking-widest uppercase text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors"
      >
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
        <span>{secondaryLangs.map((k) => LANG_LABEL[k]).join(" · ")}</span>
        {hasSecondaryValues && !expanded && (
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
        )}
      </button>

      {/* Secondary: the other two languages */}
      {expanded && (
        <div className="space-y-2 border-l border-border/50 pl-4 ml-6 mt-0.5">
          {secondaryLangs.map((key) => renderField(key))}
        </div>
      )}
    </div>
  );
}
