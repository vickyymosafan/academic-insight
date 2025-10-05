# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the Academic Insight PWA to ensure fast load times, smooth interactions, and excellent user experience.

## Performance Targets

- **Performance Score**: >90 (Lighthouse)
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Cumulative Layout Shift (CLS)**: <0.1
- **Total Blocking Time (TBT)**: <200ms
- **Speed Index (SI)**: <3.4s

## Implemented Optimizations

### 1. Code Splitting and Lazy Loading

#### Dynamic Imports
We use Next.js dynamic imports to lazy load non-critical components:

```typescript
// Lazy load heavy components
const DashboardOverview = dynamic(
  () => import('@/components/dashboard/DashboardOverview'),
  {
    loading: () => <DashboardOverviewSkeleton />,
    ssr: false,
  }
);

// Lazy load PWA components
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt"), {
  ssr: false,
});
```

**Benefits**:
- Reduces initial bundle size
- Faster initial page load
- Components load only when needed

#### Route-based Code Splitting
Next.js automatically splits code by routes in the `app` directory:
- `/auth/login` - Authentication bundle
- `/dashboard` - Dashboard bundle
- `/dashboard/students` - Student management bundle

### 2. Image Optimization

#### Next.js Image Component
All images use the optimized Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/icon.png"
  alt="Academic Insight"
  width={192}
  height={192}
  loading="lazy"
  quality={85}
/>
```

#### Image Configuration
```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
}
```

**Benefits**:
- Automatic format conversion (AVIF, WebP)
- Responsive images for different screen sizes
- Lazy loading by default
- Optimized quality (85%)

### 3. API Caching Strategy

#### Client-side Caching
We implement a custom caching layer for API calls:

```typescript
import { fetchWithCache, cacheKeys } from '@/lib/api-cache';

// Fetch with 5-minute cache
const stats = await fetchWithCache(
  cacheKeys.dashboardStats(),
  () => fetchDashboardStats(),
  { ttl: 5 * 60 * 1000 }
);
```

**Cache Strategies**:
- Dashboard stats: 5 minutes TTL
- Student list: 2 minutes TTL
- Student details: 10 minutes TTL
- Automatic cleanup of expired entries

#### Service Worker Caching
PWA service worker implements multiple caching strategies:

```javascript
// Static assets - Cache First
{
  urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  handler: "CacheFirst",
  options: {
    cacheName: "static-image-assets",
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60,
    },
  },
}

// API calls - Network First
{
  urlPattern: /\/api\//,
  handler: "NetworkFirst",
  options: {
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
  },
}
```

### 4. Bundle Optimization

#### Package Import Optimization
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['@heroicons/react', 'recharts'],
}
```

**Benefits**:
- Tree-shaking for icon libraries
- Smaller bundle sizes
- Faster parsing and execution

#### Remove Console Logs in Production
```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
}
```

### 5. Font Optimization

#### Google Fonts with Next.js Font
```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
});
```

**Benefits**:
- Automatic font optimization
- Self-hosted fonts (no external requests)
- Font display swap for better perceived performance

### 6. Compression and Minification

#### Automatic Compression
```typescript
// next.config.ts
compress: true, // Enables gzip compression
```

#### Production Optimizations
```typescript
productionBrowserSourceMaps: false, // Reduces bundle size
poweredByHeader: false, // Removes X-Powered-By header
```

### 7. Performance Monitoring

#### Web Vitals Tracking
We track Core Web Vitals automatically:

```typescript
import { performanceMonitor } from '@/lib/performance';

// Metrics are automatically collected:
// - FCP (First Contentful Paint)
// - LCP (Largest Contentful Paint)
// - FID (First Input Delay)
// - CLS (Cumulative Layout Shift)
// - TTFB (Time to First Byte)
```

#### Development Logging
In development mode, performance metrics are logged to console:

```
📊 Performance Metrics
FCP (First Contentful Paint): 1234.56 ms
LCP (Largest Contentful Paint): 2345.67 ms
FID (First Input Delay): 12.34 ms
CLS (Cumulative Layout Shift): 0.0123
TTFB (Time to First Byte): 123.45 ms
```

## Testing Performance

### Lighthouse Audit

Run Lighthouse audit locally:

```bash
# Start the development server
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse
```

Run Lighthouse audit on production:

```bash
npm run lighthouse:prod
```

The script will:
1. Launch headless Chrome
2. Run Lighthouse audit
3. Generate HTML report
4. Check if performance score meets target (>90)
5. Provide improvement suggestions if needed

### Bundle Analysis

Analyze bundle size:

```bash
npm run analyze
```

This will:
1. Build the production bundle
2. Generate interactive bundle visualization
3. Open in browser automatically
4. Show size of each module and chunk

### Performance Checklist

Before deployment, verify:

- [ ] Lighthouse Performance Score >90
- [ ] FCP <1.5s
- [ ] LCP <2.5s
- [ ] CLS <0.1
- [ ] No console errors in production
- [ ] All images optimized (WebP/AVIF)
- [ ] Bundle size reasonable (<500KB initial)
- [ ] Service worker caching working
- [ ] API responses cached appropriately

## Best Practices

### 1. Component Optimization

```typescript
// ✅ Good: Lazy load heavy components
const Chart = dynamic(() => import('./Chart'), { ssr: false });

// ❌ Bad: Import everything upfront
import Chart from './Chart';
```

### 2. Image Optimization

```typescript
// ✅ Good: Use Next.js Image with lazy loading
<Image src="/image.jpg" alt="..." width={500} height={300} loading="lazy" />

// ❌ Bad: Use regular img tag
<img src="/image.jpg" alt="..." />
```

### 3. API Calls

```typescript
// ✅ Good: Cache API responses
const data = await fetchWithCache(key, fetcher, { ttl: 300000 });

// ❌ Bad: Fetch on every render
const data = await fetch('/api/data').then(r => r.json());
```

### 4. State Management

```typescript
// ✅ Good: Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

// ❌ Bad: Compute on every render
const expensiveValue = computeExpensive(data);
```

## Monitoring in Production

### Vercel Analytics

If deployed on Vercel, enable Web Analytics:

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to Analytics tab
4. Enable Web Analytics

This will track:
- Real User Monitoring (RUM)
- Core Web Vitals
- Page load times
- Geographic distribution

### Custom Analytics

Integrate with Google Analytics or other services:

```typescript
// lib/performance.ts
performanceMonitor.reportMetrics(); // Sends to analytics
```

## Troubleshooting

### Slow Initial Load

1. Check bundle size with `npm run analyze`
2. Identify large dependencies
3. Consider lazy loading or alternatives
4. Check network waterfall in DevTools

### Poor LCP Score

1. Optimize largest image/element
2. Ensure critical CSS is inlined
3. Preload important resources
4. Check server response time

### High CLS Score

1. Add explicit width/height to images
2. Reserve space for dynamic content
3. Avoid inserting content above existing content
4. Use CSS aspect-ratio for responsive elements

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Core Web Vitals](https://web.dev/vitals/)
