import React from 'react';
import Skeleton from './Skeleton';

const InfiniteScrollLoader = () => (
  <div className="flex justify-center py-8">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8" rounded="rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" rounded="rounded" />
        <Skeleton className="h-3 w-20" rounded="rounded" />
      </div>
    </div>
  </div>
);

export default InfiniteScrollLoader;
