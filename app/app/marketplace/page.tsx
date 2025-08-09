"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Gavel, Clock, ArrowUp, Loader2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { WalletRequired } from "@/components/solana/wallet-required"
import type { NFT } from "@/lib/solana/nft-utils"
import { formatUSD } from "@/lib/loan-utils"
import { Badge } from "@/components/ui/badge"

interface Auction extends NFT {
  currentBid: number
  minBidIncrement: number
  endTime: Date
  bids: number
  isDefaulted?: boolean
}

export default function MarketplacePage() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({})
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: number }>({})
  const { toast } = useToast()

  const generateDefaultedNFTs = () => {
    return [
      {
        mint: "mint1357924680",
        name: "Mew Holo Promo",
        image: "/placeholder.svg?height=300&width=200",
        value: 1800,
        rarity: "Mythic",
        attributes: [],
        description: "This NFT was acquired when the borrower defaulted on a loan",
      },
      {
        mint: "mint1472583690",
        name: "Rayquaza EX",
        image: "/placeholder.svg?height=300&width=200",
        value: 2200,
        rarity: "Legendary",
        attributes: [],
        description: "This NFT was acquired when the borrower defaulted on a loan",
      },
      {
        mint: "mint9876543211",
        name: "Umbreon Gold Star",
        image: "/placeholder.svg?height=300&width=200",
        value: 4500,
        rarity: "Legendary",
        attributes: [],
        description: "This NFT was acquired when the borrower defaulted on a loan",
      },
      {
        mint: "mint1234567891",
        name: "Espeon Crystal",
        image: "/placeholder.svg?height=300&width=200",
        value: 3200,
        rarity: "Mythic",
        attributes: [],
        description: "This NFT was acquired when the borrower defaulted on a loan",
      },
    ]
  }

  useEffect(() => {
    async function loadAuctions() {
      if (publicKey) {
        setIsLoading(true)
        try {
          // Load defaulted NFTs from loans
          const storedDefaultedNfts = localStorage.getItem("cardfi_defaulted_nfts")
          const defaultedNfts = storedDefaultedNfts ? JSON.parse(storedDefaultedNfts) : generateDefaultedNFTs()

          // If no defaulted NFTs exist yet, initialize with mock data
          if (!storedDefaultedNfts || JSON.parse(storedDefaultedNfts).length === 0) {
            localStorage.setItem("cardfi_defaulted_nfts", JSON.stringify(defaultedNfts))
          }

          // Create auctions only from defaulted NFTs
          const defaultedAuctions: Auction[] = defaultedNfts.map((nft: any) => ({
            ...nft,
            currentBid: (nft.value || 100) * 0.5, // Lower starting price for defaulted NFTs
            minBidIncrement: (nft.value || 100) * 0.05,
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * (1 + Math.floor(Math.random() * 3))), // 1-3 days from now
            bids: Math.floor(Math.random() * 5),
            isDefaulted: true,
          }))

          setAuctions(defaultedAuctions)

          // Initialize bid amounts
          const initialBids = defaultedAuctions.reduce(
            (acc, auction) => {
              acc[auction.mint] = auction.currentBid + auction.minBidIncrement
              return acc
            },
            {} as { [key: string]: number },
          )

          setBidAmounts(initialBids)
        } catch (error) {
          console.error("Error loading auctions:", error)

          // If blockchain fetch fails, at least show defaulted NFTs
          const defaultedNfts = JSON.parse(localStorage.getItem("cardfi_defaulted_nfts") || "[]")

          const defaultedAuctions: Auction[] = defaultedNfts.map((nft: any) => ({
            ...nft,
            currentBid: (nft.value || 100) * 0.5,
            minBidIncrement: (nft.value || 100) * 0.05,
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
            bids: Math.floor(Math.random() * 5),
            isDefaulted: true,
          }))

          setAuctions(defaultedAuctions)

          const initialBids = defaultedAuctions.reduce(
            (acc, auction) => {
              acc[auction.mint] = auction.currentBid + auction.minBidIncrement
              return acc
            },
            {} as { [key: string]: number },
          )

          setBidAmounts(initialBids)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadAuctions()
  }, [connection, publicKey])

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      const times = auctions.reduce(
        (acc, auction) => {
          const diff = auction.endTime.getTime() - now.getTime()

          if (diff <= 0) {
            acc[auction.mint] = { hours: 0, minutes: 0, seconds: 0 }
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            acc[auction.mint] = { hours, minutes, seconds }
          }

          return acc
        },
        {} as { [key: string]: { hours: number; minutes: number; seconds: number } },
      )

      setTimeLeft(times)
    }, 1000)

    return () => clearInterval(interval)
  }, [auctions])

  const handleBidChange = (auctionId: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      setBidAmounts({
        ...bidAmounts,
        [auctionId]: numValue,
      })
    }
  }

  const placeBid = (auctionId: string) => {
    const auction = auctions.find((a) => a.mint === auctionId)
    if (!auction) return

    if (bidAmounts[auctionId] <= auction.currentBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be at least ${formatUSD(auction.currentBid + auction.minBidIncrement)}`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Bid Placed",
      description: `You've successfully bid ${formatUSD(bidAmounts[auctionId])} on ${auction.name}`,
    })

    // In a real app, we would update the auction data here
  }

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}:${time.seconds.toString().padStart(2, "0")}`
  }

  return (
    <WalletRequired>
      <section id="marketplace" className="py-20 bg-gradient-to-b from-background to-background/95">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">NFT Marketplace</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Bid on NFTs including defaulted collateral or list your own cards for auction. All transactions secured by
              Solana.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid gap-6">
              {auctions.map((auction) => (
                <motion.div
                  key={auction.mint}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={`bg-background/50 ${auction.isDefaulted ? "border-red-500/20" : "border-pink-500/20"} overflow-hidden`}
                  >
                    <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
                      <div className="relative">
                        <img
                          src={auction.image || "/placeholder.svg"}
                          alt={auction.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-background/80 text-xs font-medium px-2 py-1 rounded-full">
                          {auction.rarity}
                        </div>
                        {auction.isDefaulted && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Defaulted
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="font-bold text-white">{auction.name}</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{auction.name}</h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Gavel className="h-4 w-4" />
                                <span>{auction.bids} bids</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className={timeLeft[auction.mint]?.hours < 1 ? "text-red-400" : ""}>
                                  {timeLeft[auction.mint] ? formatTime(timeLeft[auction.mint]) : "Loading..."}
                                </span>
                              </div>
                            </div>
                            {auction.isDefaulted && (
                              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                                <div className="text-sm">
                                  <span className="font-medium text-red-400">Defaulted Collateral</span>
                                  <p className="text-muted-foreground">
                                    This NFT was collateral for a defaulted loan and is now available at a discounted
                                    price.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                              {formatUSD(auction.currentBid)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                              <label className="text-sm font-medium mb-2 block">Your Bid (USD)</label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={bidAmounts[auction.mint] || ""}
                                  onChange={(e) => handleBidChange(auction.mint, e.target.value)}
                                  className="border-border/50 focus-visible:ring-pink-500"
                                  min={auction.currentBid + auction.minBidIncrement}
                                  step={auction.minBidIncrement}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  USD
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Min bid: {formatUSD(auction.currentBid + auction.minBidIncrement)}
                              </div>
                            </div>
                            <Button
                              onClick={() => placeBid(auction.mint)}
                              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white"
                            >
                              <ArrowUp className="mr-2 h-4 w-4" /> Place Bid
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background/50">
              <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Auctions Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                There are currently no active auctions. Check back later or mint your own NFTs to participate.
              </p>
              <Button asChild>
                <a href="/app/mint">Mint Your First Card</a>
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 bg-muted/30 rounded-lg p-6 border border-border/50"
          >
            <h3 className="text-xl font-bold mb-4">Marketplace Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Transparent Auctions</h4>
                <p className="text-sm text-muted-foreground">
                  All bids and transactions are recorded on the Solana blockchain for complete transparency.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Instant Settlement</h4>
                <p className="text-sm text-muted-foreground">
                  When an auction ends, NFTs and funds are automatically transferred to the respective parties.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Low Fees</h4>
                <p className="text-sm text-muted-foreground">
                  Benefit from Solana's ultra-low transaction fees, typically less than $0.001 per transaction.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </WalletRequired>
  )
}
