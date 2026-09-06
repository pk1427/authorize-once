import { NextResponse } from 'next/server'
import { store, getActiveAuth } from '@/lib/contributions'
import { POLICY, validatePolicy } from '@/lib/policy'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberAddress, policy } = body

    if (!memberAddress || !policy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validation = validatePolicy(
      policy.allowedContracts[0],
      policy.maxAmount,
      policy.allowedNetworks[0]
    )

    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 })
    }

    const existingAuth = getActiveAuth(memberAddress)
    if (existingAuth) {
      return NextResponse.json({ error: 'Authorization already exists' }, { status: 409 })
    }

    const authId = `auth_${memberAddress}_${Date.now()}`
    const expiresAt = new Date(policy.expiresAt || POLICY.expiresAt)

    store.auths.set(memberAddress, {
      memberId: memberAddress,
      memberAddress,
      grantedAt: new Date(),
      expiresAt,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      authId,
      expiresAt: expiresAt.toISOString(),
      message: 'Wallet access granted successfully',
    })
  } catch (error) {
    console.error('Grant error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
