import * as React from "react"
import { Skeleton as HeroSkeleton } from "@heroui/react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <HeroSkeleton
      className={cn("rounded-md", className)}
      {...(props as any)}
    />
  )
}

export { Skeleton }
