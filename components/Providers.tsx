'use client'

import { PrivyProvider } from '@privy-io/react-auth'

const PRIVY_CONFIG = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  config: {
    appearance: {
      theme: 'dark' as const,
      accentColor: '#6366f1' as `#${string}`,
    },
    walletCreationMode: 'everything' as const,
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <PrivyProvider appId={PRIVY_CONFIG.appId} config={PRIVY_CONFIG.config}>{children}</PrivyProvider>
}
