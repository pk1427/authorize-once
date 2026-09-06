export const POLICY = {
  allowedContracts: [process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'],
  maxAmount: '0.01',
  maxAmountUnit: 'ETH',
  allowedNetworks: ['base-sepolia', 'base'],
  expiresAt: new Date('2026-12-31T00:00:00Z'),
} as const

export type Policy = typeof POLICY

export function isPolicyActive(): boolean {
  return new Date() < POLICY.expiresAt
}

export function validatePolicy(contractAddress: string, amount: string, network: string, expiresAt?: Date): { valid: boolean; reason?: string } {
  if (!isPolicyActive()) {
    return { valid: false, reason: 'Policy has expired' }
  }

  if (expiresAt && new Date() > expiresAt) {
    return { valid: false, reason: 'Policy has expired' }
  }

  if (!POLICY.allowedContracts.includes(contractAddress as any)) {
    return { valid: false, reason: `Contract ${contractAddress} is not in the allowlist` }
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum > parseFloat(POLICY.maxAmount)) {
    return { valid: false, reason: `Amount ${amount} exceeds max allowed ${POLICY.maxAmount} ${POLICY.maxAmountUnit}` }
  }

  if (!POLICY.allowedNetworks.includes(network as any)) {
    return { valid: false, reason: `Network ${network} is not allowed` }
  }

  return { valid: true }
}
