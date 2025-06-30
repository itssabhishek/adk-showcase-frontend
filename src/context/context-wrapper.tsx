'use client';
import React from 'react';

import AgentManager from '@/components/agent-os/AgentManager';
import BackgroundManager from '@/components/background/BackgroundManager';
import VrmManager from '@/components/vrm/VrmManager';

export default function ContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BackgroundManager />
      <VrmManager />
      <AgentManager />
    </>
  );
}
