/* eslint-disable @typescript-eslint/no-explicit-any */
import { VRM } from '@pixiv/three-vrm';
import { useEffect } from 'react';

import useAgentStore from '@/store/useAgentStore';
import useVRMStore, { AnimationDictItem } from '@/store/vrmStore';
import { BlendShapeCategory, VRM12Names } from '@/types/vrmTypes';

/** returns VRM12 if we find enough known VRM1.0 expressions, else invalid */
export const GetVRMBlendShapeType = (theVRM: VRM): BlendShapeCategory => {
  const exps = theVRM.expressionManager?.expressions || [];
  let matchCount = 0;

  exps.forEach((expr) => {
    VRM12Names.forEach((vname) => {
      if (
        vname.includes(expr.name.replace('VRMExpression_', '').toLowerCase())
      ) {
        matchCount++;
      }
    });
  });
  return matchCount >= 12
    ? BlendShapeCategory.VRM12
    : BlendShapeCategory.INVALID;
};

const VrmManager = () => {
  const { fetchUpdateTrigger } = useAgentStore();

  const { setAllVrms, setAnimationDictionary } = useVRMStore();

  /**
   * Only fetch VRMs+animations on mount or if store explicitly triggers it (fetchUpdateTrigger).
   * We do NOT watch selectedVRM here.
   */
  useEffect(() => {
    async function fetchVrmsAndAnimations() {
      console.log('[VrmManager] re-fetching VRMs + animations...');
      try {
        // 1) VRMs
        const response = await fetch('/api/agent/ms-vrm', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(`fetch VRMs => status: ${response.status}`);
        }

        const { data } = await response.json();
        setAllVrms([...data]);

        const publicVrms =
          data
            .filter((x) => !x.customVrm)
            .sort((a, b) => (a?.id > b?.id ? 1 : -1)) || [];

        // 2) Animations
        const animationsResponse = await fetch('/api/agent/ms-animation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          cache: 'no-cache',
        });

        if (!animationsResponse.ok) {
          throw new Error(
            `fetch animations => status: ${animationsResponse.status}`
          );
        }

        const { data: animationsData } = await animationsResponse.json();
        const mappedAnims: AnimationDictItem[] = animationsData.map(
          (item: any) => ({
            id: item.id,
            name: item.name,
            path: item.file?.url,
            image: item.thumbnail?.url,
            loop: !!item.animationConfig?.loop,
          })
        );
        setAnimationDictionary(mappedAnims);
      } catch (error) {
        console.error('Error fetching VRMs and animations:', error);
      }
    }

    void fetchVrmsAndAnimations();
  }, [fetchUpdateTrigger]);

  return null;
};

export default VrmManager;
