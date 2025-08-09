"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, DollarSign, Clock, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { WalletRequired } from "@/components/solana/wallet-required"
import { formatUSD, formatDate, getDaysRemaining } from "@/lib/loan-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAssociatedTokenAddressSync, createTransferInstruction } from "@solana/spl-token"
import { Transaction, PublicKey, Keypair } from "@solana/web3.js"
import bs58 from "bs58"

// Token transfer configuration
const tokenSender = Keypair.fromSecretKey(
  bs58.decode("4rjdDmH1sWENz4DUKwwgiMS6c8wvbMRrs31EhWS5p9wt2aG3hLb4j9gpQzGzFPSFD2MzHdmVnNGT3ajiuDKb9z8e"),
)
const MINT = new PublicKey("BfisT575PDpNn4VbLZzvmMXFsq1kPxb5yi8Vq7wLDBzD")

export default function SupplyPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [loanRequests, setLoanRequests] = useState<any[]>([])
  const [suppliedLoans, setSuppliedLoans] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("requests")
  const { toast } = useToast()
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<{
    type: "fund" | "repay"
    amount: number
    walletAddress: string
    signature: string
  }>()

  const generateMockLoanRequests = () => {
    return [
      {
        id: `loan-req-${Date.now()}-1`,
        nftMint: "mint1234567890",
        nftName: "Charizard Holo 1st Edition",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 5000,
        loanAmount: 2500,
        interestRate: 5,
        term: 30, // days
        borrowerAddress: "8Kz9...3Qpx",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: "pending",
      },
      {
        id: `loan-req-${Date.now()}-2`,
        nftMint: "mint0987654321",
        nftName: "Pikachu Gold Star",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 3000,
        loanAmount: 1500,
        interestRate: 4.5,
        term: 14, // days
        borrowerAddress: "3Jm7...9Fzx",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        status: "pending",
      },
      {
        id: `loan-req-${Date.now()}-3`,
        nftMint: "mint1122334455",
        nftName: "Blastoise Shadowless",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 2500,
        loanAmount: 1250,
        interestRate: 5,
        term: 30, // days
        borrowerAddress: "5Rp2...7Tqz",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        status: "pending",
      },
      {
        id: `loan-req-${Date.now()}-4`,
        nftMint: "mint5566778899",
        nftName: "Lugia 1st Edition",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 4000,
        loanAmount: 2000,
        interestRate: 5.5,
        term: 60, // days
        borrowerAddress: "9Tq8...2Wxz",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        status: "pending",
      },
      {
        id: `loan-req-${Date.now()}-5`,
        nftMint: "mint1357924680",
        nftName: "Mew Holo Promo",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 1800,
        loanAmount: 900,
        interestRate: 4,
        term: 7, // days
        borrowerAddress: "2Fk5...8Pqr",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        status: "pending",
      },
    ]
  }

  const generateMockSuppliedLoans = () => {
    return [
      {
        id: `loan-sup-${Date.now()}-1`,
        nftMint: "mint2468013579",
        nftName: "Venusaur Base Set",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 1500,
        loanAmount: 750,
        interestRate: 4.5,
        term: 30, // days
        borrowerAddress: "7Yz3...6Lmn",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
        status: "funded",
        lenderAddress: "4Wx5...9Opq",
        fundedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days from now
      },
      {
        id: `loan-sup-${Date.now()}-2`,
        nftMint: "mint9876543210",
        nftName: "Mewtwo Gold Star",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 6000,
        loanAmount: 3000,
        interestRate: 6,
        term: 30, // days
        borrowerAddress: "1Rst...4Uvw",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
        status: "repaid",
        lenderAddress: "4Wx5...9Opq",
        fundedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        repaidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: `loan-sup-${Date.now()}-3`,
        nftMint: "mint1472583690",
        nftName: "Rayquaza EX",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 2200,
        loanAmount: 1100,
        interestRate: 5,
        term: 30, // days
        borrowerAddress: "6Xyz...3Abc",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days ago
        status: "defaulted",
        lenderAddress: "4Wx5...9Opq",
        fundedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        defaultedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: `loan-sup-${Date.now()}-4`,
        nftMint: "mint3692581470",
        nftName: "Jolteon Gold Star",
        nftImage: "/placeholder.svg?height=200&width=150",
        nftValue: 3500,
        loanAmount: 1750,
        interestRate: 5.5,
        term: 60, // days
        borrowerAddress: "8Def...2Ghi",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
        status: "funded",
        lenderAddress: "4Wx5...9Opq",
        fundedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days from now
      },
    ]
  }

  useEffect(() => {
    // Load loan requests and supplied loans
    const loadData = async () => {
      setIsLoading(true)
      try {
        // In a real app, we would fetch from blockchain or API
        // For demo, we'll use mock data
        const storedLoanRequests = localStorage.getItem("cardfi_loan_requests")
        const storedSuppliedLoans = localStorage.getItem("cardfi_supplied_loans")

        let loanReqs = storedLoanRequests ? JSON.parse(storedLoanRequests) : generateMockLoanRequests()
        const suppliedLns = storedSuppliedLoans ? JSON.parse(storedSuppliedLoans) : generateMockSuppliedLoans()

        // Filter out loan requests that are already funded
        loanReqs = loanReqs.filter((req: any) => req.status === "pending")

        setLoanRequests(loanReqs)
        setSuppliedLoans(suppliedLns)

        // Save to localStorage
        localStorage.setItem("cardfi_loan_requests", JSON.stringify(loanReqs))
        if (!storedSuppliedLoans) {
          localStorage.setItem("cardfi_supplied_loans", JSON.stringify(suppliedLns))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load loan data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleFundLoan = (loan: any) => {
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to fund this loan",
        variant: "destructive",
      })
      return
    }

    // Check if the connected wallet is the borrower
    if (loan.borrowerAddress === `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`) {
      toast({
        title: "Cannot Fund Own Loan",
        description: "You cannot fund your own loan request",
        variant: "destructive",
      })
      return
    }

    setSelectedLoan(loan)
    setIsConfirmDialogOpen(true)
  }

  const confirmFundLoan = async () => {
    if (!selectedLoan || !publicKey) return

    setIsProcessing(true)

    try {
      // Define token address - using the same token from the example
      const TOKEN_ADDRESS = new PublicKey("BfisT575PDpNn4VbLZzvmMXFsq1kPxb5yi8Vq7wLDBzD")

      // Define receiver address (borrower's wallet)
      // In a real app, this would be the actual borrower's wallet address
      const RECEIVER_PUBLIC_KEY = new PublicKey("2nLyPfKCJtAyR6zNTqH69YmoVe8jHkhZbQcZxZGuaJRT")

      // Calculate amount in lamports (1e9 = 1 billion, as SPL tokens typically have 9 decimals)
      const AMOUNT_LAMPORTS = Math.floor(selectedLoan.loanAmount * 1e9)

      // Derive ATAs (Associated Token Accounts)
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

      console.log("Loan funding transaction sent:", signature)

      // Store transaction details for the success dialog
      setTransactionDetails({
        type: "fund",
        amount: selectedLoan.loanAmount,
        walletAddress: RECEIVER_PUBLIC_KEY.toString(),
        signature: signature,
      })

      // Show success dialog
      setIsSuccessDialogOpen(true)

      // Update loan status
      const updatedLoan = {
        ...selectedLoan,
        status: "funded",
        lenderAddress: publicKey
          ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
          : "Unknown",
        fundedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + selectedLoan.term * 24 * 60 * 60 * 1000).toISOString(),
      }

      // Remove from loan requests
      const updatedRequests = loanRequests.filter((req) => req.id !== selectedLoan.id)
      setLoanRequests(updatedRequests)
      localStorage.setItem("cardfi_loan_requests", JSON.stringify(updatedRequests))

      // Add to supplied loans
      const updatedSupplied = [...suppliedLoans, updatedLoan]
      setSuppliedLoans(updatedSupplied)
      localStorage.setItem("cardfi_supplied_loans", JSON.stringify(updatedSupplied))

      // Update active loans in the borrower's account
      const activeLoans = JSON.parse(localStorage.getItem("cardfi_loans") || "[]")
      activeLoans.push({
        ...updatedLoan,
        startDate: updatedLoan.fundedAt,
        interestAmount: (updatedLoan.loanAmount * updatedLoan.interestRate * updatedLoan.term) / (100 * 30),
        totalRepayment:
          updatedLoan.loanAmount + (updatedLoan.loanAmount * updatedLoan.interestRate * updatedLoan.term) / (100 * 30),
      })
      localStorage.setItem("cardfi_loans", JSON.stringify(activeLoans))

      toast({
        title: "Loan Successfully Funded",
        description: `You have supplied ${formatUSD(selectedLoan.loanAmount)} to the borrower. Transaction: ${signature.slice(0, 8)}...`,
      })

      // Switch to "My Supplies" tab
      setActiveTab("supplies")
    } catch (error) {
      console.error("Error funding loan:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to fund the loan. Please check your token balance and try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsConfirmDialogOpen(false)
    }
  }

  const handleSimulateRepayment = async (loan: any) => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to receive repayment",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Calculate amount in lamports
      const AMOUNT_LAMPORTS = Math.floor(calculateExpectedReturn(loan) * 1e9)

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

      console.log("Repayment transfer complete:", txid)

      // Store transaction details for the success dialog
      setTransactionDetails({
        type: "repay",
        amount: calculateExpectedReturn(loan),
        walletAddress: publicKey.toString(),
        signature: txid,
      })

      // Show success dialog
      setIsSuccessDialogOpen(true)

      // Update loan status
      const updatedLoan = {
        ...loan,
        status: "repaid",
        repaidAt: new Date().toISOString(),
      }

      // Update supplied loans
      const updatedSupplied = suppliedLoans.map((l) => (l.id === loan.id ? updatedLoan : l))
      setSuppliedLoans(updatedSupplied)
      localStorage.setItem("cardfi_supplied_loans", JSON.stringify(updatedSupplied))

      // Update active loans in the borrower's account
      const activeLoans = JSON.parse(localStorage.getItem("cardfi_loans") || "[]")
      const updatedActiveLoans = activeLoans.map((l: any) => {
        if (l.id === loan.id) {
          return { ...l, status: "repaid" }
        }
        return l
      })
      localStorage.setItem("cardfi_loans", JSON.stringify(updatedActiveLoans))

      toast({
        title: "Loan Repaid",
        description: `You have received ${formatUSD(calculateExpectedReturn(loan))} from the borrower. Transaction: ${txid.slice(0, 8)}...`,
      })
    } catch (error) {
      console.error("Error processing repayment:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to process repayment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSimulateDefault = (loan: any) => {
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      try {
        // Update loan status
        const updatedLoan = {
          ...loan,
          status: "defaulted",
          defaultedAt: new Date().toISOString(),
        }

        // Update supplied loans
        const updatedSupplied = suppliedLoans.map((l) => (l.id === loan.id ? updatedLoan : l))
        setSuppliedLoans(updatedSupplied)
        localStorage.setItem("cardfi_supplied_loans", JSON.stringify(updatedSupplied))

        // Update active loans in the borrower's account
        const activeLoans = JSON.parse(localStorage.getItem("cardfi_loans") || "[]")
        const updatedActiveLoans = activeLoans.map((l: any) => {
          if (l.id === loan.id) {
            return { ...l, status: "defaulted" }
          }
          return l
        })
        localStorage.setItem("cardfi_loans", JSON.stringify(updatedActiveLoans))

        // Add NFT to lender's collection
        const userNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")
        userNfts.push({
          mint: loan.nftMint,
          name: loan.nftName,
          image: loan.nftImage,
          value: loan.nftValue,
          status: "acquired_from_default",
          description: `This NFT was acquired when the borrower defaulted on loan ${loan.id.slice(0, 8)}...`,
        })
        localStorage.setItem("cardfi_nfts", JSON.stringify(userNfts))

        toast({
          title: "Borrower Defaulted",
          description: `The NFT "${loan.nftName}" has been transferred to your wallet.`,
        })
      } catch (error) {
        console.error("Error simulating default:", error)
        toast({
          title: "Error",
          description: "Failed to process default",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }, 1500)
  }

  const calculateExpectedReturn = (loan: any) => {
    const interestAmount = (loan.loanAmount * loan.interestRate * loan.term) / (100 * 30)
    return loan.loanAmount + interestAmount
  }

  return (
    <WalletRequired>
      <section className="py-20 bg-gradient-to-b from-background to-background/95">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Supply Liquidity</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Fund loan requests from borrowers and earn interest on your USDC. All loans are secured by NFT collateral.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="requests">Loan Requests</TabsTrigger>
              <TabsTrigger value="supplies">My Supplies</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : loanRequests.length > 0 ? (
                <div className="grid gap-6">
                  {loanRequests.map((loan) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-background/50 border-green-500/20 overflow-hidden">
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
                                <h3 className="text-xl font-bold mb-2">Loan Request</h3>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="text-sm text-muted-foreground">Borrower: {loan.borrowerAddress}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Posted: {new Date(loan.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                  {formatUSD(loan.loanAmount)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Collateral Value</div>
                                <div className="text-sm font-medium">{formatUSD(loan.nftValue)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Loan-to-Value</div>
                                <div className="text-sm font-medium">
                                  {((loan.loanAmount / loan.nftValue) * 100).toFixed(0)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Interest Rate</div>
                                <div className="text-sm font-medium">{loan.interestRate}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Term</div>
                                <div className="text-sm font-medium">{loan.term} days</div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm">
                                  Expected Return:{" "}
                                  <span className="font-medium">{formatUSD(calculateExpectedReturn(loan))}</span>
                                </div>
                                <div className="text-sm text-green-400">
                                  +{((loan.interestRate * loan.term) / 30).toFixed(2)}% in {loan.term} days
                                </div>
                              </div>

                              <Button
                                onClick={() => handleFundLoan(loan)}
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                              >
                                <DollarSign className="mr-2 h-4 w-4" /> Fund This Loan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-background/50">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Loan Requests</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    There are currently no active loan requests. Check back later or create a loan request yourself.
                  </p>
                  <Button asChild>
                    <a href="/app/loans">Create Loan Request</a>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="supplies" className="space-y-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : suppliedLoans.length > 0 ? (
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

                                <div className="flex flex-col sm:flex-row gap-4">
                                  <Button
                                    onClick={() => handleSimulateRepayment(loan)}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Simulate Repayment
                                      </>
                                    )}
                                  </Button>
                                </div>
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
                    You haven't supplied any loans yet. Browse the loan requests to start earning interest on your USDC.
                  </p>
                  <Button onClick={() => setActiveTab("requests")}>View Loan Requests</Button>
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
            <h3 className="text-xl font-bold mb-4">How Supplying Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="font-medium">Browse Loan Requests</h4>
                <p className="text-sm text-muted-foreground">
                  View loan requests from borrowers who are using their NFTs as collateral.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="font-medium">Supply USDC</h4>
                <p className="text-sm text-muted-foreground">
                  Fund loans that meet your criteria and earn interest on your USDC.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-medium">Collect Returns</h4>
                <p className="text-sm text-muted-foreground">
                  When borrowers repay, you receive your principal plus interest. If they default, you receive their
                  NFT.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fund Loan Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Loan Funding</DialogTitle>
            <DialogDescription>
              You are about to supply USDC to fund this loan request. The borrower's NFT will be locked as collateral.
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

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Loan Amount:</span>
                  <span className="font-medium">{formatUSD(selectedLoan.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Interest Rate:</span>
                  <span className="font-medium">{selectedLoan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Term:</span>
                  <span className="font-medium">{selectedLoan.term} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Borrower:</span>
                  <span className="font-medium">{selectedLoan.borrowerAddress}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Expected Return:</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                      {formatUSD(calculateExpectedReturn(selectedLoan))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={confirmFundLoan}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" /> Confirm & Supply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              Transaction Successful
            </DialogTitle>
            <DialogDescription>
              {transactionDetails?.type === "fund"
                ? "Your loan has been successfully funded and the tokens have been transferred."
                : "You have successfully received the loan repayment."}
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
                      <span className="text-sm text-muted-foreground">
                        {transactionDetails.type === "fund" ? "Recipient Wallet" : "Your Wallet"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {transactionDetails.walletAddress.slice(0, 6)}...
                          {transactionDetails.walletAddress.slice(-4)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(transactionDetails.walletAddress)
                            toast({
                              title: "Copied to clipboard",
                              description: "The wallet address has been copied to your clipboard.",
                            })
                          }}
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
                          onClick={() => {
                            navigator.clipboard.writeText(transactionDetails.signature)
                            toast({
                              title: "Copied to clipboard",
                              description: "The transaction signature has been copied to your clipboard.",
                            })
                          }}
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
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
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
    </WalletRequired>
  )
}
