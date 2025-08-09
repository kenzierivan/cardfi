"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Layers, Sparkles, Wallet, Loader2, DollarSign, Clock, CheckCircle2 } from "lucide-react"
import { WalletRequired } from "@/components/solana/wallet-required"
import { fetchNFTs, type NFT } from "@/lib/solana/nft-utils"
import { CURRENCY_RATES } from "@/lib/constants"
import { getActiveLoans, formatUSD, formatDate, getDaysRemaining } from "@/lib/loan-utils"
import { useToast } from "@/hooks/use-toast"
import NFTDetailModal from "@/components/nft-detail-modal"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { initializeMockLoans } from "@/lib/loan-utils"

export default function DashboardPage() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeLoans, setActiveLoans] = useState<number>(0)
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null)
  const { toast } = useToast()
  const [isNftModalOpen, setIsNftModalOpen] = useState(false)
  const [suppliedLoans, setSuppliedLoans] = useState<any[]>([])
  const [totalSupplied, setTotalSupplied] = useState<number>(0)

  useEffect(() => {
    async function loadNFTs() {
      if (publicKey) {
        setIsLoading(true)
        try {
          // First try to load from localStorage to show something immediately
          const localNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")
          if (localNfts.length > 0) {
            setNfts(localNfts)
            setIsLoading(false)
          }

          // Then try to load from blockchain with a timeout
          const fetchPromise = fetchNFTs(connection, publicKey)
          const timeoutPromise = new Promise<NFT[]>((_, reject) =>
            setTimeout(() => reject(new Error("Blockchain fetch timeout")), 10000),
          )

          // Race between fetch and timeout
          const userNfts = await Promise.race([fetchPromise, timeoutPromise]).catch((error) => {
            console.warn("Blockchain fetch failed or timed out:", error)
            return [] as NFT[]
          })

          // Combine both sources if blockchain fetch succeeded
          if (userNfts.length > 0) {
            // Deduplicate by mint address
            const combinedNfts = [...userNfts]
            localNfts.forEach((localNft) => {
              if (!combinedNfts.some((nft) => nft.mint === localNft.mint)) {
                combinedNfts.push(localNft)
              }
            })
            setNfts(combinedNfts)
          }
        } catch (error) {
          console.error("Error loading NFTs:", error)
          // If blockchain fetch fails, at least show localStorage NFTs
          const localNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")
          setNfts(localNfts)
        } finally {
          setIsLoading(false)
        }
      }
    }

    function loadLoans() {
      // Initialize mock loans if none exist
      initializeMockLoans()

      const loans = getActiveLoans()
      setActiveLoans(loans.filter((loan) => loan.status === "active").length)
    }

    function loadSupplies() {
      const supplies = JSON.parse(localStorage.getItem("cardfi_supplied_loans") || "[]")
      setSuppliedLoans(supplies)

      // Calculate total supplied amount
      const activeSupplies = supplies.filter((loan: any) => loan.status === "funded")
      const total = activeSupplies.reduce((sum: number, loan: any) => sum + loan.loanAmount, 0)
      setTotalSupplied(total)
    }

    loadNFTs()
    loadLoans()
    loadSupplies()
  }, [connection, publicKey])

  const handleViewNft = (nft: NFT) => {
    setSelectedNft(nft)
    setIsNftModalOpen(true)
  }

  const calculateExpectedReturn = (loan: any) => {
    const interestAmount = (loan.loanAmount * loan.interestRate * loan.term) / (100 * 30)
    return loan.loanAmount + interestAmount
  }

  return (
    <WalletRequired>
      <div className="relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{nfts.length}</div>
                  <p className="text-xs text-muted-foreground">Your trading card collection</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeLoans}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeLoans === 0
                      ? "No active loans"
                      : activeLoans === 1
                        ? "1 active loan"
                        : `${activeLoans} active loans`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No pending offers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatUSD(totalSupplied)}</div>
                  <p className="text-xs text-muted-foreground">
                    {suppliedLoans.filter((loan) => loan.status === "funded").length} active supplies
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="nfts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="nfts">My NFTs</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
                <TabsTrigger value="supplies">Supplies</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="nfts" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : nfts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {nfts.map((nft) => (
                      <Card key={nft.mint} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium">{nft.name}</h3>
                          <p className="text-sm text-muted-foreground">Rarity: {nft.rarity || "Common"}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                              {formatUSD((nft.value || 0) * CURRENCY_RATES.USDC_TO_USD)}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => handleViewNft(nft)}>
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-background/50">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      You don't have any CardFi trading card NFTs yet. Head over to the Mint section to create your
                      first NFT.
                    </p>
                    <Button asChild>
                      <a href="/app/mint">Mint Your First Card</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="loans">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Loans</CardTitle>
                    <CardDescription>Manage your current loans and repayments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {activeLoans > 0 ? `${activeLoans} Active Loans` : "No Active Loans"}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {activeLoans > 0
                          ? "Visit the Loans section to manage your active loans and repayments."
                          : "You don't have any active loans. Use your NFTs as collateral to borrow stablecoins."}
                      </p>
                      <Button asChild>
                        <a href="/app/loans">{activeLoans > 0 ? "Manage Loans" : "Get a Loan"}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="supplies">
                {suppliedLoans.length > 0 ? (
                  <div className="grid gap-6">
                    {suppliedLoans
                      .filter((loan) => loan.status === "funded")
                      .map((loan) => {
                        const daysRemaining = getDaysRemaining(loan.dueDate)
                        const progress = ((loan.term - daysRemaining) / loan.term) * 100

                        return (
                          <Card key={loan.id} className="bg-background/50 border-green-500/20 overflow-hidden">
                            <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
                              <div className="relative">
                                <img
                                  src={loan.nftImage || "/placeholder.svg"}
                                  alt={loan.nftName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                                  Collateral
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                  <h3 className="font-bold text-white">{loan.nftName}</h3>
                                </div>
                              </div>
                              <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <h3 className="text-xl font-bold mb-2">Active Supply</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{daysRemaining} days remaining</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1 mb-4">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Loan Progress</span>
                                        <span>{Math.round(progress)}%</span>
                                      </div>
                                      <Progress value={progress} className="h-2" />
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-muted-foreground mb-1">Expected Return</div>
                                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                      {formatUSD(calculateExpectedReturn(loan))}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border/50">
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <div className="text-sm text-muted-foreground">Loan Amount</div>
                                      <div className="font-medium">{formatUSD(loan.loanAmount)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Interest</div>
                                      <div className="font-medium">
                                        {formatUSD((loan.loanAmount * loan.interestRate * loan.term) / (100 * 30))} (
                                        {loan.interestRate}%)
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Borrower</div>
                                      <div className="font-medium">{loan.borrowerAddress}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Due Date</div>
                                      <div className="font-medium">{formatDate(loan.dueDate)}</div>
                                    </div>
                                  </div>

                                  <Button asChild className="w-full">
                                    <a href="/app/supply">
                                      <CheckCircle2 className="mr-2 h-4 w-4" /> Manage Supply
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}

                    {suppliedLoans.filter((loan) => loan.status !== "funded").length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Supply History</h3>
                        <div className="grid gap-4">
                          {suppliedLoans
                            .filter((loan) => loan.status !== "funded")
                            .map((loan) => (
                              <Card key={loan.id} className="bg-background/50 border-border overflow-hidden">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{loan.nftName}</CardTitle>
                                    <Badge variant={loan.status === "repaid" ? "success" : "destructive"}>
                                      {loan.status === "repaid" ? "Repaid" : "Defaulted"}
                                    </Badge>
                                  </div>
                                  <CardDescription>
                                    {loan.status === "repaid"
                                      ? `Repaid on ${formatDate(loan.repaidAt || loan.dueDate)}`
                                      : `Defaulted on ${formatDate(loan.defaultedAt || loan.dueDate)}`}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-muted-foreground">Loan Amount</div>
                                      <div className="font-medium">{formatUSD(loan.loanAmount)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">
                                        {loan.status === "repaid" ? "Total Return" : "NFT Acquired"}
                                      </div>
                                      <div className="font-medium">
                                        {loan.status === "repaid"
                                          ? formatUSD(calculateExpectedReturn(loan))
                                          : loan.nftName}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-background/50">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Supplies</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      You haven't supplied any loans yet. Browse the loan requests to start earning interest on your
                      USDC.
                    </p>
                    <Button asChild>
                      <a href="/app/supply">View Loan Requests</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="trades">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Trades</CardTitle>
                    <CardDescription>Manage your open trades and offers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Trades</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You don't have any active trades. Visit the Trade section to exchange cards with other
                        collectors.
                      </p>
                      <Button asChild>
                        <a href="/app/trade">Trade Cards</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent transactions and activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Your transaction history will appear here once you start using the platform.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {selectedNft && (
        <NFTDetailModal nft={selectedNft} isOpen={isNftModalOpen} onClose={() => setIsNftModalOpen(false)} />
      )}
    </WalletRequired>
  )
}
