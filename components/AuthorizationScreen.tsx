'use client'

import { useState } from 'react'
import { POLICY, isPolicyActive, validatePolicy } from '@/lib/policy'

interface AuthorizationScreenProps {
  onComplete: () => void
  onBack: () => void
}

export function AuthorizationScreen({ onComplete, onBack }: AuthorizationScreenProps) {
  const [accepted, setAccepted] = useState(false)
  const [isGranting, setIsGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGrant = async () => {
    if (!accepted) {
      setError('You must accept the policy before granting access.')
      return
    }

    setIsGranting(true)
    setError(null)

    try {
      const response = await fetch('/api/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberAddress: '0x',
          policy: POLICY,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant access')
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGranting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold">Authorize Your Wallet</h2>
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
            <h3 className="font-semibold text-blue-400 mb-2">What you&apos;re authorizing</h3>
            <p className="text-sm text-gray-300">
              By granting access, you allow the savings circle to automatically withdraw contributions from your wallet on a recurring basis. You will not be prompted again until you revoke this access or it expires.
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Policy Details</h3>
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
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-gray-400">Policy Status</span>
                <span className={isPolicyActive() ? 'text-green-400' : 'text-red-400'}>
                  {isPolicyActive() ? 'Active' : 'Expired'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Expires</span>
                <span className="font-mono">{POLICY.expiresAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What CAN be done:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
              <li>Withdraw up to 0.01 ETH per transaction to the savings circle contract</li>
              <li>Execute contributions only on Base Sepolia and Base networks</li>
              <li>Access expires automatically on 2026-12-31</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">What CANNOT be done:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
              <li>Transfer funds to any address other than the savings circle contract</li>
              <li>Withdraw more than 0.01 ETH in a single transaction</li>
              <li>Access your wallet after the expiry date</li>
              <li>Transfer any tokens other than ETH</li>
            </ul>
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
            <button onClick={onBack} className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
              Back
            </button>
            <button
              onClick={handleGrant}
              disabled={!accepted || isGranting}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {isGranting ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
