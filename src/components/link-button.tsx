import type { ComponentProps, ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  href: string
  children: ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

export function LinkButton({
  href,
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}: LinkButtonProps) {
  return (
    <Button
      render={<Link href={href} {...props} />}
      nativeButton={false}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </Button>
  )
}
