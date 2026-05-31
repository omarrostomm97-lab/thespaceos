import * as React from "react"
import { PopoverRoot, PopoverTrigger as HeroPopoverTrigger, PopoverContent as HeroPopoverContent, PopoverDialog } from "@heroui/react"
import { cn } from "@/lib/utils"

const Popover = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof PopoverRoot>) => (
  <PopoverRoot {...(props as any)}>{children}</PopoverRoot>
)

const PopoverTrigger = ({ children, asChild, ...props }: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) => (
  <HeroPopoverTrigger {...(props as any)}>{children}</HeroPopoverTrigger>
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }>(
  ({ className, children, ...props }, ref) => (
    <HeroPopoverContent>
      <PopoverDialog
        ref={ref as any}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...(props as any)}
      >
        {children}
      </PopoverDialog>
    </HeroPopoverContent>
  )
)
PopoverContent.displayName = "PopoverContent"

const PopoverAnchor = ({ children }: { children: React.ReactNode }) => <>{children}</>

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
