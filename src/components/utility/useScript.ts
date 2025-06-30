import { useEffect } from 'react';

export function useScript(src) {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Optional: Remove the script when the component unmounts
      document.body.removeChild(script);
    };
  }, [src]);
}
