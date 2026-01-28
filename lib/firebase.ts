import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('⚠️ Firebase configuration is missing!')
  console.error('Required env vars:', {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
    authDomain: !!firebaseConfig.authDomain,
  })
}

// Initialize Firebase (works for both client and server)
let app: FirebaseApp
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    console.log('✅ Firebase initialized successfully')
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    throw error
  }
} else {
  app = getApps()[0]
}

// Initialize Firebase services
// Only initialize auth if we have valid config (auth requires apiKey)
let authInstance: Auth | null = null
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    authInstance = getAuth(app)
  }
} catch (error) {
  console.warn('⚠️ Firebase Auth initialization skipped:', error)
}

export const auth: Auth | null = authInstance
export const db: Firestore = getFirestore(app)

// Initialize Analytics only on client side
export const analytics: Analytics | null =
  typeof window !== 'undefined' ? getAnalytics(app) : null

export default app
