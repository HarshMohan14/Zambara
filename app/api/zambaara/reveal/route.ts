import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore'

const TRIBES = ['lava', 'rain', 'mountain', 'wind']

export async function POST(req: Request) {
  try {
    const zambaaraRef = collection(db, 'zambaara_users')
    
    // Fetch all pending users and sort in memory to find the oldest
    const pendingQuery = query(zambaaraRef, where('status', '==', 'pending'))
    const pendingSnapshot = await getDocs(pendingQuery)

    if (pendingSnapshot.empty) {
      return NextResponse.json({ error: 'No seekers found waiting in the shadows.' }, { status: 404 })
    }

    const pendingDocs = pendingSnapshot.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data() }))
    pendingDocs.sort((a: any, b: any) => {
      const timeA = a.data.createdAt?.toMillis ? a.data.createdAt.toMillis() : 0
      const timeB = b.data.createdAt?.toMillis ? b.data.createdAt.toMillis() : 0
      return timeA - timeB
    })

    const targetUserDoc = pendingDocs[0]
    const userData = targetUserDoc.data

    // Count existing tribes in zambaara_users to ensure balanced distribution
    const snapshot = await getDocs(zambaaraRef)
    const counts = { lava: 0, rain: 0, mountain: 0, wind: 0 }
    
    snapshot.forEach(d => {
      const tribe = d.data().tribe
      if (tribe && counts[tribe as keyof typeof counts] !== undefined) {
        counts[tribe as keyof typeof counts]++
      }
    })

    // Find tribe(s) with minimum count
    let minCount = Infinity
    let minTribes: string[] = []

    TRIBES.forEach(tribe => {
      const count = counts[tribe as keyof typeof counts]
      if (count < minCount) {
        minCount = count
        minTribes = [tribe]
      } else if (count === minCount) {
        minTribes.push(tribe)
      }
    })

    // Pick a random tribe from the tied minimums
    const assignedTribe = minTribes[Math.floor(Math.random() * minTribes.length)]

    // Update the user document to completed with their assigned tribe
    await updateDoc(targetUserDoc.ref, {
      tribe: assignedTribe,
      status: 'completed',
      revealedAt: Timestamp.now()
    })

    return NextResponse.json({ 
      success: true,
      tribe: assignedTribe,
      name: userData.name,
      number: userData.mobile || userData.number
    })

  } catch (error) {
    console.error('Error assigning tribe:', error)
    return NextResponse.json({ error: 'The elements are disturbed. Internal server error.' }, { status: 500 })
  }
}
