# Admin Panel Setup Guide

## Admin Panel Access

The admin panel is located at: `/admin`

## Demo Admin Account

A demo admin account has been created with the following credentials:

**Email:** `demo@zambara.com`  
**Username:** `demo_admin`  
**Password:** (No password required - uses email-based login)

### How to Access:

1. Go to your website homepage
2. Click the **Login** button in the navigation
3. Enter:
   - **Email:** `demo@zambara.com`
   - **Username:** `demo_admin`
   - **Name:** `Demo Admin` (optional)
4. Click **Sign In**
5. Once logged in, navigate to `/admin` or click "Admin Panel" link

## Admin Features

The admin panel includes:

### Dashboard (`/admin`)
- Overview statistics
- Quick access to all sections

### Users (`/admin/users`)
- View all registered users
- Search users
- Delete users

### Games (`/admin/games`)
- View all games
- Create new games
- Edit game details
- Toggle game active/inactive status

### Scores (`/admin/scores`)
- View all submitted scores
- Filter by user or game
- Monitor player performance

### Leaderboard (`/admin/leaderboard`)
- View leaderboard rankings
- Filter by game

### Bracelets (`/admin/bracelets`)
- Manage achievement bracelets
- Assign bracelets to users

### Contact (`/admin/contact`)
- View contact form submissions
- Mark messages as read/unread
- Filter messages

### Newsletter (`/admin/newsletter`)
- View newsletter subscribers
- Manage subscriptions

## Creating Additional Admin Accounts

To add more admin accounts, update the `ADMIN_EMAILS` array in `lib/admin.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@zambara.com',
  'demo@zambara.com',
  'your-email@example.com', // Add your email here
]
```

Then create a user account with that email address through the normal registration process.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Access Control:** Currently, admin access is based on email addresses in the `ADMIN_EMAILS` array. For production, consider:
   - Adding role-based access control (RBAC)
   - Implementing Firebase Authentication with custom claims
   - Adding admin password protection
   - Implementing 2FA (Two-Factor Authentication)

2. **API Security:** 
   - Admin API routes should verify admin status
   - Add rate limiting to prevent abuse
   - Implement proper authentication tokens

3. **Data Protection:**
   - Never expose sensitive user data
   - Implement proper data encryption
   - Follow GDPR/privacy regulations

## Creating the Demo Admin User

To create the demo admin user in Firebase:

1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Click "Add document"
4. Create a document with:
   ```json
   {
     "email": "demo@zambara.com",
     "username": "demo_admin",
     "name": "Demo Admin",
     "createdAt": [current timestamp],
     "updatedAt": [current timestamp]
   }
   ```

Or use the registration form on your website with the demo credentials.

## Admin Panel Styling

The admin panel uses the same theme as your website:
- Gold accent color: `#d1a058`
- Black background
- Custom fonts (TheWalkyrDemo, BlinkerRegular, BlinkerSemiBold)
- Consistent styling with the main site

## Troubleshooting

**Can't access admin panel:**
- Make sure you're logged in with an admin email
- Check that your email is in the `ADMIN_EMAILS` array
- Verify you're accessing `/admin` route

**Admin panel not loading:**
- Check browser console for errors
- Verify Firebase is properly configured
- Ensure you're logged in

**Data not showing:**
- Check Firebase Firestore database
- Verify security rules allow read access
- Check network tab for API errors

## Next Steps

1. ✅ Create demo admin account
2. ✅ Access admin panel at `/admin`
3. ✅ Explore all admin features
4. ⚠️ Update security rules for production
5. ⚠️ Add more admin accounts as needed
6. ⚠️ Implement additional security measures

Happy administrating! 🎉
