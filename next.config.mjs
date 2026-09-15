/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/canva-for-pitch',
  assetPrefix: '/canva-for-pitch',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
