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
  webpack: (config) => {
    // wagmi's connectors index eagerly imports the optional `porto` wallet SDK,
    // which isn't installed. We don't use it — stub it so the build succeeds.
    // wagmi's connectors barrel eagerly imports every wallet SDK. We only use
    // the injected connector, so stub the optional SDKs we don't ship.
    config.resolve.alias = {
      ...config.resolve.alias,
      porto: false,
      "porto/internal": false,
      accounts: false,
      "@safe-global/safe-apps-provider": false,
      "@safe-global/safe-apps-sdk": false,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "@metamask/sdk": false,
      "@walletconnect/ethereum-provider": false,
    };
    return config;
  },
};

export default nextConfig;
