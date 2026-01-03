import Skeleton from '../ui/Skeleton'

function NoteCardSkeleton({ showAuthor = true }) {
  return (
    <div className="w-full rounded-2xl">
      <div className="w-full bg-white/80 dark:bg-surface-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-surface-200/70 dark:border-surface-700/70 shadow-sm">
        {showAuthor && (
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="w-10 h-10" rounded="rounded-full" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3 w-20" rounded="rounded-full" />
              <Skeleton className="h-5 w-16" rounded="rounded-full" />
            </div>
          </div>
        )}

        <Skeleton className="w-full h-28 sm:h-32 mb-4" rounded="rounded-xl" />

        <div className="space-y-3 mb-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <Skeleton className="h-4 w-20" rounded="rounded-full" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-14" rounded="rounded" />
              <Skeleton className="h-6 w-14" rounded="rounded" />
              <Skeleton className="h-6 w-14" rounded="rounded" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" rounded="rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default NoteCardSkeleton
