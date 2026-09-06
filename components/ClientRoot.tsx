'use client'

import { Providers } from '@/components/Providers'

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
