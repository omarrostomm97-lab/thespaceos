import * as React from "react"
import { CheckboxRoot, CheckboxControl, CheckboxIndicator } from "@heroui/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof CheckboxRoot> & {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, checked, onCheckedChange, ...props }, ref) => (
  <CheckboxRoot
    ref={ref as any}
    isSelected={checked}
    onChange={onCheckedChange}
    className={cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-primary data-[selected]:text-primary-foreground", className)}
    {...(props as any)}
  >
    <CheckboxControl>
      <CheckboxIndicator>
        <Check className="h-4 w-4" />
      </CheckboxIndicator>
    </CheckboxControl>
  </CheckboxRoot>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
