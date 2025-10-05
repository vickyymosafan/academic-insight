# Deployment Guide - Academic Insight PWA

## Quick Start

This guide will help you deploy the Academic Insight PWA to Vercel in production.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Create at [supabase.com](https://supabase.com)
3. **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket

## Environment Variables

You'll need these environment variables from your Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Deployment Steps

### 1. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
4. Add environment variables (see above)
5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2. Configure Supabase

After deployment, update Supabase settings:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Vercel URL:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/dashboard`

### 3. Verify Deployment

Check that everything works:

- [ ] Application loads
- [ ] Login works
- [ ] Dashboard displays data
- [ ] PWA features work

## Performance Testing

Run Lighthouse audit on your production URL:

```bash
npm run lighthouse:prod
```

Target scores:
- Performance: >90
- PWA: >90
- Accessibility: >90
- Best Practices: >90

## Continuous Deployment

Vercel automatically deploys when you push to your repository:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys!
```

## Documentation

For detailed guides, see:

- [Vercel Deployment Guide](./docs/VERCEL-DEPLOYMENT.md) - Complete deployment instructions
- [Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md) - Pre-deployment checklist
- [Performance Optimization](./docs/PERFORMANCE-OPTIMIZATION.md) - Performance best practices

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check for errors
npm run lint
```

### Environment Variables Not Working

1. Verify variables in Vercel Dashboard
2. Ensure `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding variables

### Supabase Connection Issues

1. Verify Supabase URL and keys
2. Check redirect URLs in Supabase settings
3. Verify project is not paused

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

## Quick Commands

```bash
# Build locally
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Lighthouse audit
npm run lighthouse

# Security headers test
npm run test:security

# Bundle analysis
npm run analyze
```

## Production URL

After deployment, your app will be available at:
```
https://your-project.vercel.app
```

## Custom Domain (Optional)

To add a custom domain:

1. Go to **Project Settings** → **Domains**
2. Add your domain
3. Configure DNS records
4. Wait for SSL certificate (automatic)

---

**Need help?** Check the [detailed deployment guide](./docs/VERCEL-DEPLOYMENT.md) or [deployment checklist](./docs/DEPLOYMENT-CHECKLIST.md).
