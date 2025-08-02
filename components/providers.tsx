'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { PortfolioProvider, usePortfolio } from '@/contexts/portfolio-context';
import { Toaster } from 'sonner';

// Wallet connection sync component
function WalletConnectionSync({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { dispatch } = usePortfolio();

  useEffect(() => {
    if (isConnected && address) {
      dispatch({
        type: 'CONNECT_WALLET',
        payload: { address }
      });
    } else {
      dispatch({ type: 'DISCONNECT_WALLET' });
    }
  }, [isConnected, address, dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client for React Query inside the component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
        gcTime: 300000, // 5 minutes
      },
    },
  }));

  // Handle WalletConnect errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('WalletConnect') || event.message.includes('chrome.runtime')) {
        console.warn('WalletConnect or Extension error (non-critical):', event.message);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          showRecentTransactions={true}
          coolMode
        >
          <PortfolioProvider>
            <WalletConnectionSync>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#fff',
                  },
                }}
              />
            </WalletConnectionSync>
          </PortfolioProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}