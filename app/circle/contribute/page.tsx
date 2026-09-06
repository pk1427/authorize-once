'use client'

export const dynamic = 'force-dynamic'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getActiveAuth, getContributionsForMember, getPeriodKey } from '@/lib/contributions'
import { MemberCard } from '@/components/MemberCard'
import { RevokeButton } from '@/components/RevokeButton'
import { ContributionHistory } from '@/components/ContributionHistory'

export default function ContributePage() {
  const { authenticated, ready } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [memberId, setMemberId] = useState<string | null>(null)
  const [auth, setAuth] = useState<ReturnType<typeof getActiveAuth>>(undefined)
  const [contributions, setContributions] = useState<ReturnType<typeof getContributionsForMember>>([])
  const [currentPeriod, setCurrentPeriod] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.push('/')
      return
    }

    const wallet = wallets[0]
    if (!wallet) return

    const address = wallet.address
    setMemberId(address)
    setAuth(getActiveAuth(address))
    setContributions(getContributionsForMember(address))
    setCurrentPeriod(getPeriodKey(new Date()))
  }, [authenticated, ready, wallets, router])

  if (!ready || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!memberId) {
    return <div className="min-h-screen flex items-center justify-center">Loading wallet...</div>
  }

  const isActive = !!auth
  const hasContributed = contributions.some(c => c.period === currentPeriod && c.status === 'completed')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Contribute</h1>
          <p className="text-gray-400 mt-2">Manage your contributions and authorization</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <MemberCard
            memberId={memberId}
            auth={auth}
            isPolicyValid={true}
            hasContributed={hasContributed}
            currentPeriod={currentPeriod}
          />

          <div className="space-y-6">
            {isActive && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-semibold">Your Authorization</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Granted</span>
                    <span>{auth.grantedAt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expires</span>
                    <span>{auth.expiresAt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
                <RevokeButton memberId={memberId} onRevoke={() => {
                  setAuth(getActiveAuth(memberId))
                  setContributions(getContributionsForMember(memberId))
                }} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Contribution History</h3>
          <ContributionHistory contributions={contributions} />
        </div>

        <div className="text-center">
          <button
            onClick={async () => {
              const res = await fetch('/api/contribute', { method: 'POST' })
              const data = await res.json()
              if (data.success) {
                setContributions(getContributionsForMember(memberId))
              }
            }}
            disabled={!isActive || hasContributed}
            className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            {hasContributed ? 'Already Contributed This Period' : 'Contribute Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
