require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";
const OPTIMISM_API_KEY = process.env.OPTIMISM_API_KEY || "";
const CORE_RPC_URL = process.env.CORE_RPC_URL || "https://rpc.coredao.org";
const CORE_TESTNET_RPC_URL = process.env.CORE_TESTNET_RPC_URL || "https://rpc.test.btcs.network";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  
  networks: {
    hardhat: {
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
        enabled: false,
      },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
    },
    
    // Ethereum networks
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 1,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    // Core Blockchain networks
    core: {
      url: CORE_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1116,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    coreTestnet: {
      url: CORE_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1114,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    // Polygon networks
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    // Arbitrum networks
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 42161,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    arbitrumGoerli: {
      url: `https://arbitrum-goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 421613,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    // Optimism networks
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 10,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    optimismGoerli: {
      url: `https://optimism-goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 420,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    // BSC networks
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      accounts: [PRIVATE_KEY],
      chainId: 56,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
    
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [PRIVATE_KEY],
      chainId: 97,
      gas: "auto",
      gasPrice: "auto",
      timeout: 300000,
    },
  },
  
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      arbitrumGoerli: ARBISCAN_API_KEY,
      optimisticEthereum: OPTIMISM_API_KEY,
      optimisticGoerli: OPTIMISM_API_KEY,
      bsc: "YourBscScanApiKey",
      bscTestnet: "YourBscScanApiKey",
    },
    customChains: [
      {
        network: "core",
        chainId: 1116,
        urls: {
          apiURL: "https://openapi.coredao.org/api",
          browserURL: "https://scan.coredao.org"
        }
      },
      {
        network: "coreTestnet",
        chainId: 1115,
        urls: {
          apiURL: "https://api.test.btcs.network/api",
          browserURL: "https://scan.test.btcs.network"
        }
      }
    ]
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },
  
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  
  mocha: {
    timeout: 300000, // 5 minutes
    retries: 2,
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deployments: "./deployments",
  },


  
  // Custom tasks
  tasks: {
    compile: {
      clear: true,
    },
  },
  
  // Compiler settings for different contract types
  overrides: {
    "contracts/CoreLiquidProtocol.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 100, // Lower runs for main contract to reduce size
        },
        viaIR: true,
      },
    },
    "contracts/deposit/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
    "contracts/lending/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
    "contracts/yield/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
    "contracts/vault/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
    "contracts/rebalance/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
    "contracts/apr/*.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true,
      },
    },
  },
  
  // Warnings settings
  warnings: {
    "contracts/**/*": {
      "code-size": "error",
      "unused-param": "warn",
      "unused-var": "warn",
      "unreachable-code": "error",
    },
  },
};