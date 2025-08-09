"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { WalletRequired } from "@/components/solana/wallet-required"
import { mintNFT } from "@/lib/solana/mint-utils"

export default function MintPage() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [cardName, setCardName] = useState("")
  const [cardDescription, setCardDescription] = useState("")
  const [gradingCompany, setGradingCompany] = useState("")
  const [grade, setGrade] = useState("")
  const [cardValue, setCardValue] = useState("")
  const [cardImage, setCardImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCardImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setCardImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!cardName || !gradingCompany || !grade || !cardImage || !imageFile) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }

    if (!wallet.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    setMintProgress(10)

    try {
      // Prepare attributes
      const attributes = [
        {
          trait_type: "Grading Company",
          value: gradingCompany,
        },
        {
          trait_type: "Grade",
          value: grade,
        },
      ]

      if (cardValue) {
        attributes.push({
          trait_type: "Value",
          value: cardValue,
        })
      }

      // Update progress to simulate steps
      setMintProgress(30)

      console.log("Starting NFT minting process...")

      // Mint the NFT
      const mintAddress = await mintNFT({
        connection,
        wallet,
        name: cardName,
        description: cardDescription,
        image: imageFile,
        attributes,
      })

      setMintProgress(90)

      if (mintAddress) {
        console.log("NFT minted successfully:", mintAddress)
        setTimeout(() => {
          setIsMinting(false)
          setMintProgress(100)
          toast({
            title: "NFT Minted Successfully",
            description: `Your card "${cardName}" has been minted with address ${mintAddress.slice(0, 8)}...`,
          })
          // Reset form
          setCardName("")
          setGradingCompany("")
          setGrade("")
          setCardValue("")
          setCardImage(null)
          setImageFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }, 1000)
      } else {
        throw new Error("Failed to mint NFT - no mint address returned")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      })
      setIsMinting(false)
      setMintProgress(0)
    }
  }

  // For demo purposes, let's simulate successful minting
  const handleDemoMint = () => {
    if (!cardName || !gradingCompany || !grade || !cardImage) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    setMintProgress(10)

    // Simulate the minting process with progress updates
    const interval = setInterval(() => {
      setMintProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 20
      })
    }, 500)

    // Simulate completion after 2.5 seconds
    setTimeout(() => {
      clearInterval(interval)
      setMintProgress(100)

      setTimeout(() => {
        // Generate a random mint address
        const mintAddress = `mint${Math.random().toString(36).substring(2, 10)}`

        // Create NFT object
        const newNft = {
          mint: mintAddress,
          name: cardName,
          gradingCompany: gradingCompany,
          grade: grade,
          value: cardValue ? Number.parseFloat(cardValue) : 100, // Ensure value is stored as a number
          image: cardImage,
          attributes: [
            { trait_type: "Grading Company", value: gradingCompany },
            { trait_type: "Grade", value: grade },
            { trait_type: "Value", value: cardValue || "100" }, // Add value as an attribute
          ],
          timestamp: new Date().toISOString(),
        }

        // Save to localStorage
        const existingNfts = JSON.parse(localStorage.getItem("cardfi_nfts") || "[]")
        localStorage.setItem("cardfi_nfts", JSON.stringify([...existingNfts, newNft]))

        setIsMinting(false)
        toast({
          title: "NFT Minted Successfully",
          description: `Your card "${cardName}" has been minted and is now available in your dashboard and for loans.`,
        })

        // Reset form
        setCardName("")
        setGradingCompany("")
        setGrade("")
        setCardValue("")
        setCardImage(null)
        setImageFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 500)
    }, 2500)
  }

  return (
    <WalletRequired>
      <section id="mint" className="py-20">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Submit Your Trading Card</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Mint your trading cards as NFTs on Solana. Once minted, you can use them across the CardFi platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="bg-background/50 border-purple-500/20">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Card Name</Label>
                    <Input
                      id="card-name"
                      placeholder="e.g. Charizard Holo 1st Edition"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="border-border/50 focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-description">Description</Label>
                    <Textarea
                      id="card-description"
                      placeholder="Describe your card's features, condition, etc."
                      value={cardDescription}
                      onChange={(e) => setCardDescription(e.target.value)}
                      className="border-border/50 focus-visible:ring-purple-500 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grading-company">Grading Company</Label>
                      <Select value={gradingCompany} onValueChange={setGradingCompany}>
                        <SelectTrigger className="border-border/50 focus-visible:ring-purple-500">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PSA">PSA</SelectItem>
                          <SelectItem value="BGS">BGS</SelectItem>
                          <SelectItem value="CGC">CGC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger className="border-border/50 focus-visible:ring-purple-500">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 21 }, (_, i) => i / 2).map((value) => (
                            <SelectItem key={value} value={value.toString()}>
                              {value.toFixed(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-value">Value (USDC)</Label>
                    <Input
                      id="card-value"
                      type="number"
                      placeholder="e.g. 100"
                      value={cardValue}
                      onChange={(e) => setCardValue(e.target.value)}
                      className="border-border/50 focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Card Image</Label>
                    {!cardImage ? (
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop your card image, or{" "}
                            <label className="text-purple-400 hover:text-purple-300 cursor-pointer">
                              browse
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or GIF, max 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={cardImage || "/placeholder.svg"}
                          alt="Card preview"
                          className="w-full h-[200px] object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-background/80 p-1 rounded-full hover:bg-background transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isMinting ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Minting NFT...</span>
                        <span>{mintProgress}%</span>
                      </div>
                      <Progress value={mintProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleDemoMint}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                        disabled={isMinting}
                      >
                        <Sparkles className="mr-2 h-4 w-4" /> Mint NFT (Demo Mode)
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Demo mode simulates minting without blockchain transactions
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative mx-auto w-[300px] h-[420px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20"
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                  animation: "float 6s ease-in-out infinite",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 opacity-80"></div>
                <div className="absolute inset-[3px] bg-gray-900 rounded-xl overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-70"
                    style={{
                      backgroundImage: cardImage ? `url(${cardImage})` : "url('/placeholder.svg?height=420&width=300')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900"></div>
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="text-xs font-bold text-white/80">{gradingCompany || "GRADING CO"}</div>
                    <div className="text-xs font-bold text-white/80">{grade ? `Grade: ${grade}` : "GRADE"}</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{cardName || "Your Card Name"}</h3>
                    <p className="text-sm text-white/80 mb-3">
                      {cardDescription || "Card description will appear here"}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-white/80">
                        {gradingCompany || "???"} {grade || "???"}
                      </div>
                      <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        {cardValue ? `${cardValue} USDC` : "100 USDC"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 blur-xl"></div>

              <div className="mt-8 bg-muted/50 rounded-lg p-4 border border-border/50">
                <h3 className="text-sm font-medium mb-2">Solana Transaction Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-green-400 font-bold">2,400+</div>
                    <div className="text-xs text-muted-foreground">TPS</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold">$0.00026</div>
                    <div className="text-xs text-muted-foreground">Per TX</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold">0.4s</div>
                    <div className="text-xs text-muted-foreground">Finality</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </WalletRequired>
  )
}
