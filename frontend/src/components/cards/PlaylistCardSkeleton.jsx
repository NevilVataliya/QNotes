import Skeleton from '../ui/Skeleton'

function PlaylistCardSkeleton() {
  return (
    <div className="relative">
      <div className="w-full bg-surface-900/90 backdrop-blur-sm rounded-2xl p-6 border border-surface-800/80 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-6 w-16" rounded="rounded-full" />
          <Skeleton className="h-6 w-20" rounded="rounded-full" />
        </div>

        <Skeleton className="w-full h-32 mb-4" rounded="rounded-xl" />

        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-6 w-20" rounded="rounded-full" />
          <Skeleton className="h-6 w-10" rounded="rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default PlaylistCardSkeleton
