/**
 * Performance Monitoring Utilities
 * Track and report performance metrics
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe FCP and LCP
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.metrics.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Performance observers not fully supported', e);
      }
    }

    // Get FCP from paint timing
    window.addEventListener('load', () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
      }

      // Get TTFB from navigation timing
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    });
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics');
      console.log('FCP (First Contentful Paint):', this.metrics.fcp?.toFixed(2), 'ms');
      console.log('LCP (Largest Contentful Paint):', this.metrics.lcp?.toFixed(2), 'ms');
      console.log('FID (First Input Delay):', this.metrics.fid?.toFixed(2), 'ms');
      console.log('CLS (Cumulative Layout Shift):', this.metrics.cls?.toFixed(4));
      console.log('TTFB (Time to First Byte):', this.metrics.ttfb?.toFixed(2), 'ms');
      console.groupEnd();
    }
  }

  /**
   * Report metrics to analytics service
   * Can be integrated with Google Analytics, Vercel Analytics, etc.
   */
  reportMetrics() {
    // Example: Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const metrics = this.getMetrics();
      
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== undefined) {
          (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: key.toUpperCase(),
            value: Math.round(value),
            non_interaction: true,
          });
        }
      });
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Log metrics after page load (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logMetrics();
    }, 3000);
  });
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}
