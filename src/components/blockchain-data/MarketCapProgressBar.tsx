import React from 'react';

import useMarketCapStore from '../../store/useMarketCapStore';

export const formatMarketCap = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(0)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  } else {
    return value.toString();
  }
};

const MarketCapProgressBar: React.FC = () => {
  const { currentMarketCap, milestones, getNextMilestone } =
    useMarketCapStore();

  const nextMilestone = getNextMilestone();

  if (!currentMarketCap || !nextMilestone) {
    return (
      <p className="text-yellow-500 text-center text-2xl font-vt323">
        Loading...
      </p>
    );
  }

  const progress = Math.min(
    (currentMarketCap / nextMilestone.marketCap) * 100,
    100
  );

  return (
    <div className="flex flex-col items-center w-full max-w-screen-md mx-auto mt-10 space-y-6 px-6">
      <p className="text-red-500 text-6xl font-vt323 text-center">
        Current Market Cap: ${formatMarketCap(currentMarketCap)}
      </p>
      {/* <div className="w-full bg-gray-800 rounded-lg border-4 border-gray-500 shadow-md overflow-hidden">
        <div
          className="h-10 bg-gradient-to-r from-yellow-400 to-orange-500"
          style={{
            width: `${progress}%`,
            transition: 'width 0.5s ease-in-out',
          }}></div>
      </div> */}
      {/* <p className="text-red-500 text-3xl font-vt323 text-center">
        Next Milestone: {nextMilestone.description}
      </p> */}
    </div>
  );
};

export default MarketCapProgressBar;
