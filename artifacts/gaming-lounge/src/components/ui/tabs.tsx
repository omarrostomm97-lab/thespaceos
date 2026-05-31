import * as React from "react"
import { TabsRoot, TabList, Tab, TabPanel } from "@heroui/react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsRoot
      defaultSelectedKey={defaultValue}
      selectedKey={value}
      onSelectionChange={(key) => onValueChange?.(String(key))}
      className={cn("w-full", className)}
    >
      {children}
    </TabsRoot>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <TabList
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...(props as any)}
    >
      {children}
    </TabList>
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps {
  value: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

function TabsTrigger({ value, className, children, disabled }: TabsTriggerProps) {
  return (
    <Tab
      id={value}
      isDisabled={disabled}
      {...({
        className: ({ isSelected }: { isSelected: boolean }) =>
          cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            isSelected
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
            className
          ),
      } as any)}
    >
      {children}
    </Tab>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children?: React.ReactNode
}

function TabsContent({ value, className, children }: TabsContentProps) {
  return (
    <TabPanel
      id={value}
      className={cn("mt-2 ring-offset-background focus-visible:outline-none", className)}
    >
      {children}
    </TabPanel>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
