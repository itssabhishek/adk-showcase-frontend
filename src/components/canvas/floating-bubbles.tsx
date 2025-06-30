/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Html } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { BubbleDiv } from '@/components/canvas/bubble-div';
import useVRMStore from '@/store/vrmStore';

import useBubbleStore from '../../store/useBubbleStore';

export function FloatingBubbles() {
  const { bubbles, removeBubble } = useBubbleStore();
  const headBone = useVRMStore((state) => state.headBone);
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    if (headBone && groupRef.current) {
      headBone.add(groupRef.current);

      // Offset the group relative to the head
      groupRef.current.position.set(0.3, 0, 0);

      return () => {
        headBone.remove(groupRef.current);
      };
    }
  }, [headBone]);

  if (!headBone) return null;

  return (
    <group ref={groupRef}>
      <Html transform={true} scale={0.1}>
        <div
          style={{
            position: 'relative',
            height: 0,
            overflow: 'visible',
          }}>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'center',
            }}>
            {bubbles.map((bubble) => (
              <BubbleDiv
                key={bubble.id}
                bubble={bubble}
                onRemove={() => removeBubble(bubble.id)}
                style={bubble.style}
              />
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}
