import { create } from 'zustand';
import { Message as DBMessage } from '@/types/chat';
import { extractMessageText } from '@/components/utility/parseResponse';

export interface ExtendedMessage extends DBMessage {
  tempId?: string;
}

export type Message = {
  id: string;
  isUser: boolean;
  content: string;
};

interface SocketChatState {
  socket: WebSocket | null;
  messages: Message[];
  userId?: string;
  sessionId?: string;

  connect: () => void;
  joinStream: (streamId: number, userId: number) => void;
  leaveStream: () => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
}

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

const useSocketChatStore = create<SocketChatState>((set, get) => ({
  socket: null,
  messages: [],

  userId: undefined,
  sessionId: undefined,

  connect: () => {
    // Tear down any existing socket
    const existing = get().socket;
    if (existing) {
      console.log('[SocketChat] tearing down existing socket');
      existing.close();
      set({ socket: null });
    }

    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }

    const GATEWAY_URL = process.env.NEXT_PUBLIC_AGENT_CHAT_GATEWAY || '';
    const ws = new WebSocket(GATEWAY_URL);

    ws.onopen = () => {
      console.log('[SocketChat] Connected (WebSocket)');
      // Generate random userId
      const userId = crypto.randomUUID();
      set({ userId });
      // Send initial message with userId and sessionId undefined
      ws.send(
        JSON.stringify({ user_id: userId, message: 'Starting new session' })
      );
      set({ messages: [] });
    };

    ws.onclose = (event) => {
      console.log('[SocketChat] Disconnected (WebSocket) =>', event.reason);
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
      }
      set({ socket: null, messages: [] });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SocketChat] Received data:', data);

        if (data?.session_id && get().sessionId !== data.session_id) {
          set({ sessionId: data.session_id });
          localStorage.setItem('session_id', data.session_id);
          return;
        }

        if (data?.content) {
          const messageText = extractMessageText(data?.content);
          console.log('[SocketChat] Extracted message:', messageText);

          if (messageText) {
            console.log('[SocketChat] Extracted message text:', messageText);
            const messageId = crypto.randomUUID();
            const newMessage = {
              id: messageId,
              isUser: false,
              content: messageText || data.content,
            };

            const newMessages = [...get().messages, newMessage];
            set({ messages: newMessages });

            // try {
            //   const arrBuf = decodeBase64ToArrayBuffer(msg.audio);
            //   const { currentVRM } = useVRMStore.getState();
            //   if (currentVRM?.model) {
            //     currentVRM.model.speakFromBuffer(arrBuf, messageText);
            //   }
            // } catch (err) {
            //   console.error('[SocketChat] audio error:', err);
            // }
          }

          return;
        }
      } catch (err) {
        console.error('[SocketChat] onmessage error:', err);
      }
    };

    set({ socket: ws });
  },

  joinStream: (sessionId, userId) => {
    const sock = get().socket;
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      console.warn('[SocketChat] joinStream but socket not connected');
      return;
    }

    sock.send(
      JSON.stringify({ user_id: userId, message: 'Starting new session' })
    );
  },

  leaveStream: () => {
    const sock = get().socket;
    const { sessionId } = get();
    if (sock && sock.readyState === WebSocket.OPEN && sessionId) {
      sock.send(JSON.stringify({ type: 'leaveStream', streamId: sessionId }));
    }
    set({ sessionId: null, messages: [] });
  },

  disconnect: () => {
    const sock = get().socket;
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    if (sock) {
      sock.close();
    }
    set({ socket: null, messages: [], sessionId: null, userId: undefined });
  },

  sendMessage: (content: string) => {
    const sock = get().socket;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(
        JSON.stringify({
          type: 'send_message',
          session_id: get().sessionId,
          user_id: get().userId,
          message: content,
        })
      );

      const newMessage = {
        id: crypto.randomUUID(),
        isUser: true,
        content,
      };

      const newMessages = [...get().messages, newMessage];
      set({
        messages: newMessages,
      });
    } else {
      get().connect();
    }
  },
}));

export default useSocketChatStore;
