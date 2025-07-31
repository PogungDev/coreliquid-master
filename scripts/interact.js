const { ethers } = require('hardhat');

// Contract addresses from deployment
const CONTRACTS = {
  StCOREToken: '0xBb2180ebd78ce97360503434eD37fcf4a1Df61c3',
  CoreNativeStaking: '0xDB8cFf278adCCF9E9b5da745B44E754fC4EE3C76',
  UnifiedLiquidityPool: '0x50EEf481cae4250d252Ae577A09bF514f224C6C4',
  CoreLiquidProtocol: '0x978e3286EB805934215a88694d80b09aDed68D90'
};

async function main() {
  console.log('🚀 Starting CoreLiquid Protocol interaction...');
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('📝 Using account:', signer.address);
  
  try {
    // Get StCOREToken contract
    const StCOREToken = await ethers.getContractAt('StCOREToken', CONTRACTS.StCOREToken);
    
    // Check total supply
    const totalSupply = await StCOREToken.totalSupply();
    console.log('💰 StCORE Total Supply:', ethers.utils.formatEther(totalSupply), 'stCORE');
    
    // Check exchange rate
    const exchangeRate = await StCOREToken.getExchangeRate();
    console.log('📊 Exchange Rate:', ethers.utils.formatEther(exchangeRate));
    
    // Get CoreNativeStaking contract
    const CoreNativeStaking = await ethers.getContractAt('CoreNativeStaking', CONTRACTS.CoreNativeStaking);
    
    // Check staking stats
    const totalStaked = await CoreNativeStaking.totalStaked();
    console.log('🔒 Total Staked:', ethers.utils.formatEther(totalStaked), 'CORE');
    
    // Get protocol stats
    const CoreLiquidProtocol = await ethers.getContractAt('CoreLiquidProtocol', CONTRACTS.CoreLiquidProtocol);
    
    // Check if protocol is paused
    const isPaused = await CoreLiquidProtocol.paused();
    console.log('⏸️  Protocol Paused:', isPaused);
    
    console.log('\n✅ Successfully interacted with CoreLiquid Protocol!');
    console.log('🔗 View transactions on Core Explorer: https://scan.test2.btcs.network/');
    console.log('📋 Contract Addresses:');
    Object.entries(CONTRACTS).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('❌ Error interacting with contracts:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });