const hre = require("hardhat");

async function main() {
  console.log("=== DEPLOYING TO CORE TESTNET ===");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", await hre.ethers.provider.getNetwork().then(n => n.chainId));
  
  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "CORE");
  
  // Deploy SimpleToken
  console.log("\n=== DEPLOYING SIMPLE TOKEN ===");
  
  // Compile the contract source directly
  const contractSource = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract SimpleToken {
        string public name;
        string public symbol;
        uint8 public decimals;
        uint256 public totalSupply;
        
        mapping(address => uint256) public balanceOf;
        mapping(address => mapping(address => uint256)) public allowance;
        
        address public owner;
        
        event Transfer(address indexed from, address indexed to, uint256 value);
        event Approval(address indexed owner, address indexed spender, uint256 value);
        event Mint(address indexed to, uint256 value);
        
        modifier onlyOwner() {
            require(msg.sender == owner, "Not owner");
            _;
        }
        
        constructor(
            string memory _name,
            string memory _symbol,
            uint8 _decimals,
            uint256 _initialSupply
        ) {
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
            owner = msg.sender;
            
            if (_initialSupply > 0) {
                totalSupply = _initialSupply;
                balanceOf[msg.sender] = _initialSupply;
                emit Transfer(address(0), msg.sender, _initialSupply);
            }
        }
        
        function transfer(address to, uint256 value) external returns (bool) {
            require(to != address(0), "Transfer to zero address");
            require(balanceOf[msg.sender] >= value, "Insufficient balance");
            
            balanceOf[msg.sender] -= value;
            balanceOf[to] += value;
            
            emit Transfer(msg.sender, to, value);
            return true;
        }
        
        function approve(address spender, uint256 value) external returns (bool) {
            allowance[msg.sender][spender] = value;
            emit Approval(msg.sender, spender, value);
            return true;
        }
        
        function transferFrom(address from, address to, uint256 value) external returns (bool) {
            require(to != address(0), "Transfer to zero address");
            require(balanceOf[from] >= value, "Insufficient balance");
            require(allowance[from][msg.sender] >= value, "Insufficient allowance");
            
            balanceOf[from] -= value;
            balanceOf[to] += value;
            allowance[from][msg.sender] -= value;
            
            emit Transfer(from, to, value);
            return true;
        }
        
        function mint(address to, uint256 value) external onlyOwner {
            require(to != address(0), "Mint to zero address");
            
            totalSupply += value;
            balanceOf[to] += value;
            
            emit Mint(to, value);
            emit Transfer(address(0), to, value);
        }
        
        function getInfo() external view returns (
            string memory _name,
            string memory _symbol,
            uint8 _decimals,
            uint256 _totalSupply,
            address _owner
        ) {
            return (name, symbol, decimals, totalSupply, owner);
        }
    }
  `;
  
  // Create contract factory
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken", {
    signer: deployer
  });
  
  // Deploy with constructor arguments
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  
  console.log("Deploying SimpleToken with:");
  console.log("- Name: CoreLiquid Test Token");
  console.log("- Symbol: CLT");
  console.log("- Decimals: 18");
  console.log("- Initial Supply:", hre.ethers.formatEther(initialSupply));
  
  const simpleToken = await SimpleToken.deploy(
    "CoreLiquid Test Token",
    "CLT",
    18,
    initialSupply
  );
  
  console.log("\n=== WAITING FOR DEPLOYMENT ===");
  await simpleToken.deployed();
  
  console.log("\n=== DEPLOYMENT SUCCESS ===");
  console.log("SimpleToken deployed to:", simpleToken.address);
  console.log("Transaction hash:", simpleToken.deployTransaction.hash);
  console.log("Block number:", simpleToken.deployTransaction.blockNumber);
  
  // Verify deployment
  console.log("\n=== VERIFYING DEPLOYMENT ===");
  const tokenName = await simpleToken.name();
  const tokenSymbol = await simpleToken.symbol();
  const tokenDecimals = await simpleToken.decimals();
  const tokenTotalSupply = await simpleToken.totalSupply();
  const tokenOwner = await simpleToken.owner();
  const deployerBalance = await simpleToken.balanceOf(deployer.address);
  
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Token Decimals:", tokenDecimals);
  console.log("Total Supply:", hre.ethers.formatEther(tokenTotalSupply));
  console.log("Owner:", tokenOwner);
  console.log("Deployer Balance:", hre.ethers.formatEther(deployerBalance));
  
  // Test minting
  console.log("\n=== TESTING MINT FUNCTION ===");
  const mintAmount = hre.ethers.parseEther("500000");
  const mintTx = await simpleToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  
  const newBalance = await simpleToken.balanceOf(deployer.address);
  const newTotalSupply = await simpleToken.totalSupply();
  
  console.log("Minted:", hre.ethers.formatEther(mintAmount));
  console.log("New Deployer Balance:", hre.ethers.formatEther(newBalance));
  console.log("New Total Supply:", hre.ethers.formatEther(newTotalSupply));
  console.log("Mint Transaction Hash:", mintTx.hash);
  
  console.log("\n=== BLOCKCHAIN VERIFICATION ===");
  console.log("Network: Core Testnet (Chain ID: 1114)");
  console.log("Contract Address:", simpleToken.address);
  console.log("Deployer Address:", deployer.address);
  
  console.log("\n=== EXPLORER LINKS ===");
  console.log(`Contract: https://scan.test2.btcs.network/address/${simpleToken.address}`);
  console.log(`Deploy Tx: https://scan.test2.btcs.network/tx/${simpleToken.deployTransaction.hash}`);
  console.log(`Mint Tx: https://scan.test2.btcs.network/tx/${mintTx.hash}`);
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("✅ Smart contract successfully deployed to Core blockchain!");
  console.log("✅ You can now verify the transactions on Core explorer.");
  console.log("✅ Contract is ready for use and testing.");
  
  return {
    contractAddress: simpleToken.address,
    deployTxHash: simpleToken.deployTransaction.hash,
    mintTxHash: mintTx.hash,
    explorerUrl: `https://scan.test2.btcs.network/address/${simpleToken.address}`
  };
}

main()
  .then((result) => {
    console.log("\n=== FINAL RESULT ===");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n=== DEPLOYMENT FAILED ===");
    console.error(error);
    process.exit(1);
  });