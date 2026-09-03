import { useEffect, useRef } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MarketTicker, OrderBookDepth, Trade } from '@/types/trading';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

export function useTradingWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { selectedSymbol, setTicker, setOrderBook, setWsStatus, setExecutedTrade } = useTradingStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    let isCancelled = false;

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setWsStatus('reconnecting');

      const urlWithAuth = accessToken ? `${WS_BASE_URL}?token=${accessToken}` : WS_BASE_URL;
      const ws = new WebSocket(urlWithAuth);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCancelled) {
          ws.close();
          return;
        }
        setWsStatus('connected');

        // Subscribe to current symbol topics
        const subTicker = JSON.stringify({
          action: 'subscribe',
          topic: `ticker:${selectedSymbol}`,
        });
        const subOrderbook = JSON.stringify({
          action: 'subscribe',
          topic: `orderbook:${selectedSymbol}`,
        });

        ws.send(subTicker);
        ws.send(subOrderbook);
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          const { topic, payload } = envelope;

          if (!topic || !payload) return;

          if (topic.startsWith('ticker:')) {
            setTicker(payload as MarketTicker);
          } else if (topic.startsWith('orderbook:')) {
            setOrderBook(payload as OrderBookDepth);
          } else if (topic.startsWith('user:order_executed')) {
            setExecutedTrade(payload as Trade);
          }
        } catch (err) {
          // Ignore parse errors from ping frames
        }
      };

      ws.onerror = () => {
        setWsStatus('reconnecting');
      };

      ws.onclose = () => {
        if (!isCancelled) {
          setWsStatus('disconnected');
          // Auto reconnect after 2 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [accessToken, setWsStatus, setTicker, setOrderBook, setExecutedTrade]);

  // When selectedSymbol changes, switch subscriptions
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Subscribe to new symbol
      ws.send(
        JSON.stringify({
          action: 'subscribe',
          topic: `ticker:${selectedSymbol}`,
        })
      );
      ws.send(
        JSON.stringify({
          action: 'subscribe',
          topic: `orderbook:${selectedSymbol}`,
        })
      );
    }
  }, [selectedSymbol]);

  return {
    reconnect: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    },
  };
}
