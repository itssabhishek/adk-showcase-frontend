import { useEffect } from 'react';

import useBackgroundStore, { chromaBgs } from '@/store/backgroundStore';
import { IBgProps } from '@/types/agent';

const BackgroundManager = () => {
  const userAvailableBackgrounds = useBackgroundStore(
    (state) => state.userAvailableBackgrounds
  );
  const currentBackground = useBackgroundStore(
    (state) => state.currentBackground
  );
  const setUserAvailableBackgrounds = useBackgroundStore(
    (state) => state.setUserAvailableBackgrounds
  );
  const setCurrentBackground = useBackgroundStore(
    (state) => state.setCurrentBackground
  );

  const setAllBackgrounds = useBackgroundStore(
    (state) => state.setAllBackgrounds
  );

  const fetchUpdateTrigger = useBackgroundStore(
    (state) => state.fetchUpdateTrigger
  );

  const mapChromaBgs = (): IBgProps[] => {
    const mappedChromaBgs = chromaBgs.map((bg, index) => ({
      ...bg,
      id: 999 + index,
    }));
    return mappedChromaBgs as IBgProps[];
  };

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const apiUrl = `/api/agent/ms-bg`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BACKEND_API_ADMIN_SECRET}`,
          },
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data }: { data: IBgProps[] } = await response.json();

        setAllBackgrounds([...data]);

        const publicBackgrounds =
          data
            .filter((x) => !x.customBg)
            .sort((a, b) => (a?.id > b?.id ? 1 : -1)) || [];

        const unlockedBgs = [];
        for (const bg of data) {
          // for (const ub of customBgs) {
          //   if (bg?.id === ub?.bg?.id && bg?.customBg) {
          //     unlockedBgs.push(bg);
          //   }
          // }
        }

        console.log('bgData is', data, unlockedBgs, publicBackgrounds);
        const finalData: IBgProps[] = [...unlockedBgs, ...publicBackgrounds];

        setUserAvailableBackgrounds(finalData);

        if (finalData.length > 0 && !currentBackground) {
          setCurrentBackground(finalData[0]);
        }
      } catch (error) {
        console.error('Failed to fetch backgrounds:', error);
      }
    };

    fetchBackgrounds();
  }, [fetchUpdateTrigger]);

  return null;
};

export default BackgroundManager;
