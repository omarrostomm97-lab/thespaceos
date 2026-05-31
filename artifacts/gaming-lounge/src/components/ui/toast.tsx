import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ToastViewport = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />
))
ToastViewport.displayName = "ToastViewport"
const Toast = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> &
    VariantProps<typeof toastVariants> & {
      open?: boolean
      onOpenChange?: (open: boolean) => void
    }
>(({ className, variant, open: _open, onOpenChange: _onOpenChange, ...props }, ref) => (
  <li ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
))
Toast.displayName = "Toast"
const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
))
ToastTitle.displayName = "ToastTitle"
const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"
const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100", className)} {...props} />
))
ToastClose.displayName = "ToastClose"
const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors", className)} {...props} />
))
ToastAction.displayName = "ToastAction"

type ToastActionElement = React.ReactElement<typeof ToastAction>
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export type { ToastActionElement, ToastProps }
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, toastVariants }
