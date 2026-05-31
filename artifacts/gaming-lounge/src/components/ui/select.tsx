import * as React from "react"
import {
  Select as SelectRoot,
  SelectTrigger as HeroSelectTrigger,
  SelectValue as HeroSelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
} from "@heroui/react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

const Select = ({ value, onValueChange, defaultValue, disabled, children, className, ...props }: SelectProps) => (
  <SelectRoot
    selectedKey={value ?? null}
    onSelectionChange={(key) => key !== null && onValueChange?.(String(key))}
    defaultSelectedKey={defaultValue}
    isDisabled={disabled}
    className={cn("w-full", className)}
    {...(props as any)}
  >
    {children}
  </SelectRoot>
)
Select.displayName = "Select"

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
  ({ className, placeholder, ...props }, ref) => (
    <HeroSelectValue
      className={cn("flex-1 text-start data-[placeholder]:text-muted-foreground", className)}
      {...(props as any)}
    >
      {({ selectedItem }) =>
        selectedItem ? null : <span className="text-muted-foreground">{placeholder}</span>
      }
    </HeroSelectValue>
  )
)
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroSelectTrigger
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...(props as any)}
    >
      {children}
      <SelectIndicator className="opacity-50" />
    </HeroSelectTrigger>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <SelectPopover
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...(props as any)}
    >
      <ListBox className="p-1 outline-none">
        {children}
      </ListBox>
    </SelectPopover>
  )
)
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  )
)
SelectLabel.displayName = "SelectLabel"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => (
    <ListBoxItem
      id={value}
      isDisabled={disabled}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        className
      )}
      {...(props as any)}
    >
      {children}
    </ListBoxItem>
  )
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  )
)
SelectSeparator.displayName = "SelectSeparator"

const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
