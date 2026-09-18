import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "subtle";
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200",
          variant === "default" && "btn-gradient",
          variant === "subtle" && "glass-subtle text-foreground hover:shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);

GradientButton.displayName = "GradientButton";
