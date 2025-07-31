"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Book, 
  Search, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Code, 
  Zap, 
  Shield, 
  TrendingUp,
  DollarSign,
  Settings,
  Users,
  AlertTriangle,
  Info,
  Lightbulb,
  FileText,
  Video,
  Github
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'features' | 'api' | 'smart-contracts' | 'guides' | 'troubleshooting';
  content: string;
  codeExample?: string;
  links?: { title: string; url: string; }[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const docSections: DocSection[] = [
    {
      id: "introduction",
      title: "Introduction to CoreLiquid Protocol",
      description: "Learn about the core concepts and features of CoreLiquid Protocol",
      category: "getting-started",
      content: `CoreLiquid Protocol is a comprehensive DeFi platform that combines automated liquidity management, yield optimization, and lending/borrowing capabilities. Built on Core blockchain, it provides users with:

• **Automated Rebalancing**: Smart algorithms automatically adjust your liquidity positions for optimal returns
• **Yield Aggregation**: Access to multiple yield farming strategies across different protocols
• **Lending & Borrowing**: Collateralized lending with competitive interest rates
• **Risk Management**: Advanced risk assessment and liquidation protection
• **Governance**: Community-driven protocol governance and decision making

The protocol is designed to maximize capital efficiency while minimizing user intervention, making DeFi accessible to both beginners and advanced users.`,
      links: [
        { title: "Core Blockchain", url: "https://coredao.org" },
        { title: "Whitepaper", url: "#" }
      ]
    },
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Step-by-step guide to start using CoreLiquid Protocol",
      category: "getting-started",
      content: `Follow these steps to get started with CoreLiquid Protocol:

**Step 1: Connect Your Wallet**
• Install a compatible wallet (MetaMask, WalletConnect, etc.)
• Add Core network to your wallet
• Connect your wallet to the CoreLiquid dApp

**Step 2: Fund Your Wallet**
• Bridge assets to Core network
• Ensure you have CORE tokens for gas fees
• Acquire supported tokens (ETH, BTC, USDC, etc.)

**Step 3: Make Your First Deposit**
• Navigate to the Deposit page
• Select your preferred strategy
• Enter the amount you want to deposit
• Confirm the transaction

**Step 4: Monitor Your Positions**
• Use the Portfolio page to track performance
• Set up notifications for important events
• Adjust your strategy as needed`,
      codeExample: `// Example: Connect to CoreLiquid Protocol
import { ethers } from 'ethers';
import { CoreLiquidProtocol } from '@coreliquid/sdk';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const protocol = new CoreLiquidProtocol(signer);

// Deposit into a strategy
const tx = await protocol.deposit({
  strategy: 'eth-usdc-lp',
  amount: ethers.utils.parseEther('1.0'),
  token: 'ETH'
});

await tx.wait();`
    },
    {
      id: "deposit-strategies",
      title: "Deposit Strategies",
      description: "Understanding different deposit strategies and their risk profiles",
      category: "features",
      content: `CoreLiquid offers various deposit strategies to suit different risk appetites and investment goals:

**Conservative Strategies (Low Risk)**
• Stable Coin Yield: 6-8% APY, minimal impermanent loss
• Conservative Bond: 5-7% APY, government-backed securities
• Blue Chip LP: 8-12% APY, major token pairs

**Moderate Strategies (Medium Risk)**
• ETH-USDC LP: 12-18% APY, balanced exposure
• BTC-ETH LP: 10-16% APY, crypto-native pairs
• Multi-Asset Yield: 14-20% APY, diversified portfolio

**Aggressive Strategies (High Risk)**
• High Yield DeFi: 20-35% APY, experimental protocols
• Leveraged Positions: 25-50% APY, amplified returns
• Arbitrage Trading: 15-30% APY, market inefficiencies

**Strategy Selection Tips:**
• Start with conservative strategies if you're new to DeFi
• Diversify across multiple strategies to reduce risk
• Consider your investment timeline and risk tolerance
• Monitor market conditions and adjust accordingly`,
      codeExample: `// Example: Query available strategies
const strategies = await protocol.getAvailableStrategies();

strategies.forEach(strategy => {
  console.log(\`Strategy: \${strategy.name}\`);
  console.log(\`APY: \${strategy.apy}%\`);
  console.log(\`Risk Level: \${strategy.riskLevel}\`);
  console.log(\`TVL: $\${strategy.tvl}\`);
});`
    },
    {
      id: "auto-rebalancing",
      title: "Auto-Rebalancing",
      description: "How automated rebalancing works and its benefits",
      category: "features",
      content: `Auto-rebalancing is a core feature that automatically adjusts your positions to maintain optimal performance:

**How It Works:**
• Continuous monitoring of market conditions
• Algorithm-driven position adjustments
• Automatic execution without user intervention
• Gas-optimized transactions

**Benefits:**
• Maximizes capital efficiency
• Reduces impermanent loss
• Maintains target allocations
• Saves time and effort

**Rebalancing Triggers:**
• Price movements beyond threshold
• Liquidity concentration changes
• Market volatility spikes
• Time-based intervals

**Configuration Options:**
• Rebalancing frequency
• Price deviation thresholds
• Gas price limits
• Emergency stop conditions

**Best Practices:**
• Enable auto-rebalancing for long-term positions
• Set appropriate thresholds based on market conditions
• Monitor gas costs during high network congestion
• Review and adjust settings periodically`,
      codeExample: `// Example: Configure auto-rebalancing
const rebalanceConfig = {
  enabled: true,
  priceThreshold: 0.05, // 5% price deviation
  timeInterval: 3600, // 1 hour
  gasLimit: 500000,
  maxGasPrice: ethers.utils.parseUnits('50', 'gwei')
};

await protocol.setRebalanceConfig(rebalanceConfig);`
    },
    {
      id: "lending-borrowing",
      title: "Lending & Borrowing",
      description: "How to lend assets and borrow against collateral",
      category: "features",
      content: `CoreLiquid's lending and borrowing system allows you to earn interest on deposits and access liquidity:

**Lending Features:**
• Competitive interest rates
• Multiple supported assets
• Instant liquidity
• Compound interest

**Borrowing Features:**
• Over-collateralized loans
• Flexible repayment terms
• Multiple collateral types
• Liquidation protection

**Supported Assets:**
• ETH, BTC, USDC, USDT, DAI
• LP tokens from major DEXs
• Governance tokens
• Yield-bearing assets

**Risk Management:**
• Loan-to-Value (LTV) ratios
• Liquidation thresholds
• Health factor monitoring
• Automatic alerts

**Interest Rate Model:**
• Utilization-based rates
• Dynamic adjustments
• Market-driven pricing
• Transparent calculations`,
      codeExample: `// Example: Borrow against collateral
// First, deposit collateral
const collateralTx = await protocol.depositCollateral({
  asset: 'ETH',
  amount: ethers.utils.parseEther('2.0')
});

// Then borrow against it
const borrowTx = await protocol.borrow({
  asset: 'USDC',
  amount: ethers.utils.parseUnits('2000', 6), // $2000 USDC
  collateral: 'ETH'
});

// Check health factor
const healthFactor = await protocol.getHealthFactor(userAddress);`
    },
    {
      id: "yield-optimization",
      title: "Yield Optimization",
      description: "Advanced yield farming and optimization strategies",
      category: "features",
      content: `CoreLiquid's yield optimization engine maximizes returns through intelligent strategy selection:

**Optimization Features:**
• Multi-protocol yield farming
• Automated strategy switching
• Compound reward harvesting
• Gas-efficient operations

**Supported Protocols:**
• Uniswap V3 liquidity provision
• Compound lending
• Aave money markets
• Curve stable swaps
• Balancer weighted pools

**Optimization Algorithms:**
• Machine learning models
• Historical performance analysis
• Risk-adjusted returns
• Market condition adaptation

**Yield Sources:**
• Trading fees from LP positions
• Lending interest
• Governance token rewards
• Arbitrage opportunities
• Protocol incentives

**Performance Metrics:**
• APY calculations
• Risk-adjusted returns
• Sharpe ratio
• Maximum drawdown
• Volatility measures`,
      codeExample: `// Example: Optimize yield strategy
const optimizationParams = {
  riskTolerance: 'moderate',
  targetAPY: 15,
  maxDrawdown: 0.1,
  rebalanceFrequency: 'daily'
};

const optimizedStrategy = await protocol.optimizeYield(
  userPortfolio,
  optimizationParams
);

// Execute optimization
const tx = await protocol.executeOptimization(optimizedStrategy);`
    },
    {
      id: "smart-contracts",
      title: "Smart Contract Architecture",
      description: "Overview of the protocol's smart contract system",
      category: "smart-contracts",
      content: `CoreLiquid Protocol consists of multiple interconnected smart contracts:

**Core Contracts:**
• **CoreLiquidProtocol.sol**: Main protocol contract
• **DepositManager.sol**: Handles user deposits and withdrawals
• **AutoRebalanceManager.sol**: Manages automated rebalancing
• **YieldAggregator.sol**: Aggregates yield from multiple sources

**Lending Contracts:**
• **BorrowEngine.sol**: Manages borrowing operations
• **CollateralManager.sol**: Handles collateral management
• **InterestRateModel.sol**: Calculates interest rates
• **LiquidationEngine.sol**: Manages liquidations

**Utility Contracts:**
• **APROptimizer.sol**: Optimizes APR strategies (APRCalculator functionality integrated)
• **RiskEngine.sol**: Assesses and manages risks
• **OracleRouter.sol**: Price feed management
• **ProtocolRouter.sol**: Route calls to appropriate contracts

**Security Features:**
• Multi-signature governance
• Time-locked upgrades
• Emergency pause mechanisms
• Comprehensive testing
• External audits`,
      codeExample: `// Example: Interact with core contracts
const coreProtocol = new ethers.Contract(
  CORE_PROTOCOL_ADDRESS,
  CoreLiquidProtocolABI,
  signer
);

// Get protocol metrics
const metrics = await coreProtocol.getProtocolMetrics();
console.log('Total TVL:', metrics.totalTVL);
console.log('Active Users:', metrics.activeUsers);

// Check user position
const position = await coreProtocol.getUserPosition(userAddress);`
    },
    {
      id: "api-reference",
      title: "API Reference",
      description: "Complete API documentation for developers",
      category: "api",
      content: `CoreLiquid Protocol provides comprehensive APIs for integration:

**REST API Endpoints:**

**GET /api/v1/strategies**
• Returns list of available strategies
• Query parameters: category, risk_level, min_apy

**GET /api/v1/user/{address}/portfolio**
• Returns user's portfolio information
• Includes positions, balances, and performance

**POST /api/v1/deposit**
• Create a new deposit transaction
• Body: { strategy, amount, token }

**POST /api/v1/withdraw**
• Create a withdrawal transaction
• Body: { position_id, amount }

**WebSocket API:**
• Real-time price updates
• Position change notifications
• Liquidation alerts
• Rebalancing events

**GraphQL API:**
• Flexible data querying
• Historical data access
• Complex filtering options
• Subscription support`,
      codeExample: `// Example: Using the REST API
const API_BASE = 'https://api.coreliquid.finance';

// Get available strategies
const strategies = await fetch(\`\${API_BASE}/api/v1/strategies\`)
  .then(res => res.json());

// Get user portfolio
const portfolio = await fetch(
  \`\${API_BASE}/api/v1/user/\${userAddress}/portfolio\`
).then(res => res.json());

// WebSocket connection
const ws = new WebSocket('wss://api.coreliquid.finance/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};`
    },
    {
      id: "integration-guide",
      title: "Integration Guide",
      description: "How to integrate CoreLiquid Protocol into your application",
      category: "guides",
      content: `Learn how to integrate CoreLiquid Protocol into your DeFi application:

**SDK Installation:**
\`\`\`bash
npm install @coreliquid/sdk
# or
yarn add @coreliquid/sdk
\`\`\`

**Basic Setup:**
1. Initialize the SDK with your provider
2. Configure network settings
3. Set up event listeners
4. Handle user authentication

**Common Integration Patterns:**
• Portfolio management dashboards
• Yield farming aggregators
• DeFi wallet integrations
• Trading bots and automation
• Analytics and reporting tools

**Best Practices:**
• Always validate user inputs
• Handle network errors gracefully
• Implement proper error logging
• Use appropriate gas limits
• Monitor transaction status

**Testing:**
• Use testnet for development
• Implement comprehensive unit tests
• Test edge cases and error conditions
• Validate gas usage and costs
• Performance testing under load`,
      codeExample: `// Example: Complete integration setup
import { CoreLiquidSDK } from '@coreliquid/sdk';

class DeFiApp {
  constructor() {
    this.sdk = new CoreLiquidSDK({
      network: 'mainnet',
      provider: window.ethereum,
      apiKey: process.env.CORELIQUID_API_KEY
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.sdk.on('deposit', (event) => {
      console.log('Deposit completed:', event);
      this.updateUI();
    });
    
    this.sdk.on('rebalance', (event) => {
      console.log('Rebalance executed:', event);
      this.showNotification('Position rebalanced');
    });
  }
  
  async connectWallet() {
    try {
      await this.sdk.connect();
      const address = await this.sdk.getAddress();
      console.log('Connected:', address);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }
}`
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues and their solutions",
      category: "troubleshooting",
      content: `Common issues and how to resolve them:

**Connection Issues:**
• **Problem**: Wallet won't connect
• **Solution**: Check network settings, clear browser cache, try different wallet

• **Problem**: Transaction fails
• **Solution**: Increase gas limit, check token balances, verify network

**Transaction Issues:**
• **Problem**: High gas fees
• **Solution**: Wait for lower network congestion, use gas optimization

• **Problem**: Transaction stuck
• **Solution**: Speed up with higher gas price or cancel and retry

**Strategy Issues:**
• **Problem**: Low yields
• **Solution**: Consider switching strategies, check market conditions

• **Problem**: Impermanent loss
• **Solution**: Enable auto-rebalancing, use stable pair strategies

**Account Issues:**
• **Problem**: Missing funds
• **Solution**: Check transaction history, verify correct network

• **Problem**: Liquidation risk
• **Solution**: Add more collateral, reduce borrowed amount

**Getting Help:**
• Check our FAQ section
• Join our Discord community
• Submit a support ticket
• Review transaction on block explorer`
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "What is the minimum deposit amount?",
      answer: "The minimum deposit varies by strategy but is typically around $100 equivalent. Some strategies may have higher minimums due to gas cost efficiency.",
      category: "deposits"
    },
    {
      question: "How often does auto-rebalancing occur?",
      answer: "Auto-rebalancing is triggered by market conditions, typically when price deviations exceed 5% or at least once every 24 hours, depending on your settings.",
      category: "rebalancing"
    },
    {
      question: "Are there any fees?",
      answer: "CoreLiquid charges a 2% performance fee on profits and a 0.5% management fee annually. Gas fees for transactions are separate and paid to the network.",
      category: "fees"
    },
    {
      question: "How do I withdraw my funds?",
      answer: "You can withdraw your funds at any time through the Portfolio page. Withdrawals are processed immediately, subject to network confirmation times.",
      category: "withdrawals"
    },
    {
      question: "What happens if I get liquidated?",
      answer: "If your collateral ratio falls below the liquidation threshold, your position may be liquidated to repay the loan. You'll receive any remaining collateral after fees.",
      category: "liquidation"
    },
    {
      question: "Is my money safe?",
      answer: "CoreLiquid Protocol has been audited by leading security firms. However, DeFi involves risks including smart contract bugs, market volatility, and impermanent loss.",
      category: "security"
    }
  ];

  const filteredSections = docSections.filter(section => {
    const matchesCategory = activeCategory === "all" || section.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <Zap className="w-4 h-4" />;
      case 'features': return <TrendingUp className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'smart-contracts': return <Shield className="w-4 h-4" />;
      case 'guides': return <Book className="w-4 h-4" />;
      case 'troubleshooting': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to using CoreLiquid Protocol
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="https://github.com/coreliquid" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </Button>
          <Button variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Video Tutorials
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: 'getting-started', label: 'Getting Started' },
                { id: 'features', label: 'Features' },
                { id: 'api', label: 'API Reference' },
                { id: 'smart-contracts', label: 'Smart Contracts' },
                { id: 'guides', label: 'Integration Guides' },
                { id: 'troubleshooting', label: 'Troubleshooting' }
              ].map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {getCategoryIcon(category.id)}
                  <span className="ml-2">{category.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <a href="#getting-started">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Quick Start
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <a href="#api-reference">
                  <Code className="w-4 h-4 mr-2" />
                  API Docs
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <a href="#smart-contracts">
                  <Shield className="w-4 h-4 mr-2" />
                  Contracts
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 space-y-6">
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search query or browse different categories
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSections.map((section) => (
              <Card key={section.id} id={section.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(section.category)}
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {section.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return <br key={index} />;
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-1">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{paragraph.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h4 key={index} className="font-semibold text-lg mt-4 mb-2">
                            {paragraph.slice(2, -2)}
                          </h4>
                        );
                      }
                      return <p key={index} className="mb-2">{paragraph}</p>;
                    })}
                  </div>
                  
                  {section.codeExample && (
                    <div className="relative">
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-100"
                          onClick={() => copyToClipboard(section.codeExample!, section.id)}
                        >
                          {copiedCode === section.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <pre className="text-sm">
                          <code>{section.codeExample}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {section.links && section.links.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Related Links:</h5>
                      <div className="flex flex-wrap gap-2">
                        {section.links.map((link, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.title}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions and answers about CoreLiquid Protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    <Badge variant="outline" className="mt-2">
                      {faq.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}