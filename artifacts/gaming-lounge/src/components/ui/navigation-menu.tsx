import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

const NavigationMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...props}>{children}</div>
))
NavigationMenu.displayName = "NavigationMenu"
const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...props} />
))
NavigationMenuList.displayName = "NavigationMenuList"
const NavigationMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
))
NavigationMenuItem.displayName = "NavigationMenuItem"
const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={cn(navigationMenuTriggerStyle(), "group", className)} {...props}>{children}</button>
))
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"
const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("absolute top-0 left-0 w-full", className)} {...props} />
))
NavigationMenuContent.displayName = "NavigationMenuContent"
const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(({ className, ...props }, ref) => (
  <a ref={ref} className={cn(className)} {...props} />
))
NavigationMenuLink.displayName = "NavigationMenuLink"
const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("absolute left-0 top-full flex justify-center", className)} {...props} />
))
NavigationMenuViewport.displayName = "NavigationMenuViewport"
const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className)} {...props} />
))
NavigationMenuIndicator.displayName = "NavigationMenuIndicator"

export {
  navigationMenuTriggerStyle, NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink,
  NavigationMenuViewport, NavigationMenuIndicator,
}
