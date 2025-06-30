// useBubbleStore.ts
import { CSSProperties, ReactNode } from 'react';
import { create } from 'zustand';

export interface Bubble {
  id: number;
  content: ReactNode;
  createdAt: number;
  style?: CSSProperties;
}

interface BubbleStore {
  bubbles: Bubble[];
  addBubble: (content: ReactNode, style?: CSSProperties) => void;
  removeBubble: (id: number) => void;
}

const MAX_BUBBLES = 10;

let bubbleIdCounter = 0;

const useBubbleStore = create<BubbleStore>((set, get) => ({
  bubbles: [],
  addBubble: (content, style) =>
    set((state) => {
      const id = bubbleIdCounter++;
      const newBubble: Bubble = { id, content, createdAt: Date.now(), style };

      if (state.bubbles.length >= MAX_BUBBLES) {
        const oldestBubble = state.bubbles[0];
        return {
          bubbles: [...state.bubbles.slice(1), newBubble],
        };
      }

      return { bubbles: [...state.bubbles, newBubble] };
    }),
  removeBubble: (id) =>
    set((state) => ({
      bubbles: state.bubbles.filter((bubble) => bubble.id !== id),
    })),
}));

export default useBubbleStore;
