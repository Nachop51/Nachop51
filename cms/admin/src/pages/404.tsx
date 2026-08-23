import { Link } from 'wouter'

import { Page } from '@/components/common/page'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function NotFoundPage() {
  return (
    <Page>
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>The page you requested does not exist in this CMS.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="/" className={buttonVariants()}>
            Back to posts
          </Link>
        </EmptyContent>
      </Empty>
    </Page>
  )
}
