"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  Eye,
  AlertCircle
} from "lucide-react";

interface ContractHealth {
  name: string;
  address: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastBlock: number;
  gasUsage: number;
  transactionCount: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  contract?: string;
  resolved: boolean;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

export default function MonitoringPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const [contractsHealth, setContractsHealth] = useState<ContractHealth[]>([
    {
      name: "CoreLiquidProtocol",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
      status: "healthy",
      lastBlock: 12345678,
      gasUsage: 150000,
      transactionCount: 1250,
      errorRate: 0.2,
      responseTime: 250,
      uptime: 99.9
    },
    {
      name: "DepositManager",
      address: "0x123a456b789c012d345e678f901a234b567c890d",
      status: "healthy",
      lastBlock: 12345677,
      gasUsage: 120000,
      transactionCount: 890,
      errorRate: 0.1,
      responseTime: 180,
      uptime: 99.8
    },
    {
      name: "APROptimizer",
      address: "0x456b789c012d345e678f901a234b567c890d123e",
      status: "warning",
      lastBlock: 12345675,
      gasUsage: 180000,
      transactionCount: 450,
      errorRate: 1.2,
      responseTime: 450,
      uptime: 98.5
    },
    {
      name: "AutoRebalanceManager",
      address: "0x789c012d345e678f901a234b567c890d123e456f",
      status: "healthy",
      lastBlock: 12345678,
      gasUsage: 200000,
      transactionCount: 320,
      errorRate: 0.3,
      responseTime: 300,
      uptime: 99.7
    },
    {
      name: "YieldAggregator",
      address: "0x012d345e678f901a234b567c890d123e456f789a",
      status: "critical",
      lastBlock: 12345670,
      gasUsage: 250000,
      transactionCount: 150,
      errorRate: 5.8,
      responseTime: 800,
      uptime: 95.2
    }
  ]);

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: "1",
      type: "critical",
      title: "High Error Rate Detected",
      message: "YieldAggregator contract showing 5.8% error rate in the last hour",
      timestamp: "2024-01-15T10:30:00Z",
      contract: "YieldAggregator",
      resolved: false
    },
    {
      id: "2",
      type: "warning",
      title: "Increased Response Time",
      message: "APROptimizer response time above threshold (450ms)",
      timestamp: "2024-01-15T09:45:00Z",
      contract: "APROptimizer",
      resolved: false
    },
    {
      id: "3",
      type: "info",
      title: "Scheduled Maintenance",
      message: "Routine maintenance completed successfully",
      timestamp: "2024-01-15T08:00:00Z",
      resolved: true
    }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: "Total Transactions/Hour",
      value: 1250,
      unit: "tx/h",
      trend: "up",
      threshold: 1000,
      status: "good"
    },
    {
      name: "Average Gas Price",
      value: 25,
      unit: "gwei",
      trend: "stable",
      threshold: 50,
      status: "good"
    },
    {
      name: "Network Congestion",
      value: 65,
      unit: "%",
      trend: "up",
      threshold: 80,
      status: "warning"
    },
    {
      name: "Protocol TVL",
      value: 12500000,
      unit: "USD",
      trend: "up",
      threshold: 10000000,
      status: "good"
    },
    {
      name: "Active Users (24h)",
      value: 2340,
      unit: "users",
      trend: "up",
      threshold: 2000,
      status: "good"
    },
    {
      name: "System Uptime",
      value: 99.2,
      unit: "%",
      trend: "stable",
      threshold: 99.0,
      status: "good"
    }
  ]);

  useEffect(() => {
    connectWallet();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setProvider(provider);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      
      // Update some random metrics to simulate real-time data
      setPerformanceMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.value * 0.1
      })));
      
      toast({
        title: "Data Refreshed",
        description: "Monitoring data updated successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh monitoring data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const healthyContracts = contractsHealth.filter(c => c.status === 'healthy').length;
  const warningContracts = contractsHealth.filter(c => c.status === 'warning').length;
  const criticalContracts = contractsHealth.filter(c => c.status === 'critical').length;
  const unresolvedAlerts = systemAlerts.filter(a => !a.resolved).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring of CoreLiquid Protocol smart contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={refreshData} disabled={refreshing} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <span className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyContracts}</div>
            <p className="text-xs text-muted-foreground">Operating normally</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningContracts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalContracts}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unresolvedAlerts}</div>
            <p className="text-xs text-muted-foreground">Unresolved alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>Current status of all protocol components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractsHealth.slice(0, 5).map((contract) => (
                    <div key={contract.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(contract.status)}
                        <div>
                          <p className="font-medium">{contract.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {contract.address.slice(0, 10)}...{contract.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={contract.status === 'healthy' ? 'default' : 
                                      contract.status === 'warning' ? 'secondary' : 'destructive'}>
                          {contract.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contract.uptime}% uptime
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Successful rebalance executed</p>
                      <p className="text-xs text-muted-foreground">AutoRebalanceManager • 2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New yield strategy deployed</p>
                      <p className="text-xs text-muted-foreground">YieldStrategy • 15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">High gas price detected</p>
                      <p className="text-xs text-muted-foreground">Network Monitor • 32 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Large deposit processed</p>
                      <p className="text-xs text-muted-foreground">DepositManager • 1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Error rate spike detected</p>
                      <p className="text-xs text-muted-foreground">YieldAggregator • 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid gap-4">
            {contractsHealth.map((contract) => (
              <Card key={contract.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(contract.status)}
                      <div>
                        <CardTitle className="text-lg">{contract.name}</CardTitle>
                        <CardDescription>
                          {contract.address.slice(0, 20)}...{contract.address.slice(-10)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={contract.status === 'healthy' ? 'default' : 
                                  contract.status === 'warning' ? 'secondary' : 'destructive'}>
                      {contract.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Last Block</p>
                      <p className="text-2xl font-bold">{contract.lastBlock.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gas Usage</p>
                      <p className="text-2xl font-bold">{contract.gasUsage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Transactions</p>
                      <p className="text-2xl font-bold">{contract.transactionCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className={`text-2xl font-bold ${
                        contract.errorRate < 1 ? 'text-green-600' : 
                        contract.errorRate < 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {contract.errorRate}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time: {contract.responseTime}ms</span>
                      <span>Uptime: {contract.uptime}%</span>
                    </div>
                    <Progress value={contract.uptime} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.name.includes('TVL') || metric.name.includes('USD') ? 
                      `$${(metric.value / 1000000).toFixed(1)}M` : 
                      `${metric.value.toLocaleString()} ${metric.unit}`
                    }
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Threshold: {metric.threshold.toLocaleString()} {metric.unit}
                    </p>
                    <Badge variant={metric.status === 'good' ? 'default' : 
                                  metric.status === 'warning' ? 'secondary' : 'destructive'}>
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={(metric.value / metric.threshold) * 100} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500' :
                alert.type === 'warning' ? 'border-l-yellow-500' :
                alert.type === 'error' ? 'border-l-red-400' :
                'border-l-blue-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {alert.type === 'critical' ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" /> :
                     alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" /> :
                     alert.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" /> :
                     <Activity className="h-4 w-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        {alert.contract && (
                          <Badge variant="outline">{alert.contract}</Badge>
                        )}
                      </div>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm">
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}