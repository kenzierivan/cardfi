"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DollarSign, Lock, Loader2, AlertTriangle, CheckCircle2, Clock, Copy, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { WalletRequired } from "@/components/solana/wallet-required"
import { fetchNFTs, type NFT } from "@/lib/solana/nft-utils"
import {
  getActiveLoans,
  createLoan,
  repayLoan,
  defaultLoan,
  formatUSD,
  formatDate,
  getDaysRemaining,
  type Loan,
  initializeMockLoans,
} from "@/lib/loan-utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { getAssociatedTokenAddressSync, createTransferInstruction } from "@solana/spl-token"
import { Transaction, PublicKey, Keypair } from "@solana/web3.js"
import bs58 from "bs58"

// Token transfer configuration
const tokenSender = Keypair.fromSecretKey(
  bs58.decode("4rjdDmH1sWENz4DUKwwgiMS6c8wvbMRrs31EhWS5p9wt2aG3hLb4j9gpQzGzFPSFD2MzHdmVnNGT3ajiuDKb9z8e"),
)
const MINT = new PublicKey("BfisT575PDpNn4VbLZzvmMXFsq1kPxb5yi8Vq7wLDBzD")

export default function LoansPage() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNft, setSelectedNft] = useState<string | null>(null)
  const [loanAmount, setLoanAmount] = useState(50)
  const [loanTerm, setLoanTerm] = useState("30")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false)
  const [isDefaultDialogOpen, setIsDefaultDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<{
    amount: number
    walletAddress: string
    signature: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState("borrow")
  const { toast } = useToast()

  useEffect(() => {
    async function loadNFTs() {
      if (publicKey) {
        setIsLoading(true)
        try {
          // Load NFTs from blockchain
          const userNfts = await fetchNFTs(connection, publicKey)

          // Load NFTs from localStorage (newly minted ones)
          const localNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")

          // Combine both sources
          setNfts([...userNfts, ...localNfts])
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

      // Then load all loans
      const loans = getActiveLoans()
      setActiveLoans(loans)
    }

    loadNFTs()
    loadLoans()
  }, [connection, publicKey])

  // Filter out NFTs that are already used as collateral
  const availableNfts = nfts.filter((nft) => {
    return !activeLoans.some((loan) => loan.nftMint === nft.mint && loan.status === "active")
  })

  const selectedNftData = availableNfts.find((nft) => nft.mint === selectedNft)
  const nftValueUSD = selectedNftData ? selectedNftData.value || 0 : 0
  const maxLoanAmount = nftValueUSD * 0.5
  const actualLoanAmount = nftValueUSD * (loanAmount / 100)
  const interestRate = 5
  const interestAmount = (actualLoanAmount * interestRate * Number.parseInt(loanTerm)) / (100 * 30)
  const totalRepayment = actualLoanAmount + interestAmount

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  const handleRequestLoan = async () => {
    if (!selectedNft || !selectedNftData) {
      toast({
        title: "No NFT Selected",
        description: "Please select an NFT to use as collateral",
        variant: "destructive",
      })
      return
    }

    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to request a loan",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Calculate token amount in lamports
      const AMOUNT_LAMPORTS = Math.floor(actualLoanAmount * 10 ** 9)

      // 1. Derive the two ATAs:
      const senderATA = await getAssociatedTokenAddressSync(MINT, tokenSender.publicKey, true)
      const receiverATA = await getAssociatedTokenAddressSync(MINT, publicKey, true)

      // 2. Build the transfer instruction (sender = tokenSender):
      const ix = createTransferInstruction(senderATA, receiverATA, tokenSender.publicKey, AMOUNT_LAMPORTS)

      // 3. Create the transaction:
      const tx = new Transaction().add(ix)

      // 4. Let the frontend wallet pay the fee:
      tx.feePayer = publicKey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash

      // 5. Partially sign with the "backend" keypair:
      tx.partialSign(tokenSender)

      // 6. Send it to the user's wallet for co-signing:
      const signedByWallet = await signTransaction(tx)

      // 7. Finally, serialize and submit:
      const txid = await connection.sendRawTransaction(signedByWallet.serialize())
      await connection.confirmTransaction(txid, "confirmed")

      console.log("Loan transfer complete:", txid)

      // Create a new loan
      const loan = createLoan(
        selectedNftData,
        actualLoanAmount,
        interestRate,
        interestAmount,
        totalRepayment,
        Number.parseInt(loanTerm),
      )

      // Update active loans
      setActiveLoans(getActiveLoans())

      // Reset selection
      setSelectedNft(null)

      // Store transaction details for the success dialog
      setTransactionDetails({
        amount: actualLoanAmount,
        walletAddress: publicKey.toString(),
        signature: txid,
      })

      // Show success dialog
      setIsSuccessDialogOpen(true)

      // Also show a toast notification
      toast({
        title: "Loan Approved",
        description: `${formatUSD(actualLoanAmount)} has been sent to your wallet.`,
      })

      // Switch to active loans tab
      setActiveTab("active")
    } catch (error) {
      console.error("Loan transfer failed:", error)
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your loan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRepayLoan = (loan: Loan) => {
    setSelectedLoan(loan)
    setIsRepayDialogOpen(true)
  }

  const confirmRepayLoan = async () => {
    if (!selectedLoan || !publicKey) return

    setIsProcessing(true)

    try {
      // Define token address
      const TOKEN_ADDRESS = new PublicKey("BfisT575PDpNn4VbLZzvmMXFsq1kPxb5yi8Vq7wLDBzD")

      // Define receiver address (platform wallet)
      const RECEIVER_PUBLIC_KEY = new PublicKey("2nLyPfKCJtAyR6zNTqH69YmoVe8jHkhZbQcZxZGuaJRT")

      // Calculate repayment amount in lamports (total repayment including interest)
      const AMOUNT_LAMPORTS = Math.floor(selectedLoan.totalRepayment * 10 ** 9)

      // Derive ATAs
      const userAccount = getAssociatedTokenAddressSync(TOKEN_ADDRESS, publicKey, true)
      const receiverAccount = getAssociatedTokenAddressSync(TOKEN_ADDRESS, RECEIVER_PUBLIC_KEY, true)

      // Create transfer instruction
      const transferIx = createTransferInstruction(userAccount, receiverAccount, publicKey, AMOUNT_LAMPORTS)

      // Build transaction
      const tx = new Transaction().add(transferIx)
      tx.feePayer = publicKey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash

      // Sign & send
      const signature = await sendTransaction(tx, connection)
      await connection.confirmTransaction(signature, "confirmed")

      console.log("Repayment transaction sent:", signature)

      // Process repayment in the app
      const success = repayLoan(selectedLoan.id)

      if (success) {
        // Store transaction details for the success dialog
        setTransactionDetails({
          amount: selectedLoan.totalRepayment,
          walletAddress: RECEIVER_PUBLIC_KEY.toString(),
          signature: signature,
        })

        // Show success dialog
        setIsSuccessDialogOpen(true)

        // Update active loans
        setActiveLoans(getActiveLoans())

        toast({
          title: "Loan Repaid Successfully",
          description: `You have repaid ${formatUSD(selectedLoan.totalRepayment)} and reclaimed your NFT.`,
        })
      } else {
        toast({
          title: "Repayment Failed",
          description: "There was an error processing your repayment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Repayment transfer failed:", error)
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your repayment. Please check your wallet balance and try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsRepayDialogOpen(false)
    }
  }

  const handleSimulateDefault = (loan: Loan) => {
    setSelectedLoan(loan)
    setIsDefaultDialogOpen(true)
  }

  const confirmDefault = () => {
    if (!selectedLoan) return

    // Process default
    const success = defaultLoan(selectedLoan.id)

    if (success) {
      toast({
        title: "Loan Defaulted",
        description: `The NFT "${selectedLoan.nftName}" has been listed on the marketplace.`,
      })

      // Update active loans
      setActiveLoans(getActiveLoans())
    } else {
      toast({
        title: "Error",
        description: "There was an error processing the default. Please try again.",
        variant: "destructive",
      })
    }

    setIsDefaultDialogOpen(false)
  }

  return (
    <WalletRequired>
      <section id="loans" className="py-20 bg-gradient-to-b from-background to-background/95">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">NFT-Backed Loans</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Use your trading card NFTs as collateral to borrow stablecoins or manage your existing loans.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="borrow">Borrow</TabsTrigger>
              <TabsTrigger value="active">Active Loans</TabsTrigger>
            </TabsList>

            <TabsContent value="borrow" className="space-y-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : availableNfts.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="bg-background/50 border-blue-500/20">
                    <CardHeader>
                      <CardTitle>Select Collateral</CardTitle>
                      <CardDescription>Choose an NFT to use as collateral for your loan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {availableNfts.map((nft) => (
                          <div
                            key={nft.mint}
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
                                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                  {formatUSD(nft.value || 0)}
                                </span>
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
                            <span className="text-sm text-muted-foreground">Max: {formatUSD(maxLoanAmount)}</span>
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
                          <span className="font-medium">{formatUSD(actualLoanAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Interest Rate:</span>
                          <span className="font-medium">{interestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Interest Amount:</span>
                          <span className="font-medium">{formatUSD(interestAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Loan Term:</span>
                          <span className="font-medium">{loanTerm} Days</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Repayment:</span>
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                              {formatUSD(totalRepayment)}
                            </span>
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
              ) : (
                <div className="text-center py-12 border rounded-lg bg-background/50">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No NFTs Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You need to have CardFi trading card NFTs to use as collateral. Head over to the Mint section to
                    create your first NFT.
                  </p>
                  <Button asChild>
                    <a href="/app/mint">Mint Your First Card</a>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-8">
              {activeLoans.length > 0 ? (
                <div className="grid gap-6">
                  {activeLoans
                    .filter((loan) => loan.status === "active")
                    .map((loan) => {
                      const daysRemaining = getDaysRemaining(loan.dueDate)
                      const progress = ((Number.parseInt(loan.term) - daysRemaining) / Number.parseInt(loan.term)) * 100

                      return (
                        <Card key={loan.id} className="bg-background/50 border-blue-500/20 overflow-hidden">
                          <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
                            <div className="relative">
                              <img
                                src={loan.nftImage || "/placeholder.svg"}
                                alt={loan.nftName}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                                <Lock className="h-3 w-3" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <h3 className="font-bold text-white">{loan.nftName}</h3>
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                  <h3 className="text-xl font-bold mb-2">Active Loan</h3>
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
                                  <div className="text-sm text-muted-foreground mb-1">Repayment Amount</div>
                                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                    {formatUSD(loan.totalRepayment)}
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
                                      {formatUSD(loan.interestAmount)} ({loan.interestRate}%)
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Start Date</div>
                                    <div className="font-medium">{formatDate(loan.startDate)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Due Date</div>
                                    <div className="font-medium">{formatDate(loan.dueDate)}</div>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                  <Button
                                    onClick={() => handleRepayLoan(loan)}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Repay Loan
                                  </Button>
                                  <Button
                                    onClick={() => handleSimulateDefault(loan)}
                                    variant="outline"
                                    className="flex-1 border-red-500/50 text-red-400 hover:text-red-300 hover:border-red-400"
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Simulate Default
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
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

              {activeLoans.some((loan) => loan.status !== "active") && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Loan History</h3>
                  <div className="grid gap-4">
                    {activeLoans
                      .filter((loan) => loan.status !== "active")
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
                                ? `Repaid on ${formatDate(loan.dueDate)}`
                                : `Defaulted on ${formatDate(loan.dueDate)}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Loan Amount</div>
                                <div className="font-medium">{formatUSD(loan.loanAmount)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Total Repayment</div>
                                <div className="font-medium">{formatUSD(loan.totalRepayment)}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
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
                  Get up to 70% of your NFT's value in USDC stablecoins sent directly to your wallet.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-medium">Repay & Reclaim</h4>
                <p className="text-sm text-muted-foreground">
                  Repay your loan plus interest within the term to reclaim your NFT.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Transaction Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              Transaction Successful
            </DialogTitle>
            <DialogDescription>
              Your loan has been approved and the funds have been transferred to your wallet.
            </DialogDescription>
          </DialogHeader>

          {transactionDetails && (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="font-bold text-lg">{formatUSD(transactionDetails.amount)}</span>
                </div>
                <div className="h-px bg-green-500/20 my-3" />
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Recipient Wallet</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {transactionDetails.walletAddress.slice(0, 6)}...
                          {transactionDetails.walletAddress.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transactionDetails.walletAddress)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Transaction Signature</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {transactionDetails.signature.slice(0, 6)}...
                          {transactionDetails.signature.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transactionDetails.signature)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                  onClick={() =>
                    window.open(
                      `https://explorer.solana.com/tx/${transactionDetails.signature}?cluster=devnet`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Solana Explorer
                </Button>
                <Button variant="outline" onClick={() => setIsSuccessDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Repay Loan Dialog */}
      <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repay Loan</DialogTitle>
            <DialogDescription>Confirm that you want to repay this loan and reclaim your NFT.</DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedLoan.nftImage || "/placeholder.svg"}
                  alt={selectedLoan.nftName}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h4 className="font-medium">{selectedLoan.nftName}</h4>
                  <p className="text-sm text-muted-foreground">Collateral NFT</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Loan Amount:</span>
                  <span className="font-medium">{formatUSD(selectedLoan.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Interest Amount:</span>
                  <span className="font-medium">{formatUSD(selectedLoan.interestAmount)}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Repayment:</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                      {formatUSD(selectedLoan.totalRepayment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRepayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRepayLoan}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Repayment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Default Loan Dialog */}
      <Dialog open={isDefaultDialogOpen} onOpenChange={setIsDefaultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulate Loan Default</DialogTitle>
            <DialogDescription>
              This will simulate a loan default. The NFT will be listed on the marketplace and removed from your
              collection.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedLoan.nftImage || "/placeholder.svg"}
                  alt={selectedLoan.nftName}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h4 className="font-medium">{selectedLoan.nftName}</h4>
                  <p className="text-sm text-muted-foreground">Collateral NFT</p>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-400">Warning</h4>
                    <p className="text-sm text-muted-foreground">
                      This action is irreversible. Your NFT will be transferred to the marketplace and you will lose
                      ownership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDefaultDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDefault} variant="destructive">
              Simulate Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WalletRequired>
  )
}
