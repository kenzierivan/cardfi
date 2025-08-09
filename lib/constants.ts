// Currency conversion rates
export const CURRENCY_RATES = {
  SOL_TO_USD: 102.45, // Example rate: 1 SOL = $102.45 USD
  USDC_TO_USD: 1, // 1 USDC = $1 USD (exactly)
}

// Loan status types
export type LoanStatus = "active" | "repaid" | "defaulted"

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
