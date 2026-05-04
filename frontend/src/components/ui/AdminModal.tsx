import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  /** When true, skips the default px-6 py-5 content wrapper — use when children manage their own padding */
  noPadding?: boolean;
}

export default function AdminModal({
  title,
  onClose,
  children,
  maxWidth = "max-w-xl",
  noPadding = false,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} bg-background border border-border rounded-xl my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm tracking-[0.2em] uppercase">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {noPadding ? children : <div className="px-6 py-5">{children}</div>}
      </div>
    </div>,
    document.body,
  );
}
