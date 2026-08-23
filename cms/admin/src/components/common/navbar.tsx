import { Link } from 'wouter'
import { buttonVariants } from '@/components/ui/button'
import ThemeSwitcher from '@/components/common/theme-switcher'

export default function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav
        aria-label="Admin navigation"
        className="mx-auto flex min-h-15 w-[calc(100%-1.5rem)] max-w-6xl items-center justify-between gap-4 sm:w-[calc(100%-2rem)]"
      >
        <Link
          to="/"
          className="inline-flex items-baseline gap-2 font-semibold tracking-[-0.02em] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="font-mono font-bold text-primary" aria-hidden="true">
            /
          </span>
          <span>Nachop</span>
          <span className="text-xs font-medium tracking-normal text-muted-foreground">CMS</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Posts
          </Link>
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  )
}
