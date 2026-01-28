# Backend API Documentation

This Next.js application includes a comprehensive backend API built with Next.js API Routes and Prisma ORM.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, use a PostgreSQL database:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zambara?schema=public"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
```

### 4. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens a GUI to view and edit your database at `http://localhost:5555`

## API Endpoints

### Users

- `GET /api/users` - Get all users (supports search, pagination)
  - Query params: `search`, `limit`, `offset`
- `GET /api/users/[id]` - Get user by ID
- `POST /api/users` - Create a new user
  - Body: `{ email, username, name?, avatar? }`
- `PATCH /api/users/[id]` - Update user
  - Body: `{ name?, avatar? }`
- `DELETE /api/users/[id]` - Delete user

### Games

- `GET /api/games` - Get all games
  - Query params: `element`, `difficulty`, `isActive`, `limit`, `offset`
- `GET /api/games/[id]` - Get game by ID
- `POST /api/games` - Create a new game
  - Body: `{ name, description?, element, difficulty?, isActive? }`
- `PATCH /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game

### Scores

- `GET /api/scores` - Get scores
  - Query params: `userId`, `gameId`, `limit`, `offset`, `orderBy`, `order`
- `POST /api/scores` - Submit a new score
  - Body: `{ userId, gameId, score, time? }`

### Leaderboard

- `GET /api/leaderboard` - Get leaderboard
  - Query params: `gameId`, `limit`, `offset`

### Bracelets

- `GET /api/bracelets` - Get all bracelets
  - Query params: `element`, `rarity`, `limit`, `offset`
- `POST /api/bracelets` - Create a new bracelet
  - Body: `{ name, description?, element, image?, rarity? }`

### Contact

- `GET /api/contact` - Get all contact messages (admin)
  - Query params: `read`, `limit`, `offset`
- `POST /api/contact` - Submit contact form
  - Body: `{ name, email, message, subject? }`

### Newsletter

- `GET /api/newsletter` - Get all subscribers (admin)
  - Query params: `subscribed`, `limit`, `offset`
- `POST /api/newsletter` - Subscribe to newsletter
  - Body: `{ email }`
- `DELETE /api/newsletter?email=...` - Unsubscribe from newsletter

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean
  data?: any
  error?: string
  message?: string
}
```

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Database Schema

The database includes the following models:

- **User** - User accounts
- **Game** - Game definitions
- **Score** - User scores for games
- **Bracelet** - Achievement bracelets
- **Leaderboard** - Leaderboard rankings
- **Contact** - Contact form submissions
- **Newsletter** - Newsletter subscriptions

See `prisma/schema.prisma` for the complete schema definition.

## Example Usage

### Create a User

```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'player1',
    name: 'Player One'
  })
})

const data = await response.json()
```

### Submit a Score

```typescript
const response = await fetch('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    gameId: 'game-id',
    score: 1000,
    time: 120
  })
})
```

### Get Leaderboard

```typescript
const response = await fetch('/api/leaderboard?gameId=game-id&limit=10')
const data = await response.json()
```

## Development

Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/*`

## Production

For production, consider:

1. Using PostgreSQL instead of SQLite
2. Adding authentication middleware
3. Implementing rate limiting
4. Adding request validation
5. Setting up proper error logging
6. Adding API documentation with Swagger/OpenAPI

## Next Steps

- Add authentication (JWT, NextAuth.js, etc.)
- Add rate limiting
- Add request validation middleware
- Add API documentation (Swagger)
- Add unit and integration tests
- Add database migrations for production
