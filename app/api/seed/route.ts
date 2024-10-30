import createMockData from '@/app/api/seed/mock'
import { db } from '@/lib/db'
import { requests } from '@/lib/db/schema'

export async function POST() {
  try {
    // Generate mock data for the last 14 days
    const mockData = Array.from({ length: 14 * 24 })
      .map((_, i) => createMockData({ minutes: i * 60 }))
      .flat()

    // Insert data in batches to avoid memory issues
    const batchSize = 100
    for (let i = 0; i < mockData.length; i += batchSize) {
      const batch = mockData.slice(i, i + batchSize)
      await db.insert(requests).values(batch).execute()
    }

    return Response.json({
      success: true,
      count: mockData.length
    })
  } catch (error) {
    console.error('Seed Error:', error)
    return Response.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}

// Optional - add endpoint to clear data
export async function DELETE() {
  try {
    await db.delete(requests).execute()
    return Response.json({ success: true })
  } catch (error) {
    console.error('Clear Error:', error)
    return Response.json({ error: 'Failed to clear database' }, { status: 500 })
  }
}
