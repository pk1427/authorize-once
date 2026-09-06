'use client'

import { ContributionRecord } from '@/lib/contributions'

interface ContributionHistoryProps {
  contributions: ContributionRecord[]
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  const sorted = [...contributions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  if (sorted.length === 0) {
    return <p className="text-gray-400 text-center py-8">No contributions yet</p>
  }

  return (
    <div className="space-y-3">
      {sorted.map((contrib) => (
        <div key={contrib.id} className="bg-slate-900/50 rounded-xl p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{contrib.amount} ETH</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                contrib.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                contrib.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                'bg-yellow-900/30 text-yellow-400'
              }`}>
                {contrib.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Period: {contrib.period}</p>
            {contrib.txHash && (
              <p className="text-xs text-gray-500 font-mono mt-1">TX: {contrib.txHash.slice(0, 20)}...</p>
            )}
            {contrib.error && (
              <p className="text-xs text-red-400 mt-1">Error: {contrib.error}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-400">
            {contrib.createdAt.toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
