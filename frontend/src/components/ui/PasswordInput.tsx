import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required,
  autoComplete,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center border-b border-border focus-within:border-foreground transition-colors">
      <input
        type={show ? "text" : "password"}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-2 text-sm outline-none"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((p) => !p)}
        className="shrink-0 ml-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        aria-label={show ? "Сховати пароль" : "Показати пароль"}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}
