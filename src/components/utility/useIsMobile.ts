import { useEffect, useState } from 'react';

import { debounce } from './utils';

/**
 * Custom hook that detects if the current device is a mobile device, currently just checking if under certain width
 * @returns An object containing the boolean value indicating if the device is mobile.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const mobileWidth = 640;

  useEffect(() => {
    const debounceResize = debounce(() => {
      setIsMobile(window.innerWidth <= mobileWidth);
    }, 100); // 250ms delay

    window.addEventListener('resize', debounceResize);

    setIsMobile(window.innerWidth <= mobileWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', debounceResize);
    };
  }, []);

  return { isMobile };
}

export { useIsMobile };
