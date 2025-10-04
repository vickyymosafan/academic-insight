# PWA Features Documentation

## Overview

Academic Insight PWA telah dikonfigurasi sebagai Progressive Web App dengan fitur-fitur berikut:

## Features

### 1. Installable App
- Aplikasi dapat diinstall di home screen perangkat (Android, iOS, Desktop)
- Berjalan dalam mode standalone tanpa browser UI
- Icon aplikasi custom dengan ukuran 192x192 dan 512x512

### 2. Offline Support
- Service Worker dengan caching strategies
- Data caching untuk akses offline
- Offline indicator untuk menampilkan status koneksi
- Fallback page untuk mode offline

### 3. Install Prompt
- Automatic install prompt untuk Android/Desktop
- Manual instructions untuk iOS
- Dismissible dengan cooldown period 7 hari

### 4. Caching Strategies

#### Cache First
- Google Fonts webfonts
- Audio files (mp3, wav, ogg)
- Video files (mp4)

#### Stale While Revalidate
- Google Fonts stylesheets
- Font files (eot, otf, ttf, woff, woff2)
- Images (jpg, jpeg, gif, png, svg, ico, webp)
- Next.js images
- JavaScript files
- CSS files
- Next.js data files

#### Network First
- JSON, XML, CSV files
- Same-origin pages (excluding API routes)

## Components

### InstallPrompt
Komponen untuk menampilkan prompt install PWA.

**Features:**
- Auto-detect platform (Android/iOS/Desktop)
- iOS manual instructions
- Dismissible dengan localStorage tracking
- Responsive design

**Usage:**
```tsx
import InstallPrompt from '@/components/InstallPrompt';

// Already included in root layout
<InstallPrompt />
```

### OfflineIndicator
Komponen untuk menampilkan status koneksi internet.

**Features:**
- Real-time online/offline detection
- Auto-hide notification after 3 seconds (online)
- Persistent notification when offline
- Accessible with ARIA attributes

**Usage:**
```tsx
import OfflineIndicator from '@/components/OfflineIndicator';

// Already included in root layout
<OfflineIndicator />
```

## Hooks

### useOnlineStatus
Hook untuk mendeteksi status koneksi internet.

**Usage:**
```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

### usePWA
Hook untuk mengelola PWA install state.

**Usage:**
```tsx
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { isInstallable, isInstalled, install } = usePWA();
  
  if (isInstalled) {
    return <div>App sudah terinstall</div>;
  }
  
  if (isInstallable) {
    return (
      <button onClick={install}>
        Install App
      </button>
    );
  }
  
  return null;
}
```

### useOfflineData
Hook untuk fetching data dengan offline cache support.

**Usage:**
```tsx
import { useOfflineData } from '@/hooks/useOfflineData';

function MyComponent() {
  const { data, isLoading, error, isFromCache, refetch } = useOfflineData({
    key: 'dashboard-stats',
    fetchFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      return response.json();
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {isFromCache && <p>Menampilkan data cache</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## Utilities

### Offline Cache
Utility functions untuk caching data.

**Functions:**
- `cacheData(key, data)` - Save data to cache
- `getCachedData(key)` - Retrieve cached data
- `clearCache(key)` - Clear specific cache
- `clearAllCache()` - Clear all cached data
- `isCached(key)` - Check if data is cached

**Usage:**
```tsx
import { cacheData, getCachedData } from '@/lib/offline-cache';

// Save data
cacheData('user-profile', { name: 'John', email: 'john@example.com' });

// Retrieve data
const profile = getCachedData('user-profile');
```

## Configuration

### next.config.ts
PWA configuration dengan next-pwa plugin:

```typescript
import withPWA from "@ducanh2912/next-pwa";

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // ... caching strategies
  ],
})(nextConfig);
```

### manifest.ts
Web app manifest configuration:

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Academic Insight PWA',
    short_name: 'Academic Insight',
    description: '...',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    // ... icons and other settings
  };
}
```

## Testing PWA

### Local Testing
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Open in browser: `http://localhost:3000`
4. Open DevTools > Application > Service Workers
5. Check "Offline" to test offline mode

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit
5. Target score: >90

### Install Testing

#### Android
1. Open app in Chrome
2. Tap "Add to Home Screen" prompt
3. Confirm installation
4. Open app from home screen

#### iOS
1. Open app in Safari
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. Confirm installation
5. Open app from home screen

#### Desktop
1. Open app in Chrome/Edge
2. Click install icon in address bar
3. Confirm installation
4. Open app from desktop/start menu

## Deployment

### Vercel
PWA works automatically on Vercel with no additional configuration needed.

### Environment Variables
No additional environment variables required for PWA functionality.

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS is enabled (required for service workers)
- Clear browser cache and reload

### Install Prompt Not Showing
- PWA must be served over HTTPS
- Manifest must be valid
- Icons must be accessible
- User must not have dismissed recently

### Offline Mode Not Working
- Ensure service worker is registered
- Check cache storage in DevTools
- Verify caching strategies in next.config.ts

### Icons Not Displaying
- Run `npm run generate:icons` to create icons
- Verify icon files exist in public/ directory
- Check manifest.ts icon paths

## Best Practices

1. **Always cache critical data** when online for offline access
2. **Show offline indicators** to inform users of connection status
3. **Provide fallback UI** for offline scenarios
4. **Test thoroughly** on different devices and browsers
5. **Monitor cache size** to avoid storage quota issues
6. **Update service worker** when deploying new versions

## Resources

- [Next PWA Documentation](https://github.com/DuCanhGH/next-pwa)
- [PWA Best Practices](https://web.dev/pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
