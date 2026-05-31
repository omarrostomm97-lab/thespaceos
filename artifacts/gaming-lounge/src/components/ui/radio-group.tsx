import * as React from "react"
import { RadioGroupRoot, RadioRoot, RadioControl, RadioIndicator } from "@heroui/react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof RadioGroupRoot>>(
  ({ className, ...props }, ref) => (
    <RadioGroupRoot
      ref={ref as any}
      className={cn("grid gap-2", className)}
      {...(props as any)}
    />
  )
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof RadioRoot> & { value?: string }>(
  ({ className, ...props }, ref) => (
    <RadioRoot
      ref={ref as any}
      className={cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...(props as any)}
    >
      <RadioControl>
        <RadioIndicator />
      </RadioControl>
    </RadioRoot>
  )
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
