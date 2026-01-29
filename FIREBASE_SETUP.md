# Firebase Setup Guide

This guide will help you set up Firebase for your Zambara backend.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "zambara")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click **Enable**

### Set Up Security Rules (Important!)

After creating the database, go to **Rules** tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (for development)
    // TODO: Update these rules for production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ For Production:** Update these rules to restrict access based on authentication and user roles.

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app (give it a nickname like "Zambara Web")
6. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Update Your .env File

Open your `.env` file and replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Install Dependencies

```bash
npm install
```

This will install Firebase SDK and other dependencies.

## Step 6: Create Firestore Indexes (Optional but Recommended)

Firestore requires indexes for certain queries. When you run queries that combine multiple `where` clauses or use `orderBy`, Firestore will show you a link to create the index automatically.

Common indexes you might need:
- `users`: `email` (ascending)
- `users`: `username` (ascending)
- `scores`: `userId` (ascending), `score` (descending)
- `scores`: `gameId` (ascending), `score` (descending)
Firestore will prompt you to create these when needed.

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   Visit `http://localhost:3000/api/health`
   
   You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "database": "connected"
   }
   ```

3. Test creating a user:
   - Open your browser console
   - Click "Login" in the navigation
   - Enter email, username, and name
   - Submit the form
   - Check Firebase Console → Firestore Database to see the new user document

## Firestore Collections Structure

Your Firestore database will have these collections:

- **users** - User accounts
- **games** - Game definitions
- **scores** - User scores
- **bracelets** - Achievement bracelets
- **userBracelets** - User-bracelet relationships
- **contact** - Contact form submissions
- **newsletter** - Newsletter subscriptions

## Firebase Console Features

### View Data
- Go to **Firestore Database** → **Data** tab
- See all your collections and documents in real-time

### Monitor Usage
- Go to **Usage** tab to see read/write operations
- Monitor your free tier limits (50K reads/day, 20K writes/day)

### Security Rules
- Go to **Rules** tab to manage access permissions
- Update rules for production security

## Production Considerations

### 1. Update Security Rules

Replace test mode rules with proper authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for games
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users
    }
    
    // Scores - users can submit their own
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Contact and newsletter - anyone can create
    match /contact/{contactId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null; // Admin only
    }
    
    match /newsletter/{subscriberId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null; // Admin only
    }
  }
}
```

### 2. Enable Firebase Authentication (Optional)

For better security, enable Firebase Authentication:

1. Go to **Authentication** → **Get started**
2. Enable **Email/Password** provider
3. Update `UserContext.tsx` to use Firebase Auth instead of custom login

### 3. Set Up Environment Variables in Production

When deploying (Vercel, Netlify, etc.):
- Add Firebase config as environment variables
- Never commit `.env` file to git
- Use your hosting platform's environment variable settings

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Check that your API key in `.env` matches Firebase Console
- Make sure environment variables start with `NEXT_PUBLIC_`

### "Missing or insufficient permissions"
- Check Firestore Security Rules
- Make sure you're in test mode for development
- Verify your queries match the rules

### "Index not found"
- Click the link in the error message to create the index
- Or go to Firestore → Indexes → Create Index

### Data not appearing
- Check browser console for errors
- Verify Firebase config is correct
- Check Firestore Console to see if data was created
- Ensure Security Rules allow the operation

## Free Tier Limits

Firebase Free (Spark) Plan includes:
- **Firestore:** 50K reads/day, 20K writes/day, 20K deletes/day
- **Storage:** 1 GB stored, 10 GB/month downloads
- **Bandwidth:** 10 GB/month

For production, consider upgrading to Blaze (pay-as-you-go) plan.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify your `.env` file has correct values
3. Check browser console for client-side errors
4. Review Firestore Security Rules

Happy coding! 🚀
