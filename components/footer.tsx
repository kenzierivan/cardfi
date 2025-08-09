import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscIcon as Discord, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-07%20125857_Nero_AI_Image_Upscaler_Photo_Face-CeHfcc6fp5H9YUF4EG9eGr362O4KtG.png"
                  alt="CardFi Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500">
                CardFi
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tokenize your trading cards on Solana. Mint NFTs, borrow stablecoins, trade peer-to-peer, or bid in our
              marketplace.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Discord className="h-4 w-4" />
                <span className="sr-only">Discord</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#mint" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mint NFTs
                </Link>
              </li>
              <li>
                <Link href="#loans" className="text-muted-foreground hover:text-foreground transition-colors">
                  Borrow
                </Link>
              </li>
              <li>
                <Link href="#trade" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trade
                </Link>
              </li>
              <li>
                <Link href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Solana Ecosystem</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://solana.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Solana
                </Link>
              </li>
              <li>
                <Link
                  href="https://phantom.app"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Phantom Wallet
                </Link>
              </li>
              <li>
                <Link
                  href="https://pyth.network"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pyth Network
                </Link>
              </li>
              <li>
                <Link
                  href="https://solscan.io"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Solscan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">© 2025 CardFi. All rights reserved.</div>
          <div className="flex items-center">
            <div className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Built on Solana
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
