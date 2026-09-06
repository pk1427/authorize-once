export const CONTRACTS = {
  savingsCircle: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
}

export const NETWORKS = {
  'base-sepolia': {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://base.org',
  },
}

export const ABI = {
  contribute: 'function contribute() external payable',
  deposit: 'function deposit() external payable',
  withdraw: 'function withdraw(uint256 amount) external',
  getMember: 'function getMember(address member) external view returns (bool)',
  getContribution: 'function getContribution(address member, uint256 period) external view returns (bool)',
} as const
