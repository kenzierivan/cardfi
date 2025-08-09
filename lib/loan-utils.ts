import type { NFT } from "@/lib/solana/nft-utils"

// Currency conversion rates
const CURRENCY_RATES = {
  SOL_TO_USD: 102.45, // Example rate: 1 SOL = $102.45 USD
}

// Loan status types
type LoanStatus = "active" | "repaid" | "defaulted"

// Loan interface
export interface Loan {
  id: string
  nftMint: string
  nftName: string
  nftImage: string
  nftValue: number
  loanAmount: number
  interestRate: number
  interestAmount: number
  totalRepayment: number
  term: number // in days
  startDate: string
  dueDate: string
  status: LoanStatus
}

// Get active loans from localStorage
export function getActiveLoans(): Loan[] {
  if (typeof window === "undefined") return []

  try {
    const loans = JSON.parse(localStorage.getItem("cardfi_loans") || "[]")
    return loans
  } catch (error) {
    console.error("Error loading loans:", error)
    return []
  }
}

// Save loans to localStorage
export function saveLoans(loans: Loan[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("cardfi_loans", JSON.stringify(loans))
  } catch (error) {
    console.error("Error saving loans:", error)
  }
}

// Create a new loan
export function createLoan(
  nft: NFT,
  loanAmount: number,
  interestRate: number,
  interestAmount: number,
  totalRepayment: number,
  term: number,
): Loan {
  const startDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + term)

  const loan: Loan = {
    id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    nftMint: nft.mint,
    nftName: nft.name,
    nftImage: nft.image || "/placeholder.svg",
    nftValue: nft.value || 0, // Ensure the NFT value is properly stored
    loanAmount,
    interestRate,
    interestAmount,
    totalRepayment,
    term,
    startDate: startDate.toISOString(),
    dueDate: dueDate.toISOString(),
    status: "active",
  }

  const loans = getActiveLoans()
  loans.push(loan)
  saveLoans(loans)

  return loan
}

// Repay a loan
export function repayLoan(loanId: string): boolean {
  const loans = getActiveLoans()
  const loanIndex = loans.findIndex((loan) => loan.id === loanId)

  if (loanIndex === -1) return false

  loans[loanIndex].status = "repaid"
  saveLoans(loans)

  return true
}

// Default on a loan
export function defaultLoan(loanId: string): boolean {
  const loans = getActiveLoans()
  const loanIndex = loans.findIndex((loan) => loan.id === loanId)

  if (loanIndex === -1) return false

  loans[loanIndex].status = "defaulted"
  saveLoans(loans)

  // Move NFT to marketplace
  const defaultedNft = {
    mint: loans[loanIndex].nftMint,
    name: loans[loanIndex].nftName,
    image: loans[loanIndex].nftImage,
    value: loans[loanIndex].nftValue,
    status: "defaulted",
    forSale: true,
  }

  // Add to defaulted NFTs in marketplace
  const defaultedNfts = JSON.parse(localStorage.getItem("cardfi_defaulted_nfts") || "[]")
  defaultedNfts.push(defaultedNft)
  localStorage.setItem("cardfi_defaulted_nfts", JSON.stringify(defaultedNfts))

  // Remove from user's NFTs
  const userNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")
  const updatedUserNfts = userNfts.filter((nft: NFT) => nft.mint !== loans[loanIndex].nftMint)
  localStorage.setItem("cardfi_nfts", JSON.stringify(updatedUserNfts))

  return true
}

// Get loan by NFT mint address
export function getLoanByNftMint(nftMint: string): Loan | null {
  const loans = getActiveLoans()
  const loan = loans.find((loan) => loan.nftMint === nftMint && loan.status === "active")
  return loan || null
}

// Format currency to USD
export function formatUSD(amount: number): string {
  return amount.toFixed(2)
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Calculate days remaining until due date
export function getDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Generate mock loans for demo purposes
export function generateMockLoans(): Loan[] {
  const mockLoans: Loan[] = [
    {
      id: "loan-1678923456-abc123",
      nftMint: "mint1234567890",
      nftName: "Charizard Holo 1st Edition",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 5000,
      loanAmount: 2500,
      interestRate: 5,
      interestAmount: 62.5,
      totalRepayment: 2562.5,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days from now
      status: "active",
    },
    {
      id: "loan-1678923457-def456",
      nftMint: "mint0987654321",
      nftName: "Pikachu Gold Star",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 3000,
      loanAmount: 1500,
      interestRate: 4.5,
      interestAmount: 33.75,
      totalRepayment: 1533.75,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days from now
      status: "active",
    },
    {
      id: "loan-1678923458-ghi789",
      nftMint: "mint1122334455",
      nftName: "Blastoise Shadowless",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 2500,
      loanAmount: 1250,
      interestRate: 5,
      interestAmount: 31.25,
      totalRepayment: 1281.25,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days from now
      status: "active",
    },
    {
      id: "loan-1678923459-jkl012",
      nftMint: "mint5566778899",
      nftName: "Lugia 1st Edition",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 4000,
      loanAmount: 2000,
      interestRate: 5.5,
      interestAmount: 55,
      totalRepayment: 2055,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days ago
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      status: "repaid",
    },
    {
      id: "loan-1678923460-mno345",
      nftMint: "mint1357924680",
      nftName: "Mew Holo Promo",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 1800,
      loanAmount: 900,
      interestRate: 4,
      interestAmount: 18,
      totalRepayment: 918,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), // 40 days ago
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      status: "defaulted",
    },
    {
      id: "loan-1678923461-pqr678",
      nftMint: "mint2468013579",
      nftName: "Venusaur Base Set",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 1500,
      loanAmount: 750,
      interestRate: 4.5,
      interestAmount: 16.88,
      totalRepayment: 766.88,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(), // 28 days from now
      status: "active",
    },
    {
      id: "loan-1678923462-stu901",
      nftMint: "mint9876543210",
      nftName: "Mewtwo Gold Star",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 6000,
      loanAmount: 3000,
      interestRate: 6,
      interestAmount: 90,
      totalRepayment: 3090,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      status: "repaid",
    },
    {
      id: "loan-1678923463-vwx234",
      nftMint: "mint1472583690",
      nftName: "Rayquaza EX",
      nftImage: "/placeholder.svg?height=300&width=200",
      nftValue: 2200,
      loanAmount: 1100,
      interestRate: 5,
      interestAmount: 27.5,
      totalRepayment: 1127.5,
      term: 30,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(), // 50 days ago
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      status: "defaulted",
    },
  ]

  return mockLoans
}

// Initialize mock loans in localStorage if none exist
export function initializeMockLoans(): void {
  if (typeof window === "undefined") return

  const existingLoans = localStorage.getItem("cardfi_loans")
  if (!existingLoans || JSON.parse(existingLoans).length === 0) {
    const mockLoans = generateMockLoans()
    saveLoans(mockLoans)

    // Also initialize defaulted NFTs for the marketplace
    const defaultedNfts = mockLoans
      .filter((loan) => loan.status === "defaulted")
      .map((loan) => ({
        mint: loan.nftMint,
        name: loan.nftName,
        image: loan.nftImage,
        value: loan.nftValue,
        rarity: ["Rare", "Mythic", "Legendary"][Math.floor(Math.random() * 3)],
        status: "defaulted",
        forSale: true,
      }))

    localStorage.setItem("cardfi_defaulted_nfts", JSON.stringify(defaultedNfts))
  }
}
