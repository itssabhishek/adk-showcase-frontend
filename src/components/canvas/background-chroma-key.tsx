'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Sets the background color of the scene using chroma keying.
 * @param {string} color - The color to set as the background.
 * @returns {JSX.Element} - The component.
 */
export function BackgroundChromaKey({ color }: { color: string }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!color || color === '') return;

    scene.background = new THREE.Color(color);

    return () => {
      scene.background = null;
    };
  }, [scene, color]);

  return <></>;
}
