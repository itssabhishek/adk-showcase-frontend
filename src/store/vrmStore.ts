import { VRM } from '@pixiv/three-vrm';
import { Object3D, Vector3 } from 'three';
import { create } from 'zustand';

import { Model } from '@/components/vrm/Model';
import { loadVRMAnimation } from '@/components/vrm/VRMAnimation/loadVRMAnimation';
import { VRMAnimation } from '@/components/vrm/VRMAnimation/VRMAnimation';
import { IVrmProps } from '@/types/agent';

// export interface IVrmProps {
//   id: number;
//   name: string;
//   file: {
//     url: string;
//   };
//   thumbnail?: {
//     url: string;
//   };
//   // ...other fields
// }

export interface AnimationDictItem {
  id: number;
  name: string;
  path: string;
  image?: string;
  loop?: boolean;
}

export interface AdditionalVrmProps extends VRM {
  model?: Model; // pointer back to the Model instance
  eyesPosition?: Vector3;
}

/** Options for controlling playback (e.g. talk animations) */
export interface AnimationOptions {
  loop?: boolean;
}

interface VRMStoreState {
  allVrms: IVrmProps[];
  userAvailableVrms: IVrmProps[];
  selectedVRM: IVrmProps | null;
  currentVRM: (VRM & AdditionalVrmProps) | null;

  /** Fetched from /api/agent/ms-animation - each item has {id, name, path, loop} */
  animationDictionary: AnimationDictItem[];

  /** Cache loaded VRMAnimations by ID. So we don't keep re-loading from URL. */
  loadedAnimations: Record<number, VRMAnimation | null>;

  /** Tracks the type of blendshapes (ARKIT, VRM12, etc). Not strictly needed for the question. */
  blendShapeType: string | null;
  headBone: Object3D | null;

  /** Actions */
  setAllVrms: (vrms: IVrmProps[]) => void;
  setUserAvailableVrms: (vrms: IVrmProps[]) => void;
  setSelectedVRM: (vrm: IVrmProps) => void;
  setCurrentVRM: (vrm: VRM & AdditionalVrmProps) => void;
  setAnimationDictionary: (dict: AnimationDictItem[]) => void;
  setVRMBlendShapeType: (type: string) => void;
  setHeadBone: (bone: Object3D | null) => void;

  /**
   * Load & play an Idle animation by ID.
   * Will fetch VRMAnimation from path if not already loaded, then call model.loadIdleAnimation.
   */
  playIdleAnimationById: (animationId: number) => Promise<void>;

  /**
   * Load & play an Action animation (e.g. talk) by ID.
   * Will fetch VRMAnimation from path if not loaded, then call model.playActionAnimation.
   */
  playActionAnimationById: (
    animationId: number,
    options?: AnimationOptions
  ) => Promise<void>;
}

export const useVRMStore = create<VRMStoreState>((set, get) => ({
  allVrms: [],
  userAvailableVrms: [],
  selectedVRM: null,
  currentVRM: null,

  animationDictionary: [],
  loadedAnimations: {},

  blendShapeType: null,
  headBone: null,
  setAllVrms: (vrms: IVrmProps[]) => set({ allVrms: vrms }),
  setUserAvailableVrms: (vrms: IVrmProps[]) => set({ userAvailableVrms: vrms }),
  setSelectedVRM: (vrm: IVrmProps) => set({ selectedVRM: vrm }),
  setCurrentVRM: (vrm: VRM & AdditionalVrmProps) => set({ currentVRM: vrm }),
  setAnimationDictionary: (dict) => set({ animationDictionary: dict }),
  setVRMBlendShapeType: (type) => set({ blendShapeType: type }),
  setHeadBone: (bone) => set({ headBone: bone }),

  async playIdleAnimationById(animationId: number) {
    const { currentVRM, animationDictionary, loadedAnimations } = get();
    if (!currentVRM || !currentVRM.model) return;

    // 1) find the dictionary entry
    const animEntry = animationDictionary.find((a) => a.id === animationId);
    if (!animEntry) {
      console.warn(
        '[useVRMStore] No animation dictionary entry found for',
        animationId
      );
      return;
    }

    // 2) If we don't have it cached, load it
    let vrmAnim = loadedAnimations[animationId] || null;
    if (!vrmAnim) {
      try {
        const loaded = await loadVRMAnimation(animEntry.path);
        if (!loaded) {
          console.warn(
            '[useVRMStore] Could not load VRMAnimation from path',
            animEntry.path
          );
          return;
        }
        vrmAnim = loaded;
        set((state) => ({
          loadedAnimations: {
            ...state.loadedAnimations,
            [animationId]: loaded,
          },
        }));
      } catch (e) {
        console.error('[useVRMStore] Error loading VRMAnimation', e);
        return;
      }
    }

    // 3) pass to model
    currentVRM.model.loadIdleAnimation(vrmAnim as VRMAnimation);
  },

  async playActionAnimationById(
    animationId: number,
    options?: AnimationOptions
  ) {
    const { currentVRM, animationDictionary, loadedAnimations } = get();
    if (!currentVRM || !currentVRM.model) return;

    // 1) find the dictionary entry
    const animEntry = animationDictionary.find((a) => a.id === animationId);
    if (!animEntry) {
      console.warn(
        '[useVRMStore] No animation dictionary entry found for',
        animationId
      );
      return;
    }

    // 2) If we don't have it cached, load it
    let vrmAnim = loadedAnimations[animationId] || null;
    if (!vrmAnim) {
      try {
        const loaded = await loadVRMAnimation(animEntry.path);
        if (!loaded) {
          console.warn(
            '[useVRMStore] Could not load VRMAnimation from path',
            animEntry.path
          );
          return;
        }
        vrmAnim = loaded;
        set((state) => ({
          loadedAnimations: {
            ...state.loadedAnimations,
            [animationId]: loaded,
          },
        }));
      } catch (e) {
        console.error('[useVRMStore] Error loading VRMAnimation', e);
        return;
      }
    }

    // 3) pass to model
    await currentVRM.model.playActionAnimation(
      vrmAnim as VRMAnimation,
      options
    );
  },
}));

export default useVRMStore;
