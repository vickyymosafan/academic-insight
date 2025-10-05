# GitHub Actions Setup Guide

## Overview

This guide explains how to set up GitHub Actions for the Academic Insight PWA CI/CD pipeline.

## Required GitHub Secrets

To enable the CI/CD pipeline, you need to add the following secrets to your GitHub repository:

### 1. Supabase Secrets (Required for Build & Tests)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → Project API keys → anon/public |

### 2. Vercel Secrets (Required for Deployment Jobs)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel deployment token | Vercel Dashboard → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel Dashboard → Settings → General → Organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID | Project Settings → General → Project ID |

## How to Add Secrets to GitHub

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret

For each secret listed above:

1. Click **New repository secret**
2. Enter the **Name** (exactly as shown in the table)
3. Enter the **Value** (copy from Supabase/Vercel dashboard)
4. Click **Add secret**

### Step 3: Verify Secrets

After adding all secrets, you should see them listed (values are hidden):

```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ VERCEL_TOKEN
✓ VERCEL_ORG_ID
✓ VERCEL_PROJECT_ID
```

## Getting Supabase Credentials

### 1. Get Supabase URL and Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Getting Vercel Credentials

### 1. Get Vercel Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture → **Settings**
3. Navigate to **Tokens**
4. Click **Create Token**
5. Give it a name (e.g., "GitHub Actions")
6. Select scope: **Full Account**
7. Click **Create**
8. Copy the token immediately (you won't see it again!)

### 2. Get Vercel Organization ID

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile/team name
3. Navigate to **Settings** → **General**
4. Copy the **Organization ID** (or **Team ID**)

**Example:**
```
VERCEL_ORG_ID=team_abc123xyz
```

### 3. Get Vercel Project ID

1. Go to your project in Vercel Dashboard
2. Click **Settings**
3. Navigate to **General**
4. Copy the **Project ID**

**Example:**
```
VERCEL_PROJECT_ID=prj_abc123xyz
```

## CI/CD Pipeline Overview

The pipeline includes the following jobs:

### 1. Lint and Test
- Runs ESLint
- Runs unit tests with coverage
- Uploads coverage to Codecov

### 2. Build
- Builds the Next.js application
- Verifies build output
- Runs on every push and PR

### 3. E2E Tests
- Runs Playwright E2E tests
- Only runs on pull requests
- Uploads test reports

### 4. Security Scan
- Runs npm audit
- Checks for vulnerabilities
- Fails on moderate+ vulnerabilities

### 5. Deploy Preview
- Deploys to Vercel preview environment
- Only runs on pull requests
- Requires Vercel secrets

### 6. Deploy Production
- Deploys to Vercel production
- Only runs on push to main branch
- Requires Vercel secrets

## Workflow Triggers

The workflow runs on:

- **Push to main or staging branches**: Runs all jobs including production deployment
- **Pull requests to main or staging**: Runs tests and creates preview deployment

## Disabling Deployment Jobs (Optional)

If you don't want to use automatic deployments, you can disable the deployment jobs:

### Option 1: Comment Out Deployment Jobs

Edit `.github/workflows/ci.yml` and comment out the `deploy-preview` and `deploy-production` jobs:

```yaml
# deploy-preview:
#   name: Deploy Preview (Vercel)
#   ...

# deploy-production:
#   name: Deploy Production (Vercel)
#   ...
```

### Option 2: Remove Deployment Jobs

Delete the `deploy-preview` and `deploy-production` job sections entirely.

## Testing the Pipeline

### 1. Test on Pull Request

```bash
# Create a feature branch
git checkout -b test-ci

# Make a small change
echo "# Test" >> test.md
git add test.md
git commit -m "test: CI pipeline"

# Push and create PR
git push origin test-ci
```

Then create a pull request on GitHub and watch the Actions tab.

### 2. Test on Main Branch

```bash
# Merge PR or push directly to main
git checkout main
git merge test-ci
git push origin main
```

Watch the Actions tab for the production deployment.

## Viewing Workflow Results

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Click on a workflow run to see details
4. Click on individual jobs to see logs

## Troubleshooting

### Build Fails with "secrets.NEXT_PUBLIC_SUPABASE_URL is undefined"

**Solution**: Add the required secrets to your GitHub repository (see above).

### Deployment Fails with "Vercel token is invalid"

**Solution**: 
1. Verify `VERCEL_TOKEN` is correct
2. Check token hasn't expired
3. Ensure token has correct permissions

### E2E Tests Fail

**Solution**:
1. Check if tests pass locally: `npm run test:e2e`
2. Verify Supabase credentials are correct
3. Check test logs in GitHub Actions

### Security Scan Fails

**Solution**:
1. Run `npm audit` locally
2. Fix vulnerabilities: `npm audit fix`
3. Update dependencies if needed

## Optional: Codecov Integration

To enable code coverage reporting:

1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token
5. Add as GitHub secret: `CODECOV_TOKEN`

## Best Practices

1. **Keep Secrets Secure**: Never commit secrets to the repository
2. **Use Environment-Specific Secrets**: Use different Supabase projects for staging/production
3. **Monitor Workflow Runs**: Check Actions tab regularly for failures
4. **Update Dependencies**: Keep GitHub Actions up to date
5. **Test Locally First**: Always test changes locally before pushing

## Workflow Status Badge

Add a status badge to your README:

```markdown
![CI/CD Pipeline](https://github.com/your-username/your-repo/workflows/CI%2FCD%20Pipeline/badge.svg)
```

Replace `your-username` and `your-repo` with your GitHub username and repository name.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Codecov Documentation](https://docs.codecov.com/docs)

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions tab
2. Verify all secrets are correctly set
3. Test the build locally: `npm run build`
4. Check GitHub Actions status: [status.github.com](https://www.githubstatus.com/)
