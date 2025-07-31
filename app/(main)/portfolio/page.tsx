"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Settings
} from "lucide-react";

interface PortfolioPosition {
  id: string;
  strategy: string;
  amount: number;
  value: number;
  apy: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
  status: 'Active' | 'Pending' | 'Withdrawn';
  entryDate: string;
  lastUpdate: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalDeposited: number;
  totalPnL: number;
  totalPnLPercentage: number;
  totalYieldEarned: number;
  averageAPY: number;
  activePositions: number;
  riskScore: number;
}

interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Yield' | 'Rebalance' | 'Liquidation';
  strategy: string;
  amount: number;
  value: number;
  timestamp: string;
  txHash: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

interface AssetAllocation {
  asset: string;
  amount: number;
  value: number;
  percentage: number;
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
}

export default function PortfolioPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 125000,
    totalDeposited: 100000,
    totalPnL: 25000,
    totalPnLPercentage: 25.0,
    totalYieldEarned: 18500,
    averageAPY: 12.8,
    activePositions: 6,
    riskScore: 6.5
  });

  const [positions, setPositions] = useState<PortfolioPosition[]>([
    {
      id: "pos-1",
      strategy: "ETH-USDC LP Strategy",
      amount: 45000,
      value: 52000,
      apy: 15.2,
      pnl: 7000,
      pnlPercentage: 15.6,
      allocation: 41.6,
      status: "Active",
      entryDate: "2024-01-01",
      lastUpdate: "2024-01-14"
    },
    {
      id: "pos-2",
      strategy: "BTC-ETH LP Strategy",
      amount: 30000,
      value: 35000,
      apy: 13.8,
      pnl: 5000,
      pnlPercentage: 16.7,
      allocation: 28.0,
      status: "Active",
      entryDate: "2024-01-05",
      lastUpdate: "2024-01-14"
    },
    {
      id: "pos-3",
      strategy: "Stable Coin Yield",
      amount: 15000,
      value: 16200,
      apy: 8.5,
      pnl: 1200,
      pnlPercentage: 8.0,
      allocation: 13.0,
      status: "Active",
      entryDate: "2024-01-10",
      lastUpdate: "2024-01-14"
    },
    {
      id: "pos-4",
      strategy: "High Yield DeFi",
      amount: 8000,
      value: 10500,
      apy: 22.3,
      pnl: 2500,
      pnlPercentage: 31.3,
      allocation: 8.4,
      status: "Active",
      entryDate: "2024-01-08",
      lastUpdate: "2024-01-14"
    },
    {
      id: "pos-5",
      strategy: "Conservative Bond",
      amount: 10000,
      value: 10800,
      apy: 6.2,
      pnl: 800,
      pnlPercentage: 8.0,
      allocation: 8.6,
      status: "Active",
      entryDate: "2024-01-03",
      lastUpdate: "2024-01-14"
    },
    {
      id: "pos-6",
      strategy: "Arbitrage Strategy",
      amount: 2000,
      value: 500,
      apy: 18.7,
      pnl: -1500,
      pnlPercentage: -75.0,
      allocation: 0.4,
      status: "Pending",
      entryDate: "2024-01-12",
      lastUpdate: "2024-01-14"
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      type: "Deposit",
      strategy: "ETH-USDC LP Strategy",
      amount: 45000,
      value: 45000,
      timestamp: "2024-01-14T10:30:00Z",
      txHash: "0x1234...5678",
      status: "Completed"
    },
    {
      id: "tx-2",
      type: "Yield",
      strategy: "BTC-ETH LP Strategy",
      amount: 850,
      value: 850,
      timestamp: "2024-01-14T08:15:00Z",
      txHash: "0x2345...6789",
      status: "Completed"
    },
    {
      id: "tx-3",
      type: "Rebalance",
      strategy: "High Yield DeFi",
      amount: 2500,
      value: 2500,
      timestamp: "2024-01-13T16:45:00Z",
      txHash: "0x3456...7890",
      status: "Completed"
    },
    {
      id: "tx-4",
      type: "Withdraw",
      strategy: "Conservative Bond",
      amount: 5000,
      value: 5200,
      timestamp: "2024-01-13T14:20:00Z",
      txHash: "0x4567...8901",
      status: "Completed"
    },
    {
      id: "tx-5",
      type: "Deposit",
      strategy: "Arbitrage Strategy",
      amount: 2000,
      value: 2000,
      timestamp: "2024-01-12T11:10:00Z",
      txHash: "0x5678...9012",
      status: "Pending"
    }
  ]);

  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([
    {
      asset: "ETH",
      amount: 28.5,
      value: 65000,
      percentage: 52.0,
      apy: 14.2,
      risk: "Medium"
    },
    {
      asset: "USDC",
      amount: 25000,
      value: 25000,
      percentage: 20.0,
      apy: 8.5,
      risk: "Low"
    },
    {
      asset: "BTC",
      amount: 0.8,
      value: 20000,
      percentage: 16.0,
      apy: 13.8,
      risk: "Medium"
    },
    {
      asset: "WBTC",
      amount: 0.4,
      value: 10000,
      percentage: 8.0,
      apy: 12.1,
      risk: "Medium"
    },
    {
      asset: "DAI",
      amount: 5000,
      value: 5000,
      percentage: 4.0,
      apy: 6.2,
      risk: "Low"
    }
  ]);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setProvider(provider);
        setAccount(address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const refreshPortfolio = async () => {
    setLoading(true);
    try {
      // Simulate API call to refresh portfolio data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Portfolio Refreshed",
        description: "Your portfolio data has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh portfolio data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPortfolio = () => {
    const data = {
      summary: portfolioSummary,
      positions: positions,
      transactions: transactions,
      assetAllocation: assetAllocation,
      exportedAt: new Date().toISOString(),
      account: account
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${account.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Portfolio Exported",
      description: "Your portfolio data has been exported successfully",
    });
  };

  const formatCurrency = (value: number) => {
    if (hideBalances) return "****";
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    if (hideBalances) return "**%";
    const color = value >= 0 ? "text-green-600" : "text-red-600";
    const icon = value >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />;
    return (
      <span className={`flex items-center ${color} font-medium`}>
        {icon}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Withdrawn': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Deposit': return 'text-green-600 bg-green-100';
      case 'Withdraw': return 'text-red-600 bg-red-100';
      case 'Yield': return 'text-blue-600 bg-blue-100';
      case 'Rebalance': return 'text-purple-600 bg-purple-100';
      case 'Liquidation': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            {isConnected ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect your wallet to view portfolio"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setHideBalances(!hideBalances)}
            variant="outline"
            size="sm"
          >
            {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            onClick={refreshPortfolio}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportPortfolio} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect your wallet to view your portfolio and manage your positions
            </p>
            <Button onClick={connectWallet}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {formatPercentage(portfolioSummary.totalPnLPercentage)}
                  <span className="ml-1">from deposits</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(portfolioSummary.totalPnL)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unrealized gains/losses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yield Earned</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(portfolioSummary.totalYieldEarned)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average APY: {hideBalances ? "**%" : `${portfolioSummary.averageAPY}%`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hideBalances ? "**" : portfolioSummary.riskScore}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolioSummary.activePositions} active positions
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription>Your portfolio performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Performance Chart</p>
                        <p className="text-xs text-gray-400">Chart component would be integrated here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Distribution</CardTitle>
                    <CardDescription>Your asset allocation breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assetAllocation.slice(0, 5).map((asset, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold">{asset.asset}</span>
                            </div>
                            <div>
                              <p className="font-medium">{asset.asset}</p>
                              <p className="text-sm text-muted-foreground">
                                {hideBalances ? "****" : asset.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(asset.value)}</p>
                            <p className="text-sm text-muted-foreground">
                              {hideBalances ? "**%" : `${asset.percentage}%`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Positions</CardTitle>
                  <CardDescription>Your current positions across all strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Strategy</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Current Value</th>
                          <th className="text-left p-2">APY</th>
                          <th className="text-left p-2">P&L</th>
                          <th className="text-left p-2">Allocation</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position) => (
                          <tr key={position.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{position.strategy}</td>
                            <td className="p-2">{formatCurrency(position.amount)}</td>
                            <td className="p-2 font-bold">{formatCurrency(position.value)}</td>
                            <td className="p-2 text-green-600 font-medium">
                              {hideBalances ? "**%" : `${position.apy}%`}
                            </td>
                            <td className="p-2">
                              <div className="flex flex-col">
                                <span className={position.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(Math.abs(position.pnl))}
                                </span>
                                {formatPercentage(position.pnlPercentage)}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <Progress value={position.allocation} className="w-16" />
                                <span className="text-sm">
                                  {hideBalances ? "**%" : `${position.allocation}%`}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge className={getStatusColor(position.status)}>
                                {position.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline">
                                  Manage
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent transactions and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Strategy</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Value</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <Badge className={getTransactionTypeColor(tx.type)}>
                                {tx.type}
                              </Badge>
                            </td>
                            <td className="p-2">{tx.strategy}</td>
                            <td className="p-2">{formatCurrency(tx.amount)}</td>
                            <td className="p-2 font-medium">{formatCurrency(tx.value)}</td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td className="p-2">
                              <Badge variant={tx.status === 'Completed' ? 'default' : 
                                tx.status === 'Pending' ? 'secondary' : 'destructive'}>
                                {tx.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <a 
                                href={`https://etherscan.io/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Detailed breakdown of your asset allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Asset</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Value</th>
                          <th className="text-left p-2">Percentage</th>
                          <th className="text-left p-2">APY</th>
                          <th className="text-left p-2">Risk Level</th>
                          <th className="text-left p-2">Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetAllocation.map((asset, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-bold">{asset.asset.slice(0, 2)}</span>
                                </div>
                                <span className="font-medium">{asset.asset}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              {hideBalances ? "****" : asset.amount.toLocaleString()}
                            </td>
                            <td className="p-2 font-bold">{formatCurrency(asset.value)}</td>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <Progress value={asset.percentage} className="w-16" />
                                <span>{hideBalances ? "**%" : `${asset.percentage}%`}</span>
                              </div>
                            </td>
                            <td className="p-2 text-green-600 font-medium">
                              {hideBalances ? "**%" : `${asset.apy}%`}
                            </td>
                            <td className="p-2">
                              <Badge className={getRiskColor(asset.risk)}>
                                {asset.risk}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Progress value={asset.percentage} className="w-20" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}