'use client'

import { MemberAuth } from '@/lib/contributions'

interface MemberCardProps {
  memberId: string
  auth: MemberAuth | undefined
  isPolicyValid: boolean
  hasContributed: boolean
  currentPeriod: string
}

export function MemberCard({ memberId, auth, isPolicyValid, hasContributed, currentPeriod }: MemberCardProps) {
  const isActive = !!auth

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          {memberId.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold">Member</h3>
          <p className="text-sm text-gray-400 font-mono">{memberId}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-700">
          <span className="text-gray-400">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {isActive ? 'Authorized' : 'Not Authorized'}
          </span>
        </div>

        {isActive && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-gray-400">Granted</span>
              <span className="text-sm">{auth.grantedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-gray-400">Expires</span>
              <span className="text-sm">{auth.expiresAt.toLocaleDateString()}</span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-400">This Period</span>
          <span className={`px-2 py-1 rounded-full text-xs ${hasContributed ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
            {hasContributed ? 'Contributed' : 'Pending'}
          </span>
        </div>
      </div>

      {!isActive && isPolicyValid && (
        <a href="/circle/join" className="block w-full text-center px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors">
          Authorize Wallet
        </a>
      )}
    </div>
  )
}
