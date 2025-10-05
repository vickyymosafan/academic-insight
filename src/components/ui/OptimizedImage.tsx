/**
 * Optimized Image Component
 * Wrapper around Next.js Image with performance optimizations
 */

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  showPlaceholder = true,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        quality={85}
      />
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
}
