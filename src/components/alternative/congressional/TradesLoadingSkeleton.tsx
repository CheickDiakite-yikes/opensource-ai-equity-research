
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TradesLoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Skeleton className="h-10 w-full mb-4" />
    <div>
      <Skeleton className="h-10 w-full mb-2" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
  </div>
);

export default TradesLoadingSkeleton;
