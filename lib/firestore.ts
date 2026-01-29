import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentData,
  deleteField,
} from 'firebase/firestore'
import { db } from './firebase'

// Helper to convert Firestore timestamps to dates
export const convertTimestamps = (data: any): any => {
  if (!data) return data
  
  if (Array.isArray(data)) {
    return data.map(convertTimestamps)
  }
  
  if (typeof data === 'object' && data !== null) {
    const converted: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Timestamp) {
        converted[key] = value.toDate().toISOString()
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = convertTimestamps(value)
      } else {
        converted[key] = value
      }
    }
    return converted
  }
  
  return data
}

// User functions removed - no longer using user system
// Placeholder function to prevent errors in existing code that may still reference it
export async function getUserById(id: string) {
  return null
}

// Games
export const gamesCollection = collection(db, 'games')

export async function getGames(params?: {
  eventId?: string
  hostId?: string
  difficulty?: string
  status?: 'running' | 'completed'
  limit?: number
  offset?: number
}) {
  try {
    // Build base query with filters
    let q = query(gamesCollection)
    
    if (params?.difficulty) {
      q = query(q, where('difficulty', '==', params.difficulty))
    }
    if (params?.status) {
      q = query(q, where('status', '==', params.status))
    }
    if (params?.eventId) {
      q = query(q, where('eventId', '==', params.eventId))
    }
    if (params?.hostId) {
      q = query(q, where('hostId', '==', params.hostId))
    }
    
    // Try to add orderBy, but fetch all matching documents first for accurate total count
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getGames] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    // Fetch all matching documents (without limit) to get accurate total count
    const querySnapshot = await getDocs(q)
    let games = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    // Sort client-side if orderBy wasn't applied or failed
    if (!useOrderBy) {
      games.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    // Store total before pagination
    const total = games.length
    
    // Apply pagination
    const offset = params?.offset || 0
    const limit = params?.limit || games.length
    const paginatedGames = games.slice(offset, offset + limit)
    
    console.log(`[getGames] Filter: status=${params?.status || 'all'}, Found: ${total} total, Showing: ${paginatedGames.length} (offset: ${offset}, limit: ${limit})`)
    
    return {
      games: paginatedGames,
      total: total,
    }
  } catch (error: any) {
    console.error('[getGames] Error fetching games:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      status: params?.status,
      difficulty: params?.difficulty,
    })
    if (error.code === 'failed-precondition') {
      console.warn('[getGames] Firestore index required. Check console for index creation link.')
      return {
        games: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getGameById(id: string) {
  const docRef = doc(db, 'games', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

export async function createGame(data: {
  players: Array<{ name: string; mobile: string }>
  eventId: string
  hostId: string
}) {
  const gameData: any = {
    eventId: data.eventId.trim(),
    hostId: data.hostId.trim(),
    players: data.players, // Store as array of objects with name and mobile
    status: 'running',
    startTime: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  const docRef = await addDoc(gamesCollection, gameData)
  return getGameById(docRef.id)
}

export async function completeGame(
  gameId: string,
  winnerId: string // Format: "name_mobile" or just "name" for legacy
) {
  const docRef = doc(db, 'games', gameId)
  const game = await getGameById(gameId)
  
  if (!game) {
    throw new Error('Game not found')
  }
  
  if ((game as any).status === 'completed') {
    throw new Error('Game is already completed')
  }
  
  // Parse winnerId to extract name and mobile
  const winnerParts = winnerId.split('_')
  const winnerName = winnerParts[0]
  const winnerMobile = winnerParts.length > 1 ? winnerParts.slice(1).join('_') : undefined
  
  // Calculate winning time from startTime to now
  const gameData = game as any
  const startTime = gameData.startTime
  if (!startTime) {
    throw new Error('Game start time not found')
  }
  
  const startTimestamp = startTime instanceof Timestamp 
    ? startTime.toMillis() 
    : new Date(startTime).getTime()
  const completedAt = Timestamp.now()
  const winnerTime = Math.floor((completedAt.toMillis() - startTimestamp) / 1000) // Time in seconds
  
  // Update game status
  const updateData: any = {
    status: 'completed',
    winner: winnerName,
    winnerId: winnerId,
    winnerTime: winnerTime,
    completedAt: completedAt,
    updatedAt: Timestamp.now(),
  }
  
  if (winnerMobile) {
    updateData.winnerMobile = winnerMobile
  }
  
  await updateDoc(docRef, updateData)
  
  // Create completion record for the winner (ranked by time only)
  try {
    if (winnerTime && winnerTime > 0 && !isNaN(winnerTime)) {
      await createScore({
        playerName: winnerName,
        playerMobile: winnerMobile,
        playerId: winnerId,
        gameId: gameId,
        time: winnerTime,
      })
    }
  } catch (scoreError: any) {
    console.error('[completeGame] Error creating score:', scoreError)
  }

  return getGameById(gameId)
}

export async function updateGame(id: string, data: any) {
  const docRef = doc(db, 'games', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  
  // Only add fields that are defined and not undefined
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      // Handle eventId and hostId - if empty string, use deleteField() to remove
      if ((key === 'eventId' || key === 'hostId') && data[key] === '') {
        updateData[key] = deleteField()
      } else {
        updateData[key] = data[key]
      }
    }
  })
  
  await updateDoc(docRef, updateData)
  return getGameById(id)
}

export async function deleteGame(id: string) {
  try {
    console.log(`[deleteGame] Starting deletion of game ${id}`)
    
    // Delete all scores for this game
    const scoresQuery = query(scoresCollection, where('gameId', '==', id))
    const scoresSnapshot = await getDocs(scoresQuery)
    const scoreDeletes = scoresSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(scoreDeletes)
    console.log(`[deleteGame] Deleted ${scoresSnapshot.size} scores for game ${id}`)

    // Delete the game itself
    await deleteDoc(doc(db, 'games', id))
    console.log(`[deleteGame] Successfully deleted game ${id}`)
  } catch (error: any) {
    console.error(`[deleteGame] Error deleting game ${id}:`, error)
    throw error
  }
}

// Scores
export const scoresCollection = collection(db, 'scores')

export async function getScores(params?: {
  playerName?: string
  gameId?: string
  limit?: number
  offset?: number
  orderBy?: string
  order?: string
}) {
  try {
    let q = query(scoresCollection)
    
    if (params?.playerName) {
      q = query(q, where('playerName', '==', params.playerName))
    }
    if (params?.gameId) {
      q = query(q, where('gameId', '==', params.gameId))
    }
    
    const orderField = params?.orderBy || 'time'
    const orderDirection = params?.order === 'asc' ? 'asc' : 'desc'
    
    let useOrderBy = false
    // Try to add orderBy, but don't fail if index doesn't exist
    try {
      q = query(q, orderBy(orderField, orderDirection))
      useOrderBy = true
    } catch (error: any) {
      // If index doesn't exist, continue without orderBy
      console.warn(`[getScores] Index may be needed for orderBy(${orderField}), will sort client-side`)
      useOrderBy = false
    }
    
    // Increase limit to get more results for client-side sorting
    const fetchLimit = params?.limit ? Math.max(params.limit + (params.offset || 0), 1000) : 1000
    q = query(q, limit(fetchLimit))
    
    const querySnapshot = await getDocs(q)
    let scores = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    console.log(`[getScores] Fetched ${scores.length} scores for gameId: ${params?.gameId || 'all'}`)
    
    // Sort client-side: time asc = lower time first (missing time last)
    scores.sort((a: any, b: any) => {
      const isTimeAsc = orderField === 'time' && orderDirection === 'asc'
      const aVal = a[orderField]
      const bVal = b[orderField]
      const aValue = aVal === undefined || aVal === null ? (isTimeAsc ? Infinity : 0) : Number(aVal)
      const bValue = bVal === undefined || bVal === null ? (isTimeAsc ? Infinity : 0) : Number(bVal)
      if (orderDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    })
    
    const offset = params?.offset || 0
    const limitValue = params?.limit || scores.length
    const paginatedScores = scores.slice(offset, offset + limitValue)
    
    // Fetch game data for each score
    const scoresWithDetails = await Promise.all(
      paginatedScores.map(async (score: any) => {
        const game = await getGameById(score.gameId)
        return {
          ...score,
          game: game
            ? {
                id: game.id,
                name: game.name,
              }
            : null,
        }
      })
    )
    
    return {
      scores: scoresWithDetails,
      total: scores.length,
    }
  } catch (error: any) {
    console.error('[getScores] Error fetching scores:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      gameId: params?.gameId,
    })
    // Return empty result instead of throwing
    return {
      scores: [],
      total: 0,
    }
  }
}

export async function createScore(data: {
  playerName: string
  playerMobile?: string
  playerId?: string // Combination of name_mobile
  gameId: string
  time: number // Required; ranking by time only (lower = better)
}) {
  const timeNum = Number(data.time)
  if (isNaN(timeNum) || timeNum < 0) {
    throw new Error(`Invalid time value: ${data.time}. Time must be a non-negative number.`)
  }
  const scoreData: any = {
    playerName: data.playerName,
    gameId: data.gameId,
    time: timeNum,
    createdAt: Timestamp.now(),
  }
  if (data.playerMobile) scoreData.playerMobile = data.playerMobile
  if (data.playerId) scoreData.playerId = data.playerId
  
  console.log(`[createScore] Creating record:`, {
    playerName: scoreData.playerName,
    gameId: scoreData.gameId,
    time: scoreData.time,
    playerId: scoreData.playerId,
  })
  
  const docRef = await addDoc(scoresCollection, scoreData)
  const scoreDoc = await getDoc(docRef)
  const createdScore = {
    id: scoreDoc.id,
    ...convertTimestamps(scoreDoc.data()),
  }
  
  console.log(`[createScore] ✓ Record created:`, { id: createdScore.id, time: createdScore.time })
  return createdScore
}

export async function deleteScore(id: string) {
  const docRef = doc(db, 'scores', id)
  await deleteDoc(docRef)
}

/** Get rankings by event: all completion records for games in this event, sorted by time ascending (best first), with rank. */
export async function getRankingsByEvent(params: {
  eventId: string
  limit?: number
  offset?: number
}) {
  const { eventId, limit = 50, offset = 0 } = params
  const gamesSnapshot = await getDocs(
    query(gamesCollection, where('eventId', '==', eventId))
  )
  const gameIds = gamesSnapshot.docs.map((d) => d.id)
  if (gameIds.length === 0) {
    return { rankings: [], total: 0, event: null }
  }
  const eventDoc = await getDoc(doc(db, 'events', eventId))
  const event = eventDoc.exists()
    ? { id: eventDoc.id, ...convertTimestamps(eventDoc.data()) }
    : null

  const allScores: any[] = []
  for (const gid of gameIds) {
    const q = query(scoresCollection, where('gameId', '==', gid))
    const snap = await getDocs(q)
    snap.docs.forEach((d) => {
      allScores.push({ id: d.id, ...convertTimestamps(d.data()), gameId: gid })
    })
  }
  allScores.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity))
  const total = allScores.length
  const page = allScores.slice(offset, offset + limit)

  const gamesById: Record<string, any> = {}
  for (const g of gamesSnapshot.docs) {
    gamesById[g.id] = { id: g.id, ...convertTimestamps(g.data()) }
  }

  const rankings = page.map((s, i) => ({
    id: s.id,
    rank: offset + i + 1,
    playerName: s.playerName,
    playerMobile: s.playerMobile,
    playerId: s.playerId,
    gameId: s.gameId,
    gameName: gamesById[s.gameId]?.name ?? 'Unknown',
    time: s.time,
    createdAt: s.createdAt,
  }))

  return { rankings, total, event }
}

export const contactCollection = collection(db, 'contact')

export async function getContactMessages(params?: {
  read?: boolean
  limit?: number
  offset?: number
}) {
  try {
    let q = query(contactCollection)
    if (params?.read !== undefined) {
      q = query(q, where('read', '==', params.read))
    }
    try {
      q = query(q, orderBy('createdAt', 'desc'))
    } catch (_) {}
    const snapshot = await getDocs(q)
    let messages = snapshot.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) }))
    const total = messages.length
    const offset = params?.offset || 0
    const limitVal = params?.limit || messages.length
    messages = messages.slice(offset, offset + limitVal)
    return { messages, total }
  } catch (error: any) {
    console.error('[getContactMessages]', error)
    return { messages: [], total: 0 }
  }
}

export async function createContactMessage(data: {
  name: string
  email: string
  message: string
  subject?: string
}) {
  const docData = {
    ...data,
    read: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  const ref = await addDoc(contactCollection, docData)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...convertTimestamps(snap.data()) } : null
}

export async function deleteContactMessage(id: string) {
  const docRef = doc(db, 'contact', id)
  await deleteDoc(docRef)
}

export async function updateContactMessage(id: string, data: { read?: boolean }) {
  const docRef = doc(db, 'contact', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  if (data.read !== undefined) {
    updateData.read = data.read
  }
  await updateDoc(docRef, updateData)
  return getDoc(docRef).then((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  }))
}

// Bracelets
export const braceletsCollection = collection(db, 'bracelets')
export const userBraceletsCollection = collection(db, 'userBracelets')

export async function getBracelets(params?: {
  element?: string
  rarity?: string
  limit?: number
  offset?: number
}) {
  try {
    let q = query(braceletsCollection)
    if (params?.element) q = query(q, where('element', '==', params.element))
    if (params?.rarity) q = query(q, where('rarity', '==', params.rarity))
    const snapshot = await getDocs(q)
    let bracelets = snapshot.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) }))
    const total = bracelets.length
    const offset = params?.offset || 0
    const limitVal = params?.limit || bracelets.length
    bracelets = bracelets.slice(offset, offset + limitVal)
    return { bracelets, total }
  } catch (error: any) {
    console.error('[getBracelets]', error)
    return { bracelets: [], total: 0 }
  }
}

export async function getBraceletById(id: string) {
  const docRef = doc(db, 'bracelets', id)
  const snap = await getDoc(docRef)
  return snap.exists() ? { id: snap.id, ...convertTimestamps(snap.data()) } : null
}

export async function createBracelet(data: {
  name: string
  description?: string
  element: string
  image?: string
  rarity?: string
}) {
  const docData: any = {
    name: data.name,
    element: data.element,
    rarity: data.rarity || 'common',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  if (data.description != null) docData.description = data.description
  if (data.image != null) docData.image = data.image
  const ref = await addDoc(braceletsCollection, docData)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...convertTimestamps(snap.data()) } : null
}

export async function assignBracelet(braceletId: string, playerName: string) {
  const existing = await getDocs(
    query(
      userBraceletsCollection,
      where('braceletId', '==', braceletId),
      where('playerName', '==', playerName)
    )
  )
  if (!existing.empty) {
    throw new Error('Player already has this bracelet')
  }
  const ref = await addDoc(userBraceletsCollection, {
    braceletId,
    playerName,
    earnedAt: Timestamp.now(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...convertTimestamps(snap.data()) } : null
}

// Newsletter
export const newsletterCollection = collection(db, 'newsletter')

export async function getNewsletterSubscribers(params?: {
  subscribed?: boolean
  limit?: number
  offset?: number
}) {
  try {
    let q = query(newsletterCollection)
    if (params?.subscribed !== undefined) {
      q = query(q, where('subscribed', '==', params.subscribed))
    }
    const snapshot = await getDocs(q)
    let subscribers = snapshot.docs.map((d) => ({ id: d.id, ...convertTimestamps(d.data()) }))
    const total = subscribers.length
    const offset = params?.offset || 0
    const limitVal = params?.limit || subscribers.length
    subscribers = subscribers.slice(offset, offset + limitVal)
    return { subscribers, total }
  } catch (error: any) {
    console.error('[getNewsletterSubscribers]', error)
    return { subscribers: [], total: 0 }
  }
}

export async function subscribeNewsletter(email: string) {
  const normalized = email.trim().toLowerCase()
  const existing = await getDocs(
    query(newsletterCollection, where('email', '==', normalized))
  )
  if (!existing.empty) {
    throw new Error('Email is already subscribed')
  }
  const ref = await addDoc(newsletterCollection, {
    email: normalized,
    subscribed: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...convertTimestamps(snap.data()) } : null
}

export async function unsubscribeNewsletter(email: string) {
  const normalized = email.trim().toLowerCase()
  const q = query(newsletterCollection, where('email', '==', normalized))
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    throw new Error('Email not found in newsletter list')
  }
  for (const d of snapshot.docs) {
    await updateDoc(doc(db, 'newsletter', d.id), {
      subscribed: false,
      updatedAt: Timestamp.now(),
    })
  }
  const first = snapshot.docs[0]
  return { id: first.id, ...convertTimestamps(first.data()) }
}

export async function deleteNewsletterSubscriber(id: string) {
  const docRef = doc(db, 'newsletter', id)
  await deleteDoc(docRef)
}

// Bookings
export const bookingsCollection = collection(db, 'bookings')

export async function getBookings(params?: {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  date?: string
  limit?: number
  offset?: number
}) {
  try {
    let q = query(bookingsCollection)
    
    if (params?.status) {
      q = query(q, where('status', '==', params.status))
    }
    if (params?.date) {
      q = query(q, where('date', '==', params.date))
    }
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getBookings] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    const querySnapshot = await getDocs(q)
    let bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    if (!useOrderBy) {
      bookings.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    const total = bookings.length
    const offset = params?.offset || 0
    const limit = params?.limit || bookings.length
    const paginatedBookings = bookings.slice(offset, offset + limit)
    
    return {
      bookings: paginatedBookings,
      total: total,
    }
  } catch (error: any) {
    console.error('[getBookings] Error fetching bookings:', error)
    if (error.code === 'failed-precondition') {
      return {
        bookings: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getBooking(id: string) {
  const docRef = doc(db, 'bookings', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

export async function createBooking(data: {
  name: string
  email: string
  mobile: string
  date: string
  time: string
  numberOfPlayers: number
  specialRequests?: string
}) {
  const bookingData: any = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.trim(),
    date: data.date,
    time: data.time,
    numberOfPlayers: data.numberOfPlayers,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  // Only add optional fields if they have values (Firestore doesn't allow undefined)
  if (data.specialRequests && data.specialRequests.trim()) {
    bookingData.specialRequests = data.specialRequests.trim()
  }
  
  const docRef = await addDoc(bookingsCollection, bookingData)
  return getBooking(docRef.id)
}

export async function updateBooking(id: string, data: {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  name?: string
  email?: string
  mobile?: string
  date?: string
  time?: string
  numberOfPlayers?: number
  specialRequests?: string
}) {
  const docRef = doc(db, 'bookings', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  
  if (data.status !== undefined) updateData.status = data.status
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
  if (data.mobile !== undefined) updateData.mobile = data.mobile.trim()
  if (data.date !== undefined) updateData.date = data.date
  if (data.time !== undefined) updateData.time = data.time
  if (data.numberOfPlayers !== undefined) updateData.numberOfPlayers = data.numberOfPlayers
  // Only set specialRequests if it has a value (Firestore doesn't allow undefined)
  if (data.specialRequests !== undefined) {
    if (data.specialRequests && data.specialRequests.trim()) {
      updateData.specialRequests = data.specialRequests.trim()
    } else {
      updateData.specialRequests = deleteField()
    }
  }
  
  await updateDoc(docRef, updateData)
  return getBooking(id)
}

export async function deleteBooking(id: string) {
  const docRef = doc(db, 'bookings', id)
  await deleteDoc(docRef)
}

// Pre-Bookings
export const preBookingsCollection = collection(db, 'preBookings')

export async function getPreBookings(params?: {
  status?: 'pending' | 'confirmed' | 'cancelled'
  limit?: number
  offset?: number
}) {
  try {
    let q = query(preBookingsCollection)
    
    if (params?.status) {
      q = query(q, where('status', '==', params.status))
    }
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getPreBookings] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    const querySnapshot = await getDocs(q)
    let preBookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    if (!useOrderBy) {
      preBookings.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    const total = preBookings.length
    const offset = params?.offset || 0
    const limit = params?.limit || preBookings.length
    const paginatedPreBookings = preBookings.slice(offset, offset + limit)
    
    return {
      preBookings: paginatedPreBookings,
      total: total,
    }
  } catch (error: any) {
    console.error('[getPreBookings] Error fetching pre-bookings:', error)
    if (error.code === 'failed-precondition') {
      return {
        preBookings: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getPreBooking(id: string) {
  const docRef = doc(db, 'preBookings', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

export async function createPreBooking(data: {
  name: string
  email: string
  mobile: string
  preferredDate?: string
  preferredTime?: string
  numberOfPlayers: number
  specialRequests?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
}) {
  const preBookingData: any = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.trim(),
    numberOfPlayers: data.numberOfPlayers,
    status: (data.status || 'pending') as 'pending' | 'confirmed' | 'cancelled',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  // Only add optional fields if they have values (Firestore doesn't allow undefined)
  if (data.preferredDate && data.preferredDate.trim()) {
    preBookingData.preferredDate = data.preferredDate.trim()
  }
  if (data.preferredTime && data.preferredTime.trim()) {
    preBookingData.preferredTime = data.preferredTime.trim()
  }
  if (data.specialRequests && data.specialRequests.trim()) {
    preBookingData.specialRequests = data.specialRequests.trim()
  }
  
  const docRef = await addDoc(preBookingsCollection, preBookingData)
  return getPreBooking(docRef.id)
}

export async function updatePreBooking(id: string, data: {
  status?: 'pending' | 'confirmed' | 'cancelled'
  name?: string
  email?: string
  mobile?: string
  preferredDate?: string
  preferredTime?: string
  numberOfPlayers?: number
  specialRequests?: string
}) {
  const docRef = doc(db, 'preBookings', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  
  if (data.status !== undefined) updateData.status = data.status
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
  if (data.mobile !== undefined) updateData.mobile = data.mobile.trim()
  // Only set preferredDate if it has a value (Firestore doesn't allow undefined)
  if (data.preferredDate !== undefined) {
    if (data.preferredDate && data.preferredDate.trim()) {
      updateData.preferredDate = data.preferredDate.trim()
    } else {
      // To clear the field, use deleteField() from Firestore
      updateData.preferredDate = deleteField()
    }
  }
  // Only set preferredTime if it has a value
  if (data.preferredTime !== undefined) {
    if (data.preferredTime && data.preferredTime.trim()) {
      updateData.preferredTime = data.preferredTime.trim()
    } else {
      updateData.preferredTime = deleteField()
    }
  }
  if (data.numberOfPlayers !== undefined) updateData.numberOfPlayers = data.numberOfPlayers
  // Only set specialRequests if it has a value
  if (data.specialRequests !== undefined) {
    if (data.specialRequests && data.specialRequests.trim()) {
      updateData.specialRequests = data.specialRequests.trim()
    } else {
      updateData.specialRequests = deleteField()
    }
  }
  
  await updateDoc(docRef, updateData)
  return getPreBooking(id)
}

export async function deletePreBooking(id: string) {
  const docRef = doc(db, 'preBookings', id)
  await deleteDoc(docRef)
}

// Events
export const eventsCollection = collection(db, 'events')

export async function getEvents(params?: {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  hostId?: string
  limit?: number
  offset?: number
}) {
  try {
    let q = query(eventsCollection)
    
    if (params?.status) {
      q = query(q, where('status', '==', params.status))
    }
    if (params?.hostId) {
      q = query(q, where('hostId', '==', params.hostId))
    }
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('startDate', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getEvents] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    const querySnapshot = await getDocs(q)
    let events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    if (!useOrderBy) {
      events.sort((a: any, b: any) => {
        const aDate = a.startDate ? new Date(a.startDate).getTime() : 0
        const bDate = b.startDate ? new Date(b.startDate).getTime() : 0
        return bDate - aDate
      })
    }
    
    const total = events.length
    const offset = params?.offset || 0
    const limit = params?.limit || events.length
    const paginatedEvents = events.slice(offset, offset + limit)
    
    return {
      events: paginatedEvents,
      total: total,
    }
  } catch (error: any) {
    console.error('[getEvents] Error fetching events:', error)
    if (error.code === 'failed-precondition') {
      return {
        events: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getEventById(id: string) {
  const docRef = doc(db, 'events', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

// Alias for backward compatibility
export async function getEvent(id: string) {
  return getEventById(id)
}

export async function createEvent(data: {
  name: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  hostId?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  maxParticipants?: number
  image?: string
}) {
  const eventData: any = {
    name: data.name.trim(),
    startDate: data.startDate,
    status: (data.status || 'upcoming') as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  if (data.description && data.description.trim()) {
    eventData.description = data.description.trim()
  }
  if (data.endDate && data.endDate.trim()) {
    eventData.endDate = data.endDate.trim()
  }
  if (data.location && data.location.trim()) {
    eventData.location = data.location.trim()
  }
  if (data.hostId && data.hostId.trim()) {
    eventData.hostId = data.hostId.trim()
  }
  if (data.maxParticipants !== undefined) {
    eventData.maxParticipants = data.maxParticipants
  }
  if (data.image && data.image.trim()) {
    eventData.image = data.image.trim()
  }
  
  const docRef = await addDoc(eventsCollection, eventData)
  return getEvent(docRef.id)
}

export async function updateEvent(id: string, data: {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  location?: string
  hostId?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  maxParticipants?: number
  image?: string
}) {
  const docRef = doc(db, 'events', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.description !== undefined) {
    if (data.description && data.description.trim()) {
      updateData.description = data.description.trim()
    } else {
      updateData.description = deleteField()
    }
  }
  if (data.startDate !== undefined) updateData.startDate = data.startDate
  if (data.endDate !== undefined) {
    if (data.endDate && data.endDate.trim()) {
      updateData.endDate = data.endDate.trim()
    } else {
      updateData.endDate = deleteField()
    }
  }
  if (data.location !== undefined) {
    if (data.location && data.location.trim()) {
      updateData.location = data.location.trim()
    } else {
      updateData.location = deleteField()
    }
  }
  if (data.hostId !== undefined) {
    if (data.hostId && data.hostId.trim()) {
      updateData.hostId = data.hostId.trim()
    } else {
      updateData.hostId = deleteField()
    }
  }
  if (data.status !== undefined) updateData.status = data.status
  if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants
  if (data.image !== undefined) {
    if (data.image && data.image.trim()) {
      updateData.image = data.image.trim()
    } else {
      updateData.image = deleteField()
    }
  }
  
  await updateDoc(docRef, updateData)
  return getEvent(id)
}

export async function deleteEvent(id: string) {
  const docRef = doc(db, 'events', id)
  await deleteDoc(docRef)
}

// Hosts
export const hostsCollection = collection(db, 'hosts')

export async function getHosts(params?: {
  status?: 'active' | 'inactive'
  limit?: number
  offset?: number
}) {
  try {
    let q = query(hostsCollection)
    
    if (params?.status) {
      q = query(q, where('status', '==', params.status))
    }
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getHosts] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    const querySnapshot = await getDocs(q)
    let hosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    if (!useOrderBy) {
      hosts.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    const total = hosts.length
    const offset = params?.offset || 0
    const limit = params?.limit || hosts.length
    const paginatedHosts = hosts.slice(offset, offset + limit)
    
    return {
      hosts: paginatedHosts,
      total: total,
    }
  } catch (error: any) {
    console.error('[getHosts] Error fetching hosts:', error)
    if (error.code === 'failed-precondition') {
      return {
        hosts: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getHost(id: string) {
  const docRef = doc(db, 'hosts', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

export async function createHost(data: {
  name: string
  email: string
  mobile: string
  bio?: string
  image?: string
  status?: 'active' | 'inactive'
}) {
  const hostData: any = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.trim(),
    status: (data.status || 'active') as 'active' | 'inactive',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  if (data.bio && data.bio.trim()) {
    hostData.bio = data.bio.trim()
  }
  if (data.image && data.image.trim()) {
    hostData.image = data.image.trim()
  }
  
  const docRef = await addDoc(hostsCollection, hostData)
  return getHost(docRef.id)
}

export async function updateHost(id: string, data: {
  name?: string
  email?: string
  mobile?: string
  bio?: string
  image?: string
  status?: 'active' | 'inactive'
}) {
  const docRef = doc(db, 'hosts', id)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  }
  
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
  if (data.mobile !== undefined) updateData.mobile = data.mobile.trim()
  if (data.bio !== undefined) {
    if (data.bio && data.bio.trim()) {
      updateData.bio = data.bio.trim()
    } else {
      updateData.bio = deleteField()
    }
  }
  if (data.image !== undefined) {
    if (data.image && data.image.trim()) {
      updateData.image = data.image.trim()
    } else {
      updateData.image = deleteField()
    }
  }
  if (data.status !== undefined) updateData.status = data.status
  
  await updateDoc(docRef, updateData)
  return getHost(id)
}

export async function deleteHost(id: string) {
  const docRef = doc(db, 'hosts', id)
  await deleteDoc(docRef)
}
