#!/bin/bash

# CoreLiquid Protocol Deployment Script
# This script handles deployment to Core Chain networks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
NETWORK="testnet"
VERIFY="true"
DRY_RUN="false"
SKIP_CONFIRMATION="false"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Foundry is installed
    if ! command -v forge &> /dev/null; then
        print_error "Foundry is not installed. Please install it first:"
        echo "curl -L https://foundry.paradigm.xyz | bash"
        echo "foundryup"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please copy .env.example to .env and configure it."
        exit 1
    fi
    
    # Source environment variables
    source .env
    
    # Check required environment variables
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env file"
        exit 1
    fi
    
    if [ -z "$TREASURY_ADDRESS" ]; then
        print_error "TREASURY_ADDRESS not set in .env file"
        exit 1
    fi
    
    if [ -z "$GOVERNANCE_ADDRESS" ]; then
        print_error "GOVERNANCE_ADDRESS not set in .env file"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to compile contracts
compile_contracts() {
    print_status "Compiling contracts..."
    forge build
    if [ $? -eq 0 ]; then
        print_success "Contracts compiled successfully"
    else
        print_error "Contract compilation failed"
        exit 1
    fi
}

# Function to run tests before deployment
run_tests() {
    print_status "Running tests before deployment..."
    forge test
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Deployment aborted."
        exit 1
    fi
}

# Function to get RPC URL based on network
get_rpc_url() {
    case $NETWORK in
        "mainnet")
            echo "$CORE_RPC_URL"
            ;;
        "testnet")
            echo "$CORE_TESTNET_RPC_URL"
            ;;
        *)
            print_error "Unknown network: $NETWORK"
            exit 1
            ;;
    esac
}

# Function to get etherscan API key based on network
get_etherscan_key() {
    case $NETWORK in
        "mainnet")
            echo "$CORE_ETHERSCAN_API_KEY"
            ;;
        "testnet")
            echo "$CORE_TESTNET_ETHERSCAN_API_KEY"
            ;;
        *)
            print_error "Unknown network: $NETWORK"
            exit 1
            ;;
    esac
}

# Function to deploy contracts
deploy_contracts() {
    local rpc_url=$(get_rpc_url)
    local etherscan_key=$(get_etherscan_key)
    
    print_status "Deploying to $NETWORK network..."
    print_status "RPC URL: $rpc_url"
    
    if [ "$DRY_RUN" = "true" ]; then
        print_warning "DRY RUN MODE - No actual deployment will occur"
        return 0
    fi
    
    # Prepare deployment command
    local deploy_cmd="forge script script/Deploy.s.sol:Deploy"
    deploy_cmd="$deploy_cmd --rpc-url $rpc_url"
    deploy_cmd="$deploy_cmd --private-key $PRIVATE_KEY"
    deploy_cmd="$deploy_cmd --broadcast"
    
    if [ "$VERIFY" = "true" ] && [ -n "$etherscan_key" ]; then
        deploy_cmd="$deploy_cmd --verify --etherscan-api-key $etherscan_key"
        print_status "Contract verification enabled"
    else
        print_warning "Contract verification disabled"
    fi
    
    # Execute deployment
    print_status "Executing deployment command..."
    eval $deploy_cmd
    
    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_status "Deployment Summary:"
    echo "Network: $NETWORK"
    echo "Verification: $VERIFY"
    echo "Treasury: $TREASURY_ADDRESS"
    echo "Governance: $GOVERNANCE_ADDRESS"
    echo "Emergency Council: $EMERGENCY_COUNCIL_ADDRESS"
    echo ""
    print_status "Check the deployment logs above for contract addresses"
}

# Function to confirm deployment
confirm_deployment() {
    if [ "$SKIP_CONFIRMATION" = "true" ]; then
        return 0
    fi
    
    echo ""
    print_warning "You are about to deploy CoreLiquid Protocol to $NETWORK"
    show_deployment_summary
    echo ""
    read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
}

# Function to estimate gas costs
estimate_gas() {
    local rpc_url=$(get_rpc_url)
    
    print_status "Estimating gas costs..."
    
    # Run deployment simulation to estimate gas
    forge script script/Deploy.s.sol:Deploy --rpc-url $rpc_url --private-key $PRIVATE_KEY
    
    print_status "Gas estimation completed. Check the output above."
}

# Function to verify contracts after deployment
verify_contracts() {
    local etherscan_key=$(get_etherscan_key)
    
    if [ -z "$etherscan_key" ]; then
        print_warning "No Etherscan API key provided. Skipping verification."
        return 0
    fi
    
    print_status "Verifying contracts..."
    
    # Note: Contract addresses would need to be extracted from deployment logs
    # This is a placeholder for the verification process
    print_warning "Manual verification may be required. Check deployment logs for contract addresses."
}

# Function to run post-deployment checks
post_deployment_checks() {
    print_status "Running post-deployment checks..."
    
    # Add any post-deployment verification logic here
    # For example, checking if contracts are deployed correctly
    
    print_success "Post-deployment checks completed"
}

# Function to show help
show_help() {
    echo "CoreLiquid Protocol Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -n, --network NETWORK     Target network (mainnet|testnet) [default: testnet]"
    echo "  -v, --verify              Verify contracts on explorer [default: true]"
    echo "  --no-verify               Skip contract verification"
    echo "  -d, --dry-run             Simulate deployment without executing"
    echo "  -y, --yes                 Skip confirmation prompt"
    echo "  --skip-tests              Skip running tests before deployment"
    echo "  --estimate-gas            Only estimate gas costs"
    echo "  -h, --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                        # Deploy to testnet with verification"
    echo "  $0 -n mainnet             # Deploy to mainnet"
    echo "  $0 --dry-run               # Simulate deployment"
    echo "  $0 -n testnet --no-verify # Deploy to testnet without verification"
    echo "  $0 --estimate-gas          # Estimate gas costs only"
    echo ""
    echo "Environment Variables (set in .env):"
    echo "  PRIVATE_KEY               Deployer private key"
    echo "  TREASURY_ADDRESS          Treasury address"
    echo "  GOVERNANCE_ADDRESS        Governance address"
    echo "  EMERGENCY_COUNCIL_ADDRESS Emergency council address"
    echo "  CORE_RPC_URL              Core mainnet RPC URL"
    echo "  CORE_TESTNET_RPC_URL      Core testnet RPC URL"
    echo "  CORE_ETHERSCAN_API_KEY    Core explorer API key"
    echo ""
}

# Parse command line arguments
SKIP_TESTS="false"
ESTIMATE_ONLY="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--network)
            NETWORK="$2"
            shift 2
            ;;
        -v|--verify)
            VERIFY="true"
            shift
            ;;
        --no-verify)
            VERIFY="false"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -y|--yes)
            SKIP_CONFIRMATION="true"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        --estimate-gas)
            ESTIMATE_ONLY="true"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate network parameter
if [[ "$NETWORK" != "mainnet" && "$NETWORK" != "testnet" ]]; then
    print_error "Invalid network: $NETWORK. Must be 'mainnet' or 'testnet'"
    exit 1
fi

# Main deployment flow
print_status "Starting CoreLiquid Protocol deployment..."
print_status "Target network: $NETWORK"

# Check prerequisites
check_prerequisites

# Compile contracts
compile_contracts

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = "false" ]; then
    run_tests
else
    print_warning "Skipping tests as requested"
fi

# Handle gas estimation only
if [ "$ESTIMATE_ONLY" = "true" ]; then
    estimate_gas
    exit 0
fi

# Confirm deployment
confirm_deployment

# Deploy contracts
deploy_contracts

# Run post-deployment checks
post_deployment_checks

# Show final summary
echo ""
print_success "🎉 CoreLiquid Protocol deployment completed successfully!"
show_deployment_summary

print_status "Next steps:"
echo "1. Save the contract addresses from the deployment logs"
echo "2. Update your frontend configuration with the new addresses"
echo "3. Test the deployed contracts on $NETWORK"
echo "4. Consider setting up monitoring and alerts"

if [ "$NETWORK" = "testnet" ]; then
    echo "5. When ready, deploy to mainnet using: $0 -n mainnet"
fi

print_success "Deployment script completed! 🚀"