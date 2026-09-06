import { NextResponse } from 'next/server'
import { store, getActiveAuth } from '@/lib/contributions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberAddress } = body

    if (!memberAddress) {
      return NextResponse.json({ error: 'Missing memberAddress' }, { status: 400 })
    }

    const auth = store.auths.get(memberAddress)
    if (!auth) {
      return NextResponse.json({ error: 'No authorization found' }, { status: 404 })
    }

    auth.revokedAt = new Date()
    auth.isActive = false
    store.auths.set(memberAddress, auth)

    return NextResponse.json({
      success: true,
      message: 'Authorization revoked successfully',
    })
  } catch (error) {
    console.error('Revoke error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
