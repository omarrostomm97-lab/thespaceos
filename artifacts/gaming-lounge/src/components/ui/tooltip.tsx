import * as React from "react"
import { TooltipRoot, TooltipContent as HeroTooltipContent } from "@heroui/react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode; delayDuration?: number }) => (
  <>{children}</>
)

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <TooltipRoot>{children}</TooltipRoot>
)

const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => (
  <>{children}</>
)

type Side = "top" | "right" | "bottom" | "left"

const placementMap: Record<Side, string> = {
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
  side?: Side
  align?: string
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, sideOffset, side, ...props }, ref) => (
    <HeroTooltipContent
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
        className
      )}
      offset={sideOffset}
      placement={side ? (placementMap[side] as any) : undefined}
      {...(props as any)}
    >
      {children}
    </HeroTooltipContent>
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
