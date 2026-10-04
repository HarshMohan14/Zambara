import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, addDoc, query, where, Timestamp, doc, getDoc, runTransaction } from 'firebase/firestore'
import { CUSTOM_PLAYERS_COLLECTION } from '@/lib/zambaara-custom'

const TRIBES = ['lava', 'rain', 'mountain', 'wind']

const pickBalancedTribe = (counts: Record<string, number>) => {
  let minCount = Infinity
  let minTribes: string[] = []
  TRIBES.forEach(tribe => {
    const count = counts[tribe] || 0
    if (count < minCount) {
      minCount = count
      minTribes = [tribe]
    } else if (count === minCount) {
      minTribes.push(tribe)
    }
  })
  return minTribes[Math.floor(Math.random() * minTribes.length)]
}

// CASE 0: Player locked-in from a custom tournament roster (searched on the kiosk)
async function revealCustomPlayer(customPlayerId: string) {
  const playerRef = doc(db, CUSTOM_PLAYERS_COLLECTION, customPlayerId)
  const playerSnap = await getDoc(playerRef)
  if (!playerSnap.exists()) {
    return NextResponse.json({ error: 'Player not found in this tournament roster.' }, { status: 404 })
  }
  const player = playerSnap.data()

  if (player.tribe) {
    return NextResponse.json({
      success: true,
      tribe: player.tribe,
      name: player.name,
      number: player.mobile,
      isExisting: true
    })
  }

  // Balance tribes within this tournament only
  const rosterSnap = await getDocs(query(collection(db, CUSTOM_PLAYERS_COLLECTION), where('tournamentId', '==', player.tournamentId)))
  const counts: Record<string, number> = { lava: 0, rain: 0, mountain: 0, wind: 0 }
  rosterSnap.forEach(d => {
    const t = d.data().tribe
    if (t && counts[t] !== undefined) counts[t]++
  })
  const candidate = pickBalancedTribe(counts)

  // Transaction guarantees a tribe is assigned only once even on double scans
  const finalTribe = await runTransaction(db, async (tx) => {
    const fresh = await tx.get(playerRef)
    const existing = fresh.data()?.tribe
    if (existing) return existing as string
    tx.update(playerRef, { tribe: candidate, revealedAt: new Date().toISOString() })
    return candidate
  })

  return NextResponse.json({
    success: true,
    tribe: finalTribe,
    name: player.name,
    number: player.mobile
  })
}

export async function POST(req: Request) {
  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { name, mobile, customPlayerId } = body

    if (customPlayerId) {
      return await revealCustomPlayer(String(customPlayerId))
    }

    const zambaaraRef = collection(db, 'zambaara_users')

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

    // CASE 1: Name and Mobile submitted directly at the thumb scanner kiosk
    if (name && mobile) {
      const trimmedName = String(name).trim()
      const trimmedMobile = String(mobile).trim()

      // Check if user already exists with this mobile
      const existingQuery = query(zambaaraRef, where('mobile', '==', trimmedMobile))
      const existingSnapshot = await getDocs(existingQuery)

      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0]
        const existingData = existingDoc.data()

        // If they already have a tribe, return their existing tribe
        if (existingData.tribe) {
          return NextResponse.json({
            success: true,
            tribe: existingData.tribe,
            name: existingData.name || trimmedName,
            number: existingData.mobile || trimmedMobile,
            isExisting: true
          })
        }

        // If they existed as pending without a tribe, assign now
        await updateDoc(existingDoc.ref, {
          name: trimmedName,
          tribe: assignedTribe,
          status: 'completed',
          revealedAt: Timestamp.now()
        })

        return NextResponse.json({
          success: true,
          tribe: assignedTribe,
          name: trimmedName,
          number: trimmedMobile
        })
      }

      // Brand new seeker entering kiosk: create and reveal atomically
      await addDoc(zambaaraRef, {
        name: trimmedName,
        mobile: trimmedMobile,
        number: trimmedMobile,
        tribe: assignedTribe,
        status: 'completed',
        hasBought: false,
        createdAt: Timestamp.now(),
        revealedAt: Timestamp.now()
      })

      return NextResponse.json({
        success: true,
        tribe: assignedTribe,
        name: trimmedName,
        number: trimmedMobile
      })
    }

    // CASE 2: Fallback for queue-based scanner (no direct input provided)
    const pendingQuery = query(zambaaraRef, where('status', '==', 'pending'))
    const pendingSnapshot = await getDocs(pendingQuery)

    if (pendingSnapshot.empty) {
      return NextResponse.json({ error: 'Please enter your seeker name and mobile number first.' }, { status: 400 })
    }

    const pendingDocs = pendingSnapshot.docs.map(d => ({ id: d.id, ref: d.ref, data: d.data() }))
    pendingDocs.sort((a: any, b: any) => {
      const timeA = a.data.createdAt?.toMillis ? a.data.createdAt.toMillis() : 0
      const timeB = b.data.createdAt?.toMillis ? b.data.createdAt.toMillis() : 0
      return timeA - timeB
    })

    const targetUserDoc = pendingDocs[0]
    const userData = targetUserDoc.data

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
