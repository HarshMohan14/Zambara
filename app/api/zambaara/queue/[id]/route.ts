import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'zambaara_users', id)
    await deleteDoc(docRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Zambaara user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
