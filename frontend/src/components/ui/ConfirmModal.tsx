import { AnimatePresence, motion } from "framer-motion";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  zIndex?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = true,
  zIndex = "z-50",
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 ${zIndex} bg-foreground/20 backdrop-blur-sm`}
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed ${zIndex} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border shadow-lg px-6 py-6`}
          >
            {title && (
              <h3 className="text-base font-medium tracking-wide mb-2">
                {title}
              </h3>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {message}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1 py-2"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                onClick={onConfirm}
                className="flex-1 py-2"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
