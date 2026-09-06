import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const ClientRoot = dynamic(() => import('@/components/ClientRoot').then(mod => mod.ClientRoot), { ssr: false, loading: () => null })

export const metadata: Metadata = {
  title: 'Authorize Once | Savings Circle',
  description: 'Authorize once, then stop asking. A privacy-preserving savings circle on Base.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  )
}
