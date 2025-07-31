#!/bin/bash

# CoreLiquid Protocol Testing Script
# This script provides easy commands to run various types of tests

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

# Function to check if Foundry is installed
check_foundry() {
    if ! command -v forge &> /dev/null; then
        print_error "Foundry is not installed. Please install it first:"
        echo "curl -L https://foundry.paradigm.xyz | bash"
        echo "foundryup"
        exit 1
    fi
    print_success "Foundry is installed: $(forge --version)"
}

# Function to install dependencies
install_deps() {
    print_status "Installing Foundry dependencies..."
    forge install
    print_success "Dependencies installed successfully"
}

# Function to compile contracts
compile() {
    print_status "Compiling contracts..."
    forge build
    if [ $? -eq 0 ]; then
        print_success "Contracts compiled successfully"
    else
        print_error "Contract compilation failed"
        exit 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    forge test
    if [ $? -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed"
        exit 1
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    forge test --match-path "test/unit/**/*.sol"
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed!"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    forge test --match-path "test/integration/**/*.sol"
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed!"
    else
        print_error "Integration tests failed"
        exit 1
    fi
}

# Function to run specific contract tests
run_contract_test() {
    local contract=$1
    print_status "Running tests for $contract..."
    forge test --match-contract "$contract"
    if [ $? -eq 0 ]; then
        print_success "$contract tests passed!"
    else
        print_error "$contract tests failed"
        exit 1
    fi
}

# Function to run tests with gas report
run_gas_report() {
    print_status "Running tests with gas report..."
    forge test --gas-report
    print_success "Gas report generated"
}

# Function to run coverage report
run_coverage() {
    print_status "Generating coverage report..."
    forge coverage
    print_success "Coverage report generated"
}

# Function to run tests in verbose mode
run_verbose() {
    print_status "Running tests in verbose mode..."
    forge test -vvv
}

# Function to run tests in watch mode
run_watch() {
    print_status "Running tests in watch mode (press Ctrl+C to stop)..."
    forge test --watch
}

# Function to clean build artifacts
clean() {
    print_status "Cleaning build artifacts..."
    forge clean
    print_success "Build artifacts cleaned"
}

# Function to run quick health check
health_check() {
    print_status "Running health check..."
    
    # Check Foundry installation
    check_foundry
    
    # Compile contracts
    compile
    
    # Run a quick test
    print_status "Running quick test..."
    forge test --match-test "testInitialState" -q
    
    if [ $? -eq 0 ]; then
        print_success "Health check passed! System is ready for testing."
    else
        print_warning "Health check completed with warnings. Check the output above."
    fi
}

# Function to setup testing environment
setup() {
    print_status "Setting up testing environment..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration"
    fi
    
    # Install dependencies
    install_deps
    
    # Compile contracts
    compile
    
    print_success "Testing environment setup complete!"
}

# Function to run performance benchmark
benchmark() {
    print_status "Running performance benchmark..."
    
    echo "Starting benchmark at $(date)"
    
    # Time the test execution
    start_time=$(date +%s)
    
    # Run tests with gas reporting
    forge test --gas-report > benchmark_results.txt 2>&1
    
    end_time=$(date +%s)
    execution_time=$((end_time - start_time))
    
    echo "Benchmark completed in ${execution_time} seconds"
    echo "Results saved to benchmark_results.txt"
    
    print_success "Benchmark completed"
}

# Function to show help
show_help() {
    echo "CoreLiquid Protocol Testing Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup              Setup testing environment"
    echo "  health             Run health check"
    echo "  compile            Compile contracts"
    echo "  test               Run all tests"
    echo "  unit               Run unit tests only"
    echo "  integration        Run integration tests only"
    echo "  gas                Run tests with gas report"
    echo "  coverage           Generate coverage report"
    echo "  verbose            Run tests in verbose mode"
    echo "  watch              Run tests in watch mode"
    echo "  clean              Clean build artifacts"
    echo "  benchmark          Run performance benchmark"
    echo ""
    echo "Contract-specific tests:"
    echo "  core-native        Test CoreNativeStaking contract"
    echo "  stcore             Test StCOREToken contract"
    echo "  revenue            Test RevenueModel contract"
    echo "  liquidity          Test UnifiedLiquidityPool contract"
    echo "  integration-full   Test CoreLiquidIntegration contract"
    echo ""
    echo "Examples:"
    echo "  $0 setup           # First time setup"
    echo "  $0 test             # Run all tests"
    echo "  $0 unit             # Run only unit tests"
    echo "  $0 core-native      # Test CoreNativeStaking only"
    echo "  $0 gas              # Run tests with gas report"
    echo ""
}

# Main script logic
case "$1" in
    "setup")
        setup
        ;;
    "health")
        health_check
        ;;
    "compile")
        check_foundry
        compile
        ;;
    "test")
        check_foundry
        compile
        run_all_tests
        ;;
    "unit")
        check_foundry
        compile
        run_unit_tests
        ;;
    "integration")
        check_foundry
        compile
        run_integration_tests
        ;;
    "core-native")
        check_foundry
        compile
        run_contract_test "CoreNativeStakingTest"
        ;;
    "stcore")
        check_foundry
        compile
        run_contract_test "StCORETokenTest"
        ;;
    "revenue")
        check_foundry
        compile
        run_contract_test "RevenueModelTest"
        ;;
    "liquidity")
        check_foundry
        compile
        run_contract_test "UnifiedLiquidityPoolTest"
        ;;
    "integration-full")
        check_foundry
        compile
        run_contract_test "CoreLiquidIntegrationTest"
        ;;
    "gas")
        check_foundry
        compile
        run_gas_report
        ;;
    "coverage")
        check_foundry
        compile
        run_coverage
        ;;
    "verbose")
        check_foundry
        compile
        run_verbose
        ;;
    "watch")
        check_foundry
        compile
        run_watch
        ;;
    "clean")
        clean
        ;;
    "benchmark")
        check_foundry
        compile
        benchmark
        ;;
    "help" | "--help" | "-h")
        show_help
        ;;
    "")
        print_warning "No command specified. Showing help..."
        echo ""
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac