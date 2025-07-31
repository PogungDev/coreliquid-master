const { ethers } = require("hardhat");

async function main() {
    console.log("\n=== Core Testnet Simple Token Deployment ===");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await deployer.getBalance();
    
    console.log("\n📋 Deployment Info:");
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} CORE`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Chain ID: ${hre.network.config.chainId}`);
    
    if (balance.eq(0)) {
        console.log("\n⚠️  No CORE tokens found!");
        console.log("Please get testnet CORE from faucet:");
        console.log("🚰 Core Testnet Faucet: https://scan.test.btcs.network/faucet");
        console.log("📋 Your address:", deployerAddress);
        return;
    }
    
    // Deploy SimpleToken contract inline to avoid compilation issues
    console.log("\n🚀 Deploying SimpleToken...");
    
    const SimpleTokenSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;
        
        contract SimpleToken {
            string public name = "CoreLiquid Test Token";
            string public symbol = "CLT";
            uint8 public decimals = 18;
            uint256 public totalSupply;
            
            mapping(address => uint256) public balanceOf;
            mapping(address => mapping(address => uint256)) public allowance;
            
            address public owner;
            
            event Transfer(address indexed from, address indexed to, uint256 value);
            event Approval(address indexed owner, address indexed spender, uint256 value);
            event Mint(address indexed to, address indexed by, uint256 value);
            
            modifier onlyOwner() {
                require(msg.sender == owner, "Not owner");
                _;
            }
            
            constructor(uint256 _initialSupply) {
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
                
                emit Mint(to, msg.sender, value);
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
    
    // Contract parameters
    const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1M tokens
    
    console.log(`Initial Supply: ${ethers.utils.formatUnits(initialSupply, 18)} CLT`);
    
    // Create contract factory from source
    const SimpleTokenFactory = await ethers.getContractFactory("SimpleToken", {
        contractName: "SimpleToken",
        sourceName: "contracts/SimpleToken.sol"
    });
    
    // Deploy contract
    const token = await SimpleTokenFactory.deploy(initialSupply, {
        gasLimit: 3000000
    });
    
    console.log("\n⏳ Waiting for deployment...");
    await token.deployed();
    
    const contractAddress = token.address;
    const deployTxHash = token.deployTransaction.hash;
    
    console.log("\n✅ Deployment Successful!");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Deploy Transaction: ${deployTxHash}`);
    
    // Verify deployment by calling contract functions
    console.log("\n🔍 Verifying deployment...");
    try {
        const info = await token.getInfo();
        const deployerBalance = await token.balanceOf(deployerAddress);
        
        console.log(`Contract Name: ${info[0]}`);
        console.log(`Contract Symbol: ${info[1]}`);
        console.log(`Contract Decimals: ${info[2]}`);
        console.log(`Total Supply: ${ethers.utils.formatUnits(info[3], info[2])} ${info[1]}`);
        console.log(`Owner: ${info[4]}`);
        console.log(`Deployer Balance: ${ethers.utils.formatUnits(deployerBalance, info[2])} ${info[1]}`);
        
        // Test mint function
        console.log("\n🪙 Testing mint function...");
        const mintAmount = ethers.utils.parseUnits("10000", 18);
        const mintTx = await token.mint(deployerAddress, mintAmount, {
            gasLimit: 100000
        });
        await mintTx.wait();
        
        const newBalance = await token.balanceOf(deployerAddress);
        const newTotalSupply = await token.totalSupply();
        
        console.log(`Mint Transaction: ${mintTx.hash}`);
        console.log(`New Deployer Balance: ${ethers.utils.formatUnits(newBalance, 18)} CLT`);
        console.log(`New Total Supply: ${ethers.utils.formatUnits(newTotalSupply, 18)} CLT`);
        
        // Explorer links
        console.log("\n🔗 Core Testnet Explorer Links:");
        console.log(`Contract: https://scan.test.btcs.network/address/${contractAddress}`);
        console.log(`Deploy Tx: https://scan.test.btcs.network/tx/${deployTxHash}`);
        console.log(`Mint Tx: https://scan.test.btcs.network/tx/${mintTx.hash}`);
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("\n📝 Summary:");
        console.log(`- Contract deployed at: ${contractAddress}`);
        console.log(`- Total supply: ${ethers.utils.formatUnits(newTotalSupply, 18)} CLT`);
        console.log(`- Deployer owns: ${ethers.utils.formatUnits(newBalance, 18)} CLT`);
        console.log(`- Network: Core Testnet (Chain ID: ${hre.network.config.chainId})`);
        console.log(`- Explorer: https://scan.test.btcs.network/address/${contractAddress}`);
        
    } catch (error) {
        console.error("\n❌ Verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });