"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative py-20 overflow-hidden">
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

      <div className="container relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500">
                Tokenize Your Trading Cards on Solana
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-[600px]"
            >
              Mint NFTs, borrow stablecoins, trade peer-to-peer, or bid in our marketplace. All powered by Solana&apos;s
              lightning-fast blockchain.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/app/dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Submit Your Card <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link href="/app/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-400 transition-all duration-300"
                >
                  Explore Loans
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>2,400+ TPS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>$0.00026/tx</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Instant Settlement</span>
              </div>
            </motion.div>
          </div>
          <div className="relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: isHovered ? "rotateY(10deg) rotateX(-5deg)" : "rotateY(0) rotateX(0)",
                transition: "transform 0.5s ease",
              }}
            >
              <div className="relative w-[300px] h-[420px] sm:w-[350px] sm:h-[490px] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 opacity-80"></div>
                <div className="absolute inset-[3px] bg-gray-900 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=490&width=350')] bg-cover bg-center opacity-70"></div>
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
  )
}
