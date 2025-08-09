"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatUSD } from "@/lib/loan-utils"
import type { NFT } from "@/lib/solana/nft-utils"

interface NFTDetailModalProps {
  nft: NFT | null
  isOpen: boolean
  onClose: () => void
}

export default function NFTDetailModal({ nft, isOpen, onClose }: NFTDetailModalProps) {
  if (!nft) return null

  const nftValueUSD = nft.value || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
          <DialogDescription>
            Mint Address: <span className="font-mono text-xs">{nft.mint}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="object-cover w-full h-full" />
            {nft.rarity && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                {nft.rarity}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{nft.description || "No description available"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Value</h3>
              <p className="mt-1 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                {formatUSD(nftValueUSD)}
              </p>
            </div>

            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr, index) => (
                    <div key={index} className="bg-muted/50 rounded p-2">
                      <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                      <div className="font-medium">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button asChild>
                <a href={`/app/loans?nft=${nft.mint}`}>Use as Collateral</a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
