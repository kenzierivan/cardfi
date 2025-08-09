"use client"

import { CheckCircle2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionNotificationProps {
  amount: string
  walletAddress: string
  signature: string
}

export function TransactionNotification({ amount, walletAddress, signature }: TransactionNotificationProps) {
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  const shortSignature = `${signature.slice(0, 8)}...${signature.slice(-8)}`
  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Transaction Successful</span>
      </div>

      <div className="grid gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-medium">{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Recipient:</span>
          <span className="font-medium">{shortAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Signature:</span>
          <span className="font-medium">{shortSignature}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-1 w-full text-xs"
        onClick={() => window.open(explorerUrl, "_blank")}
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        View on Solana Explorer
      </Button>
    </div>
  )
}
