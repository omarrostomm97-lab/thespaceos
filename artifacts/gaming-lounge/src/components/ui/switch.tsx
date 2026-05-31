import * as React from "react"
import { Switch as HeroSwitch, SwitchControl, SwitchThumb } from "@heroui/react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Switch = React.forwardRef<HTMLElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className, id }, ref) => (
    <HeroSwitch
      isSelected={checked}
      onChange={onCheckedChange}
      isDisabled={disabled}
      className={cn("gap-2", className)}
      id={id}
    >
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
    </HeroSwitch>
  )
)
Switch.displayName = "Switch"

export { Switch }
