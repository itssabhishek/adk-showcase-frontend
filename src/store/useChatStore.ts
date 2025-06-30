import { create } from 'zustand';

import { decodeBase64ToArrayBuffer } from '@/components/utility/base64';
import { PreventJsonLeaking } from '@/components/utility/string';
import useAgentStore from '@/store/useAgentStore';
import useVRMStore from '@/store/vrmStore';
import { IAgent } from '@/types/agent';

export interface MessageType {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  hasBeenRead: boolean;
}

const getRandomLoreSnippets = (
  loreArray: string[] | undefined,
  count: number = 3
): string => {
  if (!loreArray || loreArray.length === 0) return '';
  const shuffled = [...loreArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join('\n');
};

const getMessageStyleDirections = (style: string[] | undefined): string => {
  if (!style) return '';
  if (style.length === 0) return '';
  return `# Message Style Directions:\\n${style.join('\n')}\n`;
};

const COMMUNICATION_METHOD =
  process.env.NEXT_PUBLIC_COMMUNICATION_METHOD || 'direct_api';

interface ChatState {
  messagesByAgentId: Record<number, MessageType[]>;

  getMessagesForAgent: (agentId: number) => MessageType[];
  sendUserMessage: (agentId: number, userQuery: string) => Promise<void>;
  addAgentMessage: (agentId: number, text: string, audio?: ArrayBuffer) => void;

  startAgentLoop: (agentId: number) => void;
  activeLoops: Record<number, boolean>;
  lastMessageTimes: Record<number, number>;

  sendAgentMessage: (agentId: number, text: string) => Promise<void>;

  stopAgentLoop: () => void;
  clearMessagesForAgent: (agentId: number) => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  messagesByAgentId: {},

  getMessagesForAgent: (agentId: number) => {
    const { messagesByAgentId } = get();
    return messagesByAgentId[agentId] || [];
  },

  sendUserMessage: async (agentId: number, userQuery: string) => {
    console.log('Starting sendUserMessage:', { agentId, userQuery });

    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQuery,
      hasBeenRead: true,
    };

    set((state) => {
      const existingMessages = state.messagesByAgentId[agentId] || [];
      return {
        messagesByAgentId: {
          ...state.messagesByAgentId,
          [agentId]: [...existingMessages, newMessage],
        },
      };
    });
    console.log('Added user message to chat');

    const agent = useAgentStore
      .getState()
      .userAgents.find((a) => a.id === agentId);
    if (!agent) return;

    try {
      await get().sendAgentMessage(agentId, userQuery);
    } catch (error) {
      console.error('Error sending agent response:', error);
    }
  },

  addAgentMessage: (agentId, text, audio) => {
    if (!text) return;
    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'agent',
      text,
      hasBeenRead: false,
    };

    set((state) => {
      const existingMessages = state.messagesByAgentId[agentId] || [];
      return {
        messagesByAgentId: {
          ...state.messagesByAgentId,
          [agentId]: [...existingMessages, newMessage],
        },
      };
    });

    if (audio) {
      const { currentVRM } = useVRMStore.getState();
      if (currentVRM?.model) {
        console.log('Playing audio through VRM...');
        currentVRM.model.speakFromBuffer(audio, text);
      } else {
        console.warn('No VRM model available to play audio');
      }
    } else {
      console.warn('No audio buffer provided (agent text only)');
    }
  },

  sendAgentMessage: async (agentId: number, userQuery: string) => {
    try {
      console.log('Starting sendAgentMessage for agent:', agentId);

      const agent: IAgent | undefined = useAgentStore
        .getState()
        .userAgents.find((a) => a.id === agentId);

      if (!agent) {
        console.warn('No agent found for agentId:', agentId);
        return;
      }

      const agentKnowledgeItems = agent.knowledge.join(`\\n`) || [];

      const agentName = agent.name;
      const agentBio = agent.description;
      const adjectives = agent.adjectives.join(', ');
      const topics = agent.idle.join(`\\n`) || [];
      const agentLoreSnippets = getRandomLoreSnippets(agent.lore);
      const agentMessageStyleDirections = getMessageStyleDirections(
        agent.style
      );
      const chatHistory = get().getMessagesForAgent(agentId).slice(-50) || [];
      const chatMessages = chatHistory.map((msg) => ({
        role:
          msg.sender === 'user'
            ? 'user'
            : ('assistant' as 'user' | 'assistant'),
        content: msg.text,
      }));

      const systemPromptContent = `
        # Task: Generate dialog for the character ${agentName}.
        About ${agentName}:
        ${agentBio}
        ${agentLoreSnippets}
        Here are some adjectives to describe ${agentName}: ${adjectives}
        \n
        ${agentName} is interested in the following topics:
        ${topics}
        \n
        # Knowledge
        ${agentKnowledgeItems}
        ${agentMessageStyleDirections}
        # Instructions: Write the next message for ${agentName}. 
        Respond in JSON format with "text". 
        The "text" field should be the response you want to send and should in Markdown format.
        Example Response Format:
        \`\`\`json
        { "text": "Your response here", }
        \`\`\`
        `.trim();

      const systemMessage = {
        role: 'system' as const,
        content: systemPromptContent,
      };

      const messages = [systemMessage, ...chatMessages];

      console.log('Messages for LLM:', JSON.stringify(messages, null, 2));

      const openAiRes = await fetch('/api/chat-os/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        throw new Error('Local /api/chat-os/generate error: ' + errText);
      }

      const openAiJson = await openAiRes.json();
      console.log('Raw LLM Response:', openAiJson);

      let agentText: string;
      let agentAction: string | undefined = undefined; // --- Parse Response (Handle potential JSON or plain text) ---

      try {
        const rawContent = openAiJson?.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error('No content in LLM response'); // Attempt to parse as JSON (like Eliza expects)

        const jsonMatch = rawContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          // Use PreventJsonLeaking on the 'text' field if it exists, otherwise use the whole parsed object for PreventJsonLeaking
          agentText = PreventJsonLeaking(parsed.text || JSON.stringify(parsed));
          agentAction = parsed.action;
          console.log('Parsed JSON response:', { agentText, agentAction });
        } else {
          agentText = PreventJsonLeaking(rawContent);
          console.warn(
            'LLM response was not standard JSON, applying PreventJsonLeaking to raw content.'
          );
        }
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        const rawContentOnError =
          openAiJson?.choices?.[0]?.message?.content ||
          'Error: Could not parse response.';
        agentText = PreventJsonLeaking(rawContentOnError);
      } // --- TTS and State Update ---

      console.log(
        `Calling TTS for final agent text: "${agentText}" (Action: ${agentAction || 'None'})`
      );
      const usedVoiceId = agent.voiceID || 'echo';

      const voiceInstructions = agent.voiceInstructions || {};
      const voiceInstructionsString = Object.entries(voiceInstructions)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      console.log('Voice', agent.voiceID);
      console.log('Voice instructions:', voiceInstructionsString);

      const ttsReq = await fetch('/api/chat-os/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: agentText,
          model: 'gpt-4o-mini-tts',
          voice: usedVoiceId,
          instructions: voiceInstructionsString || 'Speak in a normal tone.',
        }),
      });

      if (!ttsReq.ok) {
        const errText = await ttsReq.text();
        console.error('TTS route error:', errText);
        get().addAgentMessage(agentId, agentText);
        return;
      }

      const ttsJson = await ttsReq.json();
      if (!ttsJson.audioBase64) {
        console.warn('No audio returned from TTS route, just text used');
        get().addAgentMessage(agentId, agentText);
        return;
      } // Decode Base64 audio

      const audioBuffer = decodeBase64ToArrayBuffer(ttsJson.audioBase64); // Add the agent message with audio

      get().addAgentMessage(agentId, agentText, audioBuffer); // --- TODO: Handle agentAction ---
      // if (agentAction && agentAction !== 'NONE') {
      // console.log(`Agent wants to perform action: ${agentAction}`);
      // }
    } catch (error) {
      console.error('Error in sendAgentMessage:', error);
      get().addAgentMessage(agentId, 'Sorry, I encountered an error.');
    }
  },

  startAgentLoop: (agentId: number) => {
    if (get().activeLoops[agentId]) {
      console.log('Found existing loop, stopping first...');
      get().stopAgentLoop();
    }

    console.log('Starting agent loop for agent:', agentId);
    const agent = useAgentStore
      .getState()
      .userAgents.find((a) => a.id === agentId);
    const initialDelay = (agent?.idleDelay || 10) * 1000;

    set((state) => ({
      activeLoops: { ...state.activeLoops, [agentId]: true },
    }));

    setTimeout(() => {
      const runLoop = async () => {
        console.log('Running loop iteration...');

        if (!get().activeLoops[agentId]) {
          console.log('Loop stopped, exiting iteration');
          return;
        }

        try {
          const { currentVRM } = useVRMStore.getState();
          if (currentVRM?.model?.isSpeaking) {
            console.log('VRM is speaking, skipping iteration');
            return;
          }

          const agent = useAgentStore
            .getState()
            .userAgents.find((a) => a.id === agentId);
          if (!agent) {
            console.warn('No agent found, skipping iteration');
            return;
          }

          const messages = get().getMessagesForAgent(agentId);
          console.log('Checking messages for unresponded user message...');

          const lastUnreadUserMessage = [...messages]
            .reverse()
            .find((msg) => msg.sender === 'user' && !msg.hasBeenRead);

          if (lastUnreadUserMessage) {
            console.log('Found unread user message:', lastUnreadUserMessage);
            set((state) => ({
              messagesByAgentId: {
                ...state.messagesByAgentId,
                [agentId]: state.messagesByAgentId[agentId].map((msg) =>
                  msg.id === lastUnreadUserMessage.id
                    ? { ...msg, hasBeenRead: true }
                    : msg
                ),
              },
            }));
            console.log('Marked message as read');
            await get().sendAgentMessage(agentId, lastUnreadUserMessage.text);
            console.log('Sent agent response');
          } else {
            console.log('No unread messages, checking for idle chatter...');

            const idleDelay = agent.idleDelay || 10;
            console.log(
              `Waiting ${idleDelay} seconds before next idle message...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, idleDelay * 1000)
            );
            console.log('Idle delay complete, sending message...');

            const idleMessages = agent.idle;
            if (idleMessages.length > 0) {
              console.log('Found idle messages, selecting random one...');
              const randomIdle =
                idleMessages[Math.floor(Math.random() * idleMessages.length)];
              console.log('Selected idle message:', randomIdle);
              await get().sendAgentMessage(agentId, randomIdle);
            } else {
              console.log(
                'No idle messages defined, generating random topic...'
              );
              const randomPrompt =
                'Share a brief thought about any random topic that interests you';
              await get().sendAgentMessage(agentId, randomPrompt);
            }
          }

          console.log('Loop iteration complete, waiting for speech end');
        } catch (error) {
          console.error('Error in agent loop:', error);
          if (get().activeLoops[agentId]) {
            console.log('Retrying loop after error...');
            runLoop();
          } else {
            console.log('Loop stopped during error, not retrying');
          }
        }
      };

      console.log('Starting initial loop iteration...');
      runLoop();

      console.log('Setting up speech end listener...');
      const { currentVRM } = useVRMStore.getState();
      if (currentVRM?.model) {
        currentVRM.model.onSpeechEnd = () => {
          console.log('Speech ended, triggering next iteration...');
          if (get().activeLoops[agentId]) {
            runLoop();
          } else {
            console.log('Loop stopped, not continuing after speech');
          }
        };
      } else {
        console.warn('No VRM model found for speech end listener');
      }
    }, initialDelay);
  },

  activeLoops: {},
  lastMessageTimes: {},

  stopAgentLoop: () => {
    set((state) => ({
      activeLoops: {},
    }));

    const { currentVRM } = useVRMStore.getState();
    if (currentVRM?.model) {
      currentVRM.model.cancelSpeech();
      currentVRM.model.onSpeechEnd = undefined;
    }

    console.log('Stopped all agent loops');
  },

  clearMessagesForAgent: (agentId: number) => {
    set((state) => ({
      messagesByAgentId: {
        ...state.messagesByAgentId,
        [agentId]: [],
      },
    }));
  },
}));

export default useChatStore;
