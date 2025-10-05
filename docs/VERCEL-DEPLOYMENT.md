# Vercel Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Academic Insight PWA to Vercel, including environment configuration, automatic deployments, and production best practices.

## Prerequisites

Before deploying, ensure you have:

- [ ] A Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Supabase project with database configured
- [ ] All environment variables ready

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment"

# Push to remote repository
git push origin main
```

### 2. Connect to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Vercel to access your repositories
5. Select the `academic-insight-pwa` repository
6. Click "Import"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

### 3. Configure Project Settings

In the Vercel project configuration:

#### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### Node.js Version
- **Node.js Version**: 20.x (recommended)

### 4. Configure Environment Variables

Add the following environment variables in Vercel Dashboard:

#### Required Variables

Go to **Project Settings** → **Environment Variables** and add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Environment Scopes

For each variable, select the appropriate environments:
- ✅ **Production**: For production deployments
- ✅ **Preview**: For preview deployments (pull requests)
- ⬜ **Development**: Not needed (use `.env.local` locally)

#### How to Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 5. Deploy

#### First Deployment

After configuring environment variables:

1. Click **"Deploy"** in Vercel Dashboard
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a production URL: `https://your-project.vercel.app`

#### Subsequent Deployments

Vercel automatically deploys when you push to your repository:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys!
```

### 6. Configure Custom Domain (Optional)

#### Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `academic-insight.com`)
4. Follow DNS configuration instructions

#### DNS Configuration

Add the following DNS records to your domain provider:

**For root domain (academic-insight.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### SSL Certificate

Vercel automatically provisions SSL certificates for all domains. This usually takes a few minutes.

### 7. Configure Build Settings

#### Build & Development Settings

Go to **Project Settings** → **Build & Development Settings**:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

#### Environment Variables for Build

Ensure all `NEXT_PUBLIC_*` variables are available during build time.

### 8. Set Up Preview Deployments

Preview deployments are automatically created for:
- Pull requests
- Non-production branches

#### Configure Preview Settings

1. Go to **Project Settings** → **Git**
2. Configure:
   - **Production Branch**: `main` or `master`
   - **Preview Deployments**: Enable for all branches
   - **Automatic Deployments**: Enable

#### Preview URLs

Each preview deployment gets a unique URL:
```
https://academic-insight-git-feature-branch-username.vercel.app
```

### 9. Configure Deployment Protection

#### Production Deployment Protection

1. Go to **Project Settings** → **Deployment Protection**
2. Enable **"Vercel Authentication"** for production
3. Add team members who can access protected deployments

#### Preview Deployment Protection

Enable password protection for preview deployments:
1. Go to **Project Settings** → **Deployment Protection**
2. Enable **"Password Protection"** for previews
3. Set a password

## Post-Deployment Configuration

### 1. Verify Deployment

Check the following after deployment:

- [ ] Application loads correctly
- [ ] Authentication works (Supabase connection)
- [ ] Dashboard displays data
- [ ] PWA features work (install prompt, offline mode)
- [ ] Images load correctly
- [ ] API routes respond correctly

### 2. Test Performance

Run Lighthouse audit on production:

```bash
npm run lighthouse:prod
```

Verify:
- [ ] Performance score >90
- [ ] PWA score >90
- [ ] Accessibility score >90
- [ ] Best Practices score >90

### 3. Configure Supabase for Production

Update Supabase settings for production domain:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Vercel production URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/dashboard`

### 4. Enable Vercel Analytics (Optional)

1. Go to **Project Settings** → **Analytics**
2. Click **"Enable Analytics"**
3. Choose plan (Free tier available)

Benefits:
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Geographic distribution
- Device and browser analytics

### 5. Configure Security Headers

Verify security headers are applied:

```bash
npm run test:security:prod
```

Expected headers:
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Content-Security-Policy
- ✅ Referrer-Policy

## Continuous Deployment Workflow

### Automatic Deployments

```
┌─────────────┐
│  Git Push   │
│   to main   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │
│  Detects    │
│   Change    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │
│  Project    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │
│ Production  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Live!     │
└─────────────┘
```

### Branch Workflow

```
main (production)
  ├── feature/new-dashboard → Preview deployment
  ├── fix/auth-bug → Preview deployment
  └── staging → Staging deployment (optional)
```

### Deployment Notifications

Configure notifications in **Project Settings** → **Notifications**:

- **Slack**: Get deployment notifications in Slack
- **Email**: Receive deployment status emails
- **Webhooks**: Custom webhook integrations

## Staging Environment (Optional)

### Create Staging Environment

1. Create a `staging` branch:
```bash
git checkout -b staging
git push origin staging
```

2. In Vercel Dashboard:
   - Go to **Project Settings** → **Git**
   - Add `staging` as a production branch
   - Configure separate environment variables for staging

3. Access staging at:
```
https://academic-insight-staging.vercel.app
```

## Rollback Deployments

### Rollback to Previous Version

1. Go to **Deployments** tab
2. Find the previous successful deployment
3. Click **"..."** menu
4. Select **"Promote to Production"**

### Instant Rollback

```bash
# Using Vercel CLI
vercel rollback
```

## Monitoring and Logs

### View Deployment Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

### Real-time Logs

```bash
# Using Vercel CLI
vercel logs --follow
```

### Error Tracking

Integrate error tracking services:

- **Sentry**: For error monitoring
- **LogRocket**: For session replay
- **Datadog**: For comprehensive monitoring

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found error

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working

**Issue**: Environment variables not available in production

**Solution**:
1. Verify variables are set in Vercel Dashboard
2. Ensure `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding variables

### Supabase Connection Issues

**Issue**: Cannot connect to Supabase in production

**Solution**:
1. Verify Supabase URL and keys are correct
2. Check Supabase project is not paused
3. Verify redirect URLs in Supabase settings
4. Check CORS settings in Supabase

### PWA Not Installing

**Issue**: Install prompt doesn't appear in production

**Solution**:
1. Verify HTTPS is enabled (automatic on Vercel)
2. Check manifest.json is accessible
3. Verify service worker is registered
4. Test in incognito mode

### Performance Issues

**Issue**: Slow load times in production

**Solution**:
1. Run `npm run analyze` to check bundle size
2. Verify images are optimized
3. Check Vercel Analytics for bottlenecks
4. Enable Edge Functions if needed

## Best Practices

### 1. Use Preview Deployments

Always test changes in preview deployments before merging to production:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create pull request
# Test preview deployment
# Merge when ready
```

### 2. Environment-Specific Configuration

Use different Supabase projects for staging and production:

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co

# Staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
```

### 3. Monitor Performance

Regularly check:
- Vercel Analytics dashboard
- Lighthouse scores
- Error rates
- Response times

### 4. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test thoroughly before deploying
```

### 5. Use Vercel Edge Functions

For better performance, consider using Edge Functions for:
- Authentication middleware
- API routes with low latency requirements
- Geolocation-based content

## Security Checklist

Before going live:

- [ ] All environment variables are set correctly
- [ ] Service role key is kept secret (not in client code)
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Security headers are configured
- [ ] CORS is properly configured in Supabase
- [ ] RLS policies are enabled in Supabase
- [ ] Authentication is working correctly
- [ ] No sensitive data in client-side code
- [ ] CSP headers are configured
- [ ] Rate limiting is considered for API routes

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Analytics](https://vercel.com/analytics)

## Support

If you encounter issues:

1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Contact Vercel Support (Pro/Enterprise plans)
4. Check project logs in Vercel Dashboard
