"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getActiveLoans,
  repayLoan,
  defaultLoan,
  formatUSD,
  formatDate,
  getDaysRemaining,
  initializeMockLoans,
} from "@/lib/loan-utils"
import { CURRENCY_RATES } from "@/lib/constants"

export default function DashboardLoans() {
  const [loans, setLoans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize mock loans if none exist
    initializeMockLoans()

    // Load loans from localStorage
    const activeLoans = getActiveLoans()
    setLoans(activeLoans)
    setIsLoading(false)
  }, [])

  const handleRepayLoan = (loanId: string) => {
    setIsProcessing(true)

    // Simulate repayment processing
    setTimeout(() => {
      const success = repayLoan(loanId)

      if (success) {
        // Update the loans list
        const updatedLoans = getActiveLoans()
        setLoans(updatedLoans)

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
        setLoans(updatedLoans)

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activeLoans = loans.filter((loan) => loan.status === "active")
  const repaidLoans = loans.filter((loan) => loan.status === "repaid")
  const defaultedLoans = loans.filter((loan) => loan.status === "defaulted")

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Loan History</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          You haven't taken out any loans yet. Use your NFTs as collateral to borrow stablecoins.
        </p>
        <Button asChild>
          <a href="/app/loans">Get a Loan</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeLoans.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Active Loans</h3>
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <Card key={loan.id} className="bg-background/50 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-[120px]">
                      <img
                        src={loan.nftImage || "/placeholder.svg"}
                        alt={loan.nftName}
                        className="w-full h-[120px] object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{loan.nftName}</h4>
                          <p className="text-sm text-muted-foreground">Loan ID: {loan.id.slice(0, 8)}...</p>
                        </div>
                        <Badge variant="default" className="bg-blue-500">
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Loan Amount</div>
                          <div className="text-sm font-medium">{loan.loanAmount.toFixed(2)} USDC</div>
                          <div className="text-xs text-muted-foreground">
                            {formatUSD(loan.loanAmount * CURRENCY_RATES.SOL_TO_USD)}
                          </div>
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

                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <Button
                          onClick={() => handleRepayLoan(loan.id)}
                          disabled={isProcessing}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Repay Loan
                        </Button>
                        <Button
                          onClick={() => handleDefaultLoan(loan.id)}
                          disabled={isProcessing}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:text-red-300 hover:border-red-400"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" /> Simulate Default
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {repaidLoans.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Repaid Loans</h3>
          <div className="space-y-4">
            {repaidLoans.map((loan) => (
              <Card key={loan.id} className="bg-background/50 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-[120px]">
                      <img
                        src={loan.nftImage || "/placeholder.svg"}
                        alt={loan.nftName}
                        className="w-full h-[120px] object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{loan.nftName}</h4>
                          <p className="text-sm text-muted-foreground">Loan ID: {loan.id.slice(0, 8)}...</p>
                        </div>
                        <Badge variant="success">Repaid</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Loan Amount</div>
                          <div className="text-sm font-medium">{loan.loanAmount.toFixed(2)} USDC</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Repayment</div>
                          <div className="text-sm font-medium">{loan.totalRepayment.toFixed(2)} USDC</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Start Date</div>
                          <div className="text-sm">{formatDate(loan.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Repaid Date</div>
                          <div className="text-sm">{formatDate(loan.dueDate)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {defaultedLoans.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Defaulted Loans</h3>
          <div className="space-y-4">
            {defaultedLoans.map((loan) => (
              <Card key={loan.id} className="bg-background/50 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-[120px]">
                      <img
                        src={loan.nftImage || "/placeholder.svg"}
                        alt={loan.nftName}
                        className="w-full h-[120px] object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{loan.nftName}</h4>
                          <p className="text-sm text-muted-foreground">Loan ID: {loan.id.slice(0, 8)}...</p>
                        </div>
                        <Badge variant="destructive">Defaulted</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Loan Amount</div>
                          <div className="text-sm font-medium">{loan.loanAmount.toFixed(2)} USDC</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Missed Repayment</div>
                          <div className="text-sm font-medium">{loan.totalRepayment.toFixed(2)} USDC</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Start Date</div>
                          <div className="text-sm">{formatDate(loan.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Default Date</div>
                          <div className="text-sm">{formatDate(loan.dueDate)}</div>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-red-500/10 rounded-md text-sm text-red-400">
                        <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                        This NFT has been transferred to the marketplace for auction.
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
  )
}
