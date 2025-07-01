/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
   images: {
    remotePatterns: [new URL('https://cdn.myanimelist.net/**'), new URL('https://s4.anilist.co/**')],
  },
  
};

export default nextConfig;
