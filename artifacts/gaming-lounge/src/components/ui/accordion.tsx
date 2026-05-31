import * as React from "react"
import {
  AccordionRoot,
  AccordionItem as HeroAccordionItem,
  AccordionTrigger as HeroAccordionTrigger,
  AccordionBody,
} from "@heroui/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof AccordionRoot>>(
  ({ className, ...props }, ref) => (
    <AccordionRoot ref={ref as any} className={cn("w-full", className)} {...(props as any)} />
  )
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string }>(
  ({ className, ...props }, ref) => (
    <HeroAccordionItem ref={ref as any} className={cn("border-b", className)} {...(props as any)} />
  )
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroAccordionTrigger
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-expanded]>svg]:rotate-180",
        className
      )}
      {...(props as any)}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </HeroAccordionTrigger>
  )
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <AccordionBody className={cn("overflow-hidden text-sm", className)} {...(props as any)}>
      <div className="pb-4 pt-0">{children}</div>
    </AccordionBody>
  )
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
