import * as React from "react"
import {
  DropdownRoot,
  DropdownTrigger as HeroDropdownTrigger,
  DropdownPopover,
  DropdownItem as HeroDropdownItem,
  DropdownSection as HeroDropdownSection,
} from "@heroui/react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children, ...props }: { children?: React.ReactNode }) => (
  <DropdownRoot {...(props as any)}>{children}</DropdownRoot>
)

const DropdownMenuTrigger = ({ children, asChild, ...props }: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) => (
  <HeroDropdownTrigger {...(props as any)}>{children}</HeroDropdownTrigger>
)

const DropdownMenuPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }>(
  ({ className, children, ...props }, ref) => (
    <DropdownPopover>
      <div ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}>
        {children}
      </div>
    </DropdownPopover>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <HeroDropdownItem className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...(props as any)} />
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const DropdownMenuGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const DropdownMenuSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none", className)} {...props}>{children}</div>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"
const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg", className)} {...props}>{children}</div>
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"
const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"
const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"
const DropdownMenuRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
