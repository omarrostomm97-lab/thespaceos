import * as React from "react"
import { Separator as HeroSeparator } from "@heroui/react"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { orientation?: "horizontal" | "vertical"; decorative?: boolean }
>(({ className, orientation = "horizontal", decorative, ...props }, ref) => (
  <HeroSeparator
    orientation={orientation}
    className={cn(
      "bg-border shrink-0",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...(props as any)}
  />
))
Separator.displayName = "Separator"

export { Separator }
