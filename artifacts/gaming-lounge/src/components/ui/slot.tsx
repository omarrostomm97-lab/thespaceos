import * as React from "react"

function Slot({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const child = React.Children.only(children) as React.ReactElement
  const childProps = child.props as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.cloneElement(child, {
    ...props,
    ...childProps,
    className: [
      (props as { className?: string }).className,
      childProps.className as string | undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
  } as any)
}

export { Slot }
