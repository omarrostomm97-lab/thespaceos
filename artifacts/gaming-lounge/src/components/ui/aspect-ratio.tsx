import * as React from "react"
import { cn } from "@/lib/utils"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(({ ratio = 1, className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ position: "relative", paddingBottom: `${(1 / ratio) * 100}%`, ...style }}
    className={cn("overflow-hidden", className)}
    {...props}
  />
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
