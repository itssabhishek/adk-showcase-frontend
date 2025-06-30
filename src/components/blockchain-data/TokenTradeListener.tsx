/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';

import { PriceData, TokenData, Trade, TradeResponse } from './interfaces';

// A map to store active listeners by tokenAddress
const activeListeners = new Map<
  string,
  {
    fetchInformation: () => Promise<void>;
    subscriptions: {
      onTradesFetched: (data: TradeResponse) => void;
      onTokenPriceFetched: (marketCap: number) => void;
    }[];
  }
>();

type TokenTradeListenerProps = {
  tokenAddress: string;
  interval: number;
  onTradesFetched: (data: TradeResponse) => void;
  onTokenPriceFetched: (marketCap: number) => void;
  delayTime?: number;
};

const MAX_TRADE_CACHE = 1000;

const TokenTradeListener: React.FC<TokenTradeListenerProps> = ({
  tokenAddress,
  interval,
  onTradesFetched,
  onTokenPriceFetched,
  delayTime = 1250,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tradeCache = useRef<Map<string, Trade>>(new Map());
  const isFetching = useRef(false); // Prevent overlapping requests

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchTrades = async () => {
    try {
      const tradesResponse = await fetch(
        `https://data.solanatracker.io/trades/${tokenAddress}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY || '',
          },
        }
      );

      if (!tradesResponse.ok) {
        throw new Error(`Failed to fetch trades: ${tradesResponse.statusText}`);
      }

      const tradesData = await tradesResponse.json();
      const trades = tradesData.trades as Trade[];

      const newTrades = filterNewTrades(trades);

      if (newTrades.length > 0) {
        const tradeResponse: TradeResponse = {
          trades: newTrades,
          tokenAddress,
        };

        console.log(`New trades fetched: ${newTrades.length}`);

        // Notify all subscriptions
        activeListeners
          .get(tokenAddress)
          ?.subscriptions.forEach((sub) => sub.onTradesFetched(tradeResponse));
      }

      updateTradeCache(newTrades);
    } catch (error) {
      console.error(`Error fetching trades for ${tokenAddress}:`, error);
    }
  };

  const fetchTokenPrice = async () => {
    try {
      const tokenResponse = await fetch(
        `https://data.solanatracker.io/price?token=${tokenAddress}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY || '',
          },
        }
      );

      if (!tokenResponse.ok) {
        throw new Error(
          `Failed to fetch token information: ${tokenResponse.statusText}`
        );
      }

      const priceData: PriceData = await tokenResponse.json();

      // Notify all subscriptions
      activeListeners
        .get(tokenAddress)
        ?.subscriptions.forEach((sub) =>
          sub.onTokenPriceFetched(priceData.marketCap)
        );
    } catch (error) {
      console.error(
        `Error fetching token information for ${tokenAddress}:`,
        error
      );
    }
  };

  const filterNewTrades = (trades: Trade[]): Trade[] => {
    return trades.filter((trade) => !tradeCache.current.has(trade.tx));
  };

  const updateTradeCache = (trades: Trade[]) => {
    trades.forEach((trade) => {
      tradeCache.current.set(trade.tx, trade);
    });

    if (tradeCache.current.size > MAX_TRADE_CACHE) {
      const keysToRemove = Array.from(tradeCache.current.keys()).slice(
        0,
        tradeCache.current.size - MAX_TRADE_CACHE
      );
      keysToRemove.forEach((key) => tradeCache.current.delete(key));
    }
  };

  const fetchInformation = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      await fetchTrades();
      // await delay(delayTime);
      // await fetchTokenPrice();
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (!activeListeners.has(tokenAddress)) {
      // Create a new listener if none exists
      activeListeners.set(tokenAddress, {
        fetchInformation,
        subscriptions: [{ onTradesFetched, onTokenPriceFetched }],
      });

      // Start the fetch loop
      intervalRef.current = setInterval(fetchInformation, interval);
      fetchInformation();
    } else {
      // Add to existing subscriptions
      activeListeners.get(tokenAddress)?.subscriptions.push({
        onTradesFetched,
        onTokenPriceFetched,
      });
    }

    return () => {
      const listener = activeListeners.get(tokenAddress);
      if (!listener) return;

      // Remove subscription on unmount
      listener.subscriptions = listener.subscriptions.filter(
        (sub) => sub.onTradesFetched !== onTradesFetched
      );

      // If no subscriptions remain, clear the listener
      if (listener.subscriptions.length === 0) {
        activeListeners.delete(tokenAddress);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };
  }, [tokenAddress, interval]);

  return null;
};

export default TokenTradeListener;
