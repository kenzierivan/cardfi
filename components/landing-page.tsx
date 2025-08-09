"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ExternalLink, Sparkles, Wallet, CreditCard, BarChart4, Layers } from "lucide-react"

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background"></div>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                opacity: Math.random() * 0.5,
                filter: "blur(100px)",
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500 mb-6"
            >
              Token the real. <br /> Borrow in the digital.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mx-auto mb-8"
            >
              Revolutionizing trading cards with Solana blockchain technology
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/app/dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 text-lg px-8 py-6"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started <ExternalLink className="h-5 w-5 ml-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="h-6 w-6 rotate-90 text-muted-foreground" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tokenize Your Trading Card Collection</h2>
            <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
              CardFi transforms physical trading cards into digital assets on the Solana blockchain, enabling new ways
              to collect, trade, and monetize your collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-background/50 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="bg-purple-500/10 text-purple-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verified NFT Minting</h3>
                <p className="text-muted-foreground">
                  Submit your physical cards for verification. Once approved, we mint them as NFTs on Solana.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="bg-blue-500/10 text-blue-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Stablecoin Loans</h3>
                <p className="text-muted-foreground">
                  Use your NFTs as collateral to borrow stablecoins without selling your valuable cards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="bg-pink-500/10 text-pink-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">P2P Trading</h3>
                <p className="text-muted-foreground">
                  Trade cards directly with other collectors using Solana's atomic swap feature for secure exchanges.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-green-500/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="bg-green-500/10 text-green-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart4 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">NFT Marketplace</h3>
                <p className="text-muted-foreground">
                  Buy and sell cards in our marketplace, or bid on defaulted NFTs at competitive prices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Card Preview Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/95">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Powered by Solana</h2>
              <p className="text-xl text-muted-foreground mb-6">
                CardFi leverages Solana's lightning-fast blockchain to provide a seamless experience with:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Ultra-fast transactions</span>
                    <p className="text-sm text-muted-foreground">2,400+ transactions per second</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Minimal fees</span>
                    <p className="text-sm text-muted-foreground">$0.00026 average transaction cost</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Energy efficient</span>
                    <p className="text-sm text-muted-foreground">Environmentally friendly proof-of-stake consensus</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Secure smart contracts</span>
                    <p className="text-sm text-muted-foreground">Trustless transactions with no middlemen</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/app/dashboard">
                  <Button
                    size="lg"
                    className="group border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-400 transition-all duration-300"
                  >
                    Explore the Platform
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  transform: isHovered ? "rotateY(10deg) rotateX(-5deg)" : "rotateY(0) rotateX(0)",
                  transition: "transform 0.5s ease",
                }}
              >
                <div className="relative w-[300px] h-[420px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 opacity-80"></div>
                  <div className="absolute inset-[3px] bg-gray-900 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=420&width=300')] bg-cover bg-center opacity-70"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <div className="text-xs font-bold text-white/80">CARDFI EXCLUSIVE</div>
                      <div className="text-xs font-bold text-white/80">#001</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">Charizard Holo</h3>
                      <p className="text-sm text-white/80 mb-3">Legendary Fire Pokémon</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-white/80">Rarity: Mythic</div>
                        <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                          500 SOL
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -inset-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 blur-xl"
                  style={{
                    opacity: isHovered ? 0.5 : 0.3,
                    transition: "opacity 0.5s ease",
                  }}
                ></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative z-10 text-center max-w-[800px] mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Collection?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join CardFi today and unlock the full potential of your trading cards on the Solana blockchain.
              </p>
              <Link href="/app/dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 text-lg px-8 py-6"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started <Wallet className="h-5 w-5 ml-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
