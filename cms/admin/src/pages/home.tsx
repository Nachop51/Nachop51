import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'wouter'
import { navigate } from 'wouter/use-browser-location'

import { Page, PageHeader, SectionHeader } from '@/components/common/page'
import PostStatus from '@/components/common/post-status'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Post = {
  id: string
  lang: string
  slug: string
  title: string
  published_at: string | null
}

function formatPublishedDate(date: string | null) {
  if (!date) return 'Not published'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date)
  )
}

export default function HomePage() {
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const {
    data: posts,
    isLoading,
    isSuccess,
    error,
  } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Unable to load posts. Please try again.')
      return res.json()
    },
  })

  const handleNewPost = async () => {
    setIsCreating(true)
    setCreateError(null)
    const uuid = crypto.randomUUID()
    try {
      const res = await fetch(`/api/posts/${uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'en',
          slug: 'brand-new',
          title: 'New post',
          content: 'hello',
          published_at: null,
        }),
      })
      if (!res.ok) throw new Error('Unable to create a post. Please try again.')
      navigate(`/posts/${uuid}`)
    } catch (creationError) {
      setCreateError(
        creationError instanceof Error ? creationError.message : 'Unable to create a post.'
      )
      setIsCreating(false)
    }
  }

  const publishedCount = posts?.filter((post) => post.published_at).length ?? 0
  const draftCount = (posts?.length ?? 0) - publishedCount

  return (
    <Page>
      <PageHeader
        eyebrow="Publication"
        title="Posts"
        description="Draft, edit, and publish the writing that appears on your site."
        action={
          <Button onClick={handleNewPost} disabled={isCreating}>
            {isCreating && <Spinner data-icon="inline-start" />}
            {isCreating ? 'Creating…' : 'New post'}
          </Button>
        }
      />

      {createError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t create the post</AlertTitle>
          <AlertDescription>{createError}</AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="posts-heading" className="flex flex-col gap-3">
        <SectionHeader
          id="posts-heading"
          title="All writing"
          description={
            posts
              ? `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} · ${publishedCount} published · ${draftCount} drafts`
              : undefined
          }
        />

        {isLoading && (
          <div role="status" aria-label="Loading posts" className="flex flex-col gap-4 py-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center justify-between gap-6">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!isSuccess || error) && (
          <Alert variant="destructive">
            <AlertTitle>Couldn’t load posts</AlertTitle>
            <AlertDescription>{error?.message ?? 'Unable to load posts.'}</AlertDescription>
          </Alert>
        )}

        {isSuccess &&
          posts &&
          (posts.length === 0 ? (
            <Empty className="min-h-64 border">
              <EmptyHeader>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>Your first post will begin as a draft.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={handleNewPost} disabled={isCreating}>
                  {isCreating && <Spinner data-icon="inline-start" />}
                  {isCreating ? 'Creating…' : 'Create your first post'}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead className="hidden sm:table-cell">Published</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="min-w-0 whitespace-normal">
                      <Link
                        to={`/posts/${post.id}`}
                        className="group block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="block font-medium tracking-[-0.01em] group-hover:underline">
                          {post.title || 'Untitled post'}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          /{post.lang}/{post.slug}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatPublishedDate(post.published_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PostStatus published={Boolean(post.published_at)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
      </section>
    </Page>
  )
}
