import * as React from "react"
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerContent,
  DrawerDialog,
  DrawerCloseTrigger,
  DrawerHeading,
} from "@heroui/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type SheetSide = "top" | "right" | "bottom" | "left"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  children?: React.ReactNode
}

const Sheet = ({ open, onOpenChange, defaultOpen, children, ...props }: SheetProps & Record<string, any>) => (
  <DrawerRoot isOpen={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} {...props}>
    {children}
  </DrawerRoot>
)
Sheet.displayName = "Sheet"

const SheetTrigger = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof DrawerTrigger>) => (
  <DrawerTrigger {...props}>{children}</DrawerTrigger>
)
SheetTrigger.displayName = "SheetTrigger"

const SheetClose = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof DrawerCloseTrigger>) => (
  <DrawerCloseTrigger {...props}>{children}</DrawerCloseTrigger>
)
SheetClose.displayName = "SheetClose"

const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
SheetPortal.displayName = "SheetPortal"

const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
  )
)
SheetOverlay.displayName = "SheetOverlay"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <DrawerBackdrop isDismissable>
      <DrawerContent placement={side as any} className="!p-0 !m-0 !rounded-none !max-h-none !max-w-none">
        <DrawerDialog
          className={cn(
            "relative h-full bg-background border-border shadow-lg p-6 focus:outline-none",
            side === "left" || side === "right"
              ? "w-3/4 sm:max-w-sm border-r"
              : "w-full h-auto border-b",
            className
          )}
        >
          <DrawerCloseTrigger className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerCloseTrigger>
          {children}
        </DrawerDialog>
      </DrawerContent>
    </DrawerBackdrop>
  )
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-start", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <DrawerHeading className={cn("text-lg font-semibold text-foreground", className)} {...(props as any)}>
      {children}
    </DrawerHeading>
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
