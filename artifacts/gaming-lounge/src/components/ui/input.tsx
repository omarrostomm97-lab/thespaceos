import * as React from "react"
import { TextField, Input as HeroInput, FieldError } from "@heroui/react"
import { cn } from "@/lib/utils"

const inputBaseClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

interface InputProps extends React.ComponentProps<"input"> {
  isInvalid?: boolean
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isInvalid, errorMessage, ...props }, ref) => {
    if (isInvalid !== undefined || errorMessage !== undefined) {
      return (
        <TextField isInvalid={isInvalid} validationBehavior="aria" className="w-full">
          <HeroInput
            type={type}
            className={cn(
              inputBaseClass,
              isInvalid && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...(props as any)}
          />
          {errorMessage && (
            <FieldError className="mt-1 text-xs text-destructive block">
              {errorMessage}
            </FieldError>
          )}
        </TextField>
      )
    }

    return (
      <input
        type={type}
        className={cn(inputBaseClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
