import * as React from "react"
import { Chip } from "@heroui/react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const colorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    default: "primary",
    secondary: "secondary",
    destructive: "danger",
    outline: "default",
  }
  const variantMap: Record<string, "solid" | "flat" | "bordered" | "light" | "ghost" | "shadow" | "faded" | "dot"> = {
    default: "flat",
    secondary: "flat",
    destructive: "solid",
    outline: "bordered",
  }

  return (
    <Chip
      size="sm"
      color={colorMap[variant] ?? "default"}
      variant={variantMap[variant] ?? "flat"}
      className={cn("text-xs font-semibold", className)}
      {...(props as any)}
    >
      {children}
    </Chip>
  )
}

export { Badge }
