'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const { authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [isMember, setIsMember] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    if (authenticated && user) {
      const wallet = wallets[0]
      if (wallet) {
        setIsMember(true)
        setMemberId(wallet.address)
      }
    }
  }, [authenticated, user, wallets])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Authorize Once
          </h1>
          <p className="text-xl text-gray-400">
            Stop asking for wallet access every week. Grant it once, set limits, and forget about it.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="grid gap-4 text-left">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
              <div>
                <h3 className="font-semibold">Sign in with Privy</h3>
                <p className="text-gray-400 text-sm">Connect your wallet securely through Privy authentication.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
              <div>
                <h3 className="font-semibold">Authorize Your Wallet</h3>
                <p className="text-gray-400 text-sm">Review and accept a policy that limits what can be done with your wallet.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
              <div>
                <h3 className="font-semibold">Contribute Automatically</h3>
                <p className="text-gray-400 text-sm">Your weekly contribution happens automatically without further prompts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Your Authorization Policy</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">Allowed Contract</span>
              <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10) || '0x0000...0000'}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">Max Per Transaction</span>
              <span className="font-mono">0.01 ETH</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">Allowed Networks</span>
              <span className="font-mono">Base Sepolia, Base</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Expires</span>
              <span className="font-mono">2026-12-31</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {authenticated ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-green-400">Connected as {user?.wallet?.address}</p>
              {isMember ? (
                <div className="flex gap-4">
                  <Link href="/circle" className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors">
                    Go to Circle
                  </Link>
                  <button onClick={logout} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <Link href="/circle/join" className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors">
                  Join Savings Circle
                </Link>
              )}
            </div>
          ) : (
            <button onClick={login} className="px-8 py-4 bg-primary hover:bg-primary/80 rounded-lg font-semibold text-lg transition-colors">
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
