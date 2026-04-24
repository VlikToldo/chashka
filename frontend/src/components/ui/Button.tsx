import { forwardRef } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost" | "ghost-danger"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    "text-xs tracking-wide uppercase bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40",
  secondary:
    "text-xs tracking-wide uppercase border border-border hover:bg-muted transition-colors disabled:opacity-40",
  danger:
    "text-xs tracking-wide uppercase bg-red-600 text-white hover:opacity-80 transition-opacity disabled:opacity-40",
  ghost:
    "text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30",
  "ghost-danger":
    "text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30",
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 rounded ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
