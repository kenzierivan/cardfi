"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DollarSign, Lock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { CURRENCY_RATES } from "@/lib/constants"
import {
  createLoan,
  repayLoan,
  defaultLoan,
  getActiveLoans,
  formatUSD,
  formatDate,
  getDaysRemaining,
} from "@/lib/loan-utils"
import type { NFT } from "@/lib/solana/nft-utils"

// Mock NFT data
const nfts = [
  {
    id: "1",
    mint: "mint1234567890",
    name: "Charizard Holo",
    image: "/placeholder.svg?height=200&width=150",
    value: 500,
    rarity: "Legendary",
  },
  {
    id: "2",
    mint: "mint0987654321",
    name: "Pikachu Rare",
    image: "/placeholder.svg?height=200&width=150",
    value: 200,
    rarity: "Rare",
  },
  {
    id: "3",
    mint: "mint1122334455",
    name: "Blastoise Holo",
    image: "/placeholder.svg?height=200&width=150",
    value: 350,
    rarity: "Mythic",
  },
  {
    id: "4",
    mint: "mint5566778899",
    name: "Mew Limited",
    image: "/placeholder.svg?height=200&width=150",
    value: 600,
    rarity: "Legendary",
  },
]

export default function LoansSection() {
  const [selectedNft, setSelectedNft] = useState<string | null>(null)
  const [loanAmount, setLoanAmount] = useState(50)
  const [loanTerm, setLoanTerm] = useState("30")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("borrow")
  const { toast } = useToast()

  // Load active loans on component mount
  useEffect(() => {
    const loans = getActiveLoans()
    setActiveLoans(loans)
  }, [])

  const selectedNftData = nfts.find((nft) => nft.mint === selectedNft)
  const nftValueUSD = selectedNftData ? selectedNftData.value || 0 : 0
  const maxLoanAmount = nftValueUSD * 0.5
  const actualLoanAmount = nftValueUSD * (loanAmount / 100)
  const interestRate = 5
  const interestAmount = (actualLoanAmount * interestRate * Number.parseInt(loanTerm)) / (100 * 30)
  const totalRepayment = actualLoanAmount + interestAmount

  // Calculate USD values
  const maxLoanAmountUSD = maxLoanAmount * CURRENCY_RATES.SOL_TO_USD
  const actualLoanAmountUSD = actualLoanAmount * CURRENCY_RATES.SOL_TO_USD
  const interestAmountUSD = interestAmount * CURRENCY_RATES.SOL_TO_USD
  const totalRepaymentUSD = totalRepayment * CURRENCY_RATES.SOL_TO_USD

  const handleRequestLoan = () => {
    if (!selectedNft) {
      toast({
        title: "No NFT Selected",
        description: "Please select an NFT to use as collateral",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate loan processing
    setTimeout(() => {
      if (selectedNftData) {
        // Create a new loan
        const loan = createLoan(
          selectedNftData as NFT,
          actualLoanAmount,
          interestRate,
          interestAmount,
          totalRepayment,
          Number.parseInt(loanTerm),
        )

        // Update active loans state
        setActiveLoans([...activeLoans, loan])
      }

      setIsProcessing(false)
      toast({
        title: "USDC Transfer Successful",
        description: `${formatUSD(actualLoanAmountUSD)} has been sent to your wallet on Devnet`,
      })

      // Reset form
      setSelectedNft(null)
      setLoanAmount(50)
      setLoanTerm("30")
    }, 1500)
  }

  const handleRepayLoan = (loanId: string) => {
    setIsProcessing(true)

    // Simulate repayment processing
    setTimeout(() => {
      const success = repayLoan(loanId)

      if (success) {
        // Update the loans list
        const updatedLoans = getActiveLoans()
        setActiveLoans(updatedLoans)

        toast({
          title: "Loan Repaid Successfully",
          description: "Your NFT has been returned to your wallet",
          variant: "default",
        })
      } else {
        toast({
          title: "Repayment Failed",
          description: "There was an error processing your repayment",
          variant: "destructive",
        })
      }

      setIsProcessing(false)
    }, 1500)
  }

  const handleDefaultLoan = (loanId: string) => {
    setIsProcessing(true)

    // Simulate default processing
    setTimeout(() => {
      const success = defaultLoan(loanId)

      if (success) {
        // Update the loans list
        const updatedLoans = getActiveLoans()
        setActiveLoans(updatedLoans)

        toast({
          title: "Loan Defaulted",
          description: "Your NFT has been transferred to the marketplace",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "There was an error processing the default",
          variant: "destructive",
        })
      }

      setIsProcessing(false)
    }, 1500)
  }

  return (
    <section id="loans" className="py-20 bg-gradient-to-b from-background to-background/95">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Borrow Against Your NFTs</h2>
          <p className="text-muted-foreground max-w-[600px]">
            Use your trading card NFTs as collateral to borrow stablecoins. No credit checks, instant approval.
          </p>
        </div>

        <Tabs defaultValue="borrow" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
            <TabsTrigger value="active">Active Loans</TabsTrigger>
          </TabsList>

          <TabsContent value="borrow" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-background/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle>Select Collateral</CardTitle>
                  <CardDescription>Choose an NFT to use as collateral for your loan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {nfts.map((nft) => (
                      <div
                        key={nft.id}
                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedNft === nft.mint
                            ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
                            : "ring-1 ring-border hover:ring-blue-500/50"
                        }`}
                        onClick={() => setSelectedNft(nft.mint)}
                      >
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full h-[120px] object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-medium text-sm">{nft.name}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">{nft.rarity}</span>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                {nft.value} USDC
                              </span>
                              <span className="text-xs text-muted-foreground">{formatUSD(nft.value)}</span>
                            </div>
                          </div>
                        </div>
                        {selectedNft === nft.mint && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                            <Lock className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>Customize your loan terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Loan Amount ({loanAmount}%)</label>
                        <span className="text-sm text-muted-foreground">
                          Max: {maxLoanAmount.toFixed(2)} USDC ({formatUSD(maxLoanAmountUSD)})
                        </span>
                      </div>
                      <Slider
                        disabled={!selectedNft}
                        value={[loanAmount]}
                        onValueChange={(value) => setLoanAmount(value[0])}
                        min={10}
                        max={50}
                        step={5}
                        className="[&>span]:bg-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Loan Term</label>
                      <Tabs defaultValue="30" value={loanTerm} onValueChange={setLoanTerm} className="w-full">
                        <TabsList className="grid grid-cols-6 w-full">
                          <TabsTrigger value="7">7d</TabsTrigger>
                          <TabsTrigger value="30">30d</TabsTrigger>
                          <TabsTrigger value="90">90d</TabsTrigger>
                          <TabsTrigger value="180">180d</TabsTrigger>
                          <TabsTrigger value="270">270d</TabsTrigger>
                          <TabsTrigger value="365">1y</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Loan Amount:</span>
                      <div className="text-right">
                        <span className="font-medium">{actualLoanAmount.toFixed(2)} USDC</span>
                        <div className="text-xs text-muted-foreground">{formatUSD(actualLoanAmountUSD)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest Rate:</span>
                      <span className="font-medium">{interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Interest Amount:</span>
                      <div className="text-right">
                        <span className="font-medium">{interestAmount.toFixed(2)} USDC</span>
                        <div className="text-xs text-muted-foreground">{formatUSD(interestAmountUSD)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Loan Term:</span>
                      <span className="font-medium">{loanTerm} Days</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Repayment:</span>
                        <div className="text-right">
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                            {totalRepayment.toFixed(2)} USDC
                          </span>
                          <div className="text-xs text-muted-foreground">{formatUSD(totalRepaymentUSD)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleRequestLoan}
                    disabled={!selectedNft || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" /> Request Loan
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    By requesting a loan, you agree to lock your NFT as collateral until full repayment.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {activeLoans.length > 0 ? (
              <div className="space-y-6">
                {activeLoans.map((loan) => (
                  <Card key={loan.id} className="bg-background/50 border-blue-500/20">
                    <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
                      <div className="relative">
                        <img
                          src={loan.nftImage || "/placeholder.svg"}
                          alt={loan.nftName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {loan.status === "active" && (
                            <Badge variant="default" className="bg-blue-500">
                              Active
                            </Badge>
                          )}
                          {loan.status === "repaid" && <Badge variant="success">Repaid</Badge>}
                          {loan.status === "defaulted" && <Badge variant="destructive">Defaulted</Badge>}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{loan.nftName}</h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-sm text-muted-foreground">Loan ID: {loan.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                              {loan.loanAmount.toFixed(2)} USDC
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatUSD(loan.loanAmount * CURRENCY_RATES.SOL_TO_USD)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-xs text-muted-foreground">Start Date</div>
                            <div className="text-sm">{formatDate(loan.startDate)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Due Date</div>
                            <div className="text-sm">{formatDate(loan.dueDate)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Days Remaining</div>
                            <div className="text-sm">{getDaysRemaining(loan.dueDate)} days</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Total Repayment</div>
                            <div className="text-sm font-medium">{loan.totalRepayment.toFixed(2)} USDC</div>
                            <div className="text-xs text-muted-foreground">
                              {formatUSD(loan.totalRepayment * CURRENCY_RATES.SOL_TO_USD)}
                            </div>
                          </div>
                        </div>

                        {loan.status === "active" && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Button
                              onClick={() => handleRepayLoan(loan.id)}
                              disabled={isProcessing}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Repay Loan
                            </Button>
                            <Button
                              onClick={() => handleDefaultLoan(loan.id)}
                              disabled={isProcessing}
                              variant="outline"
                              className="flex-1 border-red-500/50 text-red-400 hover:text-red-300 hover:border-red-400"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" /> Simulate Default
                            </Button>
                          </div>
                        )}

                        {loan.status === "repaid" && (
                          <div className="mt-6 p-3 bg-green-500/10 text-green-400 rounded-md flex items-center">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            <span>This loan has been fully repaid and your NFT has been returned to your wallet.</span>
                          </div>
                        )}

                        {loan.status === "defaulted" && (
                          <div className="mt-6 p-3 bg-red-500/10 text-red-400 rounded-md flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This loan has defaulted and the NFT has been transferred to the marketplace.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-background/50">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  You don't have any active loans. Use your NFTs as collateral to borrow stablecoins.
                </p>
                <Button onClick={() => setActiveTab("borrow")}>Get a Loan</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 bg-muted/30 rounded-lg p-6 border border-border/50"
        >
          <h3 className="text-xl font-bold mb-4">How Loans Work</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-medium">Select NFT Collateral</h4>
              <p className="text-sm text-muted-foreground">
                Choose any trading card NFT from your collection to use as collateral.
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-medium">Receive USDC Instantly</h4>
              <p className="text-sm text-muted-foreground">
                Get up to 50% of your NFT's value in USDC stablecoins sent directly to your wallet.
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-medium">Repay & Reclaim</h4>
              <p className="text-sm text-muted-foreground">
                Repay your loan plus interest within the term to reclaim your NFT. Failure to repay will result in your
                NFT being listed on the marketplace.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
