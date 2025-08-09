"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, Search, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { WalletRequired } from "@/components/solana/wallet-required"
import type { NFT } from "@/lib/solana/nft-utils"
import { useToast } from "@/hooks/use-toast"
import { CURRENCY_RATES } from "@/lib/constants"
import { formatUSD } from "@/lib/loan-utils"
import { getActiveLoans } from "@/lib/loan-utils"

export default function TradePage() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedNft, setSelectedNft] = useState<string | null>(null)
  const { toast } = useToast()

  const generateMockTradingNFTs = () => {
    return [
      {
        mint: "other_user_mint_1",
        name: "Venusaur Holo",
        image: "/placeholder.svg?height=200&width=150",
        value: 400,
        rarity: "Mythic",
        attributes: [],
        description: "Owned by another collector",
      },
      {
        mint: "other_user_mint_2",
        name: "Mewtwo Rare",
        image: "/placeholder.svg?height=200&width=150",
        value: 550,
        rarity: "Legendary",
        attributes: [],
        description: "Owned by another collector",
      },
      {
        mint: "other_user_mint_3",
        name: "Lugia First Edition",
        image: "/placeholder.svg?height=200&width=150",
        value: 800,
        rarity: "Legendary",
        attributes: [],
        description: "Owned by another collector",
      },
      {
        mint: "other_user_mint_4",
        name: "Blastoise Shadowless",
        image: "/placeholder.svg?height=200&width=150",
        value: 650,
        rarity: "Mythic",
        attributes: [],
        description: "Owned by another collector",
      },
      {
        mint: "other_user_mint_5",
        name: "Charizard V-Max",
        image: "/placeholder.svg?height=200&width=150",
        value: 350,
        rarity: "Rare",
        attributes: [],
        description: "Owned by another collector",
      },
      {
        mint: "other_user_mint_6",
        name: "Pikachu Illustrator",
        image: "/placeholder.svg?height=200&width=150",
        value: 1200,
        rarity: "Legendary",
        attributes: [],
        description: "Owned by another collector",
      },
    ]
  }

  useEffect(() => {
    async function loadNFTs() {
      if (publicKey) {
        setIsLoading(true)
        try {
          // In a real app, we would fetch NFTs from other users
          // For demo purposes, we'll create some mock NFTs that don't belong to the user

          // Get active loans to check which NFTs are used as collateral
          const activeLoans = getActiveLoans()
          const collateralNftMints = activeLoans.filter((loan) => loan.status === "active").map((loan) => loan.nftMint)

          // Create mock NFTs from other users (not the connected wallet)
          const storedTradingNfts = localStorage.getItem("cardfi_trading_nfts")
          const mockOtherUsersNfts = storedTradingNfts ? JSON.parse(storedTradingNfts) : generateMockTradingNFTs()

          // If no trading NFTs exist yet, initialize with mock data
          if (!storedTradingNfts) {
            localStorage.setItem("cardfi_trading_nfts", JSON.stringify(mockOtherUsersNfts))
          }

          // Filter out NFTs that are used as collateral
          const availableNfts = mockOtherUsersNfts.filter((nft) => !collateralNftMints.includes(nft.mint))

          setNfts(availableNfts)
        } catch (error) {
          console.error("Error loading NFTs:", error)
          setNfts([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadNFTs()
  }, [connection, publicKey])

  const filteredNfts = nfts.filter((nft) => {
    const matchesSearch =
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nft.rarity && nft.rarity.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedTab === "all") return matchesSearch
    return matchesSearch && nft.rarity?.toLowerCase() === selectedTab.toLowerCase()
  })

  const handleProposeTrade = (nftMint: string) => {
    toast({
      title: "Trade Proposed",
      description: "Your trade proposal has been sent to the owner.",
    })
  }

  return (
    <WalletRequired>
      <section id="trade" className="py-20">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trade Cards Peer-to-Peer</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Browse the marketplace and trade your NFTs directly with other collectors. No middlemen, no fees.
            </p>
          </div>

          <Card className="bg-background/50 border-purple-500/20">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Trading Marketplace</CardTitle>
                  <CardDescription>Browse and trade NFTs with other collectors</CardDescription>
                </div>
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or rarity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-border/50 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full mt-4">
                <TabsList className="grid grid-cols-4 md:w-[400px]">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="rare">Rare</TabsTrigger>
                  <TabsTrigger value="mythic">Mythic</TabsTrigger>
                  <TabsTrigger value="legendary">Legendary</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNfts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNfts.map((nft) => (
                    <motion.div
                      key={nft.mint}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-lg overflow-hidden border transition-all duration-300 ${
                        selectedNft === nft.mint
                          ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                          : "hover:ring-1 hover:ring-purple-500/50"
                      }`}
                      onClick={() => setSelectedNft(nft.mint === selectedNft ? null : nft.mint)}
                    >
                      <div className="relative">
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full h-[180px] object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-background/80 text-xs font-medium px-2 py-1 rounded-full">
                          {nft.rarity}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{nft.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            Owner: {nft.mint.slice(0, 4)}...{nft.mint.slice(-4)}
                          </span>
                          <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                            {formatUSD((nft.value || 0) * CURRENCY_RATES.SOL_TO_USD)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-400"
                          onClick={() => handleProposeTrade(nft.mint)}
                        >
                          <ArrowLeftRight className="mr-2 h-3 w-3" /> Propose Trade
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-background/50">
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Trading Cards Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    There are currently no cards available for trading from other collectors. Check back later or mint
                    your own NFTs to participate in the marketplace.
                  </p>
                  <Button asChild>
                    <a href="/app/mint">Mint Your First Card</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 bg-muted/30 rounded-lg p-6 border border-border/50"
          >
            <h3 className="text-xl font-bold mb-4">Trading Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Atomic Swaps</h4>
                <p className="text-sm text-muted-foreground">
                  Trade NFTs directly with other collectors using Solana's atomic swap feature for secure, trustless
                  exchanges.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Escrow Trading</h4>
                <p className="text-sm text-muted-foreground">
                  Use our built-in escrow system for more complex trades involving multiple NFTs or SOL/USDC.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Trade History</h4>
                <p className="text-sm text-muted-foreground">
                  View complete trade history and provenance for any NFT to verify authenticity and previous ownership.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </WalletRequired>
  )
}
