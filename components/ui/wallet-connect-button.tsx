"use client"

import type { FC } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletConnectButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const WalletConnectButton: FC<WalletConnectButtonProps> = ({ className, variant = "outline", size = "sm" }) => {
  const { publicKey, wallet, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (publicKey) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "items-center gap-2 border-green-500/50 text-green-400 hover:text-green-300 hover:border-green-400 transition-all duration-300",
        publicKey && "border-green-500 bg-green-500/10",
        className,
      )}
    >
      <Wallet className="h-4 w-4" />
      {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : "Connect Wallet"}
    </Button>
  )
}
