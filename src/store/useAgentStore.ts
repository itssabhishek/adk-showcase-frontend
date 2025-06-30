import { create } from 'zustand';

import { IAgent } from '@/types/agent';

interface AgentStoreState {
  agent: IAgent;

  /** All agents on the platform, unfiltered. */
  allAgents: IAgent[];

  /** Only the user-owned agents. */
  userAgents: IAgent[];

  selectedAgent: number | null;
  popoutOpen: boolean;
  fetchUpdateTrigger: number;

  /** Agents that were just created by the user recently. */
  newAgents: IAgent[];

  /** Toggles the agent details popout sidebar. */
  isSidebarOpen: boolean;

  /** ACTIONS */

  setAllAgents: (agents: IAgent[]) => void;
  setUserAgents: (agents: IAgent[]) => void;

  setSelectedAgent: (agentId: number, token?: string) => void;

  setPopoutOpen: (open: boolean) => void;

  triggerFetchAgents: () => void;
  setNewAgents: (newAgents: IAgent[]) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;

  /** Insert or replace one agent in userAgents or allAgents. */
  setOneAgent: (updatedAgent: IAgent) => void;

  // fetch all agents from the API
  fetchAllAgents: () => Promise<void>;

  /** Single-agent fetch and store update. */
  fetchAgentById: (agentId: number, token?: string) => Promise<void>;

  setSelectedAgentBySlug: (slug: string, skipTab?: boolean) => void;
}

const useAgentStore = create<AgentStoreState>((set, get) => ({
  agent: null,
  allAgents: [],
  userAgents: [],
  selectedAgent: null,
  popoutOpen: false,
  fetchUpdateTrigger: 0,
  newAgents: [],
  isSidebarOpen: true,

  /** ======= SETTERS ======= */
  setAllAgents: (agents) => set(() => ({ allAgents: agents })),
  setUserAgents: (agents) => set(() => ({ userAgents: agents })),

  setSelectedAgent: (agentId: number, token?: string) => {
    console.log('[useAgentStore] setSelectedAgent =>', agentId);
    set({
      selectedAgent: agentId,
      popoutOpen: true,
    });
    get().fetchAgentById(agentId, token);
  },

  setPopoutOpen: (open) => set(() => ({ popoutOpen: open })),

  triggerFetchAgents: () =>
    set((state) => ({ fetchUpdateTrigger: state.fetchUpdateTrigger + 1 })),

  setNewAgents: (newAgents) => set(() => ({ newAgents })),

  setIsSidebarOpen: (isOpen) => set(() => ({ isSidebarOpen: isOpen })),

  /** Insert or update agent in both userAgents and allAgents. */
  setOneAgent: (updatedAgent) =>
    set((state) => {
      // update allAgents
      const newAll = state.allAgents.map((old) =>
        old.id === updatedAgent.id ? { ...old, ...updatedAgent } : old
      );
      const foundAll = newAll.some((a) => a.id === updatedAgent.id);
      if (!foundAll) {
        newAll.push(updatedAgent);
      }

      // update userAgents
      const newUser = state.userAgents.map((old) =>
        old.id === updatedAgent.id ? { ...old, ...updatedAgent } : old
      );
      const foundUser = newUser.some((a) => a.id === updatedAgent.id);
      if (!foundUser) {
        // only add if belongs to user
        // note: we can compare updatedAgent.user?.userId to the session user if needed
        newUser.push(updatedAgent);
      }

      return {
        allAgents: newAll,
        userAgents: newUser,
      };
    }),

  async fetchAgentById(agentId: number, token?: string) {
    if (!agentId) {
      console.warn('No agent ID supplied, skipping fetchAgentById');
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/agent/ms-agent/${agentId}`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) {
        console.error(
          'fetchAgentById: fetch failed =>',
          await res.text(),
          res.status
        );
        return;
      }
      const data = await res.json();
      // Adjusting based on potential API response structures
      const newAgent: IAgent | null =
        data?.agent || data?.data?.agent || data?.data || null;
      if (!newAgent) {
        console.warn('No agent data found in response for ID:', agentId);
        return;
      }

      console.log('[useAgentStore] fetchAgentById response:', newAgent);
      set(() => ({ agent: newAgent }));
      get().setOneAgent(newAgent);
    } catch (err) {
      console.error('Error in fetchAgentById:', err);
    }
  },

  async fetchAllAgents() {
    try {
      const apiUrl = `/api/agent/ms-agent`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();

      console.log('[useAgentStore] fetchAllAgents response:', data);

      // data should be the entire array of agents
      set(() => ({ allAgents: data }));
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  },

  setSelectedAgentBySlug: (slug: string, skipTab?: boolean) => {
    const { allAgents } = get();
    if (!Array.isArray(allAgents) || allAgents.length === 0) {
      console.warn('[useAgentStore] setSelectedAgentBySlug: no allAgents yet');
      return;
    }
    const found = allAgents.find((agent) => agent.slug === slug);
    if (found) {
      console.log(
        '[useAgentStore] Found agent by slug =>',
        found.slug,
        found.id
      );
      set({
        selectedAgent: found.id,
        popoutOpen: true,
      });
    } else {
      console.warn('[useAgentStore] No agent found for slug =>', slug);
    }
  },
}));

export default useAgentStore;
