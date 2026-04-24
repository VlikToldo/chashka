export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium tracking-wide uppercase border-b border-border pb-2 mb-4">
      {children}
    </h3>
  )
}
