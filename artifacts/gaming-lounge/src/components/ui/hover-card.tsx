import * as React from "react"
import { PopoverRoot, PopoverTrigger as HeroPopoverTrigger, PopoverContent as HeroPopoverContent, PopoverDialog } from "@heroui/react"
import { cn } from "@/lib/utils"

const HoverCard = ({ children, ...props }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <PopoverRoot {...(props as any)}>{children}</PopoverRoot>
)

const HoverCardTrigger = ({ children, asChild, ...props }: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) => (
  <HeroPopoverTrigger {...(props as any)}>{children}</HeroPopoverTrigger>
)
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }>(
  ({ className, children, ...props }, ref) => (
    <HeroPopoverContent>
      <PopoverDialog
        ref={ref as any}
        className={cn("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)}
        {...(props as any)}
      >
        {children}
      </PopoverDialog>
    </HeroPopoverContent>
  )
)
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
