"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Zap, 
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

interface UserSettings {
  // Security Settings
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number;
  autoLockEnabled: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  priceAlerts: boolean;
  liquidationAlerts: boolean;
  yieldAlerts: boolean;
  
  // Trading Settings
  slippageTolerance: number;
  gasPrice: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice: number;
  autoRebalance: boolean;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  
  // Display Settings
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  language: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
  hideBalances: boolean;
  compactMode: boolean;
  
  // Advanced Settings
  expertMode: boolean;
  debugMode: boolean;
  analyticsEnabled: boolean;
  betaFeatures: boolean;
}

interface ProtocolSettings {
  maxLeverage: number;
  liquidationThreshold: number;
  borrowingEnabled: boolean;
  stakingEnabled: boolean;
  governanceEnabled: boolean;
  emergencyPause: boolean;
}

export default function SettingsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const [userSettings, setUserSettings] = useState<UserSettings>({
    // Security Settings
    twoFactorEnabled: false,
    biometricEnabled: true,
    sessionTimeout: 30,
    autoLockEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    priceAlerts: true,
    liquidationAlerts: true,
    yieldAlerts: false,
    
    // Trading Settings
    slippageTolerance: 0.5,
    gasPrice: 'standard',
    customGasPrice: 25,
    autoRebalance: true,
    riskTolerance: 'moderate',
    
    // Display Settings
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    hideBalances: false,
    compactMode: false,
    
    // Advanced Settings
    expertMode: false,
    debugMode: false,
    analyticsEnabled: true,
    betaFeatures: false
  });

  const [protocolSettings, setProtocolSettings] = useState<ProtocolSettings>({
    maxLeverage: 5,
    liquidationThreshold: 80,
    borrowingEnabled: true,
    stakingEnabled: true,
    governanceEnabled: true,
    emergencyPause: false
  });

  const [originalSettings, setOriginalSettings] = useState<UserSettings>(userSettings);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    const hasChanges = JSON.stringify(userSettings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [userSettings, originalSettings]);

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

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOriginalSettings(userSettings);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setUserSettings(originalSettings);
    setHasUnsavedChanges(false);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to last saved state",
    });
  };

  const updateUserSetting = (key: keyof UserSettings, value: any) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateProtocolSetting = (key: keyof ProtocolSettings, value: any) => {
    setProtocolSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportSettings = () => {
    const data = {
      userSettings,
      protocolSettings,
      exportedAt: new Date().toISOString(),
      account: account
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coreliquid-settings-${account.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your CoreLiquid Protocol preferences and security settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={resetSettings} variant="outline" disabled={!hasUnsavedChanges}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={loading || !hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Display Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={userSettings.theme} onValueChange={(value) => updateUserSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={userSettings.currency} onValueChange={(value) => updateUserSetting('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={userSettings.language} onValueChange={(value) => updateUserSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hide Balances</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide sensitive balance information by default
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.hideBalances}
                    onCheckedChange={(checked) => updateUserSetting('hideBalances', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout to show more information
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.compactMode}
                    onCheckedChange={(checked) => updateUserSetting('compactMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.twoFactorEnabled}
                    onCheckedChange={(checked) => updateUserSetting('twoFactorEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Use fingerprint or face recognition for quick access
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.biometricEnabled}
                    onCheckedChange={(checked) => updateUserSetting('biometricEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Lock</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically lock the application when inactive
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.autoLockEnabled}
                    onCheckedChange={(checked) => updateUserSetting('autoLockEnabled', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <div className="px-3">
                  <Slider
                    value={[userSettings.sessionTimeout]}
                    onValueChange={([value]) => updateUserSetting('sessionTimeout', value)}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>5 min</span>
                    <span>{userSettings.sessionTimeout} min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.emailNotifications}
                    onCheckedChange={(checked) => updateUserSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.pushNotifications}
                    onCheckedChange={(checked) => updateUserSetting('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.smsNotifications}
                    onCheckedChange={(checked) => updateUserSetting('smsNotifications', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Price Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about significant price movements
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.priceAlerts}
                    onCheckedChange={(checked) => updateUserSetting('priceAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Liquidation Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when positions are at risk of liquidation
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.liquidationAlerts}
                    onCheckedChange={(checked) => updateUserSetting('liquidationAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Yield Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about yield farming opportunities
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.yieldAlerts}
                    onCheckedChange={(checked) => updateUserSetting('yieldAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Trading Settings
              </CardTitle>
              <CardDescription>
                Configure your trading preferences and risk management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Slippage Tolerance (%)</Label>
                  <div className="px-3">
                    <Slider
                      value={[userSettings.slippageTolerance]}
                      onValueChange={([value]) => updateUserSetting('slippageTolerance', value)}
                      max={5}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0.1%</span>
                      <span>{userSettings.slippageTolerance}%</span>
                      <span>5%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gasPrice">Gas Price Setting</Label>
                  <Select value={userSettings.gasPrice} onValueChange={(value) => updateUserSetting('gasPrice', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {userSettings.gasPrice === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customGasPrice">Custom Gas Price (gwei)</Label>
                    <Input
                      id="customGasPrice"
                      type="number"
                      value={userSettings.customGasPrice}
                      onChange={(e) => updateUserSetting('customGasPrice', Number(e.target.value))}
                      placeholder="25"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select value={userSettings.riskTolerance} onValueChange={(value) => updateUserSetting('riskTolerance', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Rebalance</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically rebalance positions to maintain target allocation
                  </p>
                </div>
                <Switch
                  checked={userSettings.autoRebalance}
                  onCheckedChange={(checked) => updateUserSetting('autoRebalance', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Protocol Settings
              </CardTitle>
              <CardDescription>
                Configure protocol-level settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Maximum Leverage</Label>
                  <div className="px-3">
                    <Slider
                      value={[protocolSettings.maxLeverage]}
                      onValueChange={([value]) => updateProtocolSetting('maxLeverage', value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1x</span>
                      <span>{protocolSettings.maxLeverage}x</span>
                      <span>10x</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Liquidation Threshold (%)</Label>
                  <div className="px-3">
                    <Slider
                      value={[protocolSettings.liquidationThreshold]}
                      onValueChange={([value]) => updateProtocolSetting('liquidationThreshold', value)}
                      max={95}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>50%</span>
                      <span>{protocolSettings.liquidationThreshold}%</span>
                      <span>95%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Protocol Features</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Borrowing Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to borrow against their collateral
                    </p>
                  </div>
                  <Switch
                    checked={protocolSettings.borrowingEnabled}
                    onCheckedChange={(checked) => updateProtocolSetting('borrowingEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Staking Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to stake tokens for rewards
                    </p>
                  </div>
                  <Switch
                    checked={protocolSettings.stakingEnabled}
                    onCheckedChange={(checked) => updateProtocolSetting('stakingEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Governance Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to participate in protocol governance
                    </p>
                  </div>
                  <Switch
                    checked={protocolSettings.governanceEnabled}
                    onCheckedChange={(checked) => updateProtocolSetting('governanceEnabled', checked)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-red-600">Emergency Pause</Label>
                    <p className="text-sm text-muted-foreground">
                      Pause all protocol operations in case of emergency
                    </p>
                  </div>
                  <Switch
                    checked={protocolSettings.emergencyPause}
                    onCheckedChange={(checked) => updateProtocolSetting('emergencyPause', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced features for experienced users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Expert Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced features and remove safety warnings
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.expertMode}
                    onCheckedChange={(checked) => updateUserSetting('expertMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show additional debugging information
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.debugMode}
                    onCheckedChange={(checked) => updateUserSetting('debugMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow collection of anonymous usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.analyticsEnabled}
                    onCheckedChange={(checked) => updateUserSetting('analyticsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Beta Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable experimental features (may be unstable)
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.betaFeatures}
                    onCheckedChange={(checked) => updateUserSetting('betaFeatures', checked)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Data Management</h4>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={exportSettings} variant="outline" className="flex-1">
                    Export Settings
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Import Settings
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Reset All Settings
                  </Button>
                </div>
              </div>
              
              {userSettings.expertMode && (
                <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Expert Mode Enabled</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You have enabled expert mode. Some safety features and warnings have been disabled. 
                        Please ensure you understand the risks before proceeding with advanced operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}