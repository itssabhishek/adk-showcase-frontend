import { useEffect, useState } from 'react';

const useIsSafari = () => {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);
  }, []);

  return isSafari;
};

export default useIsSafari;
