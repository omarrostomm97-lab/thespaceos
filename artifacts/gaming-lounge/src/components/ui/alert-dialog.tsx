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
import { buttonVariants } from "@/components/ui/button"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  children?: React.ReactNode
}

const AlertDialog = ({ open, onOpenChange, defaultOpen, children }: AlertDialogProps) => (
  <ModalRoot isOpen={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
    {children}
  </ModalRoot>
)
AlertDialog.displayName = "AlertDialog"

const AlertDialogTrigger = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof ModalTrigger>) => (
  <ModalTrigger {...props}>{children}</ModalTrigger>
)
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
AlertDialogPortal.displayName = "AlertDialogPortal"

const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  )
)
AlertDialogOverlay.displayName = "AlertDialogOverlay"

const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <ModalBackdrop isDismissable={false}>
      <ModalContainer>
        <ModalDialog
          className={cn(
            "relative bg-background text-foreground border border-border rounded-lg p-6 shadow-xl w-full max-w-lg focus:outline-none",
            className
          )}
        >
          {children}
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  )
)
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-start mb-4", className)}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4", className)}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <ModalHeading
    className={cn("text-lg font-semibold", className)}
    {...(props as any)}
  >
    {children}
  </ModalHeading>
)
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, children, ...props }, ref) => (
    <ModalCloseTrigger
      className={cn(buttonVariants(), className)}
      onPress={onClick as any}
      {...(props as any)}
    >
      {children}
    </ModalCloseTrigger>
  )
)
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <ModalCloseTrigger
      className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
      {...(props as any)}
    >
      {children}
    </ModalCloseTrigger>
  )
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
