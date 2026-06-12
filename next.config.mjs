/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    qualities: [75, 85, 90, 100],
    remotePatterns: [
      { protocol: 'https', hostname: 'myanimelist.net' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'myanimelist.cdn-dena.com' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
};

export default nextConfig;
