import { Badge } from '@/components/ui/badge'

type PostStatusProps = {
  published: boolean
  hasUnpublishedChanges?: boolean
}

export default function PostStatus({ published, hasUnpublishedChanges = false }: PostStatusProps) {
  if (published && hasUnpublishedChanges) {
    return <Badge variant="secondary">Unpublished changes</Badge>
  }

  return (
    <Badge variant={published ? 'default' : 'secondary'}>{published ? 'Published' : 'Draft'}</Badge>
  )
}
