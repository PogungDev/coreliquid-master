"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Edit, 
  Save, 
  Shield, 
  Lock, 
  Bell, 
  Settings, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Gift, 
  Download, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Sun,
  Moon,
  Monitor 
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'DeFi enthusiast and yield farming strategist with 3+ years of experience in CoreLiquid Protocol.',
    avatar: '/api/placeholder/150/150',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    joinDate: '2021-03-15',
    totalDeposits: '$125,430.50',
    totalEarnings: '$18,765.23',
    activeStrategies: 7,
    riskTolerance: 'Moderate',
    preferredAssets: ['ETH', 'USDC', 'WBTC'],
    notifications: {
      email: true,
      push: false,
      sms: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showBalance: false,
      showTransactions: false
    },
    twoFactor: false,
    language: 'en',
    timezone: 'UTC-5',
    theme: 'dark'
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Save user data logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  const handleDeleteAccount = () => {
    // Delete account logic here
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-slate-300">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-purple-600 text-white text-xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profile Info', icon: User },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Privacy', icon: Lock },
                    { id: 'preferences', label: 'Preferences', icon: Settings },
                    { id: 'activity', label: 'Activity Log', icon: Activity },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {activeTab === 'profile' && 'Profile Information'}
                      {activeTab === 'security' && 'Security Settings'}
                      {activeTab === 'notifications' && 'Notification Preferences'}
                      {activeTab === 'privacy' && 'Privacy Settings'}
                      {activeTab === 'preferences' && 'User Preferences'}
                      {activeTab === 'activity' && 'Activity Log'}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {activeTab === 'profile' && 'Update your personal information and profile details'}
                      {activeTab === 'security' && 'Manage your account security and authentication'}
                      {activeTab === 'notifications' && 'Configure how you receive notifications'}
                      {activeTab === 'privacy' && 'Control your privacy and data sharing preferences'}
                      {activeTab === 'preferences' && 'Customize your experience and interface'}
                      {activeTab === 'activity' && 'View your recent account activity and transactions'}
                    </CardDescription>
                  </div>
                  {activeTab === 'profile' && (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? 'outline' : 'default'}
                      className={isEditing ? 'border-slate-600 text-slate-300' : 'bg-purple-600 hover:bg-purple-700'}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={user.name}
                            onChange={(e) => setUser({...user, name: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-white bg-slate-700 px-3 py-2 rounded-md">{user.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address
                        </label>
                        {isEditing ? (
                          <Input
                            value={user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-white bg-slate-700 px-3 py-2 rounded-md">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={user.bio}
                          onChange={(e) => setUser({...user, bio: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={3}
                        />
                      ) : (
                        <p className="text-white bg-slate-700 px-3 py-2 rounded-md">{user.bio}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white bg-slate-700 px-3 py-2 rounded-md flex-1 font-mono text-sm">
                          {user.walletAddress}
                        </p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4">
                        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-slate-300">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                          <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={user.twoFactor}
                          onCheckedChange={(checked) => setUser({...user, twoFactor: checked})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Change Password</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password
                          </label>
                          <Input
                            type="password"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                          </label>
                          <Input
                            type="password"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm New Password
                          </label>
                          <Input
                            type="password"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 w-fit">
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Email Notifications</h3>
                          <p className="text-slate-400 text-sm">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={user.notifications.email}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            notifications: {...user.notifications, email: checked}
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Push Notifications</h3>
                          <p className="text-slate-400 text-sm">Receive push notifications in your browser</p>
                        </div>
                        <Switch
                          checked={user.notifications.push}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            notifications: {...user.notifications, push: checked}
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">SMS Notifications</h3>
                          <p className="text-slate-400 text-sm">Receive important alerts via SMS</p>
                        </div>
                        <Switch
                          checked={user.notifications.sms}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            notifications: {...user.notifications, sms: checked}
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Marketing Communications</h3>
                          <p className="text-slate-400 text-sm">Receive updates about new features and promotions</p>
                        </div>
                        <Switch
                          checked={user.notifications.marketing}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            notifications: {...user.notifications, marketing: checked}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Show Balance</h3>
                          <p className="text-slate-400 text-sm">Display your portfolio balance publicly</p>
                        </div>
                        <Switch
                          checked={user.privacy.showBalance}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            privacy: {...user.privacy, showBalance: checked}
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Show Transactions</h3>
                          <p className="text-slate-400 text-sm">Make your transaction history visible to others</p>
                        </div>
                        <Switch
                          checked={user.privacy.showTransactions}
                          onCheckedChange={(checked) => setUser({
                            ...user,
                            privacy: {...user.privacy, showTransactions: checked}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Language
                        </label>
                        <select
                          value={user.language}
                          onChange={(e) => setUser({...user, language: e.target.value})}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="zh">中文</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={user.timezone}
                          onChange={(e) => setUser({...user, timezone: e.target.value})}
                          className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                        >
                          <option value="UTC-12">UTC-12</option>
                          <option value="UTC-8">UTC-8 (PST)</option>
                          <option value="UTC-5">UTC-5 (EST)</option>
                          <option value="UTC+0">UTC+0 (GMT)</option>
                          <option value="UTC+1">UTC+1 (CET)</option>
                          <option value="UTC+8">UTC+8 (CST)</option>
                          <option value="UTC+9">UTC+9 (JST)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Theme
                      </label>
                      <div className="flex space-x-4">
                        {[
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'system', label: 'System', icon: Monitor },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setUser({...user, theme: theme.id})}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                              user.theme === theme.id
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            <theme.icon className="w-4 h-4" />
                            <span>{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          action: 'Deposited 1.5 ETH',
                          time: '2 hours ago',
                          status: 'success'
                        },
                        {
                          action: 'Claimed rewards',
                          time: '1 day ago',
                          status: 'success'
                        },
                        {
                          action: 'Updated profile settings',
                          time: '3 days ago',
                          status: 'info'
                        },
                        {
                          action: 'Failed transaction',
                          time: '1 week ago',
                          status: 'error'
                        }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'success' ? 'bg-green-400' :
                              activity.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                            }`} />
                            <div>
                              <p className="text-white font-medium">{activity.action}</p>
                              <p className="text-slate-400 text-sm">{activity.time}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-slate-700">
                      <Button variant="outline" className="border-slate-600 text-slate-300">
                        <Download className="w-4 h-4 mr-2" />
                        Export Activity Log
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-300">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}