import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const { name, mobile } = await req.json()

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile are required' }, { status: 400 })
    }

    const tagconRef = collection(db, 'tagcon_users')
    
    // Check if the user is already pending
    const existingQuery = query(tagconRef, where('mobile', '==', mobile), where('status', '==', 'pending'))
    const existingDocs = await getDocs(existingQuery)

    if (!existingDocs.empty) {
      return NextResponse.json({ success: true, message: 'Already pending in queue' })
    }

    // Save to Firestore as pending
    await addDoc(tagconRef, {
      name,
      mobile,
      number: mobile, // backward compatibility
      status: 'pending',
      tribe: null, // Tribe will be assigned by the reveal page
      hasBought: false, // default
      createdAt: Timestamp.now()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error registering for tagcon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
