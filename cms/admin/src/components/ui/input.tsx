import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

type InputProps = React.ComponentProps<'input'> & {
  appearance?: 'default' | 'document-title' | 'document-description' | 'document-meta'
}

const appearances = {
  default:
    'h-8 rounded-none border border-input px-2.5 py-1 text-xs focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30',
  'document-title':
    'h-auto border-0 px-0 py-0 text-4xl leading-none font-semibold tracking-[-0.045em] placeholder:text-muted-foreground/60 focus-visible:ring-0 sm:text-5xl',
  'document-description':
    'h-auto border-0 px-0 py-0 text-base leading-relaxed text-muted-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0',
  'document-meta':
    'h-7 border-0 px-1 py-0 text-xs text-muted-foreground focus-visible:bg-muted/60 focus-visible:ring-0',
} as const

function Input({ className, type, appearance = 'default', ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 bg-transparent transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        appearances[appearance],
        className
      )}
      {...props}
    />
  )
}

export { Input }
