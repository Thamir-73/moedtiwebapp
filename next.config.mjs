/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moedti.netlify.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/moedti.appspot.com/**',
      },
    ],
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  // You can add more configurations here as needed
};

export default nextConfig;