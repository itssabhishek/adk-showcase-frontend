'use client';

// import Lenis from '@studio-freight/lenis';
import { Signal } from '@preact/signals-react';
import { Preload, View } from '@react-three/drei';
import { addEffect, Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';

import useUIRefStore from '@/store/uiRefStore';

export default function Scene({
  style,
  ...props
}: {
  style: React.CSSProperties;
  [key: string]: unknown;
}) {
  const viewportContent = View.Port();

  const [canvasSkissorEnabled, setCanvasSkissorEnabled] = useState(false);

  const canvasRef = useUIRefStore((state) => state.canvasRef);

  return (
    <>
      {canvasSkissorEnabled && (
        <Canvas
          shadows
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: -1, // added to fix the canvas not being behind the content
            ...style,
          }}
          ref={canvasRef}
          onCreated={({ gl }) => {
            console.log(`Global View canvas created (for gl.skissor usage):`);
            console.log(gl.domElement);
          }}
          eventSource={document.body}
          eventPrefix="client"
          {...props}>
          {viewportContent}

          <Preload all />
        </Canvas>
      )}
    </>
  );
}
