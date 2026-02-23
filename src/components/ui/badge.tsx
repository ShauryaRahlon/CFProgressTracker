import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white/80",
        secondary: "bg-white/5 text-white/60",
        success: "bg-emerald-500/10 text-emerald-400",
        warning: "bg-amber-500/10 text-amber-400",
        div1: "bg-rose-500/10 text-rose-400",
        div2: "bg-blue-500/10 text-blue-400",
        div3: "bg-green-500/10 text-green-400",
        div4: "bg-teal-500/10 text-teal-400",
        educational: "bg-violet-500/10 text-violet-400",
        global: "bg-orange-500/10 text-orange-400",
        icpc: "bg-yellow-500/10 text-yellow-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

function getContestBadgeVariant(classification: string) {
  switch (classification) {
    case "Div. 1 + Div. 2": return "div1" as const;
    case "Div. 1": return "div1" as const;
    case "Div. 2": return "div2" as const;
    case "Div. 3": return "div3" as const;
    case "Div. 4": return "div4" as const;
    case "Educational": return "educational" as const;
    case "Global": return "global" as const;
    case "ICPC": return "icpc" as const;
    default: return "secondary" as const;
  }
}

export { Badge, badgeVariants, getContestBadgeVariant }
