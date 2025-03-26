
import * as React from "react"

import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge(
  { className, variant = "default", ...props }: BadgeProps
) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "text-foreground border border-input",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variantClasses[variant],
      className
    )} {...props} />
  )
}

export { Badge }
