import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { convertTimestamps } from '@/lib/firestore'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tournamentId = searchParams.get('tournamentId')

    const bookingsRef = collection(db, 'zambaara_bookings')
    let q = query(bookingsRef)
    if (tournamentId) {
      q = query(bookingsRef, where('tournamentId', '==', tournamentId))
    }
    
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }))

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error('Error fetching Zambaara bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { tournamentId, userId, userName, userMobile, tribe, seatIndex } = await req.json()

    if (!tournamentId || !userId || !userName || !userMobile || !tribe || seatIndex === undefined) {
      return NextResponse.json({ error: 'All booking fields are required' }, { status: 400 })
    }

    const bookingsRef = collection(db, 'zambaara_bookings')
    
    // Check if the seat is already occupied
    const seatQuery = query(bookingsRef, where('tournamentId', '==', tournamentId), where('seatIndex', '==', seatIndex))
    const seatDocs = await getDocs(seatQuery)
    if (!seatDocs.empty) {
      return NextResponse.json({ error: 'Seat is already occupied' }, { status: 400 })
    }

    // Check if user is already booked in this tournament
    const userQuery = query(bookingsRef, where('tournamentId', '==', tournamentId), where('userId', '==', userId))
    const userDocs = await getDocs(userQuery)
    if (!userDocs.empty) {
      return NextResponse.json({ error: 'Player is already booked in this tournament' }, { status: 400 })
    }

    const docRef = await addDoc(bookingsRef, {
      tournamentId,
      userId,
      userName,
      userMobile,
      tribe,
      seatIndex: Number(seatIndex),
      bookedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (error) {
    console.error('Error creating Zambaara booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
