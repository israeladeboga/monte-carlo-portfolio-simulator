import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyPage: React.FC<LazyPageProps> = ({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  )
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};