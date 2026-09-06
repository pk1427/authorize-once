/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  transpilePackages: ['@privy-io/react-auth', '@privy-io/server-auth'],
}

module.exports = nextConfig
