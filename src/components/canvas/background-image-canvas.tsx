'use client';

import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { disposeOfTexture } from '../utility/GarbageCollection';

export function BackgroundImageCanvas({ imageUrl }: { imageUrl: string }) {
  const { scene, gl, invalidate } = useThree();
  imageUrl = imageUrl ? imageUrl : '/img/Arcade.webp';

  // Immediately set the ref to the current texture, moved from useEffect cleanup
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const prevTextureRef = useRef<THREE.Texture | null>(null); // Initialize with null

  if (prevTextureRef.current && prevTextureRef.current !== texture) {
    // Dispose of the previous texture right away if it's different from the current one
    disposeOfTexture(prevTextureRef.current, false);
  }
  prevTextureRef.current = texture; // Update the ref to the current texture

  texture.minFilter = THREE.LinearFilter;

  const updateBackground = () => {
    if (!texture.image || !texture.image.complete) return;

    const canvasAspect = gl.domElement.clientWidth / gl.domElement.clientHeight;
    const imageAspect = texture.image.width / texture.image.height;
    const aspect = imageAspect / canvasAspect;

    texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    texture.repeat.y = aspect > 1 ? 1 : aspect;

    scene.background = texture;
    scene.backgroundIntensity = 1;
    invalidate(); // Force a re-render in @react-three/fiber
  };

  useEffect(() => {
    if (texture.image?.complete) {
      updateBackground();
    } else {
      texture.image.onload = updateBackground;
    }

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateBackground);
    });
    observer.observe(gl.domElement);

    return () => {
      observer.disconnect();
      scene.background = null;

      // Clean up the current texture
      if (texture) {
        disposeOfTexture(texture, false);
      }
    };
  }, [gl.domElement, scene, texture, imageUrl, invalidate]); // Ensure imageUrl is a dependency

  return null;
}
