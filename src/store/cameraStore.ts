import { OrbitControls as OrbitControlsImpl } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';

interface CameraStoreState {
  camera: THREE.Camera;
  cameraControls: unknown; // TODO set correct type
  cameraMoved: boolean;
  enabled: boolean;
  stateSaved: boolean;
  toggleReset: boolean;
  cameraBasePosition: THREE.Vector3;
  cameraTargetPosition: THREE.Vector3;
  setCamera: (camera: THREE.Camera) => void;
  setCameraControls: (controls: typeof OrbitControlsImpl | null) => void;
  setCameraBasePosition: (position: THREE.Vector3) => void;
  setCameraTargetPosition: (position: THREE.Vector3) => void;
  resetCamera: () => void;
  toggleCameraControls: (enabled?: boolean) => void;
  checkCameraMoved: () => void;
}

const NullVector = new THREE.Vector3(0, 0, 0);

const useCameraStore = create<CameraStoreState>((set, get) => ({
  camera: null,
  cameraControls: null,
  cameraMoved: false,
  enabled: true,
  stateSaved: false,
  toggleReset: false,
  cameraBasePosition: NullVector.clone(),
  cameraTargetPosition: NullVector.clone(),
  setCamera: (camera) => set({ camera }),
  setCameraControls: (controls) => set({ cameraControls: controls }),
  setCameraBasePosition: (position) => set({ cameraBasePosition: position }),
  setCameraTargetPosition: (position) =>
    set({ cameraTargetPosition: position }),
  resetCamera: () => {
    set((state) => {
      if (state.cameraControls && state.camera) {
        //@ts-expect-error ---
        state.cameraControls.enableDamping = false;
        //@ts-expect-error ---
        state.cameraControls.target.copy(state.cameraTargetPosition);
        state.camera.position.copy(state.cameraBasePosition);
        //@ts-expect-error ---
        state.cameraControls.update();
        //@ts-expect-error ---
        state.cameraControls.enableDamping = true;
        return { cameraMoved: false };
      }
      return {};
    });
  },
  toggleCameraControls: (enabled?: boolean) => {
    set((state) => {
      const newEnabled = enabled !== undefined ? enabled : !state.enabled;
      if (state.cameraControls) {
        //@ts-expect-error ---
        state.cameraControls.enabled = newEnabled;
      }
      return { enabled: newEnabled };
    });
  },
  checkCameraMoved: () => {
    const { camera, cameraBasePosition, cameraTargetPosition, cameraControls } =
      get();
    if (camera && cameraControls) {
      const cameraMoved =
        !camera.position.equals(cameraBasePosition) ||
        //@ts-expect-error ---
        !cameraControls.target.equals(cameraTargetPosition);
      set({ cameraMoved });
    }
  },
}));

export default useCameraStore;
