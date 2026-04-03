import type { PropsWithChildren } from "react";
import { cn } from "../../shared/lib/utils";

type PageSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
  className?: string; // Allows for dynamic styling from outside
}>;

export function PageSection({ title, description, children, className }: PageSectionProps) {
  return (
    <section 
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 p-6 shadow-2xl transition-all",
        "bg-gradient-to-b from-[#08121c]/90 via-[#0d1c23]/84 to-[#081117]/92",
        className
      )}
    >
      {/* Dynamic Glow Overlays (Modern Glassmorphism) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.09),transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(251,191,36,0.08),transparent_32%)]" />
      </div>

      {/* Header Content */}
      <div className="relative z-10 mb-4 space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-white/90">
          {title}
        </h2>
        {description && (
          <p className="max-w-[760px] text-sm leading-relaxed text-white/60">
            {description}
          </p>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}