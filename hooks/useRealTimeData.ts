import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface RealTimeMetrics {
  totalValue: number;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  feesEarned: number;
  dailyReturn: number;
  liquidityUtilization: number;
  aprOptimized: number;
  lastUpdate: number;
}

interface WebSocketMessage {
  type: 'price_update' | 'volume_update' | 'fees_update' | 'metrics_update';
  data: any;
  timestamp: number;
}

export function useRealTimeData() {
  const { address, isConnected } = useAccount();
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    try {
      // Use Core blockchain WebSocket endpoint for real-time data
      const wsUrl = process.env.NEXT_PUBLIC_CORE_WS_URL || 'wss://ws.coredao.org';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Subscribe to real-time updates for user's positions
        if (address && wsRef.current) {
          const subscribeMessage = {
            type: 'subscribe',
            channels: [
              `user_metrics_${address}`,
              'global_metrics',
              'price_feeds',
              'volume_data'
            ]
          };
          wsRef.current.send(JSON.stringify(subscribeMessage));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to establish WebSocket connection');
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'price_update':
        setRealTimeMetrics(prev => prev ? {
          ...prev,
          currentPrice: message.data.price,
          priceChange24h: message.data.change24h,
          lastUpdate: message.timestamp
        } : null);
        break;

      case 'volume_update':
        setRealTimeMetrics(prev => prev ? {
          ...prev,
          volume24h: message.data.volume,
          liquidityUtilization: message.data.utilization,
          lastUpdate: message.timestamp
        } : null);
        break;

      case 'fees_update':
        setRealTimeMetrics(prev => prev ? {
          ...prev,
          feesEarned: message.data.totalFees,
          dailyReturn: message.data.dailyReturn,
          lastUpdate: message.timestamp
        } : null);
        break;

      case 'metrics_update':
        setRealTimeMetrics({
          totalValue: message.data.totalValue,
          currentPrice: message.data.currentPrice,
          priceChange24h: message.data.priceChange24h,
          volume24h: message.data.volume24h,
          feesEarned: message.data.feesEarned,
          dailyReturn: message.data.dailyReturn,
          liquidityUtilization: message.data.liquidityUtilization,
          aprOptimized: message.data.aprOptimized,
          lastUpdate: message.timestamp
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const fetchInitialData = async () => {
    if (!address) return;

    try {
      // Fetch initial metrics from API
      const response = await fetch(`/api/metrics/${address}`);
      if (response.ok) {
        const data = await response.json();
        setRealTimeMetrics({
          totalValue: data.totalValue || 0,
          currentPrice: data.currentPrice || 0,
          priceChange24h: data.priceChange24h || 0,
          volume24h: data.volume24h || 0,
          feesEarned: data.feesEarned || 0,
          dailyReturn: data.dailyReturn || 0,
          liquidityUtilization: data.liquidityUtilization || 0,
          aprOptimized: data.aprOptimized || 0,
          lastUpdate: Date.now()
        });
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      // Set default values if API fails
      setRealTimeMetrics({
        totalValue: 0,
        currentPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        feesEarned: 0,
        dailyReturn: 0,
        liquidityUtilization: 0,
        aprOptimized: 0,
        lastUpdate: Date.now()
      });
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setWsConnected(false);
  };

  const refreshData = async () => {
    await fetchInitialData();
    
    // Send refresh request via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && address) {
      const refreshMessage = {
        type: 'refresh_metrics',
        address: address
      };
      wsRef.current.send(JSON.stringify(refreshMessage));
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchInitialData();
      connectWebSocket();
    } else {
      disconnect();
      setRealTimeMetrics(null);
    }

    return () => {
      disconnect();
    };
  }, [isConnected, address]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    realTimeMetrics,
    isConnected: wsConnected,
    error,
    refreshData,
    disconnect
  };
}

export type { RealTimeMetrics };