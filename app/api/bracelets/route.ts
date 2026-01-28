import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired } from '@/lib/validation'
import { getBracelets, createBracelet } from '@/lib/firestore'
import type { CreateBraceletRequest } from '@/types/api'

// GET /api/bracelets - Get all bracelets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const element = searchParams.get('element')
    const rarity = searchParams.get('rarity')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getBracelets({
      element: element || undefined,
      rarity: rarity || undefined,
      limit,
      offset,
    })

    return successResponse({
      bracelets: result.bracelets,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching bracelets:', error)
    return serverErrorResponse('Failed to fetch bracelets')
  }
}

// POST /api/bracelets - Create a new bracelet
export async function POST(request: NextRequest) {
  try {
    const body: CreateBraceletRequest = await request.json()

    // Validation
    const nameError = validateRequired(body.name, 'Name')
    if (nameError) return errorResponse(nameError)

    const elementError = validateRequired(body.element, 'Element')
    if (elementError) return errorResponse(elementError)

    const validElements = ['fire', 'water', 'earth', 'air']
    if (!validElements.includes(body.element.toLowerCase())) {
      return errorResponse('Element must be one of: fire, water, earth, air')
    }

    const validRarities = ['common', 'rare', 'epic', 'legendary']
    if (body.rarity && !validRarities.includes(body.rarity)) {
      return errorResponse('Rarity must be one of: common, rare, epic, legendary')
    }

    const bracelet = await createBracelet({
      name: body.name,
      description: body.description,
      element: body.element.toLowerCase(),
      image: body.image,
      rarity: body.rarity || 'common',
    })

    if (!bracelet) {
      return serverErrorResponse('Failed to create bracelet')
    }

    return successResponse(bracelet, 'Bracelet created successfully', 201)
  } catch (error) {
    console.error('Error creating bracelet:', error)
    return serverErrorResponse('Failed to create bracelet')
  }
}
