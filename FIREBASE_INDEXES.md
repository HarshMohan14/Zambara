# Firebase Index Setup Guide

Firestore requires indexes for certain queries. When you see errors about missing indexes, follow these steps:

## Required Indexes

### Users Collection (Removed - No longer using user system)

~~User-related indexes removed as user system has been removed.~~

## How to Create Indexes

### Method 1: Automatic (Recommended)
1. When you see an error about missing index, click the link in the error message
2. It will take you directly to Firebase Console with the index pre-configured
3. Click "Create Index"
4. Wait for the index to build (usually takes a few minutes)

### Method 2: Manual
1. Go to Firebase Console → Firestore Database
2. Click on "Indexes" tab
3. Click "Create Index"
4. Select collection: `users`
5. Add fields:
   - Field: `email`, Order: Ascending
   - Click "Create Index"

## Quick Fix for Development

For development, you can temporarily modify Firestore security rules to allow all operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning:** Never use these rules in production!

## Common Error Messages

### "The query requires an index"
- **Solution:** Click the link in the error message to create the index automatically

### "failed-precondition"
- **Solution:** Create the required index (see above)

### "permission-denied"
- **Solution:** Update Firestore security rules to allow the operation

## Index Creation Time

- Simple indexes: Usually ready in 1-2 minutes
- Composite indexes: Can take 5-10 minutes
- Large collections: May take longer

You'll receive an email when indexes are ready, or check the Indexes tab in Firebase Console.

## Testing After Index Creation

1. Wait for index to be "Enabled" (green checkmark)
2. Refresh your application
3. Try the operation again
4. The error should be resolved

## Need Help?

If you continue to see index errors:
1. Check Firebase Console → Firestore → Indexes tab
2. Verify indexes are "Enabled" (not "Building")
3. Check the exact field names match your queries
4. Ensure security rules allow the queries
