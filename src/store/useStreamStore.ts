import { Texture } from 'three';
import { create } from 'zustand';

import { MessageObject } from '../components/blockchain-data/interfaces';

interface StreamStore {
  messages: MessageObject[];
  currentMessage: MessageObject | null;
  chatTexture: Texture | null;
  addMessage: (message: MessageObject, fromBroadcast?: boolean) => void;
  removeCurrentMessage: (fromBroadcast?: boolean) => void;
  setChatTexture: (texture: Texture | null, fromBroadcast?: boolean) => void;
}

const broadcastChannel = new BroadcastChannel('chatStore');
let isBroadcasting = false;

export const useStreamStore = create<StreamStore>((set, get) => ({
  messages: [],
  currentMessage: null,
  chatTexture: null,

  addMessage: (message, fromBroadcast = false) => {
    const { messages } = get();
    const exists = messages.some(
      (msg) => msg.message_id === message.message_id
    );

    if (!exists) {
      if (!fromBroadcast) {
        isBroadcasting = true;
        broadcastChannel.postMessage({ key: 'messages', value: message });
        isBroadcasting = false;
      }

      set({
        messages: [...messages.slice(-9), message], // Keep the last 10 messages
        currentMessage: message,
      });
    }
  },

  removeCurrentMessage: (fromBroadcast = false) => {
    if (!fromBroadcast) {
      isBroadcasting = true;
      broadcastChannel.postMessage({ key: 'removeCurrentMessage' });
      isBroadcasting = false;
    }

    set({ currentMessage: null });
  },

  setChatTexture: (texture, fromBroadcast = false) => {
    set({ chatTexture: texture });
  },
}));

// Listen to messages from other tabs and update the state accordingly
broadcastChannel.onmessage = (event) => {
  if (isBroadcasting) return;
  const { key, value } = event.data;
  const { addMessage, removeCurrentMessage } = useStreamStore.getState();

  if (key === 'messages') {
    addMessage(value, true);
  } else if (key === 'removeCurrentMessage') {
    removeCurrentMessage(true);
  }
};
