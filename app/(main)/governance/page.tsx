"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vote, Plus, CheckCircle, XCircle } from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { useToast } from "@/hooks/use-toast"

export default function GovernancePage() {
  const { state } = usePortfolio()
  const { toast } = useToast()
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)
  const [voteChoice, setVoteChoice] = useState<"for" | "against" | null>(null)
  const [proposalStep, setProposalStep] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [newProposal, setNewProposal] = useState({
    parameter: "",
    value: "",
    title: "",
    description: "",
  })

  const [activeProposals, setActiveProposals] = useState([
    {
      id: "CFX-001",
      title: "Increase Base Interest Rate",
      description: "Proposal to increase the base interest rate from 2% to 3% to better reflect market conditions",
      forVotes: 125000,
      againstVotes: 45000,
      totalVotes: 170000,
      quorum: 200000,
      status: "Active",
      timeLeft: "2 days",
      proposer: "0x1234...5678",
      parameter: "Base Interest Rate",
      value: "3%",
    },
    {
      id: "CFX-002",
      title: "Add New Collateral Asset",
      description: "Proposal to add LINK as an accepted collateral asset with 75% LTV ratio",
      forVotes: 89000,
      againstVotes: 23000,
      totalVotes: 112000,
      quorum: 200000,
      status: "Active",
      timeLeft: "5 days",
      proposer: "0x9876...4321",
      parameter: "Collateral Asset",
      value: "LINK (75% LTV)",
    },
    {
      id: "CFX-003",
      title: "Protocol Fee Adjustment",
      description: "Reduce protocol fees from 0.1% to 0.05% to increase competitiveness",
      forVotes: 156000,
      againstVotes: 78000,
      totalVotes: 234000,
      quorum: 200000,
      status: "Passed",
      timeLeft: "Ended",
      proposer: "0x5555...9999",
      parameter: "Protocol Fee",
      value: "0.05%",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-blue-500 border-blue-500"
      case "Passed":
        return "text-green-500 border-green-500"
      case "Failed":
        return "text-red-500 border-red-500"
      default:
        return "text-gray-500 border-gray-500"
    }
  }

  const parameters = [
    "Base Interest Rate",
    "Liquidation Threshold",
    "Protocol Fee",
    "Collateral Factor",
    "Reserve Factor",
  ]

  const handleVote = async (proposalId: string, choice: "for" | "against") => {
    if (!state.isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)

    try {
      // Simulate transaction processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the proposal votes
      setActiveProposals((prev) =>
        prev.map((proposal) => {
          if (proposal.id === proposalId) {
            const voteAmount = 1000 // Simulate vote weight
            return {
              ...proposal,
              forVotes: choice === "for" ? proposal.forVotes + voteAmount : proposal.forVotes,
              againstVotes: choice === "against" ? proposal.againstVotes + voteAmount : proposal.againstVotes,
              totalVotes: proposal.totalVotes + voteAmount,
            }
          }
          return proposal
        }),
      )

      toast({
        title: "Vote Successful",
        description: `Successfully voted ${choice.toUpperCase()} on proposal ${proposalId}!`,
        variant: "default",
      })

      setVoteDialogOpen(false)
      setSelectedProposal(null)
      setVoteChoice(null)
    } catch (error) {
      console.error("Vote failed:", error)
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const handleCreateProposal = async () => {
    if (!state.isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a proposal.",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate transaction processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const proposalId = `CFX-${(activeProposals.length + 1).toString().padStart(3, "0")}`
      const newProposalData = {
        id: proposalId,
        title: newProposal.title,
        description: newProposal.description,
        forVotes: 0,
        againstVotes: 0,
        totalVotes: 0,
        quorum: 200000,
        status: "Active",
        timeLeft: "7 days",
        proposer: state.accountAddress || "Anonymous",
        parameter: newProposal.parameter,
        value: newProposal.value,
      }

      setActiveProposals((prev) => [newProposalData, ...prev])

      // Reset form and close dialog
      setProposalStep(1)
      setNewProposal({ parameter: "", value: "", title: "", description: "" })
      setIsDialogOpen(false)

      toast({
        title: "Proposal Created",
        description: `Proposal ${proposalId} created successfully!`,
        variant: "default",
      })
    } catch (error) {
      console.error("Create proposal failed:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openVoteDialog = (proposalId: string, choice: "for" | "against") => {
    setSelectedProposal(proposalId)
    setVoteChoice(choice)
    setVoteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">GOVERNANCE</h1>
          <p className="text-gray-400">Participate in protocol governance</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!state.isWalletConnected}>
              <Plus className="w-4 h-4 mr-2" />
              Create Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] border-[#2A2A2A] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>

            {proposalStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Select Parameter</h3>
                <div className="space-y-2">
                  <Label className="text-gray-400">Parameter to Change</Label>
                  <Select
                    value={newProposal.parameter}
                    onValueChange={(value) => setNewProposal({ ...newProposal, parameter: value })}
                  >
                    <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                      <SelectValue placeholder="Choose parameter" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                      {parameters.map((param) => (
                        <SelectItem key={param} value={param} className="text-white hover:bg-[#3A3A3A]">
                          {param}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">New Value</Label>
                  <Input
                    placeholder="Enter new value"
                    value={newProposal.value}
                    onChange={(e) => setNewProposal({ ...newProposal, value: e.target.value })}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  />
                </div>

                <Button
                  onClick={() => setProposalStep(2)}
                  disabled={!newProposal.parameter || !newProposal.value}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            )}

            {proposalStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 2: Proposal Details</h3>
                <div className="space-y-2">
                  <Label className="text-gray-400">Title</Label>
                  <Input
                    placeholder="Proposal title"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Description</Label>
                  <Textarea
                    placeholder="Detailed description of the proposal"
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white min-h-[100px]"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setProposalStep(1)}
                    className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white hover:bg-[#3A3A3A]"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setProposalStep(3)}
                    disabled={!newProposal.title || !newProposal.description}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Review
                  </Button>
                </div>
              </div>
            )}

            {proposalStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 3: Review & Submit</h3>
                <div className="space-y-3 p-4 bg-[#2A2A2A] rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parameter:</span>
                    <span className="text-white">{newProposal.parameter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Value:</span>
                    <span className="text-white">{newProposal.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white">{newProposal.title}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white text-sm mt-1">{newProposal.description}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setProposalStep(2)}
                    className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white hover:bg-[#3A3A3A]"
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateProposal} className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Proposal
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Vote Confirmation Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle>Cast Your Vote</DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              {(() => {
                const proposal = activeProposals.find((p) => p.id === selectedProposal)
                return proposal ? (
                  <div className="p-4 bg-[#2A2A2A] rounded-lg">
                    <h3 className="font-medium text-white mb-2">{proposal.title}</h3>
                    <p className="text-sm text-gray-400">{proposal.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Parameter: {proposal.parameter} → {proposal.value}
                    </p>
                  </div>
                ) : null
              })()}

              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  {voteChoice === "for" ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-500 font-medium">Voting FOR</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-500 font-medium">Voting AGAINST</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setVoteDialogOpen(false)}
                  className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white hover:bg-[#3A3A3A]"
                  disabled={isVoting}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 text-white ${
                    voteChoice === "for" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={() => selectedProposal && voteChoice && handleVote(selectedProposal, voteChoice)}
                  disabled={isVoting}
                >
                  {isVoting ? "Voting..." : "Confirm Vote"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Proposals */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center">
            <Vote className="w-5 h-5 mr-2" />
            Active Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <Card key={proposal.id} className="bg-[#2A2A2A] border-[#3A3A3A]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-white">{proposal.title}</h3>
                        <Badge variant="outline" className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{proposal.description}</p>
                      <p className="text-xs text-gray-500">Proposed by {proposal.proposer}</p>
                      <p className="text-xs text-gray-500">
                        Parameter: {proposal.parameter} → {proposal.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">ID: {proposal.id}</p>
                      <p className="text-sm text-white">{proposal.timeLeft}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Voting Progress</span>
                      <span className="text-white">
                        {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(proposal.totalVotes / proposal.quorum) * 100} className="h-2" />

                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-white">For: {proposal.forVotes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-white">Against: {proposal.againstVotes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {proposal.status === "Active" && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => openVoteDialog(proposal.id, "for")}
                        disabled={!state.isWalletConnected}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>

                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                        onClick={() => openVoteDialog(proposal.id, "against")}
                        disabled={!state.isWalletConnected}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                    </div>
                  )}

                  {!state.isWalletConnected && proposal.status === "Active" && (
                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 font-mono">
                        [INFO] Please connect your wallet to participate in governance voting.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Stats */}
      <Card className="bg-[#1E1E1E] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Governance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{activeProposals.length}</p>
              <p className="text-sm text-gray-400">Total Proposals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {activeProposals.filter((p) => p.status === "Passed").length}
              </p>
              <p className="text-sm text-gray-400">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {activeProposals.filter((p) => p.status === "Active").length}
              </p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">65%</p>
              <p className="text-sm text-gray-400">Participation Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
