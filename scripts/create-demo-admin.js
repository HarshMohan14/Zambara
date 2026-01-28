/**
 * Script to create demo admin user in Firestore
 * Run this with: node scripts/create-demo-admin.js
 * 
 * Note: This requires Firebase Admin SDK or you can manually create the user
 * through Firebase Console or the website registration form
 */

console.log(`
===========================================
Demo Admin Account Creation Guide
===========================================

To create the demo admin account, you have two options:

OPTION 1: Use the Website Registration Form
--------------------------------------------
1. Go to your website: http://localhost:3000
2. Click "Login" button
3. Enter the following:
   - Email: demo@zambara.com
   - Username: demo_admin
   - Name: Demo Admin
4. Click "Sign In"
5. The account will be created automatically
6. Navigate to /admin to access admin panel

OPTION 2: Create Manually in Firebase Console
-----------------------------------------------
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: zambara
3. Go to Firestore Database
4. Navigate to 'users' collection
5. Click "Add document"
6. Add the following fields:
   - email: "demo@zambara.com"
   - username: "demo_admin"
   - name: "Demo Admin"
   - createdAt: [current timestamp]
   - updatedAt: [current timestamp]
7. Save the document

IMPORTANT: Admin Access
------------------------
The email "demo@zambara.com" is already configured as an admin email
in lib/admin.ts. Once you create a user with this email, they will
automatically have admin access.

After creating the account:
1. Log in with demo@zambara.com
2. Navigate to /admin
3. You'll have full admin access!

===========================================
`)
