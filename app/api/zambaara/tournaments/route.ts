import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { convertTimestamps } from '@/lib/firestore'

export async function GET() {
  try {
    const tourneyRef = collection(db, 'zambaara_tournaments')
    const q = query(tourneyRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const tournaments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }))

    return NextResponse.json({ success: true, tournaments })
  } catch (error) {
    console.error('Error fetching Zambaara tournaments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, size, dateTime } = await req.json()

    if (!name || !size || !dateTime) {
      return NextResponse.json({ error: 'Name, size, and dateTime are required' }, { status: 400 })
    }

    const tourneyRef = collection(db, 'zambaara_tournaments')
    const docRef = await addDoc(tourneyRef, {
      name,
      size: Number(size),
      dateTime,
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (error) {
    console.error('Error creating Zambaara tournament:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
