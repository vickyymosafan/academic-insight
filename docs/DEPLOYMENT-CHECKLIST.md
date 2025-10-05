# Deployment Checklist

Use this checklist before deploying to production to ensure everything is configured correctly.

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Code reviewed and approved
- [ ] All console.logs removed (except error/warn)

### 2. Environment Configuration

- [ ] `.env.example` is up to date
- [ ] All required environment variables documented
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Sample data seeded (if needed)

### 3. Security

- [ ] Security headers configured (`npm run test:security`)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CSP headers properly configured
- [ ] No sensitive data in client-side code
- [ ] Service role key kept secret
- [ ] Authentication working correctly
- [ ] RLS policies tested thoroughly
- [ ] Input validation implemented
- [ ] XSS protection in place
- [ ] CSRF protection considered

### 4. Performance

- [ ] Lighthouse performance score >90 (`npm run lighthouse`)
- [ ] Images optimized (WebP/AVIF)
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] Bundle size analyzed (`npm run analyze`)
- [ ] API caching strategies implemented
- [ ] Service worker caching configured
- [ ] Font optimization applied
- [ ] No unnecessary dependencies

### 5. PWA Features

- [ ] Manifest file configured
- [ ] Service worker registered
- [ ] Install prompt working
- [ ] Offline mode functional
- [ ] Icons generated (192x192, 512x512)
- [ ] Theme colors configured
- [ ] Splash screens working (iOS)
- [ ] Add to home screen tested

### 6. Database

- [ ] Database schema finalized
- [ ] Indexes created for performance
- [ ] RLS policies enabled on all tables
- [ ] Foreign key constraints in place
- [ ] Backup strategy configured
- [ ] Connection pooling configured
- [ ] Query performance optimized

### 7. Supabase Configuration

- [ ] Project created in Supabase
- [ ] Database tables created
- [ ] RLS policies applied
- [ ] Authentication providers configured
- [ ] Redirect URLs configured
- [ ] CORS settings configured
- [ ] API keys secured
- [ ] Rate limiting considered

### 8. Vercel Configuration

- [ ] Vercel account created
- [ ] Project connected to Git repository
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Domain configured (if custom)
- [ ] SSL certificate provisioned
- [ ] Analytics enabled (optional)
- [ ] Deployment protection configured

### 9. Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] Accessibility testing done
- [ ] Performance testing done

### 10. Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] Environment variables documented
- [ ] Architecture documented
- [ ] Troubleshooting guide available

## Deployment Steps

### 1. Final Code Review

```bash
# Pull latest changes
git pull origin main

# Run all tests
npm run test
npm run test:e2e

# Build locally
npm run build

# Check for errors
npm run lint
```

### 2. Update Version

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Commit version bump
git add package.json package-lock.json
git commit -m "chore: bump version to x.x.x"
```

### 3. Push to Repository

```bash
# Push to main branch
git push origin main

# Push tags
git push --tags
```

### 4. Monitor Deployment

1. Go to Vercel Dashboard
2. Watch build logs
3. Verify deployment succeeds
4. Check deployment URL

### 5. Verify Production

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Dashboard displays data
- [ ] API routes respond
- [ ] PWA features work
- [ ] Images load correctly
- [ ] No console errors

### 6. Post-Deployment Testing

```bash
# Run Lighthouse on production
npm run lighthouse:prod

# Test security headers
npm run test:security:prod

# Manual testing checklist
```

## Post-Deployment Checklist

### 1. Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up

### 2. Performance Verification

- [ ] Lighthouse score >90
- [ ] FCP <1.5s
- [ ] LCP <2.5s
- [ ] CLS <0.1
- [ ] TTI <3.8s
- [ ] No performance regressions

### 3. Functionality Testing

- [ ] Login/logout works
- [ ] Dashboard loads correctly
- [ ] Data visualization works
- [ ] Real-time updates work
- [ ] Filtering and sorting work
- [ ] PWA install works
- [ ] Offline mode works

### 4. Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 5. Mobile Testing

- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] PWA install on mobile
- [ ] Offline mode on mobile
- [ ] Performance on mobile

### 6. Security Verification

- [ ] HTTPS working
- [ ] Security headers present
- [ ] CSP not blocking resources
- [ ] Authentication secure
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities

### 7. SEO and Metadata

- [ ] Meta tags present
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Favicon present

### 8. Analytics and Tracking

- [ ] Vercel Analytics working
- [ ] Google Analytics configured (if used)
- [ ] Error tracking working
- [ ] Performance metrics tracked
- [ ] User events tracked

## Rollback Plan

If issues are discovered after deployment:

### Immediate Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback successful

### Using CLI

```bash
vercel rollback
```

### Fix and Redeploy

1. Identify the issue
2. Create hotfix branch
3. Fix the issue
4. Test thoroughly
5. Deploy fix

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Team Lead**: [contact info]
- **DevOps**: [contact info]

## Common Issues and Solutions

### Build Fails

**Issue**: Build fails on Vercel

**Solution**:
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check for missing dependencies

### Environment Variables Not Working

**Issue**: App can't connect to Supabase

**Solution**:
1. Verify variables in Vercel Dashboard
2. Check variable names (case-sensitive)
3. Ensure `NEXT_PUBLIC_` prefix for client vars
4. Redeploy after adding variables

### Performance Issues

**Issue**: Slow load times

**Solution**:
1. Run Lighthouse audit
2. Check bundle size
3. Verify image optimization
4. Check API response times
5. Review caching strategies

### PWA Not Working

**Issue**: Install prompt doesn't appear

**Solution**:
1. Verify HTTPS is enabled
2. Check manifest.json is accessible
3. Verify service worker registered
4. Test in incognito mode
5. Check browser console for errors

## Success Criteria

Deployment is successful when:

- ✅ Application is accessible at production URL
- ✅ All core features working
- ✅ Performance score >90
- ✅ No critical errors in logs
- ✅ Authentication working
- ✅ Database connections stable
- ✅ PWA features functional
- ✅ Mobile experience smooth
- ✅ Security headers present
- ✅ Monitoring active

## Sign-off

- [ ] Developer: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______

## Notes

Add any deployment-specific notes here:

---

**Last Updated**: [Date]
**Version**: [Version Number]
**Deployed By**: [Name]
