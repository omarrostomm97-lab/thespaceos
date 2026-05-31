import * as React from "react"
import { SliderRoot, SliderTrack, SliderThumb } from "@heroui/react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof SliderRoot>>(
  ({ className, ...props }, ref) => (
    <SliderRoot
      ref={ref as any}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...(props as any)}
    >
      <SliderTrack className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderThumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderTrack>
    </SliderRoot>
  )
)
Slider.displayName = "Slider"

export { Slider }
