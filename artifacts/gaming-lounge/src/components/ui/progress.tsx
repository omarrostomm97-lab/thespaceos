import * as React from "react"
import { ProgressBarRoot, ProgressBarTrack, ProgressBarFill } from "@heroui/react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
  ({ className, value, ...props }, ref) => (
    <ProgressBarRoot
      ref={ref as any}
      value={value ?? 0}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...(props as any)}
    >
      <ProgressBarTrack>
        <ProgressBarFill />
      </ProgressBarTrack>
    </ProgressBarRoot>
  )
)
Progress.displayName = "Progress"

export { Progress }
