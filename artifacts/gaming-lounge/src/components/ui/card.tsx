import * as React from "react"
import {
  Card as HeroCard,
  CardHeader as HeroCardHeader,
  CardContent as HeroCardContent,
  CardFooter as HeroCardFooter,
  CardTitle as HeroCardTitle,
  CardDescription as HeroCardDescription,
} from "@heroui/react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroCard
      className={cn("bg-card text-card-foreground border border-border shadow-none rounded-lg", className)}
      {...(props as any)}
    >
      {children}
    </HeroCard>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroCardHeader className={cn("flex flex-col space-y-1.5 p-6", className)} {...(props as any)}>
      {children}
    </HeroCardHeader>
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroCardContent className={cn("p-6 pt-0", className)} {...(props as any)}>
      {children}
    </HeroCardContent>
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <HeroCardFooter className={cn("flex items-center p-6 pt-0", className)} {...(props as any)}>
      {children}
    </HeroCardFooter>
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
