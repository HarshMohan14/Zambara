import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'zambaara_bookings', id)
    
    // Construct update data
    const updateData: any = {}
    if (body.seatIndex !== undefined) updateData.seatIndex = Number(body.seatIndex)
    if (body.isWinner !== undefined) updateData.isWinner = Boolean(body.isWinner)
    if (body.isZampion !== undefined) updateData.isZampion = Boolean(body.isZampion)

    await updateDoc(docRef, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Zambaara booking:', error)
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
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'zambaara_bookings', id)
    await deleteDoc(docRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Zambaara booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
