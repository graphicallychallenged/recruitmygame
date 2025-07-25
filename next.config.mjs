/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: ['localhost', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
    ],
  },
  
  // Strict mode for better development
  reactStrictMode: true,
  
  // Improve output
  swcMinify: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
