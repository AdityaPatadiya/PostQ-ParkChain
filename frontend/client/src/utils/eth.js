import { ethers } from "ethers";

// WARNING: For production, do not hardcode addresses in code, load from env/DB.
export const BUSINESS_WALLET_ADDRESS = "0xYourBusinessWallet"; // <-- replace

// Option A: set a fixed rate (as fallback) and try to fetch live rate from CoinGecko
const FALLBACK_INR_PER_ETH = 250000; // update as needed

export async function fetchInrPerEth() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );
    const json = await res.json();
    const v = json?.ethereum?.inr;
    return typeof v === "number" && v > 0 ? v : FALLBACK_INR_PER_ETH;
  } catch (e) {
    return FALLBACK_INR_PER_ETH;
  }
}

export async function ensureWalletAndNetwork(targetChainIdHex = "0xaa36a7") {
  // default Sepolia (0xaa36a7). Use 0x1 for Ethereum mainnet.
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const network = await provider.send("eth_chainId", []);
  if (network?.toLowerCase() !== targetChainIdHex.toLowerCase()) {
    // Try switch
    await provider.send("wallet_switchEthereumChain", [
      { chainId: targetChainIdHex },
    ]);
  }
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function payInEthViaWallet({ amountEth, to = BUSINESS_WALLET_ADDRESS }) {
  if (!to || !ethers.isAddress(to)) throw new Error("Invalid destination address");
  const { signer } = await ensureWalletAndNetwork();
  const tx = await signer.sendTransaction({ to, value: ethers.parseEther(String(amountEth)) });
  // Wait for 1 confirmation on Sepolia; adjust confirmations for mainnet
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

export async function inrToEth(amountInInr) {
  const inrPerEth = await fetchInrPerEth();
  const eth = Number(amountInInr) / Number(inrPerEth);
  // round to 6 decimals for UX
  return Number(eth.toFixed(6));
}