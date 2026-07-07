import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

// Hyperliquid EVM (HyperEVM). Molten trades HYPE as the native asset.
export const hyperEvm = defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.hyperliquid.xyz/evm"] } },
  blockExplorers: { default: { name: "Hyperscan", url: "https://hyperevmscan.io" } },
});

// injected() picks up MetaMask, Rabby, Phantom (EVM), OKX, Trust, Coinbase
// extension, Brave — i.e. any EIP-1193 browser wallet. (WalletConnect / Coinbase
// Smart Wallet can be added by installing their SDKs and a WC project id.)
export const wagmiConfig = createConfig({
  chains: [hyperEvm, mainnet],
  connectors: [injected({ shimDisconnect: true })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [hyperEvm.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
