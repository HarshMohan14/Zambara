/**
 * Script to delete all data from Firestore collections
 * Run with: npx tsx scripts/delete-all-data.ts
 * Or: ts-node scripts/delete-all-data.ts
 */

import { getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  gamesCollection,
  scoresCollection,
  leaderboardCollection,
  braceletsCollection,
  userBraceletsCollection,
  contactCollection,
  newsletterCollection,
  bookingsCollection,
  preBookingsCollection,
} from '../lib/firestore'

const collections = [
  { name: 'games', collection: gamesCollection },
  { name: 'scores', collection: scoresCollection },
  { name: 'leaderboard', collection: leaderboardCollection },
  { name: 'bracelets', collection: braceletsCollection },
  { name: 'userBracelets', collection: userBraceletsCollection },
  { name: 'contact', collection: contactCollection },
  { name: 'newsletter', collection: newsletterCollection },
  { name: 'bookings', collection: bookingsCollection },
  { name: 'preBookings', collection: preBookingsCollection },
]

async function deleteAllData() {
  console.log('🚀 Starting to delete all data from Firestore...\n')

  for (const { name, collection: col } of collections) {
    try {
      console.log(`📋 Processing collection: ${name}...`)
      
      // Get all documents
      const snapshot = await getDocs(col)
      const docs = snapshot.docs
      
      if (docs.length === 0) {
        console.log(`   ✓ No documents found in ${name}\n`)
        continue
      }

      console.log(`   Found ${docs.length} document(s) in ${name}`)

      // Delete all documents
      const deletePromises = docs.map(async (docSnapshot) => {
        await deleteDoc(doc(db, name, docSnapshot.id))
      })

      await Promise.all(deletePromises)
      console.log(`   ✓ Deleted ${docs.length} document(s) from ${name}\n`)
    } catch (error: any) {
      console.error(`   ✗ Error deleting from ${name}:`, error.message)
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
