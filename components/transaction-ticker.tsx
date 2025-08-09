"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

type Transaction = {
  id: string
  type: "mint" | "loan" | "trade" | "auction"
  item: string
  user: string
  timestamp: Date
}

export default function TransactionTicker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Generate mock transactions
  useEffect(() => {
    const types = ["mint", "loan", "trade", "auction"] as const
    const items = ["Pikachu #002", "Charizard #001", "Blastoise #003", "Black Lotus #042", "Mew #151", "Mewtwo #150"]
    const generateWalletAddress = () => {
      return `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`
    }

    const initialTransactions: Transaction[] = Array.from({ length: 5 }, (_, i) => ({
      id: `tx-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      item: items[Math.floor(Math.random() * items.length)],
      user: generateWalletAddress(),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 10)),
    }))

    setTransactions(initialTransactions)

    // Add new transactions periodically
    const interval = setInterval(() => {
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: types[Math.floor(Math.random() * types.length)],
        item: items[Math.floor(Math.random() * items.length)],
        user: generateWalletAddress(),
        timestamp: new Date(),
      }

      setTransactions((prev) => [newTransaction, ...prev.slice(0, 4)])

      // Show confirmation animation
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 2000)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getTransactionText = (tx: Transaction) => {
    switch (tx.type) {
      case "mint":
        return `${tx.item} verified and minted by CardFi for ${tx.user}`
      case "loan":
        return `${tx.item} used as collateral by ${tx.user}`
      case "trade":
        return `${tx.item} traded by ${tx.user}`
      case "auction":
        return `${tx.item} bid placed by ${tx.user}`
    }
  }

  return (
    <div className="relative py-2 border-y border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-1"
        >
          <Check className="h-3 w-3" /> Transaction Confirmed in 0.4s
        </motion.div>
      )}
      <div className="flex gap-8 animate-scroll whitespace-nowrap">
        {[...transactions, ...transactions].map((tx, i) => (
          <div key={`${tx.id}-${i}`} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {tx.type.toUpperCase()}
            </span>
            <span>{getTransactionText(tx)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
