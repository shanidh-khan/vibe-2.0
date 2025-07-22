import * as React from "react"

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(({ className, ...props }, ref) => {
  return <div className="flex flex-col h-full" ref={ref} {...props} />
})
SidebarInset.displayName = "SidebarInset"

export { SidebarInset }
