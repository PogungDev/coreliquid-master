'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Coins, 
  Plus,
  ArrowRight,
  Shield,
  AlertTriangle,
  Activity,
  Target
} from 'lucide-react';

interface HealthFactorData {
  current: number;
  liquidationThreshold: number;
  status: 'safe' | 'warning' | 'critical';
  timeToLiquidation?: number;
}

interface RiskMetrics {
  collateralRatio: number;
  borrowCapacity: number;
  utilizationRate: number;
  liquidationPrice: number;
  maxBorrowAmount: number;
}

interface UserPosition {
  supplied: { [asset: string]: number };
  borrowed: { [asset: string]: number };
  collateralValue: number;
  borrowValue: number;
  availableToBorrow: number;
}

export default function LendingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [supplyAmount, setSupplyAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected] = useState(true);
  const [healthFactor, setHealthFactor] = useState<HealthFactorData>({
    current: 2.45,
    liquidationThreshold: 1.0,
    status: 'safe'
  });
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    collateralRatio: 245,
    borrowCapacity: 75.5,
    utilizationRate: 42.3,
    liquidationPrice: 1650,
    maxBorrowAmount: 15000
  });
  const [userPosition, setUserPosition] = useState<UserPosition>({
    supplied: { USDC: 25000, ETH: 5.5 },
    borrowed: { USDC: 8000, ETH: 1.2 },
    collateralValue: 36250,
    borrowValue: 10400,
    availableToBorrow: 12850
  });

  // Simplified lending data
  const lendingData = {
    overview: {
      totalSupplied: 2450000,
      totalBorrowed: 1890000,
      totalEarned: 125750,
      netAPY: 8.5
    },
    markets: [
      {
        asset: 'USDC',
        supplyAPY: 6.8,
        borrowAPY: 8.5,
        liquidity: 5600000,
        canSupply: true,
        canBorrow: true
      },
      {
        asset: 'ETH',
        supplyAPY: 4.2,
        borrowAPY: 6.8,
        liquidity: 8900000,
        canSupply: true,
        canBorrow: true
      }
    ]
  };

  const handleSupply = async () => {
    if (!selectedAsset || !supplyAmount) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Supply Successful",
        description: `Successfully supplied ${supplyAmount} ${selectedAsset}`,
      });
      
      setSupplyDialogOpen(false);
      setSupplyAmount('');
    } catch (error) {
      toast({
        title: "Supply Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!selectedAsset || !borrowAmount) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Borrow Successful",
        description: `Successfully borrowed ${borrowAmount} ${selectedAsset}`,
      });
      
      setBorrowDialogOpen(false);
      setBorrowAmount('');
    } catch (error) {
      toast({
        title: "Borrow Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lending & Borrowing</h1>
          <p className="text-muted-foreground mt-1">
            Supply assets to earn yield or borrow against your collateral
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
          <Button onClick={() => setSupplyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Supply
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Supplied</p>
                <p className="text-2xl font-bold">{formatCurrency(lendingData.overview.totalSupplied)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Borrowed</p>
                <p className="text-2xl font-bold">{formatCurrency(lendingData.overview.totalBorrowed)}</p>
              </div>
              <Coins className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(lendingData.overview.totalEarned)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net APY</p>
                <p className="text-2xl font-bold">{lendingData.overview.netAPY}%</p>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Markets</CardTitle>
          <CardDescription>Available lending and borrowing markets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lendingData.markets.map((market) => (
              <div key={market.asset} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {market.asset.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{market.asset}</h3>
                    <p className="text-sm text-muted-foreground">{formatCurrency(market.liquidity)} available</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Supply APY</p>
                    <p className="font-medium text-green-600">{market.supplyAPY}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Borrow APY</p>
                    <p className="font-medium text-orange-600">{market.borrowAPY}%</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSupplyDialogOpen(true)}>
                      Supply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setBorrowDialogOpen(true)}>
                      Borrow
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supply Dialog */}
      <Dialog open={supplyDialogOpen} onOpenChange={setSupplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supply Asset</DialogTitle>
            <DialogDescription>
              Supply assets to earn yield and use as collateral
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supply-asset">Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset to supply" />
                </SelectTrigger>
                <SelectContent>
                  {lendingData.markets.filter(m => m.canSupply).map((market) => (
                    <SelectItem key={market.asset} value={market.asset}>
                      {market.asset} - {market.supplyAPY}% APY
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supply-amount">Amount</Label>
              <Input
                id="supply-amount"
                type="number"
                placeholder="0.0"
                value={supplyAmount}
                onChange={(e) => setSupplyAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSupply} disabled={loading || !selectedAsset || !supplyAmount}>
              {loading ? "Processing..." : "Supply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Borrow Dialog */}
      <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Asset</DialogTitle>
            <DialogDescription>
              Borrow assets against your collateral
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="borrow-asset">Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset to borrow" />
                </SelectTrigger>
                <SelectContent>
                  {lendingData.markets.filter(m => m.canBorrow).map((market) => (
                    <SelectItem key={market.asset} value={market.asset}>
                      {market.asset} - {market.borrowAPY}% APY
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="borrow-amount">Amount</Label>
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.0"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBorrowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBorrow} disabled={loading || !selectedAsset || !borrowAmount}>
              {loading ? "Processing..." : "Borrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}