import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: "h-8 w-8", iconInner: "h-4 w-4", text: "text-lg" },
  md: { icon: "h-9 w-9", iconInner: "h-5 w-5", text: "text-xl" },
  lg: { icon: "h-10 w-10", iconInner: "h-5 w-5", text: "text-xl" },
};

export function BrandLogo({
  size = "md",
  showIcon = true,
  className,
}: BrandLogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {showIcon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
            s.icon
          )}
        >
          <Package className={cn("text-white", s.iconInner)} />
        </div>
      )}
      <span className={cn("font-bold tracking-tight", s.text)}>
        Pinoy<span className="text-indigo-500">Stock</span>
      </span>
    </span>
  );
}
