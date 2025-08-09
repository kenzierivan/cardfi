import { type Connection, PublicKey } from "@solana/web3.js"
import { Metaplex } from "@metaplex-foundation/js"

export interface NFT {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string
  }[]
  rarity?: string
  value?: number
}

// Update the fetchNFTs function to handle rate limiting better
export async function fetchNFTs(connection: Connection, walletAddress: PublicKey): Promise<NFT[]> {
  try {
    const metaplex = new Metaplex(connection)

    // Add retry logic with exponential backoff
    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      try {
        // Fetch all NFTs owned by the wallet
        return await metaplex.nfts().findAllByOwner({ owner: walletAddress })
      } catch (error) {
        // Check if it's a rate limit error (429)
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          console.log(`Rate limited, retrying after ${delay}ms. Retries left: ${retries}`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay * 2)
        }
        throw error
      }
    }

    // Try to fetch NFTs with retry logic
    const nfts = await fetchWithRetry()

    // Filter for CardFi NFTs (you can use a specific collection or symbol)
    const cardFiNfts = nfts.filter(
      (nft) =>
        nft.symbol === "CARDFI" || // Filter by symbol
        nft.collection?.address?.toString() === "YOUR_COLLECTION_ADDRESS", // Or by collection
    )

    // Map to our NFT interface
    const formattedNfts: NFT[] = await Promise.all(
      cardFiNfts.map(async (nft) => {
        // Fetch metadata if URI exists
        let metadata: any = {}
        if (nft.uri) {
          try {
            const response = await fetch(nft.uri)
            metadata = await response.json()
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${nft.name}:`, error)
          }
        }

        // Find rarity attribute
        const rarityAttribute = metadata.attributes?.find((attr: any) => attr.trait_type.toLowerCase() === "rarity")

        // Find value attribute
        const valueAttribute = metadata.attributes?.find((attr: any) => attr.trait_type.toLowerCase() === "value")

        return {
          mint: nft.address.toString(),
          name: nft.name || "Unnamed Card",
          symbol: nft.symbol || "CARDFI",
          description: metadata.description || "No description available",
          image: metadata.image || "/placeholder.svg?height=300&width=200",
          attributes: metadata.attributes || [],
          rarity: rarityAttribute?.value || "Common",
          value: valueAttribute ? Number.parseFloat(valueAttribute.value) : 100,
        }
      }),
    )

    return formattedNfts
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return []
  }
}

// Also update the fetchNFTsByMints function with similar retry logic
export async function fetchNFTsByMints(connection: Connection, mintAddresses: string[]): Promise<NFT[]> {
  try {
    const metaplex = new Metaplex(connection)

    // Add retry logic with exponential backoff for individual NFT fetches
    const fetchNFTWithRetry = async (mintAddress: string, retries = 3, delay = 1000): Promise<NFT | null> => {
      try {
        const mint = new PublicKey(mintAddress)
        const nft = await metaplex.nfts().findByMint({ mintAddress: mint })

        // Fetch metadata if URI exists
        let metadata: any = {}
        if (nft.uri) {
          try {
            const response = await fetch(nft.uri)
            metadata = await response.json()
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${nft.name}:`, error)
          }
        }

        // Find rarity attribute
        const rarityAttribute = metadata.attributes?.find((attr: any) => attr.trait_type.toLowerCase() === "rarity")

        // Find value attribute
        const valueAttribute = metadata.attributes?.find((attr: any) => attr.trait_type.toLowerCase() === "value")

        return {
          mint: nft.address.toString(),
          name: nft.name || "Unnamed Card",
          symbol: nft.symbol || "CARDFI",
          description: metadata.description || "No description available",
          image: metadata.image || "/placeholder.svg?height=300&width=200",
          attributes: metadata.attributes || [],
          rarity: rarityAttribute?.value || "Common",
          value: valueAttribute ? Number.parseFloat(valueAttribute.value) : 100,
        }
      } catch (error) {
        // Check if it's a rate limit error (429)
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          console.log(`Rate limited for mint ${mintAddress}, retrying after ${delay}ms. Retries left: ${retries}`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return fetchNFTWithRetry(mintAddress, retries - 1, delay * 2)
        }
        console.error(`Error fetching NFT with mint ${mintAddress}:`, error)
        return null
      }
    }

    // Fetch NFTs with rate limiting - process in batches to avoid too many concurrent requests
    const batchSize = 3
    const nfts: (NFT | null)[] = []

    for (let i = 0; i < mintAddresses.length; i += batchSize) {
      const batch = mintAddresses.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map((mintAddress) => fetchNFTWithRetry(mintAddress)))
      nfts.push(...batchResults)

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < mintAddresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    return nfts.filter((nft): nft is NFT => nft !== null)
  } catch (error) {
    console.error("Error fetching NFTs by mints:", error)
    return []
  }
}
