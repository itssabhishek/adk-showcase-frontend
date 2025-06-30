'use client';

import {
  VRM,
  VRMHumanBoneName,
  VRMLoaderPlugin,
  VRMUtils,
} from '@pixiv/three-vrm';
import { signal } from '@preact/signals-react';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import useAgentStore from '@/store/useAgentStore';
import useVRMStore, { AdditionalVrmProps } from '@/store/vrmStore';
import { AnimationStates } from '@/types/agent';

import { EmoteController } from './emoteController/emoteController';
import { Model } from './Model';
import RotatableModel, { rotationEnabledSignal } from './RotatableModel';
import { loadVRMAnimation } from './VRMAnimation/loadVRMAnimation';
import { VRMLookAtSmootherLoaderPlugin } from './VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin';
import { GetVRMBlendShapeType } from './VrmManager';

interface ILoadingState {
  isLoading: boolean;
  progress: number;
}

interface IModelCache {
  [key: string]: VRM;
}

export const loadingStateSignal = signal<ILoadingState>({
  isLoading: false,
  progress: 0,
});

export const modelCacheSignal = signal<IModelCache>({});

const loadModel = async (
  url: string,
  abortSignal: AbortSignal
): Promise<VRM | null> => {
  if (modelCacheSignal.value[url]) {
    return modelCacheSignal.value[url];
  }

  const loader = new GLTFLoader();
  loader.register(
    (parser) =>
      new VRMLoaderPlugin(parser, {
        lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
      })
  );

  return new Promise((resolve, reject) => {
    if (abortSignal.aborted) {
      reject(new Error('Loading aborted'));
      return;
    }

    loadingStateSignal.value = { isLoading: true, progress: 0 };

    loader.load(
      url,
      (gltf) => {
        if (abortSignal.aborted) {
          return;
        }
        const vrm = gltf.userData.vrm;
        if (vrm) {
          resolve(vrm);
          modelCacheSignal.value[url] = vrm;
        } else {
          reject(new Error('VRM not found in GLTF userData'));
        }
        loadingStateSignal.value = { isLoading: false, progress: 100 };
      },
      (progressEvent) => {
        if (abortSignal.aborted) {
          reject(new Error('Loading aborted'));
          return;
        }
        if (progressEvent.lengthComputable) {
          const percentComplete =
            (progressEvent.loaded / progressEvent.total) * 100;
          loadingStateSignal.value = {
            isLoading: true,
            progress: percentComplete,
          };
        }
      },
      (error) => {
        if (!abortSignal.aborted) {
          console.error('Error loading model:', error);
          reject(error);
        }
      }
    );

    abortSignal.addEventListener('abort', () => {
      if (loadingStateSignal.value.isLoading) {
        console.log(`Loading aborted: ${url}`);
        loadingStateSignal.value = { isLoading: false, progress: 0 };
        reject(new Error('Loading aborted'));
      }
    });
  });
};

type VrmComponentProps = {
  visible?: boolean;
  defaultXYZ?: React.MutableRefObject<THREE.Vector3 | null>;
  posOffset?: THREE.Vector3;
  volume?: number;
};

export default function VrmComponent({
  visible = true,
  defaultXYZ = null,
  posOffset = new THREE.Vector3(0, 0, 0),
  volume = 1,
}: VrmComponentProps) {
  const [vrm, setVrm] = useState<(VRM & AdditionalVrmProps) | null>(null);
  const modelRef = useRef<Model | null>(null);
  const abortController = useRef(new AbortController());

  const { camera } = useThree();

  const selectedVRM = useVRMStore((state) => state.selectedVRM);
  const setCurrentVRM = useVRMStore((state) => state.setCurrentVRM);
  const setVRMBlendShapeType = useVRMStore(
    (state) => state.setVRMBlendShapeType
  );
  const setHeadBone = useVRMStore((state) => state.setHeadBone);
  const { playIdleAnimationById, animationDictionary } = useVRMStore.getState();

  const { selectedAgent, allAgents } = useAgentStore();
  const currentAgent =
    allAgents.find((agent) => agent.id === selectedAgent) ?? null;

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.unLoadVrm();
      modelRef.current = null;
      setVrm(null);
    }
    if (!selectedVRM?.file?.url) {
      return;
    }

    const doLoad = async () => {
      try {
        const loadedVrm = await loadModel(
          selectedVRM.file.url,
          abortController.current.signal
        );

        if (!loadedVrm) return;

        const model = new Model(camera);
        modelRef.current = model;
        model.vrm = loadedVrm;

        loadedVrm.scene.name = 'VRMRoot';
        const headBoneNode = loadedVrm.humanoid.getNormalizedBoneNode(
          VRMHumanBoneName.Head
        );
        if (headBoneNode) {
          const eyePosition = new THREE.Vector3();
          headBoneNode.getWorldPosition(eyePosition);
          eyePosition.y += 0.1;
          (loadedVrm as VRM & AdditionalVrmProps).eyesPosition = eyePosition;
          setHeadBone(headBoneNode);
          loadedVrm.scene.traverse((o) => {
            o.frustumCulled = false;
          });
        }

        VRMUtils.rotateVRM0(loadedVrm);
        model.mixer = new THREE.AnimationMixer(loadedVrm.scene);
        model.emoteController = new EmoteController(loadedVrm, camera);

        VRMUtils.removeUnnecessaryVertices(loadedVrm.scene);
        VRMUtils.removeUnnecessaryJoints(loadedVrm.scene);

        (loadedVrm as VRM & AdditionalVrmProps).model = model;
        setCurrentVRM(loadedVrm as VRM & AdditionalVrmProps);

        const matchType = GetVRMBlendShapeType(loadedVrm);
        setVRMBlendShapeType(matchType as unknown as string);

        setVrm(loadedVrm as VRM & AdditionalVrmProps);
      } catch (err) {
        if ((err as Error).message !== 'Loading aborted') {
          console.error('VRM loading error:', err);
        }
      }
    };

    abortController.current.abort();
    abortController.current = new AbortController();
    doLoad();

    return () => {
      abortController.current.abort();
    };
  }, [
    selectedVRM?.file?.url,
    camera,
    setCurrentVRM,
    setVRMBlendShapeType,
    setHeadBone,
  ]);

  useEffect(() => {
    if (!vrm || !modelRef.current || !currentAgent) return;
    const idleEntry = currentAgent.animations?.find(
      (a) => a.state === AnimationStates.IDLE
    );

    if (idleEntry?.animationId) {
      playIdleAnimationById(idleEntry.animationId);
    } else {
      const defaultIdle = animationDictionary.find((a) => a.loop === true);
      if (defaultIdle) {
        playIdleAnimationById(defaultIdle.id);
      }
    }
  }, [vrm, modelRef, currentAgent]);

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.update(delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, 0);
      if (posOffset) {
        groupRef.current.position.add(posOffset);
      }
    }
  }, [vrm, posOffset]);

  if (!vrm) return null;

  return (
    <group ref={groupRef} visible={visible}>
      <RotatableModel dragZone={[2, 5, 1]} debug={false}>
        <group scale={[1, 1, 1]}>
          <primitive object={vrm.scene} />
        </group>
      </RotatableModel>
    </group>
  );
}
