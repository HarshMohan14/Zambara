import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { convertTimestamps } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const zambaaraRef = collection(db, 'zambaara_users')
    const q = query(zambaaraRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }))

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching Zambaara queue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
