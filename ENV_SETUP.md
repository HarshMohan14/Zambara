# Environment Variables Setup Guide

This guide explains what environment variables you need and where to get them.

## Quick Start

The `.env` file has been created for you with default development values. You can start using it immediately for local development!

## Environment Variables Explained

### 1. DATABASE_URL

**What it is:** The connection string for your database.

**For Development (Current Setup):**
```
DATABASE_URL="file:./dev.db"
```
- **What it does:** Uses SQLite, a file-based database perfect for development
- **Where it comes from:** This is a local file path - no external service needed
- **File location:** The database file (`dev.db`) will be created in the `prisma/` folder when you run `npm run db:push`
- **No setup required:** This works out of the box!

**For Production (When Deploying):**
```
DATABASE_URL="postgresql://username:password@localhost:5432/zambara?schema=public"
```
- **What it does:** Connects to a PostgreSQL database (more robust for production)
- **Where to get it:**
  - **Local PostgreSQL:** Install PostgreSQL and create a database
  - **Cloud Providers:**
    - **Vercel Postgres:** Get connection string from Vercel dashboard
    - **Supabase:** Get connection string from Supabase project settings
    - **Railway:** Get connection string from Railway project dashboard
    - **Render:** Get connection string from Render database dashboard
    - **AWS RDS:** Get connection string from AWS RDS console
    - **Heroku Postgres:** Get connection string from Heroku config vars

**Format Breakdown:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

### 2. NEXT_PUBLIC_SITE_URL

**What it is:** Your website's public URL (used for SEO, links, etc.)

**For Development:**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
- **What it does:** Points to your local development server
- **No changes needed:** This is correct for local development

**For Production:**
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```
- **What it does:** Points to your production website
- **Where to get it:** Your actual domain name (e.g., `https://zambara.com`)
- **Update when:** You deploy to production

## Current Setup (Development)

Your `.env` file is already configured for local development:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**You don't need to change anything right now!** These values will work perfectly for development.

## Where to Get Production Values

### When You're Ready to Deploy

#### Option 1: Vercel (Recommended for Next.js)

1. **Database:**
   - Go to Vercel Dashboard → Your Project → Storage
   - Create a Postgres database
   - Copy the connection string
   - Add to `.env` as `DATABASE_URL`

2. **Site URL:**
   - Your Vercel deployment URL (e.g., `https://zambara.vercel.app`)
   - Or your custom domain if configured

#### Option 2: Supabase (Free PostgreSQL)

1. **Database:**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Project Settings → Database
   - Copy the connection string (under "Connection string")
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Site URL:**
   - Your deployment URL or custom domain

#### Option 3: Railway

1. **Database:**
   - Sign up at [railway.app](https://railway.app)
   - Create a new PostgreSQL database
   - Copy the connection string from the database service
   - Add to `.env`

2. **Site URL:**
   - Your Railway deployment URL

#### Option 4: Render

1. **Database:**
   - Sign up at [render.com](https://render.com)
   - Create a PostgreSQL database
   - Copy the internal connection string
   - Add to `.env`

2. **Site URL:**
   - Your Render deployment URL

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use different values for development and production
- Never commit `.env` to version control
- Use environment variables in your hosting platform for production

### ❌ DON'T:
- Share your `.env` file publicly
- Commit database passwords to git
- Use production database URLs in development

## Testing Your Setup

After creating your `.env` file:

1. **Verify the file exists:**
   ```bash
   cat .env
   ```

2. **Initialize the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Test the connection:**
   ```bash
   npm run dev
   ```
   Then visit: `http://localhost:3000/api/health`
   
   You should see: `{"status":"healthy","timestamp":"...","database":"connected"}`

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env` file exists in the root directory
- Check that the file name is exactly `.env` (not `.env.txt`)
- Restart your development server after creating/modifying `.env`

### "Cannot connect to database"
- **Development:** Make sure you've run `npm run db:push` to create the database file
- **Production:** Verify your connection string is correct and the database is accessible

### "Prisma Client not generated"
- Run `npm run db:generate` to generate the Prisma Client
- Make sure `node_modules/.prisma/client` exists

## Summary

**For Development (Right Now):**
- ✅ `.env` file is already created
- ✅ No additional setup needed
- ✅ Just run `npm run db:generate` and `npm run db:push`

**For Production (Later):**
- Get PostgreSQL connection string from your hosting provider
- Update `DATABASE_URL` in your hosting platform's environment variables
- Update `NEXT_PUBLIC_SITE_URL` to your production domain

You're all set for development! 🚀
