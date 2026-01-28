# Leaderboard Update Guide

## How the Leaderboard Updates

The leaderboard is automatically updated in the following scenarios:

### 1. **Automatic Update When Completing a Game**
When you complete a game in the admin panel:
1. A score is created for the winner
2. The leaderboard is automatically updated for that game
3. The new entry appears with rank, score, and time

**Process:**
- Admin selects winner → Game completed → Score created → Leaderboard updated

### 2. **Manual Refresh**
- Click the **"Refresh"** button on the admin leaderboard page
- This fetches the latest leaderboard data from the database

### 3. **Manual Update for Specific Game**
- Enter a Game ID in the "Update Leaderboard for Game ID" field
- Click **"Update"** button
- This will recalculate and update the leaderboard for that specific game

## Troubleshooting

### Leaderboard Not Showing New Entries?

1. **Check if the game was completed:**
   - Go to `/admin/games`
   - Verify the game status is "Completed"
   - Check if winner and winnerTime are set

2. **Check if score was created:**
   - Go to `/admin/scores`
   - Look for the winner's score entry
   - Verify it has the correct gameId

3. **Manually update the leaderboard:**
   - Go to `/admin/leaderboard`
   - Enter the game ID in the update field
   - Click "Update"

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for console logs:
     - `Leaderboard updated for game [gameId]`
     - `Found X scores for game [gameId]`
   - Check for any error messages

5. **Verify Firestore data:**
   - Check Firebase Console → Firestore Database
   - Look in `leaderboard` collection
   - Verify entries exist with correct `gameId`, `playerName`, `rank`, `score`

6. **Check Firestore Index:**
   - The status check requires a Firestore index on `gameId` field
   - If you see an error about missing index, click the link in the error message
   - Or manually create: Collection `leaderboard`, Field `gameId` (Ascending)
   - See `FIREBASE_INDEXES.md` for details

7. **Refresh Status Manually:**
   - On the games page (`/admin/games`), click the refresh button (↻) next to any completed game's status
   - This will re-check the leaderboard status for that specific game

## How Leaderboard Ranking Works

1. **Scores are fetched** for a specific game, ordered by score (descending)
2. **Ranks are assigned** based on position (1st, 2nd, 3rd, etc.)
3. **Leaderboard entries are created/updated** with:
   - `playerName`: Winner's name
   - `gameId`: Game ID
   - `rank`: Position (1 = highest score)
   - `score`: Player's score
   - `time`: Time taken (in seconds)

## API Endpoints

### Get Leaderboard
```
GET /api/leaderboard?gameId=[gameId]&limit=100
```

### Update Leaderboard (Manual)
```
POST /api/leaderboard/update
Body: { "gameId": "game-id-here" }
```

## Notes

- Leaderboard entries are per game (each game has its own leaderboard)
- If you want a global leaderboard, fetch without `gameId` parameter
- Ranks are recalculated each time the leaderboard is updated
- If multiple players have the same score, rank is based on creation order
