import { signal } from '@preact/signals-react';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Raycaster, Vector2 } from 'three';
import * as THREE from 'three';

export const rotationEnabledSignal = signal(true);

export default function RotatableModel({
  children,
  dragZone = [2, 1.5, 1],
  externalDivRef,
  debug = false,
}: {
  children: React.ReactNode;
  dragZone?: [number, number, number];
  externalDivRef?: React.MutableRefObject<HTMLDivElement>;
  debug?: boolean;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const touchMesh = useRef<THREE.Mesh>(null);
  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);

  const [debugText, setDebugText] = useState('');

  const isRotating = useRef(false);
  const rotateStart = useRef(new Vector2());
  const rotateEnd = useRef(new Vector2());
  const rotateDelta = useRef(new Vector2());
  const rotationVelocity = useRef(new Vector2());

  const damping = 0.95;

  function getRelativeCoordinates(event: PointerEvent | TouchEvent) {
    const rect = gl.domElement.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      const e = event as PointerEvent;
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  const checkMeshUnderPointer = (event: PointerEvent | TouchEvent) => {
    if (!touchMesh.current) return false;

    const relativeCoords = getRelativeCoordinates(event);
    const mouse = new THREE.Vector2(
      (relativeCoords.x / gl.domElement.clientWidth) * 2 - 1,
      -(relativeCoords.y / gl.domElement.clientHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(touchMesh.current);

    return intersects.length > 0;
  };

  const handlePointerDown = (e: PointerEvent | TouchEvent) => {
    if ('button' in e && e.button !== 0) {
      return;
    }
    if (!rotationEnabledSignal.value) return;
    if (!checkMeshUnderPointer(e)) return;

    isRotating.current = true;
    const relativeCoords = getRelativeCoordinates(e);
    rotateStart.current.set(relativeCoords.x, relativeCoords.y);

    e.preventDefault();
  };

  const handlePointerMove = (e: PointerEvent | TouchEvent) => {
    if (!rotationEnabledSignal.value) return;
    if (!isRotating.current) return;

    const relativeCoords = getRelativeCoordinates(e);
    rotateEnd.current.set(relativeCoords.x, relativeCoords.y);

    rotateDelta.current.subVectors(rotateEnd.current, rotateStart.current);

    rotationVelocity.current.y += rotateDelta.current.x * 0.001;

    rotateStart.current.copy(rotateEnd.current);
    setDebugText(rotationVelocity.current.y.toFixed(2));

    e.preventDefault();
  };

  const handlePointerRelease = () => {
    isRotating.current = false;
  };

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += rotationVelocity.current.y;
      rotationVelocity.current.multiplyScalar(damping);
    }
  });

  const addEventListeners = (target: HTMLElement) => {
    target.addEventListener('pointerdown', handlePointerDown, {
      passive: false,
    });
    target.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    });
    target.addEventListener('pointerup', handlePointerRelease, {
      passive: false,
    });
    target.addEventListener('pointerleave', handlePointerRelease, {
      passive: false,
    });
    target.addEventListener('touchstart', handlePointerDown, {
      passive: false,
    });
    target.addEventListener('touchmove', handlePointerMove, { passive: false });
    target.addEventListener('touchend', handlePointerRelease, {
      passive: false,
    });
  };

  const removeEventListeners = (target: HTMLElement) => {
    target.removeEventListener('pointerdown', handlePointerDown);
    target.removeEventListener('pointermove', handlePointerMove);
    target.removeEventListener('pointerup', handlePointerRelease);
    target.removeEventListener('pointerleave', handlePointerRelease);
    target.removeEventListener('touchstart', handlePointerDown);
    target.removeEventListener('touchmove', handlePointerMove);
    target.removeEventListener('touchend', handlePointerRelease);
  };

  useEffect(() => {
    const target = externalDivRef?.current || gl.domElement;

    const unsubscribe = rotationEnabledSignal.subscribe(() => {
      if (rotationEnabledSignal.value) {
        addEventListeners(target);
      } else {
        removeEventListeners(target);
      }
    });

    // Initial
    if (rotationEnabledSignal.value) {
      addEventListeners(target);
    }

    return () => {
      removeEventListeners(target);
      unsubscribe();
    };
  }, [externalDivRef, gl.domElement]);

  return (
    <>
      <mesh ref={touchMesh}>
        <boxGeometry args={dragZone} />
        <meshBasicMaterial visible={debug} color="#00FF00" wireframe />
      </mesh>

      <group ref={modelRef}>{children}</group>
    </>
  );
}
