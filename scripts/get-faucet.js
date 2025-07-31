const axios = require('axios');

async function getFaucet() {
    const walletAddress = '0x2c4bB3f1C250DA1b64a5Bc5AD2B0003C9A5F8a9b';
    
    console.log('🚰 Requesting CORE from faucet...');
    console.log('Wallet:', walletAddress);
    
    try {
        // Try Core faucet API
        const response = await axios.post('https://scan.test.btcs.network/api/faucet', {
            address: walletAddress
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ Faucet response:', response.data);
        
        // Wait a bit for transaction to be mined
        console.log('⏳ Waiting for transaction to be mined...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check balance
        const { exec } = require('child_process');
        exec('cast balance 0x2c4bB3f1C250DA1b64a5Bc5AD2B0003C9A5F8a9b --rpc-url https://rpc.test.btcs.network', (error, stdout, stderr) => {
            if (error) {
                console.error('Error checking balance:', error);
                return;
            }
            console.log('💰 New balance:', stdout.trim(), 'wei');
            
            const balanceEth = parseFloat(stdout.trim()) / 1e18;
            console.log('💰 Balance in CORE:', balanceEth.toFixed(4));
            
            if (balanceEth > 0) {
                console.log('🎉 Success! You can now deploy contracts.');
                console.log('\n📝 To deploy SimpleToken, run:');
                console.log('cd simple_token_deploy');
                console.log('forge script script/Deploy.s.sol --rpc-url https://rpc.test.btcs.network --broadcast --legacy --gas-price 2000000000');
            } else {
                console.log('❌ Faucet request may have failed. Please try manually:');
                console.log('Visit: https://scan.test.btcs.network/faucet');
                console.log('Address:', walletAddress);
            }
        });
        
    } catch (error) {
        console.error('❌ Faucet request failed:', error.message);
        console.log('\n🔗 Please request CORE manually from:');
        console.log('- https://scan.test.btcs.network/faucet');
        console.log('- https://bridge.coredao.org/faucet');
        console.log('\nWallet Address:', walletAddress);
    }
}

getFaucet();