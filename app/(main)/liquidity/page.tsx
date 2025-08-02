'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { CoreFluidXContracts } from '@/lib/contracts';
import { CONTRACT_ADDRESSES } from '@/lib/wagmi';
import { 
  Droplets, 
  TrendingUp, 
  ArrowUpDown, 
  Coins, 
  BarChart3, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Copy
} from 'lucide-react';

export default function LiquidityPage() {
  const { address, isConnected } = useAccount();
  const [contracts, setContracts] = useState<CoreFluidXContracts | null>(null);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [supportedAssets, setSupportedAssets] = useState<string[]>([]);
  const [userBalances, setUserBalances] = useState<{[key: string]: string}>({});
  const [totalLiquidity, setTotalLiquidity] = useState<{[key: string]: string}>({});
  const [availableLiquidity, setAvailableLiquidity] = useState<{[key: string]: string}>({});
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  // Initialize contracts
  useEffect(() => {
    if (isConnected && window.ethereum) {
      const initContracts = async () => {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new CoreFluidXContracts(provider, signer);
          setContracts(contractInstance);
        } catch (err) {
          console.error('Failed to initialize contracts:', err);
          setError('Failed to initialize contracts');
        }
      };
      initContracts();
    }
  }, [isConnected]);

  // Load supported assets and balances
  useEffect(() => {
    if (contracts && address) {
      loadData();
    }
  }, [contracts, address]);

  const loadData = async () => {
    if (!contracts || !address) return;
    
    try {
      setLoading(true);
      
      // Get supported assets
      const assets = await contracts.getSimpleTULLSupportedAssets();
      setSupportedAssets(assets);
      
      if (assets.length > 0 && !selectedAsset) {
        setSelectedAsset(assets[0]);
      }
      
      // Get balances and liquidity for each asset
      const balances: {[key: string]: string} = {};
      const totalLiq: {[key: string]: string} = {};
      const availLiq: {[key: string]: string} = {};
      
      for (const asset of assets) {
        balances[asset] = await contracts.getSimpleTULLUserBalance(address, asset);
        totalLiq[asset] = await contracts.getSimpleTULLTotalLiquidity(asset);
        availLiq[asset] = await contracts.getSimpleTULLAvailableLiquidity(asset);
      }
      
      setUserBalances(balances);
      setTotalLiquidity(totalLiq);
      setAvailableLiquidity(availLiq);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!contracts || !address || !selectedAsset || !depositAmount) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = await contracts.depositToSimpleTULL(selectedAsset, depositAmount, address);
      setTxHash(tx.hash);
      
      await tx.wait();
      
      // Reload data
      await loadData();
      setDepositAmount('');
      
    } catch (err: any) {
      console.error('Deposit failed:', err);
      setError(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contracts || !address || !selectedAsset || !withdrawAmount) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = await contracts.withdrawFromSimpleTULL(selectedAsset, withdrawAmount, address);
      setTxHash(tx.hash);
      
      await tx.wait();
      
      // Reload data
      await loadData();
      setWithdrawAmount('');
      
    } catch (err: any) {
      console.error('Withdraw failed:', err);
      setError(err.message || 'Withdraw failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access SimpleTULL
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SimpleTULL Liquidity</h1>
          <p className="text-muted-foreground">Manage your liquidity in the True Unified Liquidity Layer</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Droplets className="mr-1 h-3 w-3" />
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Badge>
          <Button onClick={loadData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(txHash)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Select Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose asset" />
              </SelectTrigger>
              <SelectContent>
                {supportedAssets.map((asset) => (
                  <SelectItem key={asset} value={asset}>
                    {asset === CONTRACT_ADDRESSES.SIMPLE_TULL ? 'CORE Token' : 
                     asset.slice(0, 6) + '...' + asset.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedAsset && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Balance:</span>
                  <span className="font-mono">{userBalances[selectedAsset] || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Liquidity:</span>
                  <span className="font-mono">{totalLiquidity[selectedAsset] || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-mono">{availableLiquidity[selectedAsset] || '0'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownRight className="mr-2 h-5 w-5 text-green-500" />
              Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={loading || !selectedAsset}
            />
            <Button 
              onClick={handleDeposit} 
              disabled={loading || !depositAmount || !selectedAsset}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Deposit
            </Button>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpRight className="mr-2 h-5 w-5 text-red-500" />
              Withdraw
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={loading || !selectedAsset}
            />
            <Button 
              onClick={handleWithdraw} 
              disabled={loading || !withdrawAmount || !selectedAsset}
              className="w-full"
              variant="destructive"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Minus className="mr-2 h-4 w-4" />
              )}
              Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Liquidity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedAssets.map((asset) => {
              const total = parseFloat(totalLiquidity[asset] || '0');
              const available = parseFloat(availableLiquidity[asset] || '0');
              const utilized = total - available;
              const utilizationRate = total > 0 ? (utilized / total) * 100 : 0;
              
              return (
                <Card key={asset} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {asset === CONTRACT_ADDRESSES.SIMPLE_TULL ? 'CORE' : asset.slice(0, 8)}
                      </span>
                      <Badge variant={utilizationRate > 80 ? 'destructive' : utilizationRate > 60 ? 'default' : 'secondary'}>
                        {utilizationRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={utilizationRate} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {utilized.toFixed(4)} / {total.toFixed(4)} utilized
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">SimpleTULL Address:</span>
              <div className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {CONTRACT_ADDRESSES.SIMPLE_TULL}
                <Button size="sm" variant="ghost" className="ml-2 h-6 w-6 p-0" 
                        onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESSES.SIMPLE_TULL)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <span className="font-medium">Network:</span>
              <div className="mt-1">Anvil Local (Chain ID: 31337)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}