import * as React from "react"
import { cn } from "@/lib/utils"

const Menubar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm", className)} {...props} />
))
Menubar.displayName = "Menubar"
const MenubarMenu = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const MenubarGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const MenubarPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const MenubarSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const MenubarRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none", className)} {...props}>{children}</button>
))
MenubarTrigger.displayName = "MenubarTrigger"
const MenubarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}>{children}</div>
))
MenubarContent.displayName = "MenubarContent"
const MenubarItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none", inset && "pl-8", className)} {...props} />
))
MenubarItem.displayName = "MenubarItem"
const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
MenubarSeparator.displayName = "MenubarSeparator"
const MenubarLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
))
MenubarLabel.displayName = "MenubarLabel"
const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
MenubarCheckboxItem.displayName = "MenubarCheckboxItem"
const MenubarRadioItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm", className)} {...props}>{children}</div>
))
MenubarRadioItem.displayName = "MenubarRadioItem"
const MenubarSubTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(({ className, inset, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none", inset && "pl-8", className)} {...props}>{children}</div>
))
MenubarSubTrigger.displayName = "MenubarSubTrigger"
const MenubarSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg", className)} {...props}>{children}</div>
))
MenubarSubContent.displayName = "MenubarSubContent"
const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
)

export {
  Menubar, MenubarMenu, MenubarGroup, MenubarPortal, MenubarSub, MenubarRadioGroup,
  MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel,
  MenubarCheckboxItem, MenubarRadioItem, MenubarSubTrigger, MenubarSubContent, MenubarShortcut,
}
