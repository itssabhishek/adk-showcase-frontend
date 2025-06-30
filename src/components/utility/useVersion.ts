import { useEffect, useState } from 'react';

interface VersionInfo {
  SemVer: string;
  BranchName: string;
}

const useVersion = (): VersionInfo => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    SemVer: '',
    BranchName: '',
  });

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/version.json');
        const data: VersionInfo = await response.json();
        setVersionInfo(data);
      } catch (error) {
        console.error('Failed to fetch version information:', error);
      }
    };

    fetchVersionInfo();
  }, []);

  return versionInfo;
};

export default useVersion;
