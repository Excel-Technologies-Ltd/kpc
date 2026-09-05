import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#33c9b7]/20 text-[#33c9b7] border-[#33c9b7]/40",
        secondary:
          "border-transparent bg-[#182746] text-[#8aa0c0] border-[#233252]",
        destructive:
          "border-transparent bg-[#e5555c]/20 text-[#e5555c] border-[#e5555c]/40",
        outline: "text-[#8aa0c0] border-[#233252]",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        warning:
          "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
