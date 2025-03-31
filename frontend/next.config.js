/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  distDir: "build",
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://quizgeneratorbackend.vercel.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
