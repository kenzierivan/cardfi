import type { Connection } from "@solana/web3.js"
import { Metaplex } from "@metaplex-foundation/js"
import type { WalletContextState } from "@solana/wallet-adapter-react"

export interface MintNFTParams {
  connection: Connection
  wallet: WalletContextState
  name: string
  description: string
  image: File
  attributes: {
    trait_type: string
    value: string
  }[]
}

// Update the mintNFT function to handle rate limiting
export async function mintNFT({
  connection,
  wallet,
  name,
  description,
  image,
  attributes,
}: MintNFTParams): Promise<string | null> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  try {
    // Create a Metaplex instance
    const metaplex = Metaplex.make(connection)

    // Set up the wallet adapter as the identity
    // We need to create a proper wallet adapter for Metaplex
    metaplex.use({
      identity: {
        publicKey: wallet.publicKey,
        signMessage: wallet.signMessage,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
    })

    // Convert the image file to a buffer
    const imageBuffer = await image.arrayBuffer()

    // Upload the image with retry logic
    console.log("Uploading image...")
    const uploadWithRetry = async (data: Uint8Array, retries = 3, delay = 1000) => {
      try {
        return await metaplex.storage().upload(data)
      } catch (error) {
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          console.log(`Rate limited during upload, retrying after ${delay}ms. Retries left: ${retries}`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return uploadWithRetry(data, retries - 1, delay * 2)
        }
        throw error
      }
    }

    const imageUri = await uploadWithRetry(new Uint8Array(imageBuffer))
    console.log("Image uploaded:", imageUri)

    // Create the metadata with retry logic
    console.log("Uploading metadata...")
    const uploadMetadataWithRetry = async (metadata: any, retries = 3, delay = 1000) => {
      try {
        return await metaplex.nfts().uploadMetadata(metadata)
      } catch (error) {
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          console.log(`Rate limited during metadata upload, retrying after ${delay}ms. Retries left: ${retries}`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return uploadMetadataWithRetry(metadata, retries - 1, delay * 2)
        }
        throw error
      }
    }

    const { uri } = await uploadMetadataWithRetry({
      name,
      description,
      image: imageUri,
      attributes,
    })
    console.log("Metadata uploaded:", uri)

    // Create the NFT with retry logic
    console.log("Creating NFT...")
    const createNFTWithRetry = async (createParams: any, retries = 3, delay = 1000) => {
      try {
        return await metaplex.nfts().create(createParams)
      } catch (error) {
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          console.log(`Rate limited during NFT creation, retrying after ${delay}ms. Retries left: ${retries}`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return createNFTWithRetry(createParams, retries - 1, delay * 2)
        }
        throw error
      }
    }

    const { nft } = await createNFTWithRetry({
      uri,
      name,
      sellerFeeBasisPoints: 500, // 5%
      symbol: "CARDFI",
    })
    console.log("NFT created:", nft.address.toString())

    return nft.address.toString()
  } catch (error) {
    console.error("Error minting NFT:", error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}
