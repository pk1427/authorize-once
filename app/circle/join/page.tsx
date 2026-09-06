'use client'

export const dynamic = 'force-dynamic'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { POLICY, isPolicyActive, validatePolicy } from '@/lib/policy'
import { store, getActiveAuth } from '@/lib/contributions'

export default function JoinPage() {
  const { authenticated, user, ready, login } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'review' | 'granting' | 'complete'>('intro')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      setStep('intro')
      return
    }

    const wallet = wallets[0]
    if (!wallet) return

    const address = wallet.address
    const existingAuth = getActiveAuth(address)
    if (existingAuth) {
      router.push('/circle')
    }
  }, [authenticated, ready, wallets, router])

  const handleGrant = async () => {
    if (!accepted) {
      setError('You must accept the policy before granting access.')
      return
    }

    setStep('granting')
    setError(null)

    try {
      const wallet = wallets[0]
      if (!wallet) throw new Error('No wallet connected')

      const response = await fetch('/api/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberAddress: wallet.address,
          policy: POLICY,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant access')
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('review')
    }
  }

  const isStep = (s: string) => step === s

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-bold">Join Savings Circle</h1>
          <p className="text-gray-400">Sign in to authorize your wallet for automatic contributions.</p>
          <button onClick={login} className="px-8 py-4 bg-primary hover:bg-primary/80 rounded-lg font-semibold text-lg transition-colors">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (isStep('complete')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-400">Authorization Granted</h1>
          <p className="text-gray-400">Your wallet has been authorized for automatic contributions. You can revoke this access at any time from your circle dashboard.</p>
          <button onClick={() => router.push('/circle')} className="w-full px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors">
            Go to Circle
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Join Savings Circle</h1>
          <p className="text-gray-400">Authorize your wallet to enable automatic weekly contributions.</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isStep('intro') ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isStep('review') ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isStep('granting') || isStep('complete') ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>3</div>
          </div>

          {isStep('intro') && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">What you&apos;re authorizing</h2>
              <p className="text-gray-300">
                By granting access, you allow the savings circle smart contract to withdraw a fixed amount from your wallet on a recurring basis. This eliminates the need to approve each contribution manually.
              </p>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What CAN be done:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Withdraw up to 0.01 ETH per transaction to the savings circle contract</li>
                  <li>Execute contributions only on Base Sepolia and Base networks</li>
                  <li>Access expires automatically on 2026-12-31</li>
                </ul>
                <h3 className="font-semibold text-lg mt-4">What CANNOT be done:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Transfer funds to any address other than the savings circle contract</li>
                  <li>Withdraw more than 0.01 ETH in a single transaction</li>
                  <li>Access your wallet after the expiry date</li>
                  <li>Transfer any tokens other than ETH</li>
                </ul>
              </div>
              <button onClick={() => setStep('review')} className="w-full px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors">
                Review Policy
              </button>
            </div>
          )}

          {isStep('review') && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Review Authorization Policy</h2>
              <div className="bg-slate-900/50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Policy Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-400">Allowed Contract</span>
                    <span className="font-mono text-xs break-all">{POLICY.allowedContracts[0]}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-400">Max Per Transaction</span>
                    <span className="font-mono">{POLICY.maxAmount} {POLICY.maxAmountUnit}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-400">Allowed Networks</span>
                    <span className="font-mono text-xs">{POLICY.allowedNetworks.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Expires</span>
                    <span className="font-mono">{POLICY.expiresAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="accept"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 bg-slate-700 text-primary focus:ring-primary"
                />
                <label htmlFor="accept" className="text-sm text-gray-300">
                  I understand and accept the authorization policy. I know I can revoke this access at any time from my circle dashboard.
                </label>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep('intro')} className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
                  Back
                </button>
                <button onClick={handleGrant} disabled={!accepted || isStep('granting')} className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors">
                  {isStep('granting') ? 'Granting...' : 'Grant Access'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
