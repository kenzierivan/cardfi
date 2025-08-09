"use client"

import { type FC, type ReactNode, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Import the styles for the wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css"

interface SolanaWalletProviderProps {
  children: ReactNode
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // Create multiple RPC endpoints for fallback
  const endpoints = useMemo(() => {
    // Primary endpoint from Solana
    const primary = clusterApiUrl(network)

    // Additional public endpoints for fallback
    // Note: In a production app, you would use your own dedicated RPC endpoints
    const fallbacks = ["https://api.devnet.solana.com", "https://devnet.genesysgo.net"]

    return [primary, ...fallbacks]
  }, [network])

  // Use the first endpoint, but the ConnectionProvider will handle fallback
  const endpoint = endpoints[0]

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network])

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{ commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
