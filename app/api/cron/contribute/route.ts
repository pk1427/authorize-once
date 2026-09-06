import { NextResponse } from 'next/server'
import { store, getActiveMembers, getPeriodKey, hasContributedInPeriod } from '@/lib/contributions'
import { POLICY, validatePolicy } from '@/lib/policy'
import { getPrivyConfig, validateAuthorizationKey } from '@/lib/privy-server'

export async function POST(request: Request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const circleId = 'default'
    const members = getActiveMembers(circleId)
    const results = []

    for (const member of members) {
      const result = await processMemberContribution(member)
      results.push(result)
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processMemberContribution(member: ReturnType<typeof getActiveMembers>[0]) {
  const period = getPeriodKey(new Date())

  if (hasContributedInPeriod(member.id, period)) {
    return {
      memberId: member.id,
      status: 'skipped',
      reason: 'Already contributed this period',
    }
  }

  const auth = store.auths.get(member.id)
  if (!auth || !auth.isActive || auth.revokedAt || new Date() > auth.expiresAt) {
    return {
      memberId: member.id,
      status: 'skipped',
      reason: 'No active authorization',
    }
  }

  const validation = validatePolicy(POLICY.allowedContracts[0], POLICY.maxAmount, 'base-sepolia')
  if (!validation.valid) {
    return {
      memberId: member.id,
      status: 'failed',
      reason: validation.reason,
    }
  }

  try {
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`

    const record = {
      id: `contrib_cron_${Date.now()}_${member.id}`,
      memberId: member.id,
      memberAddress: member.memberAddress,
      period,
      amount: POLICY.maxAmount,
      network: 'base-sepolia',
      txHash,
      status: 'completed' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.contributions.set(record.id, record)

    return {
      memberId: member.id,
      status: 'completed',
      txHash,
      amount: POLICY.maxAmount,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    const record = {
      id: `contrib_cron_fail_${Date.now()}_${member.id}`,
      memberId: member.id,
      memberAddress: member.memberAddress,
      period,
      amount: POLICY.maxAmount,
      network: 'base-sepolia',
      status: 'failed' as const,
      error: errorMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.contributions.set(record.id, record)

    return {
      memberId: member.id,
      status: 'failed',
      reason: errorMessage,
    }
  }
}
