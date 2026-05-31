import * as React from "react"
import { cn } from "@/lib/utils"

const ContextMenu = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const ContextMenuTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>)
ContextMenuTrigger.displayName = "ContextMenuTrigger"
const ContextMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}>{children}</div>
))
ContextMenuContent.displayName = "ContextMenuContent"
const ContextMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none", inset && "pl-8", className)} {...props} />
))
ContextMenuItem.displayName = "ContextMenuItem"
const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"
const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
ContextMenuRadioItem.displayName = "ContextMenuRadioItem"
const ContextMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props} />
))
ContextMenuLabel.displayName = "ContextMenuLabel"
const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"
const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
)
const ContextMenuGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const ContextMenuPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const ContextMenuSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm", className)} {...props}>{children}</div>
))
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"
const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}>{children}</div>
))
ContextMenuSubContent.displayName = "ContextMenuSubContent"
const ContextMenuRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuRadioGroup,
}
