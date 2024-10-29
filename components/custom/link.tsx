import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import React from 'react'

import { cn } from '@/lib/utils'

export interface LinkProps extends NextLinkProps {
  className?: string
  children?: React.ReactNode
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, ...props }, ref) => {
    const isInternal =
      href?.toString().startsWith('/') || href?.toString().startsWith('#')
    const externalLinkProps = !isInternal
      ? { target: '_blank', rel: 'noreferrer' }
      : undefined

    return (
      <NextLink
        className={cn(
          'text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground',
          'rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        ref={ref}
        href={href}
        {...externalLinkProps}
        {...props}
      />
    )
  }
)

Link.displayName = 'Link'

export { Link }