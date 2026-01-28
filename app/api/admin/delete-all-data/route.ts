import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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
} from '@/lib/firestore'

// POST /api/admin/delete-all-data - Delete all data from all collections
// WARNING: This is a destructive operation!
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here to ensure only admins can access this
    
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

    const results: Record<string, { deleted: number; error?: string }> = {}

    for (const { name, collection: col } of collections) {
      try {
        // Get all documents
        const snapshot = await getDocs(col)
        const docs = snapshot.docs

        if (docs.length === 0) {
          results[name] = { deleted: 0 }
          continue
        }

        // Delete all documents
        const deletePromises = docs.map(async (docSnapshot) => {
          await deleteDoc(doc(db, name, docSnapshot.id))
        })

        await Promise.all(deletePromises)
        results[name] = { deleted: docs.length }
      } catch (error: any) {
        results[name] = { deleted: 0, error: error.message }
      }
    }

    const totalDeleted = Object.values(results).reduce(
      (sum, result) => sum + result.deleted,
      0
    )

    return successResponse(
      {
        results,
        totalDeleted,
        message: `Successfully deleted ${totalDeleted} document(s) across all collections`,
      },
      `Deleted ${totalDeleted} document(s) from all collections`
    )
  } catch (error: any) {
    console.error('Error deleting all data:', error)
    return serverErrorResponse('Failed to delete all data')
  }
}
