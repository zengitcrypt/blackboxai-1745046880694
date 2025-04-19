// wallet.js - Handles wallet connection logic and UI interactions

document.addEventListener("DOMContentLoaded", () => {
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const walletModal = document.getElementById("walletModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const walletOptionsContainer = document.getElementById("walletOptions");
  const walletError = document.getElementById("walletError");

  // Utility to abbreviate wallet address
  function abbreviateAddress(address) {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  // Show modal
  function showModal() {
    walletError.textContent = "";
    walletModal.classList.add("show");
    walletModal.classList.remove("hidden");
  }

  // Hide modal
  function hideModal() {
    walletModal.classList.remove("show");
    walletModal.classList.add("hidden");
  }

  // Disable wallet buttons during connection attempt
  function setWalletButtonsDisabled(disabled) {
    const buttons = walletOptionsContainer.querySelectorAll(".wallet-card");
    buttons.forEach((btn) => {
      btn.style.pointerEvents = disabled ? "none" : "auto";
      btn.style.opacity = disabled ? "0.6" : "1";
    });
  }

  // Connect MetaMask wallet
  async function connectMetaMask() {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask extension not found. Please install it.");
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }
      return accounts[0];
    } catch (err) {
      throw new Error("Could not connect to MetaMask. " + err.message);
    }
  }

  // Connect WalletConnect wallet
  async function connectWalletConnect() {
    // Load WalletConnect provider dynamically
    if (typeof WalletConnectProvider === "undefined") {
      throw new Error("WalletConnect library not loaded.");
    }
    try {
      const provider = new WalletConnectProvider.default({
        rpc: {
          1: "https://mainnet.infura.io/v3/your-infura-project-id",
          56: "https://bsc-dataseed.binance.org/"
        }
      });
      await provider.enable();
      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found.");
      }
      // You may want to save provider for later use (e.g., disconnect)
      window.walletConnectProvider = provider;
      return accounts[0];
    } catch (err) {
      throw new Error("Could not connect to WalletConnect. " + err.message);
    }
  }

  // Map wallet id to connection function
  const walletConnectors = {
    metamask: connectMetaMask,
    trustwallet: connectTrustWallet,
    telegram: connectTelegramWallet
  };

  // Connect Trust Wallet (using WalletConnect provider)
  async function connectTrustWallet() {
    if (typeof WalletConnectProvider === "undefined") {
      throw new Error("WalletConnect library not loaded.");
    }
    try {
      const provider = new WalletConnectProvider.default({
        rpc: {
          1: "https://mainnet.infura.io/v3/your-infura-project-id",
          56: "https://bsc-dataseed.binance.org/"
        }
      });
      await provider.enable();
      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found.");
      }
      window.walletConnectProvider = provider;
      return accounts[0];
    } catch (err) {
      throw new Error("Could not connect to Trust Wallet. " + err.message);
    }
  }

  // Connect Telegram Wallet (placeholder)
  async function connectTelegramWallet() {
    // Telegram Wallet connection logic is not standard; show error or instructions
    throw new Error("Telegram Wallet connection is not supported yet.");
  }

  // Generate wallet option cards dynamically
  function generateWalletOptions() {
    walletOptionsContainer.innerHTML = "";
    walletConfig.wallets.forEach((wallet) => {
      // Show all wallets in the modal
      const card = document.createElement("button");
      card.className = "wallet-card";
      card.setAttribute("type", "button");
      card.setAttribute("aria-label", `Connect to ${wallet.displayName}`);

      const img = document.createElement("img");
      img.src = wallet.iconUrl;
      img.alt = wallet.displayName + " icon";
      img.className = "wallet-icon";

      const name = document.createElement("span");
      name.textContent = wallet.displayName;
      name.className = "wallet-name";

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener("click", async () => {
        walletError.textContent = "";
        setWalletButtonsDisabled(true);
        try {
          const connectFn = walletConnectors[wallet.id];
          if (!connectFn) {
            throw new Error(`No connector function found for ${wallet.displayName}`);
          }
          const account = await connectFn();
          hideModal();
          connectWalletBtn.textContent = abbreviateAddress(account);
          // After connection, initialize staking contracts and UI
          if (typeof initialiseContracts === "function") {
            initialiseContracts();
          }
        } catch (err) {
          walletError.textContent = err.message;
          console.error(err);
        } finally {
          setWalletButtonsDisabled(false);
        }
      });

      walletOptionsContainer.appendChild(card);
    });
  }

  // Event listeners
  connectWalletBtn.addEventListener("click", () => {
    generateWalletOptions();
    showModal();
  });

  closeModalBtn.addEventListener("click", () => {
    hideModal();
  });

  // Close modal on outside click
  walletModal.addEventListener("click", (event) => {
    if (event.target === walletModal) {
      hideModal();
    }
  });

  // Accessibility: close modal on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && walletModal.classList.contains("show")) {
      hideModal();
    }
  });
});
