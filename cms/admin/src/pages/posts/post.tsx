import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { navigate } from 'wouter/use-browser-location'

import { Page } from '@/components/common/page'
import PostStatus from '@/components/common/post-status'
import TipTap from '@/components/tiptap'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import useDebounce from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

type Props = { id: string }
type PublishedSnapshot = Pick<Post, 'slug' | 'title' | 'description' | 'content'>
type Post = {
  id: string
  lang: string
  slug: string
  title: string
  description: string
  content: string
  published_at: string | null
  created_at: string | null
  updated_at: string | null
  published_snapshot?: PublishedSnapshot | null
}

function formatTimestamp(value: string | null) {
  if (!value) return 'Not yet'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function hasUnpublishedChanges(post: Post) {
  if (!post.published_at || !post.published_snapshot) return false
  const snapshot = post.published_snapshot
  return (
    post.slug !== snapshot.slug ||
    post.title !== snapshot.title ||
    post.description !== snapshot.description ||
    post.content !== snapshot.content
  )
}

function hasUnsavedChanges(post: Post, savedPost: Post | null) {
  if (!savedPost) return false
  return (
    post.lang !== savedPost.lang ||
    post.slug !== savedPost.slug ||
    post.title !== savedPost.title ||
    post.description !== savedPost.description ||
    post.content !== savedPost.content
  )
}

export default function PostPage({ id }: Props) {
  const queryClient = useQueryClient()
  const postQueryKey = ['post', id]
  const {
    data: post,
    isLoading: loading,
    error,
  } = useQuery<Post>({
    queryKey: postQueryKey,
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}`)
      if (response.status === 404) {
        navigate('/post/not-found')
        throw new Error('Post not found')
      }
      if (!response.ok) throw new Error('Failed to fetch post')
      return response.json()
    },
  })
  const savedPost = useRef<Post | null>(null)
  const debouncedPost = useDebounce(post, 500)

  const updatePost = (updater: (post: Post) => Post) =>
    queryClient.setQueryData<Post>(postQueryKey, (currentPost) =>
      currentPost ? updater(currentPost) : currentPost
    )

  const {
    mutate: savePost,
    isPending: isSaving,
    isError: hasSaveError,
  } = useMutation({
    mutationFn: async (currentPost: Post) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentPost.id,
          lang: currentPost.lang,
          slug: currentPost.slug,
          title: currentPost.title,
          content: currentPost.content,
          description: currentPost.description,
        }),
      })
      if (!response.ok) throw new Error('Failed to save post')
    },
    onSuccess: (_, currentPost) => {
      savedPost.current = currentPost
      updatePost((postInCache) => ({ ...postInCache, updated_at: new Date().toISOString() }))
    },
  })

  useEffect(() => {
    if (post && savedPost.current?.id !== post.id) savedPost.current = post
  }, [post])
  useEffect(() => {
    if (error || !debouncedPost || !savedPost.current) return
    const hasChanges =
      debouncedPost.lang !== savedPost.current.lang ||
      debouncedPost.slug !== savedPost.current.slug ||
      debouncedPost.title !== savedPost.current.title ||
      debouncedPost.content !== savedPost.current.content ||
      debouncedPost.description !== savedPost.current.description
    if (hasChanges) savePost(debouncedPost)
  }, [debouncedPost, error, savePost])

  const { mutate: publishPost, isPending: isPublishing } = useMutation({
    mutationFn: async (mode: 'publish' | 'unpublish') => {
      const response = await fetch(`/api/posts/${id}/${mode}`, {
        method: 'POST',
      })
      const message = await response.text()
      if (!response.ok) throw new Error(message || 'Failed to update post status')
      return { mode, message }
    },
    onSuccess: ({ mode, message }) => {
      const changedAt = new Date().toISOString()
      toast.add({
        title: message || (mode === 'publish' ? 'Post published' : 'Post unpublished'),
        type: 'success',
      })
      updatePost((currentPost) => ({
        ...currentPost,
        published_at: mode === 'publish' ? changedAt : null,
        updated_at: changedAt,
        published_snapshot:
          mode === 'publish'
            ? {
                slug: currentPost.slug,
                title: currentPost.title,
                description: currentPost.description,
                content: currentPost.content,
              }
            : null,
      }))
    },
    onError: (publishError) =>
      toast.add({
        title: 'Couldn’t update post status',
        description: publishError.message,
        type: 'error',
      }),
  })

  if (loading) {
    return (
      <Page>
        <div role="status" aria-label="Loading post" className="flex flex-col gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-2/3 max-w-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Separator />
        <Skeleton className="h-32 w-full max-w-2xl" />
        <Skeleton className="h-96 w-full" />
      </Page>
    )
  }
  if (error) {
    return (
      <Page>
        <Alert variant="destructive">
          <AlertTitle>Couldn’t load the post</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </Page>
    )
  }
  if (!post) {
    return (
      <Page>
        <Empty className="min-h-64 border">
          <EmptyHeader>
            <EmptyTitle>Post not found</EmptyTitle>
            <EmptyDescription>This post may have been removed.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Page>
    )
  }

  const unpublishedChanges = hasUnpublishedChanges(post)
  const unsavedChanges = hasUnsavedChanges(post, savedPost.current)
  const saveStatus = hasSaveError
    ? 'Couldn’t save'
    : isSaving
      ? 'Saving…'
      : unsavedChanges
        ? 'Unsaved'
        : 'Saved'

  return (
    <Page className="max-w-5xl gap-8">
      <header className="flex flex-col gap-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Post
            </p>
            <PostStatus
              published={Boolean(post.published_at)}
              hasUnpublishedChanges={unpublishedChanges}
            />
          </div>
          <Button
            type="button"
            variant={post.published_at ? 'outline' : 'default'}
            onClick={() => publishPost(post.published_at ? 'unpublish' : 'publish')}
            disabled={isPublishing}
          >
            {isPublishing && <Spinner data-icon="inline-start" />}
            {isPublishing ? 'Updating…' : post.published_at ? 'Unpublish' : 'Publish'}
          </Button>
        </div>

        <FieldGroup className="max-w-3xl gap-3">
          <Field>
            <FieldLabel htmlFor="post-title" className="sr-only">
              Title
            </FieldLabel>
            <Input
              id="post-title"
              appearance="document-title"
              value={post.title}
              placeholder="Untitled post"
              onChange={(event) =>
                updatePost((currentPost) => ({ ...currentPost, title: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="post-description" className="sr-only">
              Description
            </FieldLabel>
            <Input
              id="post-description"
              appearance="document-description"
              value={post.description}
              placeholder="Add a short description…"
              onChange={(event) =>
                updatePost((currentPost) => ({
                  ...currentPost,
                  description: event.target.value,
                }))
              }
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-4 text-xs sm:flex-row sm:items-end sm:justify-between">
          <Field className="max-w-md gap-1">
            <FieldLabel htmlFor="post-slug" className="text-muted-foreground">
              Permalink
            </FieldLabel>
            <div className="flex items-center text-muted-foreground">
              <span>/{post.lang}/</span>
              <Input
                id="post-slug"
                appearance="document-meta"
                value={post.slug}
                placeholder="post-slug"
                onChange={(event) =>
                  updatePost((currentPost) => ({ ...currentPost, slug: event.target.value }))
                }
              />
            </div>
          </Field>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground sm:justify-end">
            <div className="flex gap-2">
              <dt>Published at</dt>
              <dd className="text-foreground">{formatTimestamp(post.published_at)}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Changed at</dt>
              <dd className="text-foreground">{formatTimestamp(post.updated_at)}</dd>
              <dd
                className={cn(hasSaveError ? 'text-destructive' : 'text-muted-foreground')}
                role="status"
                aria-live="polite"
                aria-label={`Save status: ${saveStatus}`}
              >
                · {saveStatus}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <Separator />

      <section className="min-w-0" aria-label="Article body">
        <TipTap
          initial={post.content || ''}
          onChange={(markdown) =>
            updatePost((currentPost) => ({
              ...currentPost,
              content: markdown,
            }))
          }
        />
      </section>
    </Page>
  )
}
