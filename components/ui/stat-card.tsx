import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const statCardVariants = cva("rounded-xl p-6 transition-all hover:shadow-md", {
  variants: {
    variant: {
      primary:
        "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30",
      secondary:
        "bg-secondary/10 dark:bg-secondary/20 border border-secondary/20 dark:border-secondary/30",
      tertiary:
        "bg-tertiary/10 dark:bg-tertiary/20 border border-tertiary/20 dark:border-tertiary/30",
      success:
        "bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30",
      neutral: "bg-neutral border border-border",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface StatCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, label, value, trend, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              {label}
            </p>
            <p className="text-foreground text-3xl font-bold tracking-tight">
              {value}
            </p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="text-success h-4 w-4" />
                ) : (
                  <TrendingDown className="text-error h-4 w-4" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-success" : "text-error"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          {icon && <div className="ml-4 opacity-60">{icon}</div>}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
