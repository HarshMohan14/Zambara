import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { name, size, dateTime } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'zambaara_tournaments', id)
    await updateDoc(docRef, {
      name,
      size: Number(size),
      dateTime
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Zambaara tournament:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 })
    }

    // Delete the tournament document
    const docRef = doc(db, 'zambaara_tournaments', id)
    await deleteDoc(docRef)

    // Delete associated bookings
    const bookingsRef = collection(db, 'zambaara_bookings')
    const q = query(bookingsRef, where('tournamentId', '==', id))
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref))
    await Promise.all(deletePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Zambaara tournament:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
