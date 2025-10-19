require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337
    },
    // BlockDAG Testnet configuration
    blockdag_testnet: {
      url: process.env.BLOCKDAG_TESTNET_RPC_URL || "https://rpc.awakening.bdagscan.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.BLOCKDAG_TESTNET_CHAIN_ID || "1043"),
      gasPrice: "auto"
    },
    // BlockDAG Mainnet configuration
    blockdag_mainnet: {
      url: process.env.BLOCKDAG_MAINNET_RPC_URL || "https://rpc.blockdag.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.BLOCKDAG_MAINNET_CHAIN_ID || "0"),
      gasPrice: "auto"
    }
  },
  etherscan: {
    // BlockDAG block explorer API configuration
    apiKey: {
      blockdag_testnet: process.env.BLOCKDAG_EXPLORER_API_KEY || "",
      blockdag_mainnet: process.env.BLOCKDAG_EXPLORER_API_KEY || ""
    },
    customChains: [
      {
        network: "blockdag_testnet",
        chainId: parseInt(process.env.BLOCKDAG_TESTNET_CHAIN_ID || "1043"),
        urls: {
          apiURL: process.env.BLOCKDAG_EXPLORER_API_URL || "",
          browserURL: process.env.BLOCKDAG_EXPLORER_URL || "https://awakening.bdagscan.com/"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

