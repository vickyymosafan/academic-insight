import { ReactNode } from 'react';
import LoadingSpinner, { InlineLoader } from './LoadingSpinner';

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  loadingText?: string;
  variant?: 'spinner' | 'skeleton';
  minHeight?: string;
}

/**
 * Loading State Wrapper Component
 * Displays loading state with spinner or skeleton
 */
export default function LoadingState({
  isLoading,
  children,
  skeleton,
  loadingText,
  variant = 'skeleton',
  minHeight = '200px',
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (variant === 'skeleton' && skeleton) {
    return <>{skeleton}</>;
  }

  return (
    <div style={{ minHeight }} className="flex items-center justify-center">
      <InlineLoader label={loadingText} />
    </div>
  );
}

/**
 * Button Loading State
 */
interface ButtonLoadingProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
}

export function ButtonLoading({ isLoading, children, loadingText }: ButtonLoadingProps) {
  if (isLoading) {
    return (
      <span className="flex items-center justify-center gap-2">
        <LoadingSpinner size="sm" color="white" />
        {loadingText || 'Memuat...'}
      </span>
    );
  }

  return <>{children}</>;
}
