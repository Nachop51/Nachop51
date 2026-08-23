import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageProps = {
  children: ReactNode
  className?: string
}

function Page({ children, className }: PageProps) {
  return (
    <main
      className={cn(
        'mx-auto flex w-[calc(100%-1.5rem)] max-w-6xl flex-col gap-8 py-9 pb-20 sm:w-[calc(100%-2rem)] sm:gap-10 sm:py-14',
        className
      )}
    >
      {children}
    </main>
  )
}

type PageHeaderProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
}

function PageHeader({ eyebrow, title, description, meta, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-3">{meta}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

type SectionHeaderProps = {
  title: string
  description?: ReactNode
  id?: string
}

function SectionHeader({ title, description, id }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-sm font-medium">
        {title}
      </h2>
      {description && <p className="text-right text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

export { Page, PageHeader, SectionHeader }
