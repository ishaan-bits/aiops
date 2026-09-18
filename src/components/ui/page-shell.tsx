import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  spaced?: boolean;
}

export const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, spaced = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spaced && "space-y-6", className)}
        {...props}
      />
    );
  }
);

PageShell.displayName = "PageShell";
