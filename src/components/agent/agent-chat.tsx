'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';

import AgentChatFullscreenCanvas from '@/components/agent/agent-chat-fullscreen-canvas';

import { ChatPrivateMessageUI } from '@/components/chat';
import VrmComponent from '@/components/vrm/VrmComponent';
import useCameraStore from '@/store/cameraStore';
import useAgentStore from '../../store/useAgentStore';
import useSocketChatStore, { Message } from '../../store/useSocketChatStore';
import TextareaWithButton from '../common/textarea-with-button';
import { IconButton } from '@/components/buttons';
import { MicSVG, SendSVG } from '../../../public/svg';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import MicPortal from '../common/mic-portal';

const MainCanvas = dynamic(
  () => import('@/components/canvas').then((mod) => mod.MainCanvas),
  { ssr: false }
);
export default function AgentChat() {
  const { agent } = useAgentStore();
  const messages = [];
  const { connect, joinStream, sendMessage, leaveStream, disconnect } =
    useSocketChatStore();
  const [streamId, setStreamId] = useState<number | null>(null);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1); // 0 to 1
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const cameraControls = useCameraStore((state) => state.cameraControls);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        const container = chatContainerRef.current;
        // Use requestAnimationFrame to ensure the DOM has updated
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    };

    scrollToBottom();
    // Add a small delay to handle any dynamic content
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Add event listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    return () => {
      leaveStream();
      disconnect();
    };
  }, [leaveStream, disconnect]);

  // MediaRecorder references and state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle audio recording toggle
  const handleToggleRecording = () => {
    // Instead of immediately starting/stopping recording, open the mic modal
    setIsMicModalOpen(true);
    // We'll start recording from within the modal
  };

  // Start the recording process
  const startRecording = () => {
    // Check if MediaRecorder is available in the browser
    if (!('MediaRecorder' in window)) {
      alert('Audio recording is not supported in your browser.');
      return;
    }

    // Request access to the microphone
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Store the stream in ref
        streamRef.current = stream;

        // Create a new MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        // Clear previous audio chunks
        audioChunksRef.current = [];

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        // Handle recording stop event
        mediaRecorder.onstop = () => {
          // Process the recorded audio
          processAudio();
        };

        // Start recording
        mediaRecorder.start(200); // Collect data in chunks of 200ms
        setIsRecording(true);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        alert(
          'Error accessing microphone. Please ensure you have granted permission.'
        );
      });
  };

  // Stop the recording process
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  // Process the recorded audio
  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    // Create a blob from audio chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    try {
      // Option 1: Convert to text using Speech-to-Text API (if available)
      // This is a placeholder - you would need to implement an actual STT service
      // Either use a cloud service or browser's SpeechRecognition if available

      // For demonstration, we'll use a simple way to show audio was recorded
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Audio recorded:', audioUrl);

      // Option 2: Send the audio directly to your backend for processing
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const response = await fetch('/api/speech-to-text', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // if (data.transcript) {
      //   setChatInputValue(prev => prev + ' ' + data.transcript);
      // }

      // For now, we'll just add a placeholder message
      setChatInputValue((prev) => {
        const newValue = prev + (prev ? ' ' : '') + '[Audio message recorded]';
        return newValue;
      });
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  // Clean up recording on component unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSend = () => {
    if (!chatInputValue.trim()) return;
    sendMessage(chatInputValue);
    setChatInputValue('');
  };

  const handleFullscreen = () => {
    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer) return;

    if (!document.fullscreenElement) {
      canvasContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // We'll implement the actual volume control in the VRM component
  };

  const handleZoom = (zoomIn: boolean) => {
    if (!cameraControls) return;

    // Cast to OrbitControls since we know it's the correct type
    const controls = cameraControls as unknown as OrbitControlsImpl;

    // Get current distance
    const currentDistance = controls.getDistance();

    // Calculate new distance - adjust these values as needed
    const newDistance = zoomIn ? currentDistance * 0.8 : currentDistance * 1.2;

    // Set min/max limits - adjust these values as needed
    const minDistance = 0.5;
    const maxDistance = 5;

    // Clamp the new distance between min and max
    const clampedDistance = Math.min(
      Math.max(newDistance, minDistance),
      maxDistance
    );

    // Update the camera position to zoom
    const zoomScale = clampedDistance / currentDistance;
    controls.object.position.lerp(controls.target, 1 - zoomScale);
    controls.update();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mic Modal */}
      <MicPortal
        isOpen={isMicModalOpen}
        isRecording={isRecording}
        onClose={() => {
          setIsMicModalOpen(false);
          if (isRecording) {
            stopRecording();
          }
        }}
        onStopRecording={() => {
          if (isRecording) {
            stopRecording();
            setIsMicModalOpen(false);
          } else {
            startRecording();
          }
        }}
        placeholder="What do you want to ask?"
      />

      <div className="flex w-full h-full">
        <div className="relative w-full">
          <h1
            className={
              'absolute top-3.5 z-50 left-1/2 -translate-x-1/2 text-white text-center'
            }>
            Brand name
          </h1>

          {/* Small circular avatar container positioned below brand name */}
          <div
            className={cn(
              'absolute top-0 left-0 h-full w-full z-20 flex flex-col justify-center items-center gap-y-8 px-3.5 transition-all duration-500',
              messages.length > 0 ? 'justify-start top-12' : ''
            )}>
            <div
              className={`canvas-container w-[112px] z-40 h-[112px] rounded-full overflow-hidden transition-all duration-500 ${
                messages.length > 0 ? 'transform h-[54px] w-[54px]' : ''
              }`}>
              <MainCanvas zOffset={0.5} className="w-full h-full">
                <VrmComponent
                  defaultXYZ={null}
                  posOffset={new Vector3(0, 0, 0)}
                  volume={volume}
                />
              </MainCanvas>
            </div>

            {messages.length === 0 && (
              <>
                <h2 className="text-white text-[26px] max-w-1/2 text-center">
                  What gigs are coming up?
                </h2>

                <div className="flex justify-center gap-2 mx-auto mt-2 flex-wrap max-w-1/2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendMessage('What gigs are coming up?');
                    }}
                    className="h-[50px] px-4 border border-white text-white rounded-full button-text-md hover:text-white hover:bg-white/10 transition-colors duration-200">
                    What gigs are coming up?
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendMessage('Tell me about Fred Again');
                    }}
                    className="h-[50px] px-4 border border-white text-white rounded-full button-text-md hover:text-white hover:bg-white/10 transition-colors duration-200">
                    Fred Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendMessage('Who is Jyoty?');
                    }}
                    className="h-[50px] px-4 border border-white text-white rounded-full button-text-md hover:text-white hover:bg-white/10 transition-colors duration-200">
                    Jyoty
                  </Button>
                </div>
              </>
            )}
          </div>

          <div
            className={` relative ${
              isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-full'
            }`}>
            {/* Fullscreen Button - Absolute positioned */}
            {isFullscreen ? (
              <AgentChatFullscreenCanvas
                agent={agent}
                chatContainerRef={chatContainerRef}
                chatInputValue={chatInputValue}
                handleSend={handleSend}
                messages={messages}
                setChatInputValue={setChatInputValue}
              />
            ) : null}

            {/*<MainCanvas*/}
            {/*  zOffset={1.25}*/}
            {/*  className={`rounded-xl pointer-events-auto ${*/}
            {/*    isFullscreen ? '!rounded-none w-screen h-screen' : 'h-full'*/}
            {/*  }`}>*/}
            {/*  <VrmComponent*/}
            {/*    defaultXYZ={null}*/}
            {/*    posOffset={new Vector3(0, 0.25, 0)}*/}
            {/*    volume={volume}*/}
            {/*  />*/}
            {/*</MainCanvas>*/}

            <div className="absolute z-50 bottom-3.5 left-1/2 -translate-x-1/2 max-w-md w-full px-3.5  ">
              <div className="relative h-full flex flex-col my-8">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto custom-scroll !overflow-x-hidden">
                  <div className="h-full flex flex-col justify-end">
                    <div className="flex flex-col max-h-[70vh] space-y-4">
                      {messages.map((msg: Message) => {
                        return <ChatPrivateMessageUI key={msg.id} msg={msg} />;
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative w-full flex items-end gap-x-2.5 ">
                <IconButton
                  icon={<MicSVG height={26} width={26} fill={'black'} />}
                  onClick={handleToggleRecording}
                  className={cn(
                    'bg-white',
                    isRecording ? 'animate-pulse bg-red-500/60' : ''
                  )}
                />
                <TextareaWithButton
                  placeholder="What do you want to ask?"
                  containerClassName={
                    'flex-1 flex px-5 items-center flex-row flex-nowrap gap-x-2 transition-colors duration-200'
                  }
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  buttonText="Send"
                  onButtonClick={() => {}}
                />

                <IconButton
                  icon={<SendSVG height={26} width={26} fill={'black'} />}
                  onClick={handleSend}
                  className={cn('bg-white')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
