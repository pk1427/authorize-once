import { Policy } from './policy'

export interface PrivyServerConfig {
  appId: string
  appSecret: string
  authorizationKey: string
}

export function getPrivyConfig(): PrivyServerConfig {
  return {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
    appSecret: process.env.PRIVY_APP_SECRET || '',
    authorizationKey: process.env.AUTHORIZATION_KEY || '',
  }
}

export function validateAuthorizationKey(key: string): boolean {
  const expected = process.env.AUTHORIZATION_KEY
  if (!expected) return false
  return key === expected
}

export function getPolicyForSigning(): Policy {
  return {
    allowedContracts: [process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'],
    maxAmount: '0.01',
    maxAmountUnit: 'ETH',
    allowedNetworks: ['base-sepolia', 'base'],
    expiresAt: new Date('2026-12-31T00:00:00Z'),
  }
}
