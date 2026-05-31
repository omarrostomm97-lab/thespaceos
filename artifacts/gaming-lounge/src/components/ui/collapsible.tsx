import * as React from "react"
import { DisclosureRoot, DisclosureTrigger, DisclosureContent } from "@heroui/react"
import { cn } from "@/lib/utils"

const Collapsible = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DisclosureRoot>>(
  ({ className, ...props }, ref) => (
    <DisclosureRoot ref={ref as any} className={cn(className)} {...(props as any)} />
  )
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <DisclosureTrigger ref={ref as any} className={cn(className)} {...(props as any)}>
      {children}
    </DisclosureTrigger>
  )
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <DisclosureContent ref={ref as any} className={cn(className)} {...(props as any)}>
      {children}
    </DisclosureContent>
  )
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
