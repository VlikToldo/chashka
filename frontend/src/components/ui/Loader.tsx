export default function Loader({ className }: { className?: string }) {
  return (
    <div
      className={`flex justify-center items-center py-12 ${className ?? ""}`}
    >
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-foreground animate-spin" />
    </div>
  );
}
