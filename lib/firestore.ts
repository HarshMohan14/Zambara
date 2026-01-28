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
  name: string
  description?: string
  difficulty?: string
  players: Array<{ name: string; mobile: string }>
}) {
  const gameData: any = {
    name: data.name,
    difficulty: data.difficulty || 'medium',
    players: data.players, // Store as array of objects with name and mobile
    status: 'running',
    startTime: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  
  // Only add description if it has a value
  if (data.description !== undefined && data.description !== null && data.description !== '') {
    gameData.description = data.description
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
  
  // Add to leaderboard via score
  try {
    const scoreResult = await createScore({
      playerName: winnerName,
      playerMobile: winnerMobile,
      playerId: winnerId,
      gameId: gameId,
      score: 1000, // Base score, can be adjusted
      time: winnerTime,
    })
    
    console.log('Score created:', scoreResult)
    console.log('Winner time calculated:', winnerTime, 'seconds')
    
    // Ensure leaderboard is updated
    await updateLeaderboard(gameId)
    console.log('Leaderboard update completed for game:', gameId)
  } catch (scoreError: any) {
    console.error('Error creating score or updating leaderboard:', scoreError)
    // Still return the game even if score/leaderboard update fails
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
      updateData[key] = data[key]
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
    
    // Delete all leaderboard entries for this game
    const leaderboardQuery = query(leaderboardCollection, where('gameId', '==', id))
    const leaderboardSnapshot = await getDocs(leaderboardQuery)
    const leaderboardDeletes = leaderboardSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(leaderboardDeletes)
    console.log(`[deleteGame] Deleted ${leaderboardSnapshot.size} leaderboard entries for game ${id}`)
    
    // Finally, delete the game itself
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
    
    const orderField = params?.orderBy || 'score'
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
    
    // Sort client-side (always do this to ensure correct order)
    scores.sort((a: any, b: any) => {
      const aValue = a[orderField] || 0
      const bValue = b[orderField] || 0
      if (orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
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
  score: number
  time?: number
}) {
  const scoreData: any = {
    playerName: data.playerName,
    gameId: data.gameId,
    score: data.score,
    createdAt: Timestamp.now(),
  }
  
  // Add mobile and playerId if provided
  if (data.playerMobile) {
    scoreData.playerMobile = data.playerMobile
  }
  if (data.playerId) {
    scoreData.playerId = data.playerId
  }
  
  // Only add time if it has a value
  if (data.time !== undefined && data.time !== null) {
    scoreData.time = data.time
  }
  
  const docRef = await addDoc(scoresCollection, scoreData)
  const scoreDoc = await getDoc(docRef)
  const createdScore = {
    id: scoreDoc.id,
    ...convertTimestamps(scoreDoc.data()),
  }
  
  // Update leaderboard after score is created
  try {
    await updateLeaderboard(data.gameId)
    console.log(`Leaderboard updated for game ${data.gameId} after score creation`)
  } catch (error: any) {
    console.error('Error updating leaderboard after score creation:', error)
    // Don't fail the score creation if leaderboard update fails
  }
  
  return createdScore
}

// Leaderboard
export const leaderboardCollection = collection(db, 'leaderboard')

export async function updateLeaderboard(gameId: string) {
  try {
    console.log(`[Leaderboard Update] Starting update for game ${gameId}`)
    
    // Get the game to find its eventId
    const game = await getGameById(gameId)
    if (!game) {
      return {
        success: false,
        message: `Game ${gameId} not found`,
        gameId,
        entriesUpdated: 0,
        totalEntries: 0,
        results: [],
      }
    }
    
    const gameData = game as any
    const eventId = gameData.eventId
    
    if (!eventId) {
      return {
        success: false,
        message: `Game ${gameId} does not have an eventId. Please update the game to include an event.`,
        gameId,
        entriesUpdated: 0,
        totalEntries: 0,
        results: [],
      }
    }
    
    console.log(`[Leaderboard Update] Found eventId: ${eventId} for game ${gameId}`)
    
    // Get all games with this eventId
    const gamesWithEvent = await getGames({ eventId, limit: 1000 })
    console.log(`[Leaderboard Update] Found ${gamesWithEvent.games.length} games for event ${eventId}`)
    
    // Get all scores for all games in this event
    let allScores: any[] = []
    for (const g of gamesWithEvent.games) {
      const gId = (g as any).id
      try {
        const scoresData = await getScores({
          gameId: gId,
          limit: 1000,
        })
        if (scoresData && scoresData.scores && Array.isArray(scoresData.scores)) {
          allScores = allScores.concat(scoresData.scores.map((s: any) => ({ ...s, gameId: gId })))
        }
      } catch (error: any) {
        console.warn(`[Leaderboard Update] Error fetching scores for game ${gId}:`, error.message)
      }
    }
    
    console.log(`[Leaderboard Update] Found ${allScores.length} total scores for event ${eventId}`)
    
    if (allScores.length === 0) {
      const completedGames = gamesWithEvent.games.filter((g: any) => g.status === 'completed')
      if (completedGames.length === 0) {
        return {
          success: false,
          message: 'No completed games found for this event. Complete games first to create scores.',
          gameId,
          entriesUpdated: 0,
          totalEntries: 0,
          results: [],
        }
      }
      return {
        success: false,
        message: `No scores found for event ${eventId}. Found ${completedGames.length} completed game(s) but no scores.`,
        gameId,
        entriesUpdated: 0,
        totalEntries: 0,
        results: [],
      }
    }
    
    // Sort by time (ascending - lower time is better), then by playerName for consistency
    allScores.sort((a: any, b: any) => {
      const timeA = a.time !== undefined && a.time !== null ? Number(a.time) : Infinity
      const timeB = b.time !== undefined && b.time !== null ? Number(b.time) : Infinity
      if (timeA !== timeB) {
        return timeA - timeB
      }
      const nameA = a.playerName || ''
      const nameB = b.playerName || ''
      return nameA.localeCompare(nameB)
    })
    
    // Take top 10 for leaderboard
    const topScores = allScores.slice(0, 10)
    
    // Use the scores for leaderboard update
    const scoresData = {
      scores: topScores,
      total: topScores.length,
    }
    
    // Log scores being processed
    console.log('[Leaderboard Update] Scores to process:', scoresData.scores.map((s: any) => ({
      player: s.playerName,
      score: s.score,
      time: s.time
    })))
    
    // Update or create leaderboard entries sequentially to avoid race conditions
    const results = []
    for (let i = 0; i < scoresData.scores.length; i++) {
      const score = scoresData.scores[i]
      try {
        // Create document ID: eventId_playerId
        const playerId = (score as any).playerId || `${score.playerName}_${(score as any).playerMobile || 'unknown'}`
        const docId = `${eventId}_${playerId}`.replace(/[^a-zA-Z0-9_]/g, '_')
        const leaderboardRef = doc(db, 'leaderboard', docId)
        
        // Check if document exists to preserve createdAt
        const existingDoc = await getDoc(leaderboardRef)
        const updateData: any = {
          playerName: score.playerName,
          eventId: eventId,
          gameId: score.gameId || gameId, // Keep gameId for reference
          rank: i + 1,
          time: score.time !== undefined && score.time !== null ? Number(score.time) : null,
          updatedAt: Timestamp.now(),
        }
        
        // Add score if it exists (for backward compatibility)
        if (score.score !== undefined && score.score !== null) {
          updateData.score = score.score
        }
        
        // Add mobile and playerId if available
        if ((score as any).playerMobile) {
          updateData.playerMobile = (score as any).playerMobile
        }
        if ((score as any).playerId) {
          updateData.playerId = (score as any).playerId
        }
        
        // Add time if it exists
        if (score.time !== undefined && score.time !== null && score.time !== '') {
          updateData.time = score.time
        }
        
        // Preserve createdAt if document already exists
        if (!existingDoc.exists()) {
          updateData.createdAt = Timestamp.now()
        }
        
        // Use setDoc with merge to create or update
        await setDoc(leaderboardRef, updateData, { merge: true })
        console.log(`[Leaderboard Update] ✓ Updated entry: ${score.playerName} - Rank ${i + 1} - Score ${score.score}`)
        results.push({ playerName: score.playerName, rank: i + 1, success: true })
      } catch (entryError: any) {
        console.error(`[Leaderboard Update] ✗ Error updating entry for ${score.playerName}:`, entryError)
        console.error('Entry error details:', {
          code: entryError.code,
          message: entryError.message,
          playerName: score.playerName,
          gameId,
        })
        results.push({ playerName: score.playerName, rank: i + 1, success: false, error: entryError.message })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    console.log(`[Leaderboard Update] Completed for game ${gameId}: ${successCount}/${results.length} entries updated`)
    
    return {
      success: true,
      gameId,
      entriesUpdated: successCount,
      totalEntries: results.length,
      results,
    }
  } catch (error: any) {
    console.error('[Leaderboard Update] Fatal error:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      gameId,
      stack: error.stack,
    })
    throw error // Re-throw so caller knows it failed
  }
}

export async function checkGameLeaderboardStatus(gameId: string) {
  try {
    console.log(`[Status Check] Checking leaderboard status for game ${gameId}`)
    const q = query(leaderboardCollection, where('gameId', '==', gameId))
    const snapshot = await getDocs(q)
    console.log(`[Status Check] Found ${snapshot.size} leaderboard entries for game ${gameId}`)
    
    if (!snapshot.empty && snapshot.size > 0) {
      // Get the most recently updated entry
      let latestEntry = snapshot.docs[0]
      let latestTime = latestEntry.data().updatedAt || latestEntry.data().createdAt
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const updatedAt = data.updatedAt || data.createdAt
        if (updatedAt) {
          const updateTime = updatedAt instanceof Timestamp ? updatedAt.toMillis() : new Date(updatedAt).getTime()
          const latestTimeMs = latestTime instanceof Timestamp ? latestTime.toMillis() : (latestTime ? new Date(latestTime).getTime() : 0)
          if (updateTime > latestTimeMs) {
            latestEntry = doc
            latestTime = updatedAt
          }
        }
      })
      
      const entryData = latestEntry.data()
      const lastUpdated = entryData.updatedAt || entryData.createdAt
      const result = {
        hasLeaderboard: true,
        lastUpdated: lastUpdated 
          ? (lastUpdated instanceof Timestamp 
              ? lastUpdated.toDate().toISOString() 
              : typeof lastUpdated === 'string' 
                ? lastUpdated 
                : new Date(lastUpdated).toISOString())
          : null,
        entryCount: snapshot.size,
      }
      console.log(`[Status Check] Game ${gameId} has leaderboard:`, result)
      return result
    }
    
    console.log(`[Status Check] Game ${gameId} has NO leaderboard entries`)
    return { hasLeaderboard: false, lastUpdated: null, entryCount: 0 }
  } catch (error: any) {
    console.error(`[Status Check] Error checking leaderboard status for game ${gameId}:`, error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      gameId,
    })
    return { hasLeaderboard: false, lastUpdated: null, entryCount: 0 }
  }
}

export async function getLeaderboard(params?: {
  gameId?: string
  limit?: number
  offset?: number
  excludeDeletedGames?: boolean // Filter out entries for deleted games
}) {
  try {
    let q = query(leaderboardCollection)
    
    if (params?.gameId) {
      q = query(q, where('gameId', '==', params.gameId))
    }
    
    let useOrderBy = false
    // Try to order by rank, but fallback to client-side sorting
    try {
      q = query(q, orderBy('rank', 'asc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getLeaderboard] Index may be needed for orderBy, sorting client-side')
      useOrderBy = false
    }
    
    // Fetch all matching documents first for accurate total count
    const querySnapshot = await getDocs(q)
    let leaderboard = querySnapshot.docs.map((doc) => {
      const data = convertTimestamps(doc.data())
      return {
        id: doc.id,
        ...data,
        // Ensure gameId is always present
        gameId: data.gameId || null,
      }
    })
    
    console.log(`[getLeaderboard] Fetched ${leaderboard.length} leaderboard entries`)
    
    // Sort client-side by rank (ascending) or score (descending) if rank doesn't exist
    if (!useOrderBy || true) { // Always sort client-side to ensure correct order
      leaderboard.sort((a: any, b: any) => {
        if (a.rank !== undefined && b.rank !== undefined) {
          return a.rank - b.rank
        }
        // Fallback: sort by score descending
        return (b.score || 0) - (a.score || 0)
      })
    }
    
    // Fetch game data for ALL entries first (before pagination) if we need to filter
    // Use a cache to avoid fetching the same game multiple times
    const gameCache: Record<string, any> = {}
    
    // If we need to exclude deleted games, fetch game data for all entries first
    if (params?.excludeDeletedGames) {
      const allEntriesWithGames = await Promise.all(
        leaderboard.map(async (entry: any) => {
          if (!entry.gameId) {
            return null // Filter out entries without gameId
          }
          
          // Check cache first
          if (gameCache[entry.gameId]) {
            const cachedGame = gameCache[entry.gameId]
            // Filter out deleted games
            if (cachedGame.name === 'Unknown Event') {
              return null
            }
            return {
              ...entry,
              game: cachedGame,
            }
          }
          
          // Fetch game if not in cache
          try {
            const game = await getGameById(entry.gameId)
            if (game && game.name) {
              const gameData = {
                id: game.id,
                name: game.name,
              }
              gameCache[entry.gameId] = gameData
              return {
                ...entry,
                game: gameData,
              }
            } else {
              // Game not found (deleted) - filter out
              return null
            }
          } catch (error: any) {
            // Game fetch failed (deleted) - filter out
            return null
          }
        })
      )
      
      // Filter out null entries (deleted games)
      leaderboard = allEntriesWithGames.filter((entry): entry is any => entry !== null)
    }
    
    // Store total after filtering (if filtering was applied)
    const total = leaderboard.length
    
    // Apply pagination
    const offset = params?.offset || 0
    const limit = params?.limit || leaderboard.length
    const paginatedLeaderboard = leaderboard.slice(offset, offset + limit)
    
    // Fetch game data for paginated entries (if not already fetched)
    const leaderboardWithDetails = await Promise.all(
      paginatedLeaderboard.map(async (entry: any) => {
        // If game data already exists (from filtering step), return as-is
        if (entry.game) {
          return entry
        }
        
        if (!entry.gameId) {
          return {
            ...entry,
            game: {
              id: 'unknown',
              name: 'Unknown Event',
            },
          }
        }
        
        // Check cache first
        if (gameCache[entry.gameId]) {
          return {
            ...entry,
            game: gameCache[entry.gameId],
          }
        }
        
        // Fetch game if not in cache
        try {
          const game = await getGameById(entry.gameId)
          if (game && game.name) {
            const gameData = {
              id: game.id,
              name: game.name,
            }
            gameCache[entry.gameId] = gameData
            return {
              ...entry,
              game: gameData,
            }
          } else {
            // Game not found (deleted)
            const gameData = {
              id: entry.gameId,
              name: 'Unknown Event',
            }
            gameCache[entry.gameId] = gameData
            return {
              ...entry,
              game: gameData,
            }
          }
        } catch (error: any) {
          // If game fetch fails, return with Unknown Event
          const gameData = {
            id: entry.gameId,
            name: 'Unknown Event',
          }
          gameCache[entry.gameId] = gameData
          return {
            ...entry,
            game: gameData,
          }
        }
      })
    )
    
    return {
      leaderboard: leaderboardWithDetails,
      total: total,
    }
  } catch (error: any) {
    console.error('[getLeaderboard] Error fetching leaderboard:', error)
    if (error.code === 'failed-precondition') {
      return {
        leaderboard: [],
        total: 0,
      }
    }
    throw error
  }
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
  let q = query(braceletsCollection)
  
  if (params?.element) {
    q = query(q, where('element', '==', params.element))
  }
  if (params?.rarity) {
    q = query(q, where('rarity', '==', params.rarity))
  }
  
  q = query(q, orderBy('createdAt', 'desc'))
  
  if (params?.limit) {
    q = query(q, limit(params.limit))
  }
  
  const querySnapshot = await getDocs(q)
  const bracelets = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }))
  
  const offset = params?.offset || 0
  const paginatedBracelets = bracelets.slice(offset)
  
  return {
    bracelets: paginatedBracelets,
    total: bracelets.length,
  }
}

export async function getBraceletById(id: string) {
  const docRef = doc(db, 'bracelets', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) }
  }
  return null
}

export async function createBracelet(data: {
  name: string
  description?: string
  element: string
  image?: string
  rarity?: string
}) {
  const braceletData: any = {
    name: data.name,
    element: data.element.toLowerCase(),
    rarity: data.rarity || 'common',
    createdAt: Timestamp.now(),
  }
  
  // Only add optional fields if they have values
  if (data.description !== undefined && data.description !== null && data.description !== '') {
    braceletData.description = data.description
  }
  if (data.image !== undefined && data.image !== null && data.image !== '') {
    braceletData.image = data.image
  }
  
  const docRef = await addDoc(braceletsCollection, braceletData)
  return getBraceletById(docRef.id)
}

export async function assignBracelet(braceletId: string, playerName: string) {
  // Check if already assigned
  const q = query(
    userBraceletsCollection,
    where('playerName', '==', playerName),
    where('braceletId', '==', braceletId),
    limit(1)
  )
  const existing = await getDocs(q)
  
  if (!existing.empty) {
    throw new Error('Player already has this bracelet')
  }
  
  const docRef = await addDoc(userBraceletsCollection, {
    playerName,
    braceletId,
    earnedAt: Timestamp.now(),
  })
  
  const docSnap = await getDoc(docRef)
  const data = docSnap.data()
  const bracelet = await getDoc(doc(db, 'bracelets', braceletId))
  
  return {
    id: docSnap.id,
    ...convertTimestamps(data),
    playerName,
    bracelet: bracelet.exists()
      ? { id: bracelet.id, ...convertTimestamps(bracelet.data()) }
      : null,
  }
}

// Contact
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
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getContactMessages] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    // Fetch all matching documents first for accurate total count
    const querySnapshot = await getDocs(q)
    let messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    // Sort client-side if orderBy wasn't applied
    if (!useOrderBy) {
      messages.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    // Store total before pagination
    const total = messages.length
    
    // Apply pagination
    const offset = params?.offset || 0
    const limit = params?.limit || messages.length
    const paginatedMessages = messages.slice(offset, offset + limit)
    
    return {
      messages: paginatedMessages,
      total: total,
    }
  } catch (error: any) {
    console.error('[getContactMessages] Error fetching contact messages:', error)
    if (error.code === 'failed-precondition') {
      return {
        messages: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function createContactMessage(data: {
  name: string
  email: string
  message: string
  subject?: string
}) {
  const contactData: any = {
    name: data.name,
    email: data.email,
    message: data.message,
    read: false,
    createdAt: Timestamp.now(),
  }
  
  // Only add subject if it has a value
  if (data.subject !== undefined && data.subject !== null && data.subject !== '') {
    contactData.subject = data.subject
  }
  
  const docRef = await addDoc(contactCollection, contactData)
  return getDoc(docRef).then((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  }))
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
    
    let useOrderBy = false
    try {
      q = query(q, orderBy('createdAt', 'desc'))
      useOrderBy = true
    } catch (error: any) {
      console.warn('[getNewsletterSubscribers] Index may be needed for orderBy, will sort client-side')
      useOrderBy = false
    }
    
    // Fetch all matching documents first for accurate total count
    const querySnapshot = await getDocs(q)
    let subscribers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }))
    
    // Sort client-side if orderBy wasn't applied
    if (!useOrderBy) {
      subscribers.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
    }
    
    // Store total before pagination
    const total = subscribers.length
    
    // Apply pagination
    const offset = params?.offset || 0
    const limit = params?.limit || subscribers.length
    const paginatedSubscribers = subscribers.slice(offset, offset + limit)
    
    return {
      subscribers: paginatedSubscribers,
      total: total,
    }
  } catch (error: any) {
    console.error('[getNewsletterSubscribers] Error fetching newsletter subscribers:', error)
    if (error.code === 'failed-precondition') {
      return {
        subscribers: [],
        total: 0,
      }
    }
    throw error
  }
}

export async function getNewsletterSubscriberByEmail(email: string) {
  const q = query(newsletterCollection, where('email', '==', email), limit(1))
  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...convertTimestamps(doc.data()) }
  }
  return null
}

export async function subscribeNewsletter(email: string) {
  const existing = await getNewsletterSubscriberByEmail(email)
  
  if (existing) {
    if (existing.subscribed) {
      throw new Error('Email is already subscribed')
    }
    // Re-subscribe
    const docRef = doc(db, 'newsletter', existing.id)
    await updateDoc(docRef, {
      subscribed: true,
      updatedAt: Timestamp.now(),
    })
    return getDoc(docRef).then((docSnap) => ({
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    }))
  }
  
  const docRef = await addDoc(newsletterCollection, {
    email,
    subscribed: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return getDoc(docRef).then((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  }))
}

export async function unsubscribeNewsletter(email: string) {
  const existing = await getNewsletterSubscriberByEmail(email)
  
  if (!existing) {
    throw new Error('Email not found in newsletter list')
  }
  
  const docRef = doc(db, 'newsletter', existing.id)
  await updateDoc(docRef, {
    subscribed: false,
    updatedAt: Timestamp.now(),
  })
}

// Delete functions
export async function deleteScore(id: string) {
  await deleteDoc(doc(db, 'scores', id))
}

export async function deleteContactMessage(id: string) {
  await deleteDoc(doc(db, 'contact', id))
}

export async function deleteNewsletterSubscriber(id: string) {
  await deleteDoc(doc(db, 'newsletter', id))
}

export async function deleteLeaderboardEntry(id: string) {
  await deleteDoc(doc(db, 'leaderboard', id))
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
