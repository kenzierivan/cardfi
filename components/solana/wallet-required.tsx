"use client"

import type { FC, ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Loader2 } from "lucide-react"

interface WalletRequiredProps {
  children: ReactNode
}

export const WalletRequired: FC<WalletRequiredProps> = ({ children }) => {
  const { publicKey, connecting } = useWallet()

  if (connecting) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to wallet...</p>
        </div>
      </div>
    )
  }

  if (!publicKey) {
    return (
      <div className="relative min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="container max-w-md">
          <Card className="bg-background/50 border-purple-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription>Please connect your Solana wallet to access this section</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-blue-500 mb-6">
                <div className="absolute inset-1 rounded-full bg-background"></div>
                <div className="absolute inset-2.5 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
              </div>

              <div className="w-full flex justify-center">
                <WalletMultiButton className="wallet-adapter-button-custom" />
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
