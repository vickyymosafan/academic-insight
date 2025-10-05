# Academic Insight PWA

Dashboard analisis kinerja program studi untuk dosen dan administrator universitas. Aplikasi ini menyediakan visualisasi data statistik mahasiswa seperti IPK, tingkat kelulusan, dan dropout rate dalam format yang mudah dipahami dan dapat diakses melalui perangkat mobile maupun desktop.

## ✨ Features

- 🔐 **Authentication**: Secure login with Supabase Auth
- 📊 **Dashboard**: Real-time statistics and data visualization
- 📱 **Progressive Web App**: Install on mobile and desktop
- 🎨 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Real-time Updates**: Live data updates with Supabase Realtime
- 🔒 **Row Level Security**: Secure data access with RLS policies
- 📈 **Data Visualization**: Interactive charts with Recharts
- 🌐 **Offline Support**: Works offline with service worker caching
- 🚀 **Performance Optimized**: Lighthouse score >90

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **PWA**: next-pwa with Workbox
- **Charts**: Recharts
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd academic-insight-pwa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Set up Supabase database

Run the migrations in the `supabase/migrations` directory to create the database schema and RLS policies.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint

# Performance & Analysis
npm run lighthouse       # Run Lighthouse audit locally
npm run lighthouse:prod  # Run Lighthouse audit on production
npm run analyze          # Analyze bundle size

# Security
npm run test:security    # Test security headers locally
npm run test:security:prod # Test security headers on production

# Supabase
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:reset   # Reset local database
```

## 🚀 Deployment

### Quick Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Deployment Documentation

- [Vercel Deployment Guide](./docs/VERCEL-DEPLOYMENT.md) - Complete deployment instructions
- [Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md) - Pre-deployment checklist
- [Performance Optimization](./docs/PERFORMANCE-OPTIMIZATION.md) - Performance best practices

## 📚 Documentation

- [E2E Testing Guide](./docs/E2E-TESTING.md)
- [Error Handling & Loading States](./docs/ERROR-HANDLING-AND-LOADING-STATES.md)
- [PWA Features](./docs/PWA-FEATURES.md)
- [PWA Implementation Summary](./docs/PWA-IMPLEMENTATION-SUMMARY.md)
- [Security Implementation](./docs/SECURITY-IMPLEMENTATION.md)
- [Security Headers](./docs/SECURITY-HEADERS.md)
- [Testing Guide](./docs/TESTING.md)
- [Performance Optimization](./docs/PERFORMANCE-OPTIMIZATION.md)
- [Vercel Deployment](./docs/VERCEL-DEPLOYMENT.md)
- [Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md)
- [GitHub Actions Setup](./docs/GITHUB-ACTIONS-SETUP.md)

## 🏗️ Project Structure

```
academic-insight-pwa/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── auth/          # Auth components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── skeletons/     # Loading skeletons
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── tests/            # RLS policy tests
├── e2e/                   # E2E tests
├── docs/                  # Documentation
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🔒 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **HTTPS**: Enforced on all connections
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: SameSite cookies

## ⚡ Performance

- **Lighthouse Score**: >90
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image with WebP/AVIF
- **Caching**: Service worker and API caching
- **Bundle Size**: Optimized with tree-shaking

## 🧪 Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: >80% for critical components
- **RLS Tests**: Automated RLS policy testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
- [Recharts](https://recharts.org/)

## 📧 Support

For support, email [your-email] or open an issue in the repository.
