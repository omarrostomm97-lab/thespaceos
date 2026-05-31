import * as React from "react"
import { ToggleButtonGroupRoot, ToggleButtonRoot } from "@heroui/react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toggleVariants> & {
      type?: "single" | "multiple"
    }
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleButtonGroupRoot
    ref={ref as any}
    className={cn("flex items-center justify-center gap-1", className)}
    {...(props as any)}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleButtonGroupRoot>
))
ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof toggleVariants> & {
      value?: string
      pressed?: boolean
      onPressedChange?: (pressed: boolean) => void
    }
>(({ className, children, variant, size, pressed, onPressedChange, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleButtonRoot
      ref={ref as any}
      isSelected={pressed}
      onChange={onPressedChange}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...(props as any)}
    >
      {children}
    </ToggleButtonRoot>
  )
})
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
