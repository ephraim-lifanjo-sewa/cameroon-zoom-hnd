import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors (optional, good for dev)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow remote images from these hosts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
};

export default nextConfig;