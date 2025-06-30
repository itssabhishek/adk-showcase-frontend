/* eslint-disable */
'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { Vector3 } from 'three';

import { Background360 } from '@/components/canvas/background-360';
import { BackgroundImageCanvas } from '@/components/canvas/background-image-canvas';
import { FloatingBubbles } from '@/components/canvas/floating-bubbles';
import useBackgroundStore from '@/store/backgroundStore';
import useCameraStore from '@/store/cameraStore';
import useVRMStore from '@/store/vrmStore';

import { BackgroundChromaKey } from './background-chroma-key';

/**
 * Props for the main canvas to handle camera offsets & FOV
 */
interface MainCanvasProps {
  children?: React.ReactNode;

  /** Additional CSS classes for styling the canvas element */
  className?: string;

  /** 3D x-axis offset from the VRM's head position */
  xOffset?: number;
  /** 3D y-axis offset from the VRM's head position */
  yOffset?: number;
  /** 3D z-axis offset from the VRM's head position */
  zOffset?: number;

  /**
   * Field-of-view for the perspective camera.
   * (Default: 45 degrees)
   */
  cameraFov?: number;
}

/**
 * A subcomponent that applies the camera position & FOV each frame (or whenever VRM changes).
 */
function SetCameraPos({
  xOffset = 0,
  yOffset = 0,
  zOffset = 0,
  cameraFov = 45,
}: {
  xOffset?: number;
  yOffset?: number;
  zOffset?: number;
  cameraFov?: number;
}) {
  const { camera } = useThree();
  const currentVRM = useVRMStore((state) => state.currentVRM);

  useEffect(() => {
    // Reset camera position and look at center
    camera.position.set(0, 0, zOffset || 0);
    camera.lookAt(new Vector3(0, 0, 0));

    // When cameraFov changes, update camera
    //@ts-expect-error fov
    camera.fov = cameraFov;
    camera.updateProjectionMatrix();
  }, [camera, cameraFov, zOffset]);

  useEffect(() => {
    if (!currentVRM) return;

    // "eyesPosition" is stored in VRM store
    const eyePosition = currentVRM.eyesPosition || new THREE.Vector3(0, 1.5, 0);

    const cameraBasePosition = new THREE.Vector3(
      eyePosition.x + xOffset,
      eyePosition.y + yOffset,
      eyePosition.z + zOffset
    );
    camera.position.copy(cameraBasePosition);
  }, [currentVRM, camera, xOffset, yOffset, zOffset]);

  return null;
}

/**
 * MainCanvas component represents the main canvas for rendering 3D scenes with VRM models.
 * - Provides camera control via xOffset, yOffset, zOffset, cameraFov
 * - Renders optional background (Static / 360 / Chroma)
 * - Renders quest watermarks, chat textures, floating bubbles, etc.
 */
export const MainCanvas = forwardRef<HTMLCanvasElement, MainCanvasProps>(
  (
    {
      children,
      className,
      xOffset = 0,
      yOffset = 0,
      zOffset = 0,
      cameraFov = 45,
    },
    ref
  ) => {
    const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    useImperativeHandle(ref, () => internalCanvasRef.current!);

    const currentBackground = useBackgroundStore(
      (state) => state.currentBackground
    );

    const orbitControlsRef = useRef<any>(null);

    const currentVRM = useVRMStore((state) => state.currentVRM);
    const setCameraControls = useCameraStore(
      (state) => state.setCameraControls
    );
    const checkCameraMoved = useCameraStore((state) => state.checkCameraMoved);
    const orbitEnabled = useCameraStore((state) => state.enabled);

    useEffect(() => {
      if (orbitControlsRef.current) {
        setCameraControls(orbitControlsRef.current);
      }
    }, [orbitControlsRef.current, setCameraControls]);

    // Sometimes enabling/disabling controls
    useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => {
        if (!orbitControlsRef) return;
        if (orbitControlsRef.current === null) return;

        if (event.target instanceof HTMLCanvasElement) {
          orbitControlsRef.current.enabled = true;
        } else {
          orbitControlsRef.current.enabled = false;
        }
      };
      window.addEventListener('pointerdown', handlePointerDown);
      return () => {
        window.removeEventListener('pointerdown', handlePointerDown);
      };
    }, []);

    return (
      <Canvas
        ref={internalCanvasRef}
        className={`w-full h-full absolute inset-0 z-0 ${className || ''}`}
        onCreated={({ gl }) => {
          // ...
        }}
        style={{ pointerEvents: 'all' }}
        eventSource={document.body}
        eventPrefix="client">
        <directionalLight intensity={3} position={[-1, 0, 2]} />

        {/* BACKGROUND LOGIC */}
        {currentBackground?.bgConfig?.type === 'Static' && (
          <BackgroundImageCanvas imageUrl={currentBackground?.image?.url} />
        )}
        {currentBackground?.bgConfig?.type === '360' && (
          <Background360 currentBackground={currentBackground} />
        )}
        {currentBackground?.bgConfig?.type === 'Chroma' && (
          <BackgroundChromaKey
            color={currentBackground?.bgConfig?.color || '#0f0'}
          />
        )}

        {/* ORBIT CONTROLS */}
        <OrbitControls
          ref={orbitControlsRef}
          target={currentVRM?.eyesPosition || new THREE.Vector3(0, 1.5, 0)}
          rotateSpeed={0.5}
          panSpeed={0.5}
          enableZoom={true}
          enableRotate={false}
          enabled={orbitEnabled}
          onChange={() => checkCameraMoved()}
        />

        {/* APPLY OUR camera offset + fov */}
        <SetCameraPos
          xOffset={xOffset}
          yOffset={yOffset}
          zOffset={zOffset}
          cameraFov={cameraFov}
        />

        <ambientLight />

        {/* VRM / children */}
        {children}

        <FloatingBubbles />
      </Canvas>
    );
  }
);

MainCanvas.displayName = 'MainCanvas';
