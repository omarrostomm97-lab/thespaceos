import * as React from "react"
import {
  ModalRoot,
  ModalTrigger,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeading,
  ModalCloseTrigger,
} from "@heroui/react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  children?: React.ReactNode
}

const Dialog = ({ open, onOpenChange, defaultOpen, children }: DialogProps) => (
  <ModalRoot isOpen={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
    {children}
  </ModalRoot>
)
Dialog.displayName = "Dialog"

const DialogTrigger = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof ModalTrigger>) => (
  <ModalTrigger {...props}>{children}</ModalTrigger>
)
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  )
)
DialogOverlay.displayName = "DialogOverlay"

const DialogClose = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof ModalCloseTrigger>) => (
  <ModalCloseTrigger {...props}>{children}</ModalCloseTrigger>
)
DialogClose.displayName = "DialogClose"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <ModalBackdrop isDismissable>
      <ModalContainer>
        <ModalDialog
          className={cn(
            "relative bg-background text-foreground border border-border rounded-lg p-6 shadow-xl w-full max-w-lg focus:outline-none",
            className
          )}
        >
          {children}
          <ModalCloseTrigger className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-start mb-4", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <ModalHeading
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...(props as any)}
  >
    {children}
  </ModalHeading>
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
