import React, { useState } from 'react';

/**
 * Optimized image component.
 * - Lazy loading by default (except priority images).
 * - width/height + aspect-ratio to prevent CLS.
 * - Fallback image + error handler.
 * - Uses srcset when sizes array provided.
 */
const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="#0a0a12" width="400" height="200"/><text x="50%" y="50%" fill="#7a7a8a" text-anchor="middle" font-family="sans-serif" font-size="18">GHub</text></svg>'
  );

export default function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  sizes,
  priority = false,
  fallback = FALLBACK,
  className,
  style,
}) {
  const [error, setError] = useState(false);

  const baseSrc = error || !src ? fallback : src;

  // Build srcset from sizes array if provided: [{src, w}]
  let srcSet;
  if (Array.isArray(sizes) && sizes.length) {
    srcSet = sizes
      .map((s) => `${s.src} ${s.w}w`)
      .join(', ');
  }

  return (
    <img
      src={baseSrc}
      srcSet={srcSet}
      sizes={srcSet ? '(max-width: 600px) 400px, 800px' : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      width={width}
      height={height}
      style={width && height ? { ...style, aspectRatio: `${width}/${height}` } : style}
      className={className}
      onError={() => setError(true)}
    />
  );
}
