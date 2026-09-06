'use client'

import { useState } from 'react'

interface RevokeButtonProps {
  memberId: string
  onRevoke: () => void
}

export function RevokeButton({ memberId, onRevoke }: RevokeButtonProps) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRevoke = async () => {
    setIsRevoking(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberAddress: memberId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke access')
      }

      setSuccess(true)
      onRevoke()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRevoking(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <p className="text-green-400 text-sm">Authorization revoked successfully</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleRevoke}
        disabled={isRevoking}
        className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-400 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRevoking ? 'Revoking...' : 'Revoke Access'}
      </button>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-xs">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Revoking will stop automatic contributions. You can re-authorize at any time.
      </p>
    </div>
  )
}
