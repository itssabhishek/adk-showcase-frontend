import { create } from 'zustand';

import { IBgProps } from '@/types/agent';

interface BackgroundStoreState {
  allBackgrounds: IBgProps[];
  userAvailableBackgrounds: IBgProps[];
  currentBackground: IBgProps | null;
  fetchUpdateTrigger: number;
  setAllBackgrounds: (backgrounds: IBgProps[]) => void;
  setUserAvailableBackgrounds: (backgrounds: IBgProps[]) => void;
  setCurrentBackground: (background: IBgProps) => void;
  triggerFetchBackgrounds: () => void;
}

export const chromaBgs: Partial<IBgProps>[] = [
  {
    id: -1, // set-automatically
    name: 'Chroma Key Green',
    description: `Use Chroma Key to add your own backgrounds in editing software`,
    unlockedByDefault: true,
    bgConfig: {
      type: 'Chroma',
      color: '#00FF00',
    },
  },
  {
    id: -1, // set-automatically
    name: 'Chroma Key Blue',
    description: `Use Chroma Key to add your own backgrounds in editing software`,
    unlockedByDefault: true,
    bgConfig: {
      type: 'Chroma',
      color: '#0000FF',
    },
  },
];

const useBackgroundStore = create<BackgroundStoreState>((set) => ({
  allBackgrounds: [],
  userAvailableBackgrounds: [],
  currentBackground: null,
  fetchUpdateTrigger: 0,
  setAllBackgrounds: (backgrounds) => set({ allBackgrounds: backgrounds }),
  setUserAvailableBackgrounds: (backgrounds) =>
    set({ userAvailableBackgrounds: backgrounds }),
  setCurrentBackground: (background) => set({ currentBackground: background }),
  triggerFetchBackgrounds: () =>
    set((state) => ({ fetchUpdateTrigger: state.fetchUpdateTrigger + 1 })),
}));

export default useBackgroundStore;
