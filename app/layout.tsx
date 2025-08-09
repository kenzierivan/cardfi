import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { SolanaWalletProvider } from "@/components/solana/wallet-provider"
import TransactionTicker from "@/components/transaction-ticker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CardFi | Tokenize Trading Cards on Solana",
  description: "Mint NFTs, borrow stablecoins, trade peer-to-peer, or bid in our marketplace.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SolanaWalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <TransactionTicker />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
