/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep `ws` and Prisma out of the server bundle — bundling `ws` breaks its
  // frame masking (`t.mask is not a function`).
  experimental: {
    serverComponentsExternalPackages: ["ws", "@prisma/client", "prisma"],
  },
};

export default nextConfig;
