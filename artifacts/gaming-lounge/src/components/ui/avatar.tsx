import * as React from "react"
import { AvatarRoot, AvatarImage as HeroAvatarImage, AvatarFallback as HeroAvatarFallback } from "@heroui/react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof AvatarRoot>>(
  ({ className, ...props }, ref) => (
    <AvatarRoot
      ref={ref as any}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...(props as any)}
    />
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <HeroAvatarImage
      ref={ref as any}
      className={cn("aspect-square h-full w-full", className)}
      {...(props as any)}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <HeroAvatarFallback
      ref={ref as any}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
      {...(props as any)}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
