'use client';

import { MToonMaterial } from '@pixiv/three-vrm';
import { OrthographicCamera, RenderTexture } from '@react-three/drei';
import { Container, Root, Text } from '@react-three/uikit';
import React, { useEffect, useRef, useState } from 'react';
import { MeshBasicMaterial, Texture } from 'three';

import { useStreamStore } from '@/store/useStreamStore';
import useVRMStore from '@/store/vrmStore';

export const colors = {
  primary: '#3a3a3a',
  foreground: '#000000',
};

export function ChatTexture({ apiUrl }: { apiUrl: string }) {
  const { messages, addMessage, setChatTexture } = useStreamStore();
  const currentVRM = useVRMStore((state) => state.currentVRM);
  const materialRef = useRef<MeshBasicMaterial>(null);

  const [hasValidMessage, setHasValidMessage] = useState(false);

  // Fetch messages at consistent intervals
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(apiUrl);
        const data: { ok: boolean; data: any } = await response.json();
        if (data.ok && data.data) {
          addMessage(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [apiUrl, addMessage]);

  // Update VRM material with the texture
  function setMaterialOnVRM(texture: Texture | null) {
    const materials = currentVRM?.materials as MToonMaterial[] | undefined;

    if (!materials) return;

    const photoMaterial = materials.find(
      (material) => material.name === 'M_Photo'
    );

    if (photoMaterial) {
      if (!texture || !hasValidMessage) {
        photoMaterial.visible = false; // Hide material if no valid message
        return;
      }

      photoMaterial.visible = true; // Show material when valid message exists
      texture.rotation = Math.PI;
      texture.center.set(0.5, 0.5);
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;

      photoMaterial.map = texture;
      photoMaterial.alphaTest = 0.5;
      photoMaterial.depthWrite = false;
      photoMaterial.needsUpdate = true;
    }
  }

  // Handle texture updates
  useEffect(() => {
    const texture = materialRef.current?.map as Texture | null;

    // Check if there's a valid message
    const latestMessage = messages.slice(-1)[0];
    const isValid = latestMessage && latestMessage.text.trim().length > 0;

    setHasValidMessage(isValid);

    if (isValid && texture) {
      setChatTexture(texture);
      setMaterialOnVRM(texture);
    } else {
      setMaterialOnVRM(null);
    }
  }, [messages, setChatTexture]);

  return (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        visible={false} // Default to invisible until a valid message is applied
        transparent
        color={colors.foreground}>
        <RenderTexture attach="map">
          <>
            <OrthographicCamera makeDefault position={[0, 0, 1]} zoom={100} />
            <Root
              sizeX={10}
              sizeY={10}
              pixelSize={0.01}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              marginTop={100}
              padding={10}>
              {messages
                .slice(-1)
                .map((message) => {
                  message.text = message.text.replace('@BlockRotTestBot', '');
                  message.text = message.text.replace('@BlockRotBot', '');
                  return message;
                })
                .map((message) => (
                  <Container
                    key={message.message_id}
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    height="100%"
                    padding={10}>
                    <Text
                      fontWeight="bold"
                      letterSpacing={5}
                      fontSize={75}
                      color={colors.primary}>
                      {message.username}:
                    </Text>
                    <Text
                      color={colors.foreground}
                      fontSize={100}
                      maxWidth="100%"
                      wordBreak="break-word">
                      {message.text}
                    </Text>
                  </Container>
                ))}
            </Root>
          </>
        </RenderTexture>
      </meshBasicMaterial>
    </mesh>
  );
}
