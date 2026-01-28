# Setup Instructions - Firebase Backend

This guide will walk you through setting up Firebase backend for your Next.js application.

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This installs Firebase SDK and all required dependencies.

### Step 2: Set Up Firebase

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Firestore:**
   - Go to **Build** → **Firestore Database**
   - Click **Create database**
   - Choose **Start in test mode**
   - Select a location

3. **Get Your Firebase Config:**
   - Go to Project Settings (gear icon)
   - Scroll to **Your apps**
   - Click **Web** icon (`</>`)
   - Copy the configuration values

### Step 3: Configure Environment Variables

Update your `.env` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to get these values:**
- Firebase Console → Project Settings → Your apps → Web app config
- Replace all `your-*` placeholders with actual values from Firebase

### Step 4: Test Your Setup

```bash
npm run dev
```

Visit `http://localhost:3000/api/health` - you should see:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Detailed Setup

See `FIREBASE_SETUP.md` for complete step-by-step instructions including:
- Creating Firestore indexes
- Setting up security rules
- Production deployment
- Troubleshooting

## What's Different from Prisma?

- ✅ **No database migrations** - Firestore is schema-less
- ✅ **Real-time updates** - Built-in real-time listeners
- ✅ **Scalable** - Handles millions of documents
- ✅ **Free tier** - 50K reads/day, 20K writes/day
- ✅ **Cloud-hosted** - No local database files

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up Firebase project
3. ✅ Add Firebase config to `.env`
4. ✅ Test the health endpoint
5. ✅ Start building!

For detailed Firebase setup, see `FIREBASE_SETUP.md`.
