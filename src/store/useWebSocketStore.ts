import { create } from 'zustand';

interface Subscriber<T = unknown> {
  callback: (data: T) => void;
  subscriptionMethod: string;
}

export interface TradeData {
  bondingCurveKey: string;
  marketCapSol: number;
  mint: string;
  newTokenBalance: number;
  signature: string;
  tokenAmount: number;
  traderPublicKey: string;
  txType: 'buy' | 'sell';
  vSolInBondingCurve: number;
  vTokensInBondingCurve: number;
  // add Sol Amount
  solAmount?: number;
}

interface WebSocketStore {
  websocket: WebSocket | null;
  subscribers: Map<string, Map<string, Subscriber>>;
  connectWebSocket: () => void;
  subscribe: <T>(
    subscriptionMethod: string,
    key: string,
    callback: (data: T) => void
  ) => void;
  unsubscribe: (subscriptionMethod: string, key: string) => void;
  subscribeNewToken: (callback: (data: unknown) => void) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => {
  let websocketInstance: WebSocket | null = null;

  return {
    websocket: null,
    subscribers: new Map(),
    connectWebSocket: () => {
      if (
        websocketInstance &&
        (websocketInstance.readyState === WebSocket.OPEN ||
          websocketInstance.readyState === WebSocket.CONNECTING)
      ) {
        console.log('WebSocket connection already exists');
        return;
      }

      websocketInstance = new WebSocket('wss://pumpportal.fun/api/data');

      websocketInstance.onopen = () => {
        console.log('WebSocket connection opened');
        set({ websocket: websocketInstance });

        // After the WebSocket is open, send subscription messages for existing subscribers
        const subscribers = get().subscribers;
        subscribers.forEach((methodSubscribers, subscriptionMethod) => {
          methodSubscribers.forEach((subscriber, key) => {
            const payload =
              subscriptionMethod === 'subscribeNewToken'
                ? { method: 'subscribeNewToken' }
                : { method: subscriptionMethod, keys: [key] };
            websocketInstance!.send(JSON.stringify(payload));
            console.log(`Subscribed to ${subscriptionMethod} for key:`, key);
          });
        });
      };

      websocketInstance.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          //   console.log('Received data:', data);

          let messageType: string;
          let key: string;

          if (data.mint && data.txType) {
            messageType = 'subscribeTokenTrade';
            key = data.mint;
          } else if (data.mint && data.newTokenBalance !== undefined) {
            messageType = 'subscribeNewToken';
            key = 'default';
          } else {
            console.log('Received unknown message type:', data);
            return;
          }

          const methodSubscribers = get().subscribers.get(messageType);
          if (methodSubscribers) {
            const subscriber = methodSubscribers.get(key);
            if (subscriber) {
              subscriber.callback(data);
            } else {
              console.log(
                `No callback found for key: ${key} under method: ${messageType}`
              );
            }
          } else {
            console.log(`No subscribers found for method: ${messageType}`);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketInstance.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
      };

      websocketInstance.onclose = () => {
        console.log('WebSocket connection closed');
        set({ websocket: null });
        websocketInstance = null;
      };
    },
    subscribe: <T>(
      subscriptionMethod: string,
      key: string,
      callback: (data: T) => void
    ) => {
      const ws = get().websocket;
      const subscribers = get().subscribers;
      let methodSubscribers = subscribers.get(subscriptionMethod);
      if (!methodSubscribers) {
        methodSubscribers = new Map<string, Subscriber>();
        subscribers.set(subscriptionMethod, methodSubscribers);
      }
      if (!methodSubscribers.has(key)) {
        const subscriber: Subscriber = {
          callback,
          subscriptionMethod,
        };
        methodSubscribers.set(key, subscriber);
        set({ subscribers });
        // If the WebSocket is open, send the subscription message
        if (ws && ws.readyState === WebSocket.OPEN) {
          const payload =
            subscriptionMethod === 'subscribeNewToken'
              ? { method: 'subscribeNewToken' }
              : { method: subscriptionMethod, keys: [key] };
          ws.send(JSON.stringify(payload));
          console.log(`Subscribed to ${subscriptionMethod} for key:`, key);
        }
      }
    },
    unsubscribe: (subscriptionMethod: string, key: string) => {
      const ws = get().websocket;
      const subscribers = get().subscribers;
      const methodSubscribers = subscribers.get(subscriptionMethod);
      if (methodSubscribers && methodSubscribers.has(key)) {
        methodSubscribers.delete(key);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const payload =
            subscriptionMethod === 'unsubscribeNewToken'
              ? { method: 'unsubscribeNewToken' }
              : {
                  method: subscriptionMethod.replace(
                    'subscribe',
                    'unsubscribe'
                  ),
                  keys: [key],
                };
          ws.send(JSON.stringify(payload));
          console.log(`Unsubscribed from ${subscriptionMethod} for key:`, key);
        }
        if (methodSubscribers.size === 0) {
          subscribers.delete(subscriptionMethod);
        }
        set({ subscribers });
      }
    },
    subscribeNewToken: (callback: (data: unknown) => void) => {
      const key = 'default';
      get().subscribe('subscribeNewToken', key, callback);
    },
  };
});
