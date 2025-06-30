import React from 'react';
import { set } from 'react-hook-form';
import { create } from 'zustand';

interface UIRefStoreState {
  bottomBarRef: React.RefObject<HTMLDivElement>;
  setBottomBarRef: (ref: React.RefObject<HTMLDivElement>) => void;
  cameraButtonRef: React.RefObject<HTMLButtonElement>;
  setCameraButtonRef: (ref: React.RefObject<HTMLButtonElement>) => void;
  sparklesButtonRef: React.RefObject<HTMLButtonElement>;
  setSparklesButtonRef: (ref: React.RefObject<HTMLButtonElement>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasRef: (ref: React.RefObject<HTMLCanvasElement>) => void;
}

const useUIRefStore = create<UIRefStoreState>((set) => {
  return {
    bottomBarRef: React.createRef<HTMLDivElement>(),
    setBottomBarRef: (newRef) => set({ bottomBarRef: newRef }),
    cameraButtonRef: React.createRef<HTMLButtonElement>(),
    setCameraButtonRef: (newRef) => set({ cameraButtonRef: newRef }),
    sparklesButtonRef: React.createRef<HTMLButtonElement>(),
    setSparklesButtonRef: (newRef) => set({ sparklesButtonRef: newRef }),
    canvasRef: React.createRef<HTMLCanvasElement>(),
    setCanvasRef: (newRef) => set({ canvasRef: newRef }),
  };
});

export default useUIRefStore;
