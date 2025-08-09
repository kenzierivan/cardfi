"use client"

import type React from "react"

import { useState } from "react"
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

export default function MintSection() {
  const [cardName, setCardName] = useState("")
  const [cardDescription, setCardDescription] = useState("")
  const [cardRarity, setCardRarity] = useState("")
  const [cardImage, setCardImage] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const { toast } = useToast()
  const [cardValue, setCardValue] = useState("")

  const CURRENCY_RATES = {
    SOL_TO_USD: 50,
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to a service
      // For demo, we'll use a placeholder
      setCardImage("/placeholder.svg?height=300&width=300")
    }
  }

  const removeImage = () => {
    setCardImage(null)
  }

  const handleSubmit = () => {
    if (!cardName || !cardRarity || !cardImage) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    // Simulate submission process
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setMintProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsMinting(false)
          setMintProgress(0)
          toast({
            title: "Card Submitted Successfully",
            description: `Your card "${cardName}" has been submitted for verification`,
          })
          // Reset form
          setCardName("")
          setCardDescription("")
          setCardRarity("")
          setCardImage(null)
        }, 500)
      }
    }, 400)
  }

  return (
    <section id="mint" className="py-20">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Submit Your Trading Card</h2>
          <p className="text-muted-foreground max-w-[600px]">
            Submit your physical trading cards for verification. Once approved, CardFi will mint them as NFTs on Solana.
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

                <div className="space-y-2">
                  <Label htmlFor="card-rarity">Rarity</Label>
                  <Select value={cardRarity} onValueChange={setCardRarity}>
                    <SelectTrigger className="border-border/50 focus-visible:ring-purple-500">
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="mythic">Mythic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
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
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
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
                      <span>Submitting card...</span>
                      <span>{mintProgress}%</span>
                    </div>
                    <Progress value={mintProgress} className="h-2" />
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Submit Card
                  </Button>
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
                <div className="absolute inset-0 bg-[url('/placeholder.svg?height=420&width=300')] bg-cover bg-center opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-xs font-bold text-white/80">
                    {cardRarity ? cardRarity.toUpperCase() : "PENDING VERIFICATION"}
                  </div>
                  <div className="text-xs font-bold text-white/80">#???</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white mb-1">{cardName || "Your Card Name"}</h3>
                  <p className="text-sm text-white/80 mb-3">{cardDescription || "Card description will appear here"}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white/80">Rarity: {cardRarity || "???"}</div>
                    <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                      {formatUSD((cardValue ? Number.parseFloat(cardValue) : 100) * CURRENCY_RATES.SOL_TO_USD)}
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
  )
}
