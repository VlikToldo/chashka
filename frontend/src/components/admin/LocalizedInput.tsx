import type { LocalizedString } from "../../types/menu";

const LANGS = [
  { key: "uk" as const, label: "UA" },
  { key: "en" as const, label: "EN" },
  { key: "es" as const, label: "ES" },
];

interface Props {
  label: string;
  value: LocalizedString;
  onChange: (val: LocalizedString) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export default function LocalizedInput({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  required = false,
}: Props) {
  const baseClass =
    "flex-1 bg-transparent border-b border-border py-1.5 text-sm outline-none focus:border-foreground transition-colors";

  return (
    <div className="space-y-1.5">
      <label className="text-xs tracking-wide uppercase text-muted-foreground">
        {label}
      </label>
      <div className="space-y-1">
        {LANGS.map(({ key, label: langLabel }) =>
          multiline ? (
            <div key={key} className="flex items-start gap-2">
              <span className="text-[10px] w-6 pt-2 text-muted-foreground/60 uppercase shrink-0">
                {langLabel}
              </span>
              <textarea
                rows={2}
                required={required && key === "uk"}
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                placeholder={`${placeholder} (${langLabel})`}
                className={`${baseClass} resize-none`}
              />
            </div>
          ) : (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] w-6 text-muted-foreground/60 uppercase shrink-0">
                {langLabel}
              </span>
              <input
                required={required && key === "uk"}
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                placeholder={`${placeholder} (${langLabel})`}
                className={baseClass}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
