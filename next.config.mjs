/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // @react-pdf/renderer uses canvas optionally; alias to false avoids native-module errors
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig