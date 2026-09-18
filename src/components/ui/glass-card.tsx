import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "strong";
  noise?: boolean;
}

const variantMap = {
  default: "glass",
  subtle: "glass-subtle",
  strong: "glass-strong",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", noise = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(variantMap[variant], noise && "noise", className)}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";
