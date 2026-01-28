/**
 * Standalone script to delete all data from Firestore collections
 * This script initializes Firebase directly without requiring auth
 * 
 * Usage:
 *   1. Make sure your .env file has Firebase config
 *   2. Run: npx tsx scripts/delete-all-data-standalone.ts
 *   3. Or: ts-node scripts/delete-all-data-standalone.ts
 */

import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env')
    const envFile = readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    // .env file doesn't exist or can't be read, that's okay
  }
  
  // Also try .env.local
  try {
    const envLocalPath = join(__dirname, '../.env.local')
    const envLocalFile = readFileSync(envLocalPath, 'utf-8')
    envLocalFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value // .env.local overrides .env
      }
    })
  } catch (error) {
    // .env.local doesn't exist or can't be read, that's okay
  }
}

loadEnv()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate required config
if (!firebaseConfig.projectId) {
  console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is required!')
  console.error('\nPlease set your Firebase configuration in .env file:')
  console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id')
  console.error('NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key')
  process.exit(1)
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    console.log('✅ Firebase initialized successfully\n')
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error.message)
    process.exit(1)
  }
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

const collections = [
  'games',
  'scores',
  'leaderboard',
  'bracelets',
  'userBracelets',
  'events',
  'hosts',
  'contact',
  'newsletter',
  'bookings',
  'preBookings',
]

async function deleteAllData() {
  console.log('🚀 Starting to delete all data from Firestore...\n')

  for (const collectionName of collections) {
    try {
      console.log(`📋 Processing collection: ${collectionName}...`)
      
      const col = collection(db, collectionName)
      
      // Get all documents
      const snapshot = await getDocs(col)
      const docs = snapshot.docs
      
      if (docs.length === 0) {
        console.log(`   ✓ No documents found in ${collectionName}\n`)
        continue
      }

      console.log(`   Found ${docs.length} document(s) in ${collectionName}`)

      // Delete all documents
      const deletePromises = docs.map(async (docSnapshot) => {
        await deleteDoc(doc(db, collectionName, docSnapshot.id))
      })

      await Promise.all(deletePromises)
      console.log(`   ✓ Deleted ${docs.length} document(s) from ${collectionName}\n`)
    } catch (error: any) {
      console.error(`   ✗ Error deleting from ${collectionName}:`, error.message)
      console.log()
    }
  }

  console.log('✅ Finished deleting all data!')
}

// Run the script
deleteAllData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
