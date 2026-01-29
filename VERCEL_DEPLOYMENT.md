# Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel and configure environment variables.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your Firebase project credentials (from Firebase Console)

## Step 1: Build Verification

✅ **Build completed successfully!** Your application is ready for deployment.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Project name
   - Directory (press Enter for current directory)
   - Override settings (press Enter for defaults)

### Option B: Deploy via GitHub/GitLab/Bitbucket

1. Push your code to a Git repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Configure project settings
6. Click "Deploy"

## Step 3: Add Environment Variables in Vercel

**Important:** After deploying, you MUST add your Firebase environment variables in Vercel.

### Where to Add Environment Variables:

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab (left sidebar)
   - Click on **Environment Variables** (under "Configuration")

3. **Add Each Environment Variable**

   Click **"Add New"** and add the following variables one by one:

   | Variable Name | Description | Example |
   |--------------|-------------|---------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyDQY85sYWa1bA6eHUY5Wd2zs7uPktfXFNU` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `zambara.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `zambara` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `zambara.firebasestorage.app` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `213267817462` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:213267817462:web:d74bfb1edd2b2a97d21dd7` |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (optional) | `G-WXCR5VW5V0` |
   | `NEXT_PUBLIC_SITE_URL` | Your production site URL | `https://your-project.vercel.app` |

4. **Set Environment Scope**
   - For each variable, select the environments where it should be available:
     - ✅ **Production** (required)
     - ✅ **Preview** (recommended for testing)
     - ✅ **Development** (optional, if using Vercel CLI)

5. **Save Variables**
   - Click **"Save"** after adding each variable
   - All variables must start with `NEXT_PUBLIC_` to be accessible in the browser

### Quick Copy-Paste Format:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

## Step 4: Redeploy After Adding Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on your latest deployment
3. Select **"Redeploy"**
4. Or trigger a new deployment by pushing to your Git repository

**Note:** Environment variables are only available after redeployment.

## Step 5: Verify Deployment

1. Visit your deployed site: `https://your-project.vercel.app`
2. Check the browser console for any errors
3. Test key features:
   - Home page loads correctly
   - Contact form works
   - Admin panel accessible (if applicable)

## Step 6: Get Your Firebase Credentials

If you need to find your Firebase credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **"Project settings"**
5. Scroll to **"Your apps"** section
6. Click on your web app (or create one if needed)
7. Copy the configuration values

## Troubleshooting

### Environment Variables Not Working

- ✅ Ensure all variables start with `NEXT_PUBLIC_`
- ✅ Redeploy after adding variables
- ✅ Check variable names match exactly (case-sensitive)
- ✅ Verify values don't have extra spaces or quotes

### Build Errors

- ✅ Check Vercel build logs for specific errors
- ✅ Ensure all dependencies are in `package.json`
- ✅ Verify TypeScript compilation passes locally (`npm run build`)

### Firebase Connection Issues

- ✅ Verify Firebase credentials are correct
- ✅ Check Firestore Security Rules allow access
- ✅ Ensure Firebase project is active and billing is enabled (if needed)

### API Routes Not Working

- ✅ Check Vercel Function logs in dashboard
- ✅ Verify API routes are in `app/api/` directory
- ✅ Test endpoints locally first

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Firebase Console for errors
3. Verify environment variables are set correctly
4. Test locally with production environment variables

---

**✅ Your build is ready!** Follow the steps above to deploy and configure environment variables in Vercel.
