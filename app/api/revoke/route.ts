import { NextResponse } from 'next/server'
import { store, getActiveAuth } from '@/lib/contributions'
import { getPrivyConfig, validateAuthorizationKey } from '@/lib/privy-server'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !validateAuthorizationKey(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
