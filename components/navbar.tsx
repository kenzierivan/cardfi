"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { usePathname } from "next/navigation"
import { WalletConnectButton } from "@/components/ui/wallet-connect-button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const pathname = usePathname()
  const isAppPage = pathname.includes("/app")

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const landingNavLinks = [] // Remove the Launch App link

  const appNavLinks = [
    { name: "Mint", href: "/app/mint" },
    { name: "Loans", href: "/app/loans" },
    { name: "Trade", href: "/app/trade" },
    { name: "Marketplace", href: "/app/marketplace" },
    { name: "Supply", href: "/app/supply" },
    { name: "Dashboard", href: "/app/dashboard" },
  ]

  const navLinks = isAppPage ? appNavLinks : landingNavLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-07%20125857_Nero_AI_Image_Upscaler_Photo_Face-CeHfcc6fp5H9YUF4EG9eGr362O4KtG.png"
                alt="CardFi Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="hidden font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-pink-500 sm:inline-block">
              CardFi
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isAppPage &&
            appNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  "text-muted-foreground",
                  pathname === link.href && "text-foreground font-semibold",
                )}
              >
                {link.name}
              </Link>
            ))}
          {!isAppPage &&
            landingNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  "text-muted-foreground",
                  pathname === link.href && "text-foreground font-semibold",
                )}
              >
                {link.name}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAppPage && <WalletConnectButton className="hidden sm:flex" />}

          {!isAppPage && (
            <Link href="/app/dashboard" className="hidden sm:block">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
              >
                Launch App
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4 flex flex-col gap-4">
            {!isAppPage && (
              <Link
                href="/app/dashboard"
                className="text-sm font-medium text-purple-400 hover:text-purple-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Launch App
              </Link>
            )}
            {isAppPage &&
              appNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    "text-muted-foreground",
                    pathname === link.href && "text-foreground font-semibold",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            {isAppPage && <WalletConnectButton />}
          </div>
        </div>
      )}
    </header>
  )
}
