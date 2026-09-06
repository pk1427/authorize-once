import { ethers } from 'ethers'
import { SavingsCircle } from '../typechain-types'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required')
  }

  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)

  console.log('Deploying from address:', wallet.address)

  const balance = await provider.getBalance(wallet.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance. You need at least 0.01 ETH to deploy.')
  }

  const contractArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../artifacts/contracts/SavingsCircle.sol/SavingsCircle.json'),
      'utf8'
    )
  )

  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  )

  console.log('Deploying SavingsCircle contract...')
  const contract = await factory.deploy()

  await contract.waitForDeployment()
  const address = await contract.getAddress()

  console.log('Contract deployed successfully!')
  console.log('Contract address:', address)
  console.log('Transaction hash:', contract.deploymentTransaction()?.hash)

  console.log('\nAdd this to your .env.local:')
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error)
    process.exit(1)
  })
