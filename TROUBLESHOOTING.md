# Troubleshooting Guide

## API 500 Errors - User Creation

If you're seeing `POST /api/users 500` errors, follow these steps:

### Step 1: Check Firebase Configuration

Verify your `.env` file has all Firebase values:

```bash
cat .env | grep FIREBASE
```

You should see:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

### Step 2: Verify Firestore is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **zambara**
3. Go to **Build** → **Firestore Database**
4. Make sure database is created and in **test mode**

### Step 3: Check Security Rules

Go to Firestore → **Rules** tab and ensure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only!
    }
  }
}
```

**⚠️ Important:** These rules allow all access. Update for production!

### Step 4: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:
- `✅ Firebase initialized successfully`
- Any error messages about Firebase

### Step 5: Test Firebase Connection

Visit: `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

If you see `"database": "disconnected"`, Firebase isn't configured correctly.

### Step 6: Create Firestore Indexes (If Needed)

If you see index errors:

1. **Check the error message** - it contains a link
2. **Click the link** - opens Firebase Console
3. **Create the index** - Firebase builds it automatically
4. **Wait 1-5 minutes** - for index to be ready

See `FIREBASE_INDEXES.md` for details.

### Step 7: Check Browser Console

Open browser DevTools → Console tab and look for:
- Firebase initialization errors
- Network errors
- API error details

## Common Issues

### "Permission denied"
- **Fix:** Update Firestore security rules (see Step 3)

### "Index required"
- **Fix:** Create the index (see Step 6)

### "Firebase not initialized"
- **Fix:** Check `.env` file has correct values
- **Fix:** Restart dev server: `npm run dev`

### "Network error"
- **Fix:** Check internet connection
- **Fix:** Verify Firebase project is active

## Still Having Issues?

1. **Check terminal logs** - Look for detailed error messages
2. **Check browser console** - Look for client-side errors
3. **Verify Firebase Console** - Make sure project is active
4. **Test with curl:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser"}'
```

This will show you the exact error message.

## Quick Fix Checklist

- [ ] `.env` file exists with Firebase config
- [ ] Firestore database is created
- [ ] Security rules allow read/write
- [ ] Dev server restarted after `.env` changes
- [ ] Firebase project is active
- [ ] No firewall blocking Firebase

## Getting Help

If issues persist:
1. Copy the full error message from terminal
2. Copy the error from browser console
3. Check Firebase Console for any warnings
4. Verify all environment variables are set
