import { NextResponse } from 'next/server'
import { store, getActiveAuth, getPeriodKey, hasContributedInPeriod } from '@/lib/contributions'
import { POLICY, validatePolicy } from '@/lib/policy'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberAddress, amount = POLICY.maxAmount, network = 'base-sepolia' } = body

    if (!memberAddress) {
      return NextResponse.json({ error: 'Missing memberAddress' }, { status: 400 })
    }

    const auth = getActiveAuth(memberAddress)
    if (!auth) {
      return NextResponse.json({ error: 'No active authorization found' }, { status: 403 })
    }

    const validation = validatePolicy(POLICY.allowedContracts[0], amount, network)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 403 })
    }

    const period = getPeriodKey(new Date())
    if (hasContributedInPeriod(memberAddress, period)) {
      return NextResponse.json({ error: 'Already contributed this period' }, { status: 409 })
    }

    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`

    const record = {
      id: `contrib_${Date.now()}`,
      memberId: memberAddress,
      memberAddress,
      period,
      amount,
      network,
      txHash,
      status: 'completed' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.contributions.set(record.id, record)

    return NextResponse.json({
      success: true,
      txHash,
      amount,
      period,
      message: 'Contribution recorded successfully',
    })
  } catch (error) {
    console.error('Contribute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
