# Quick Start Guide - Firebase Backend

Your Firebase backend is now configured and ready to use! 🎉

## ✅ What's Already Done

- ✅ Firebase configuration added to `.env`
- ✅ Firebase SDK initialized with Analytics
- ✅ All API routes updated to use Firestore
- ✅ Dependencies installed

## 🚀 Next Steps

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **zambara** project
3. Click **Build** → **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (choose closest to your users)
7. Click **Enable**

### 2. Set Up Security Rules (Important!)

After creating the database, go to the **Rules** tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Remember:** Update these rules for production to restrict access!

### 3. Test Your Setup

Start your development server:

```bash
npm run dev
```

Then test the health endpoint:
- Visit: `http://localhost:3000/api/health`
- You should see: `{"status":"healthy","database":"connected"}`

### 4. Test User Registration

1. Open your app: `http://localhost:3000`
2. Click **Login** button in navigation
3. Enter:
   - Email: `test@example.com`
   - Username: `testuser`
   - Name: `Test User` (optional)
4. Click **Sign In**
5. Check Firebase Console → Firestore → `users` collection to see the new user!

## 📊 Firebase Console

Monitor your data:
- **Firestore Database** → **Data** tab: View all collections
- **Usage** tab: Monitor read/write operations
- **Rules** tab: Manage security rules

## 🔥 Your Firebase Config

Your project is configured with:
- **Project ID:** zambara
- **Auth Domain:** zambara.firebaseapp.com
- **Analytics:** Enabled (G-WXCR5VW5V0)

## 🎯 Available Features

All backend features are ready:
- ✅ User registration/login
- ✅ Game management
- ✅ Score submission
- ✅ Leaderboard
- ✅ Bracelets/achievements
- ✅ Contact form
- ✅ Newsletter subscription

## 📚 Documentation

- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `BACKEND.md` - API documentation
- `SETUP.md` - General setup instructions

## ⚠️ Important Notes

1. **Security Rules:** Make sure Firestore is in test mode for development
2. **Free Tier Limits:** 50K reads/day, 20K writes/day
3. **Indexes:** Firestore will prompt you to create indexes when needed
4. **Production:** Update security rules before deploying!

## 🐛 Troubleshooting

**"Missing or insufficient permissions"**
- Check Firestore Security Rules
- Make sure database is in test mode

**"Index not found"**
- Click the link in the error to create the index
- Or go to Firestore → Indexes

**Data not appearing**
- Check browser console for errors
- Verify Firestore database is created
- Check Security Rules allow read/write

## 🎉 You're All Set!

Your Firebase backend is configured and ready. Just enable Firestore and you're good to go!

Need help? Check `FIREBASE_SETUP.md` for detailed instructions.
