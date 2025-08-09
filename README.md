# CardFi

CardFi is a Web3-powered platform that unlocks liquidity from your trading cards by tokenizing them as NFTs and enabling collateralized lending.  
Built on the Solana blockchain for low fees and high transaction speed.

---

## 🚀 Features

- **NFT Tokenization of Graded Cards** — Mint NFTs backed by real, graded trading cards.
- **Collateralized Loans** — Borrow stablecoins using your NFT as collateral.
- **Peer-to-Peer Lending** — Fund loans from other users in exchange for interest.
- **Automated Loan Liquidation** — If loans default, NFTs are auctioned on the marketplace automatically.
- **Low Fees, High Speed** — Powered by Solana for a smooth DeFi experience.

---

## 🛠 How It Works

1. **Connect Your Wallet**  
   Connect your Solana wallet to the CardFi platform.

2. **Submit Your Card**  
   Provide details of your graded trading card (PSA, BGS, CGC, etc.).  
   Physical verification ensures authenticity before minting.

3. **Mint Your NFT**  
   Once verified, an NFT is minted representing your card on the blockchain.

4. **Get a Loan**  
   Use your NFT as collateral to request a stablecoin loan.  
   Loan-to-Value (LTV) ratio is based on historical lows of the card’s market price.

5. **Repay or Default**  
   - If repaid, NFT ownership returns to the borrower.  
   - If defaulted, the NFT is automatically auctioned to the highest bidder.

6. **Peer-to-Peer Lending**  
   Fund loan requests and earn interest, with repayment automated via smart contracts.

---

## 💡 Why Web3?

Unlike Web2 lending platforms, CardFi:
- Uses **NFTs** to enable true on-chain ownership and transferability.
- Enables **smart contract automation** for loan execution and liquidation.
- Supports **future interoperability** with other NFT lending platforms.

---

## 📦 Tech Stack

- **Frontend:** React / Next.js  
- **Blockchain:** Solana + Anchor  
- **Backend:** Node.js + Express  
- **Database:** PostgreSQL  
- **Smart Contracts:** Rust (Solana Programs)

---

## 🏦 Loan-to-Value (LTV) Policy

We determine LTV by:
- Web scraping market data from sources like PriceCharting and TCGPlayer.
- Using **historical low prices** to calculate the maximum borrowing limit.  
  Example: If a card’s current price is $100 but its historical low is $40, LTV is capped at 40% ($40 loan cap).

---

## 🌐 Demo

🔗 [Live Demo](https://your-demo-link.com)

---

## 📩 Contact
🐦 **X:** [@CardFiOfficial](https://x.com/cardfi_)
