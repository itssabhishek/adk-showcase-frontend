'use client';

import { useEffect } from 'react';

import useBackgroundStore from '@/store/backgroundStore';
import useVRMStore from '@/store/vrmStore';

import useAgentStore from '../../store/useAgentStore';

const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

const AgentManager = () => {
  const { agent, fetchAgentById, fetchUpdateTrigger } = useAgentStore();

  const { userAvailableBackgrounds, allBackgrounds, setCurrentBackground } =
    useBackgroundStore();
  const { userAvailableVrms, allVrms, setSelectedVRM } = useVRMStore();

  useEffect(() => {
    void fetchAgentById(Number(AGENT_ID));
  }, [fetchUpdateTrigger]);

  useEffect(() => {
    if (!agent) return;

    console.log(`[AgentManager] selected agent:`, agent);

    if (agent.bgId) {
      const pickBG = allBackgrounds.find((bg) => bg.id === agent.bgId);
      if (pickBG) {
        setCurrentBackground(pickBG);
      } else {
        setCurrentBackground(userAvailableBackgrounds?.[0] || null);
      }
    } else {
      setCurrentBackground(userAvailableBackgrounds?.[0] || null);
    }

    if (agent.vrmId) {
      const pickVRM = allVrms.find((v) => v.id === agent.vrmId);
      if (pickVRM) {
        setSelectedVRM(pickVRM);
      } else {
        setSelectedVRM(userAvailableVrms?.[0] || null);
      }
      console.log(
        `[AgentManager] selected VRM: ${pickVRM?.name} (${agent.vrmId})`
      );
    } else {
      setSelectedVRM(userAvailableVrms?.[0] || null);
    }
  }, [agent]);

  return null;
};

export default AgentManager;
